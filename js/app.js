/**
 * app.js — logica dell'interfaccia: caricamento dataset, editing dei nodi/archi,
 * ricerca, import/export. Si appoggia a window.CommandGraph (vedi graph.js).
 */
(function () {
    "use strict";

    const { cy, layout } = window.CommandGraph;

    const $ = (id) => document.getElementById(id);
    const els = {
        datasetSelect: $("datasetSelect"),
        addDatasetBtn: $("addDatasetBtn"),
        search: $("searchInput"),
        addNode: $("addNodeBtn"),
        addEdge: $("addEdgeBtn"),
        relayout: $("relayoutBtn"),
        fit: $("fitBtn"),
        import: $("importBtn"),
        export: $("exportBtn"),
        clear: $("clearBtn"),
        importFile: $("importFile"),
        hint: $("hint"),
        // pannello dettagli
        panel: $("detailPanel"),
        pType: $("detailType"),
        pClose: $("detailClose"),
        fLabel: $("fLabel"),
        fType: $("fType"),
        fSyntax: $("fSyntax"),
        fDesc: $("fDesc"),
        fSave: $("fSave"),
        fDelete: $("fDelete"),
    };

    const TYPE_LABELS = {
        command: "comando",
        subcommand: "sottocomando",
        option: "opzione",
        placeholder: "placeholder",
    };

    let selectedId = null;     // nodo aperto nel pannello
    let edgeMode = false;      // se true, stiamo collegando due nodi
    let edgeSource = null;     // primo nodo scelto in modalità arco

    /* ----------------------------------------------------------- utilità */

    function updateHint() {
        els.hint.style.display = cy.nodes().length === 0 ? "block" : "none";
    }

    function uid(prefix) {
        return prefix + "_" + Math.random().toString(36).slice(2, 8);
    }

    /** Aggiunge nodi/archi (formato dataset) al grafo, senza duplicare gli id. */
    function addElements(data) {
        const existing = new Set(cy.nodes().map((n) => n.id()));
        const add = [];

        (data.nodes || []).forEach((n) => {
            if (!n.id || existing.has(n.id)) return;
            existing.add(n.id);
            add.push({
                group: "nodes",
                data: {
                    id: n.id,
                    label: n.label || n.id,
                    type: n.type || "subcommand",
                    syntax: n.syntax || "",
                    description: n.description || "",
                },
            });
        });

        (data.edges || []).forEach((e) => {
            if (!e.source || !e.target) return;
            const id = "e_" + e.source + "__" + e.target;
            if (cy.getElementById(id).nonempty()) return;
            add.push({ group: "edges", data: { id, source: e.source, target: e.target } });
        });

        cy.add(add);
        updateHint();
    }

    /* ---------------------------------------------------------- dataset */

    async function loadDatasetList() {
        try {
            const res = await fetch("api/datasets.php");
            const list = await res.json();
            list.forEach((d) => {
                const opt = document.createElement("option");
                opt.value = d.name;
                opt.textContent = (d.title || d.name) + (d.description ? " — " + d.description : "");
                els.datasetSelect.appendChild(opt);
            });
        } catch (err) {
            console.error("Impossibile caricare l'elenco dei dataset:", err);
        }
    }

    async function fetchDataset(name) {
        const res = await fetch("api/datasets.php?name=" + encodeURIComponent(name));
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
    }

    async function addSelectedDataset() {
        const name = els.datasetSelect.value;
        if (!name) return;
        try {
            addElements(await fetchDataset(name));
            layout();
        } catch (err) {
            alert("Errore nel caricamento del dataset: " + err.message);
        }
    }

    /** Carica i dataset indicati nella URL: index.php?load=git,docker */
    async function loadFromURL() {
        const param = new URLSearchParams(location.search).get("load");
        if (!param) return;
        const names = param.split(",").map((s) => s.trim()).filter(Boolean);
        for (const name of names) {
            try {
                addElements(await fetchDataset(name));
            } catch (err) {
                console.error("Dataset '" + name + "' non caricato:", err.message);
            }
        }
        if (cy.nodes().nonempty()) layout();
    }

    /* ---------------------------------------------- pannello dettagli */

    function openPanel(node) {
        selectedId = node.id();
        cy.elements().removeClass("selected");
        node.addClass("selected");

        const t = node.data("type");
        els.pType.textContent = TYPE_LABELS[t] || t;
        els.pType.className = "badge type-" + t;
        els.fLabel.value = node.data("label") || "";
        els.fType.value = t;
        els.fSyntax.value = node.data("syntax") || "";
        els.fDesc.value = node.data("description") || "";
        els.panel.hidden = false;
    }

    function closePanel() {
        els.panel.hidden = true;
        selectedId = null;
        cy.elements().removeClass("selected");
    }

    function savePanel() {
        if (!selectedId) return;
        const node = cy.getElementById(selectedId);
        if (node.empty()) return;
        node.data({
            label: els.fLabel.value || node.id(),
            type: els.fType.value,
            syntax: els.fSyntax.value,
            description: els.fDesc.value,
        });
        // aggiorna il badge in base al nuovo tipo
        els.pType.textContent = TYPE_LABELS[els.fType.value] || els.fType.value;
        els.pType.className = "badge type-" + els.fType.value;
    }

    function deleteSelected() {
        if (!selectedId) return;
        cy.getElementById(selectedId).remove();
        closePanel();
        updateHint();
    }

    /* --------------------------------------------------- creazione */

    function addNode() {
        const id = uid("node");
        const center = cy.extent();
        cy.add({
            group: "nodes",
            data: { id, label: "nuovo", type: "subcommand", syntax: "", description: "" },
            position: {
                x: (center.x1 + center.x2) / 2,
                y: (center.y1 + center.y2) / 2,
            },
        });
        updateHint();
        openPanel(cy.getElementById(id));
        els.fLabel.focus();
        els.fLabel.select();
    }

    function toggleEdgeMode(on) {
        edgeMode = on;
        edgeSource = null;
        cy.nodes().removeClass("edge-source");
        els.addEdge.classList.toggle("active", edgeMode);
        els.addEdge.classList.toggle("btn-warning", edgeMode);
        els.addEdge.classList.toggle("btn-outline-light", !edgeMode);
        cy.container().style.cursor = edgeMode ? "crosshair" : "";
    }

    function handleEdgeClick(node) {
        if (!edgeSource) {
            edgeSource = node;
            node.addClass("edge-source");
            return;
        }
        if (edgeSource.id() !== node.id()) {
            const id = "e_" + edgeSource.id() + "__" + node.id();
            if (cy.getElementById(id).empty()) {
                cy.add({ group: "edges", data: { id, source: edgeSource.id(), target: node.id() } });
            }
        }
        toggleEdgeMode(false);
    }

    /* --------------------------------------------------- import/export */

    function exportJSON() {
        const data = {
            nodes: cy.nodes().map((n) => ({
                id: n.id(),
                label: n.data("label"),
                type: n.data("type"),
                syntax: n.data("syntax") || "",
                description: n.data("description") || "",
            })),
            edges: cy.edges().map((e) => ({ source: e.data("source"), target: e.data("target") })),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "command-tree.json";
        a.click();
        URL.revokeObjectURL(a.href);
    }

    function importJSON(file) {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                addElements(data);
                layout();
            } catch (err) {
                alert("File JSON non valido: " + err.message);
            }
        };
        reader.readAsText(file);
    }

    /* ------------------------------------------------------- ricerca */

    function runSearch(q) {
        q = q.trim().toLowerCase();
        cy.elements().removeClass("faded match");
        if (!q) return;

        const matches = cy.nodes().filter((n) => {
            const hay = [n.data("label"), n.data("syntax"), n.data("description")]
                .join(" ").toLowerCase();
            return hay.includes(q);
        });

        if (matches.empty()) return;
        cy.elements().addClass("faded");
        matches.removeClass("faded").addClass("match");
        matches.neighborhood().removeClass("faded");
    }

    /* ----------------------------------------------------- eventi cy */

    cy.on("tap", "node", (evt) => {
        const node = evt.target;
        if (edgeMode) {
            handleEdgeClick(node);
        } else {
            openPanel(node);
        }
    });

    cy.on("tap", (evt) => {
        if (evt.target === cy && !edgeMode) closePanel();
    });

    /* --------------------------------------------------- listener UI */

    els.addDatasetBtn.addEventListener("click", addSelectedDataset);
    els.datasetSelect.addEventListener("keydown", (e) => { if (e.key === "Enter") addSelectedDataset(); });
    els.addNode.addEventListener("click", addNode);
    els.addEdge.addEventListener("click", () => toggleEdgeMode(!edgeMode));
    els.relayout.addEventListener("click", layout);
    els.fit.addEventListener("click", () => window.CommandGraph.fit());
    els.export.addEventListener("click", exportJSON);
    els.import.addEventListener("click", () => els.importFile.click());
    els.importFile.addEventListener("change", (e) => {
        if (e.target.files[0]) importJSON(e.target.files[0]);
        e.target.value = "";
    });
    els.clear.addEventListener("click", () => {
        if (cy.nodes().nonempty() && confirm("Svuotare completamente il grafo?")) {
            cy.elements().remove();
            closePanel();
            updateHint();
        }
    });

    els.pClose.addEventListener("click", closePanel);
    els.fSave.addEventListener("click", savePanel);
    els.fDelete.addEventListener("click", deleteSelected);
    els.search.addEventListener("input", (e) => runSearch(e.target.value));

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (edgeMode) toggleEdgeMode(false);
            else closePanel();
        }
    });

    /* --------------------------------------------------------- avvio */

    loadDatasetList();
    loadFromURL();
    updateHint();
})();
