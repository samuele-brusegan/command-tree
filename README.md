# Command Tree

Web app per visualizzare, esplorare ed editare come **grafo a nodi** i
sottocomandi, la sintassi e le descrizioni di uno o più comandi da terminale
(es. `git`, `docker`, `ssh`).

Ogni nodo è un sottocomando, un'opzione/flag o un placeholder (es.
`<IP_HOST>`). Caricando più comandi il grafo diventa **non connesso**: un
albero separato per ciascun comando.

Stile coerente con [brusegan.it](https://www.brusegan.it) (Bootstrap dark
theme, font Bitter), pensato per essere ospitato accanto agli altri progetti.

## Stack

- **PHP** per servire la pagina e l'elenco dei dataset (`api/datasets.php`)
- **JavaScript** (vanilla) + **Bootstrap 5**
- **Cytoscape.js** con layout gerarchico **dagre** per il disegno del grafo

## Avvio in locale

Serve un interprete PHP (qualsiasi versione 7.4+ va bene):

```bash
php -S 127.0.0.1:8000
```

Poi apri <http://127.0.0.1:8000/index.php>.

### Deep-link

Puoi precaricare uno o più comandi via URL:

```
index.php?load=git              # carica solo git
index.php?load=git,docker,ssh   # carica più comandi (grafo non connesso)
```

## Uso

- **Carica un comando**: scegli un dataset e premi *Aggiungi*. Aggiungine altri
  per avere più alberi nello stesso grafo.
- **Click su un nodo**: apre il pannello con tipo, sintassi e descrizione; da lì
  puoi modificarlo o eliminarlo.
- **+ Nodo / + Arco**: crea nuovi nodi e collega due nodi (in modalità *+ Arco*
  clicca prima il nodo sorgente, poi il nodo destinazione; `Esc` annulla).
- **Riordina / Adatta**: rilancia il layout o adatta la vista.
- **Cerca nodo**: evidenzia i nodi che contengono il testo (in etichetta,
  sintassi o descrizione).
- **Importa / Esporta**: salva il grafo corrente in un file JSON o ricaricalo.

## Formato dei dati

I comandi sono file JSON nella cartella `data/`. `api/datasets.php` li elenca
automaticamente. Stesso formato usato dall'import/export.

```json
{
    "name": "git",
    "description": "Sistema di controllo versione distribuito",
    "nodes": [
        { "id": "git", "label": "git", "type": "command",
          "syntax": "git [opzioni] <comando>", "description": "..." },
        { "id": "git.commit", "label": "commit", "type": "subcommand",
          "syntax": "git commit [-m <msg>]", "description": "..." }
    ],
    "edges": [
        { "source": "git", "target": "git.commit" }
    ]
}
```

### Tipi di nodo (`type`)

| valore        | significato        | aspetto                |
|---------------|--------------------|------------------------|
| `command`     | comando radice     | blu, bordo spesso      |
| `subcommand`  | sottocomando       | verde                  |
| `option`      | opzione / flag     | arancione              |
| `placeholder` | segnaposto `<...>` | viola, tratteggiato    |

Gli `id` devono essere univoci all'interno del grafo. Per aggiungere un nuovo
comando basta creare un nuovo file in `data/` (es. `data/curl.json`).

## Struttura del progetto

```
index.php            pagina principale (shell + toolbar)
style.css            stile in linea con brusegan.it
js/graph.js          configurazione Cytoscape (stili, layout, resize/fit)
js/app.js            UI: caricamento, editing, ricerca, import/export
api/datasets.php     elenco/lettura dei dataset in data/
data/*.json          dataset dei comandi (git, docker, ssh, ...)
```
