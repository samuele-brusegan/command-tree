/**
 * graph.js — incapsula Cytoscape e la sua configurazione.
 *
 * Espone window.CommandGraph con i metodi usati da app.js. Tutta la logica
 * di interfaccia (toolbar, editing, import/export) sta in app.js: qui ci
 * occupiamo solo di disegnare e manipolare il grafo.
 */
(function () {
    "use strict";

    if (window.cytoscape && window.cytoscapeDagre) {
        cytoscape.use(window.cytoscapeDagre);
    }

    const TYPE_COLORS = {
        command:     "#4dabf7",
        subcommand:  "#51cf66",
        option:      "#ffa94d",
        placeholder: "#b197fc",
    };

    const cy = cytoscape({
        container: document.getElementById("cy"),
        wheelSensitivity: 0.25,
        minZoom: 0.2,
        maxZoom: 3,
        style: [
            {
                selector: "node",
                style: {
                    "label": "data(label)",
                    "color": "#fff",
                    "font-family": "JetBrains Mono, monospace",
                    "font-size": 13,
                    "text-valign": "center",
                    "text-halign": "center",
                    "text-wrap": "wrap",
                    "text-max-width": 160,
                    "width": "label",
                    "height": "label",
                    "padding": "12px",
                    "shape": "round-rectangle",
                    "background-color": (ele) => TYPE_COLORS[ele.data("type")] || "#adb5bd",
                    "background-opacity": 0.18,
                    "border-width": 2,
                    "border-color": (ele) => TYPE_COLORS[ele.data("type")] || "#adb5bd",
                },
            },
            {
                selector: 'node[type="command"]',
                style: { "font-size": 16, "font-weight": "bold", "border-width": 3 },
            },
            {
                selector: 'node[type="placeholder"]',
                style: { "border-style": "dashed", "shape": "round-tag" },
            },
            {
                selector: "edge",
                style: {
                    "width": 2,
                    "line-color": "#ffffff55",
                    "target-arrow-color": "#ffffff55",
                    "target-arrow-shape": "triangle",
                    "curve-style": "bezier",
                },
            },
            {
                selector: ".selected",
                style: { "border-color": "#fff", "border-width": 4, "background-opacity": 0.35 },
            },
            {
                selector: ".faded",
                style: { "opacity": 0.12 },
            },
            {
                selector: ".match",
                style: { "border-color": "#ffd43b", "border-width": 4, "background-opacity": 0.45 },
            },
            {
                selector: ".edge-source",
                style: { "border-color": "#ffd43b", "border-width": 4 },
            },
        ],
    });

    /** Layout gerarchico dall'alto verso il basso (gestisce grafi non connessi). */
    function layout() {
        if (cy.nodes().empty()) return;
        cy.resize(); // assicura dimensioni corrette del container prima del fit
        const lay = cy.layout({
            name: "dagre",
            rankDir: "TB",
            nodeSep: 55,
            rankSep: 80,
            edgeSep: 20,
            animate: true,
            animationDuration: 300,
            fit: true,
            padding: 40,
        });
        // dopo il layout rifacciamo il fit: evita il grafo "incastrato" in un angolo
        lay.one("layoutstop", () => cy.fit(undefined, 40));
        lay.run();
    }

    // Mantiene il grafo adattato quando la finestra cambia dimensione.
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            cy.resize();
            if (cy.nodes().nonempty()) cy.fit(undefined, 40);
        }, 150);
    });

    window.CommandGraph = {
        cy,
        TYPE_COLORS,
        layout,
        fit: () => { cy.resize(); cy.fit(undefined, 40); },
    };
})();
