import express from 'express';
import path, { dirname } from 'path';
import compression from 'compression';
import bodyParser from 'body-parser';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __package = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

// environment variables
const port = process.env.PORT || 8080;
const appName = __package?.name || String(port);

const app = express();

app.use(compression());
app.set('trust proxy', 1);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(history());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/data', auth, async (req, res) => {
  const data = {};
  res.json(data);
});

app.post('/api/record', auth, async (req, res) => {
  const word = req.body.word + '\n';
  res.send('ok');
});

app.listen(port);
console.log(`Backend is at port ${port}`);
