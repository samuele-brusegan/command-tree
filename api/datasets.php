<?php
/**
 * API minimale per i dataset dei comandi.
 *
 *   GET api/datasets.php              -> elenco dataset disponibili in /data
 *   GET api/datasets.php?name=git     -> contenuto del dataset "git"
 *
 * I dataset sono file JSON nella cartella /data. La parte di editing avviene
 * lato client (import/export JSON), quindi qui esponiamo solo la lettura.
 */

header('Content-Type: application/json; charset=utf-8');

$dataDir = __DIR__ . '/../data';

/** Restituisce un errore JSON e termina. */
function fail(int $code, string $message): void
{
    http_response_code($code);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$name = $_GET['name'] ?? null;

if ($name === null) {
    // Elenco dataset: nome + descrizione presa dal JSON.
    $list = [];
    foreach (glob($dataDir . '/*.json') as $file) {
        $key = basename($file, '.json');
        $json = json_decode((string) file_get_contents($file), true);
        $list[] = [
            'name'        => $key,
            'title'       => $json['name'] ?? $key,
            'description' => $json['description'] ?? '',
        ];
    }
    usort($list, fn ($a, $b) => strcmp($a['name'], $b['name']));
    echo json_encode($list, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Caricamento di un singolo dataset, con difesa contro il path traversal.
if (!preg_match('/^[A-Za-z0-9_-]+$/', $name)) {
    fail(400, 'Nome dataset non valido.');
}

$file = $dataDir . '/' . $name . '.json';
if (!is_file($file)) {
    fail(404, 'Dataset non trovato.');
}

$raw = file_get_contents($file);
if ($raw === false || json_decode($raw) === null) {
    fail(500, 'Dataset illeggibile o JSON non valido.');
}

echo $raw;
