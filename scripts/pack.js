/**
 * Script per comprimere i file e le cartelle necessari
 * in un archivio ZIP chiamato "be-node-portfolio.zip",
 * dentro la cartella "build".
 *
 * Per eseguirlo:
 *   yarn pack:prod
 * (o npm run pack:prod)
 */

const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

// Elementi principali da includere (cartelle o file):
const itemsToZip = [
    "package.json",
    "yarn.lock",
    ".yarn-cache",
    "node_modules",
    ".yarnrc.yml",
    "certs",
    "dist",
];

// Funzione per raccogliere tutti i file .env.* nella root del progetto
function getEnvFiles() {
    const rootFiles = fs.readdirSync(process.cwd());
    // Filtra tutti i file che iniziano con ".env."
    return rootFiles.filter(file => file.startsWith(".env."));
}

function main() {
    // Aggiungiamo i .env.* trovati nella root
    const envFiles = getEnvFiles();
    itemsToZip.push(...envFiles);

    // Assicuriamoci che esista la cartella build/
    const buildDir = path.join(process.cwd(), "build");
    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
    }

    // Creiamo lo stream di output verso lo zip "be-node-portfolio.zip" nella cartella "build/"
    const output = fs.createWriteStream(path.join(buildDir, "be-node-portfolio.zip"));

    // Inizializziamo archiver
    const archive = archiver("zip", {
        zlib: { level: 9 }, // livello di compressione massimo
    });

    // Gestione errori
    archive.on("error", err => {
        throw err;
    });

    // Quando l'archivio è finalizzato, scriviamo un messaggio di completamento
    output.on("close", () => {
        console.log(`Creato ZIP con ${archive.pointer()} byte`);
        console.log(`File generato: ${path.join(buildDir, "be-node-portfolio.zip")}`);
    });

    // Colleghiamo lo stream di archiver con il file di output
    archive.pipe(output);

    // Aggiungiamo gli elementi da zippare
    itemsToZip.forEach(item => {
        if (!fs.existsSync(item)) {
            console.warn(`Attenzione: "${item}" non esiste, verrà saltato.`);
            return;
        }
        const stats = fs.statSync(item);
        if (stats.isDirectory()) {
            // aggiunge ricorsivamente tutti i file della cartella
            archive.directory(item, path.basename(item));
        } else {
            // aggiunge un singolo file
            archive.file(item, { name: path.basename(item) });
        }
    });

    // Finalizziamo l'archivio
    archive.finalize();
}

main();
