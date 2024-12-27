/**
 * Script per:
 *   1) Installare dipendenze in produzione con Yarn + check-cache (su Windows)
 *   2) Comprimere i file/folder in "be-node-portfolio.zip"
 *
 * Per eseguirlo:
 *   yarn pack:prod
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const archiver = require("archiver");

// Elementi principali da includere (cartelle o file):
const itemsToZip = [
    "package.json",
    "yarn.lock",
    ".yarn-cache",
    ".yarnrc.yml",
    "certs",
    "dist",
];

// Funzione per raccogliere tutti i file .env.* nella root del progetto
function getEnvFiles() {
    const rootFiles = fs.readdirSync(process.cwd());
    // Filtra tutti i file che iniziano con ".env."
    return rootFiles.filter((file) => file.startsWith(".env."));
}

function main() {
    try {
        // 1) Installa dipendenze in produzione + check-cache
        console.log("Eseguo installazione in produzione (yarn install --check-cache)...");
        execSync("yarn install --check-cache", {
            stdio: "inherit",
            env: {
                ...process.env,        // Mantiene le variabili d'ambiente esistenti
                NODE_ENV: "production" // Imposta NODE_ENV=production
            }
        });

        // 2) Prepariamo la lista finale includendo eventuali file .env.*
        const envFiles = getEnvFiles();
        itemsToZip.push(...envFiles);

        // Assicuriamoci che esista la cartella build/
        const buildDir = path.join(process.cwd(), "build");
        if (!fs.existsSync(buildDir)) {
            fs.mkdirSync(buildDir, { recursive: true });
        }

        // Creiamo lo stream di output verso lo zip "be-node-portfolio.zip"
        const output = fs.createWriteStream(path.join(buildDir, "be-node-portfolio.zip"));

        // Inizializziamo archiver
        const archive = archiver("zip", { zlib: { level: 9 } });

        // Gestione errori
        archive.on("error", (err) => {
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
        itemsToZip.forEach((item) => {
            if (!fs.existsSync(item)) {
                console.warn(`Attenzione: "${item}" non esiste, verrà saltato.`);
                return;
            }
            const stats = fs.statSync(item);
            if (stats.isDirectory()) {
                archive.directory(item, path.basename(item));
            } else {
                archive.file(item, { name: path.basename(item) });
            }
        });

        // Finalizziamo l'archivio
        archive.finalize();
    } catch (err) {
        console.error("Errore durante l'esecuzione dello script:", err);
        process.exit(1);
    }
}

main();
