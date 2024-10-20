import express from 'express';
import path, { dirname } from 'path';
import compression from 'compression';
import bodyParser from 'body-parser';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import re from "@alexfrankcodes/random-emoji";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __package = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

// const dictPath = path.join(__dirname, '..', 'data', 'dict.json')
const ontoPath = path.join(__dirname, '..', 'data', 'onto.json')

const db = await open({ filename: path.join(__dirname, '..', 'data', 'data.db'), driver: sqlite3.cached.Database });

// await db.exec('CREATE TABLE IF NOT EXISTS ontology (id INTEGER PRIMARY KEY AUTOINCREMENT, emoji TEXT, title TEXT, en TEXT, names JSON, level INTEGER, parent INTEGER NOT NULL DEFAULT 0, leaf BOOLEAN DEFAULT(FALSE))');

// await db.close();

// let db = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'cats.json'))).filter(x => !parseInt(x.stem));
// console.log(db);

// const ontology = {};
// const dict = {};

// db.forEach(el => {
//   const item = { 'stem': el.stem, name: el.name };
//   if (el.feature === 'wishful') {
//     item['wishful'] = true;
//   }
//   if (el.type in ontology) {
//     ontology[el.type].push(item)
//   } else {
//     ontology[el.type] = [item]
//   }

//   dict[el.name] = el.stem;
//   // console.log(el.stem, el.type, el.feature);
// });

// console.log(ontology);
// console.log(dict);
// fs.writeFileSync(dictPath, JSON.stringify(dict));

// fs.writeFileSync(ontoPath, JSON.stringify(ontology));

// environment variables

const getEmoji = () => [...re.random()].shift();

const getOntology = async () => {
  const data = JSON.parse(fs.readFileSync(ontoPath, "utf8"));
  const parsed = {};
  // const emojis = ['🏪', '😜', ' 🌒', '⛵️', '🔮', '🎉', '🌟', '🐫', '🖐', '🐗', '🚍', '📚', '😋', '4️⃣', '🌘'];

  for (let x of Object.entries(data)) {
    const rels = {};
    const name = x[0] || "<unsorted>";
    const emo = getEmoji();
    const result = await db.run(
      'INSERT INTO ontology (emoji, title, en) VALUES (?, ?, ?)',
      emo, name, name
    );
    const names = {};
    for (const y of x[1]) {
      const word = y.stem.trim();
      if (word) {
        names[word] = word in names ? [...names[word], y.name] : [y.name]
        rels[word] = { emoji: getEmoji(), stem: word, names: names[word], parent: result.lastID };
      }
    }
    const item = { emoji: emo, children: rels };

    for (const z in rels) {
      const v = rels[z];
      const result = await db.run(
        'INSERT INTO ontology (emoji, title, en, names, parent, leaf) VALUES (?, ?, ?, ?, ?, ?)',
        v.emoji, v.stem, v.stem, JSON.stringify(v.names), v.parent, true
      );
    }
  }
};

// await db.exec('CREATE TABLE ontology (id INTEGER PRIMARY KEY AUTOINCREMENT, emoji TEXT, title TEXT, en TEXT, names JSON, level INTEGER, parent INTEGER NOT NULL DEFAULT 0, leaf BOOLEAN DEFAULT(FALSE))');
// getOntology();


const port = process.env.PORT || 8080;
const appName = __package?.name || String(port);

const app = express();

app.use(compression());
app.set('trust proxy', 1);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(history());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/api/topic', async (req, res) => {
  // console.log(req.body);
  const result = req.body.id ?
    await db.run(
      'UPDATE ontology SET emoji = ? , title = ?, en = ?, names = ?, parent = ? WHERE id = ?',
      req.body.emoji,
      req.body.title,
      req.body.en,
      req.body.names,
      req.body.parent,
      req.body.id
    ) : await db.run(
      'INSERT INTO ontology (emoji, title, en, names, parent, leaf) VALUES (?, ?, ?, ?, ?, ?)',
      req.body.emoji || getEmoji(), req.body.title, req.body.title, JSON.stringify(req.body.names), req.body.parent || 65, true
    );
  res.json(result);
});

app.get('/api/onto', async (req, res) => {
  const result = await db.all('SELECT * FROM ontology ORDER BY title');
  res.json(result);
});

app.get('/api/default', async (req, res) => {
  const result = await db.all("SELECT * FROM ontology WHERE title = '<unsorted>'");
  res.json(result?.shift());
});

app.listen(port);
console.log(`Backend is at port ${port}`);
