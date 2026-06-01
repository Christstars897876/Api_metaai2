const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require('helmet');
const compression = require('compression');
const log = require("./includes/log");
const config = require("./config.json");

global.config = config;
global.api = new Map();

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.static(path.join(__dirname, 'includes', 'public'), { maxAge: '1d', etag: true }));
app.use(express.static(path.join(__dirname, 'includes', 'web'), { maxAge: '1d', etag: true }));

const router = require("./includes/router");
app.use(router);

app.get("/config", (req, res) => {
  res.json(config);
});

app.enable('trust proxy');
app.set("json spaces", 2);

app.get("/", (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "includes", "public", "index.html"));
  } catch (error) {
    res.status(500).send('Erreur interne du serveur.');
  }
});

app.use((req, res) => {
  try {
    res.status(404).sendFile(path.join(__dirname, "includes", "public", "404.html"));
  } catch (error) {
    res.status(404).send('Page introuvable.');
  }
});

const PORT = process.env.PORT || config.port || 3000;
app.listen(PORT, () => {
  log.main(`Serveur démarré avec succès sur le port ${PORT}`);
});

