<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Command Tree</title>

    <!-- Bootstrap 5 (coerente con brusegan.it) -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>

    <!-- Font Bitter come brusegan.it -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,100..900;1,100..900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">

    <!-- Cytoscape + layout dagre -->
    <script src="https://cdn.jsdelivr.net/npm/cytoscape@3.30.2/dist/cytoscape.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dagre@0.8.5/dist/dagre.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/cytoscape-dagre@2.5.0/cytoscape-dagre.min.js"></script>

    <link rel="stylesheet" href="style.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#212529">
</head>
<body data-bs-theme="dark">

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">
                <span class="brand-mono">&gt;_</span> Command&nbsp;Tree
            </a>
            <a class="btn btn-light btn-sm rounded-pill" href="https://www.brusegan.it" target="_blank" rel="noopener">brusegan.it</a>
        </div>
    </nav>

    <div class="container-fluid app-shell">
        <div class="row gx-0">

            <!-- Toolbar laterale -->
            <aside class="col-12 col-lg-3 col-xxl-2 side-panel">
                <div class="heading">Command Tree</div>
                <p class="text-secondary small">
                    Visualizza ed esplora sottocomandi, sintassi e descrizioni come grafo a nodi.
                </p>

                <div class="panel-section">
                    <label class="form-label">Carica un comando</label>
                    <div class="input-group input-group-sm">
                        <select id="datasetSelect" class="form-select">
                            <option value="">— scegli —</option>
                        </select>
                        <button id="addDatasetBtn" class="btn btn-light" title="Aggiungi al grafo">Aggiungi</button>
                    </div>
                    <div class="form-text">Aggiungine più di uno per un grafo non connesso.</div>
                </div>

                <div class="panel-section">
                    <label class="form-label" for="searchInput">Cerca nodo</label>
                    <input id="searchInput" type="search" class="form-control form-control-sm" placeholder="es. commit, &lt;host&gt;…">
                </div>

                <div class="panel-section d-grid gap-2">
                    <div class="btn-group btn-group-sm w-100">
                        <button id="addNodeBtn" class="btn btn-outline-light">+ Nodo</button>
                        <button id="addEdgeBtn" class="btn btn-outline-light" title="Collega due nodi">+ Arco</button>
                    </div>
                    <div class="btn-group btn-group-sm w-100">
                        <button id="relayoutBtn" class="btn btn-outline-light">Riordina</button>
                        <button id="fitBtn" class="btn btn-outline-light">Adatta</button>
                    </div>
                </div>

                <div class="panel-section d-grid gap-2">
                    <div class="btn-group btn-group-sm w-100">
                        <button id="importBtn" class="btn btn-secondary">Importa</button>
                        <button id="exportBtn" class="btn btn-secondary">Esporta</button>
                    </div>
                    <button id="clearBtn" class="btn btn-outline-danger btn-sm">Svuota grafo</button>
                    <input id="importFile" type="file" accept="application/json,.json" hidden>
                </div>

                <div class="panel-section legend">
                    <div class="legend-title">Legenda</div>
                    <div class="legend-item"><span class="dot dot-command"></span> comando</div>
                    <div class="legend-item"><span class="dot dot-subcommand"></span> sottocomando</div>
                    <div class="legend-item"><span class="dot dot-option"></span> opzione / flag</div>
                    <div class="legend-item"><span class="dot dot-placeholder"></span> placeholder &lt;…&gt;</div>
                </div>
            </aside>

            <!-- Area grafo -->
            <main class="col side-graph">
                <div id="cy"></div>
                <div id="hint" class="graph-hint">Carica un comando per iniziare.</div>
            </main>
        </div>
    </div>

    <!-- Pannello dettagli / editing nodo -->
    <div id="detailPanel" class="detail-panel" hidden>
        <div class="detail-head">
            <span id="detailType" class="badge"></span>
            <button id="detailClose" class="btn-close btn-close-white" aria-label="Chiudi"></button>
        </div>
        <div class="mb-2">
            <label class="form-label">Etichetta</label>
            <input id="fLabel" class="form-control form-control-sm">
        </div>
        <div class="mb-2">
            <label class="form-label">Tipo</label>
            <select id="fType" class="form-select form-select-sm">
                <option value="command">comando</option>
                <option value="subcommand">sottocomando</option>
                <option value="option">opzione / flag</option>
                <option value="placeholder">placeholder</option>
            </select>
        </div>
        <div class="mb-2">
            <label class="form-label">Sintassi</label>
            <input id="fSyntax" class="form-control form-control-sm font-mono">
        </div>
        <div class="mb-2">
            <label class="form-label">Descrizione</label>
            <textarea id="fDesc" class="form-control form-control-sm" rows="4"></textarea>
        </div>
        <div class="d-flex gap-2">
            <button id="fSave" class="btn btn-light btn-sm flex-grow-1">Salva</button>
            <button id="fDelete" class="btn btn-outline-danger btn-sm">Elimina</button>
        </div>
    </div>

    <script src="js/graph.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
