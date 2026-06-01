const router = require("express").Router();
const { readdirSync } = require('fs-extra');
const path = require('path');
const log = require('./log');
const compression = require('compression');

// Dossier contenant vos scripts d'API (art.js, gpt.js, etc.)
const srcPath = path.join(__dirname, "../api/");

router.use(compression());

const apiCache = new Map();

try {
  const apiFiles = readdirSync(srcPath).filter(file => file.endsWith(".js"));
  apiFiles.forEach(file => {
    const filePath = path.join(srcPath, file);
    const api = require(filePath);

    if (!api.config && api.meta) api.config = api.meta;
    if (!api.initialize && api.onStart) api.initialize = api.onStart;

    if (api.config && api.initialize) {
      apiCache.set(api.config.name, api);
    } else {
      log.warn(`Le module ${file} a été sauté (propriétés manquantes).`);
    }
  });
} catch (err) {
  console.error(`Impossible de charger le dossier des APIs: ${err.message}`);
}

// Liaison dynamique des routes Express
apiCache.forEach((api, name) => {
  const routePath = `/api/${name}`;
  router.get(routePath, async (req, res) => {
    try {
      await api.initialize({ req, res, log });
    } catch (error) {
      if (log && log.error) log.error(`Erreur critique sur la route /api/${name} : ${error.message}`);
      if (!res.headersSent) {
        res.status(500).json({ error: "Une erreur interne s'est produite sur le serveur." });
      }
    }
  });
});

module.exports = router;

