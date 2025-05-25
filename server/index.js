import express from 'express';
import path, { dirname } from 'path';
import compression from 'compression';
import bodyParser from 'body-parser';
import history from 'connect-history-api-fallback';
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

// const dictPath = path.join(__dirname, './', 'data', 'dict.json')
const ontoPath = path.join(process.env.DATA, 'onto.json')

const db = await open({ filename: path.join(process.env.DATA, 'data.db'), driver: sqlite3.cached.Database });

// await db.exec('CREATE TABLE IF NOT EXISTS ontology (id INTEGER PRIMARY KEY AUTOINCREMENT, emoji TEXT, title TEXT, en TEXT, names JSON, level INTEGER, parent INTEGER NOT NULL DEFAULT 0, leaf BOOLEAN DEFAULT(FALSE))');


// import
// delete from list where nazwa_1 is null;

await db.exec('CREATE TABLE IF NOT EXISTS morph (basis TEXT, word TEXT, pos1 TEXT, pos2 TEXT, formant TEXT, class TEXT)');
await db.exec('CREATE TABLE IF NOT EXISTS ranking (sym_ul TEXT, rank INTEGER, qty INTEGER, name TEXT)');
// insert into ranking (rank, sym_ul,name, qty) SELECT row_number() over (order by COUNT(nazwa_1) DESC) as 'rank', sym_ul, NAZWA_1 AS name, COUNT(nazwa_1) AS qty FROM ulic GROUP BY NAZWA_1 ORDER BY qty DESC;


// miły	mile	J	R	e	suffix


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

// const pop = await db.all("SELECT NAZWA_1 AS name, COUNT(nazwa_1) AS qty FROM ulic GROUP BY NAZWA_1 ORDER BY qty DESC LIMIT 500");
// let i = 0;
// for (let item of pop) {
//   i += 1;
//   const q = `select * from ulic where nazwa_1 like '%${item.name}%' and pow = 65 and woj = 14`;
//   const r = await db.get(q);
//   if (!r?.NAZWA_1) {
//     console.log(i, "\t", item.name, "\t", item.qty);
//   }
// }

// const pop = await db.all("SELECT NAZWA_1 AS name, COUNT(nazwa_1) AS qty FROM ulic GROUP BY NAZWA_1 ORDER BY qty DESC LIMIT 500");
// let i = 0;
// for (let item of pop) {
//   i += 1;
//   const q = `select * from ulic where nazwa_1 like '%${item.name}%' and pow = 65 and woj = 14`;
//   const r = await db.get(q);
//   if (!r?.NAZWA_1) {
//     console.log(i, "\t", item.name, "\t", item.qty);
//   }
// }


const port = process.env.PORT || 8080;
const appName = __package?.name || String(port);
const app = express();
app.use(compression());
app.set('trust proxy', 1);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(history({
  index: '/',
  // verbose: true,
  rewrites: [
    { from: /\/api\/.*$/, to: (context) => context.parsedUrl.pathname + (context.parsedUrl.search || '') }
  ]
}));
app.use(express.static(path.join(__dirname, 'public')));

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

app.get('/api/ontology', async (req, res) => {
  const result = await db.all('SELECT * FROM ontology ORDER BY title');
  res.json(result);
});

app.get('/api/default', async (req, res) => {
  const result = await db.all("SELECT * FROM ontology WHERE title = '<unsorted>'");
  res.json(result?.shift());
});

app.get('/api/groups', async (req, res) => {
  const result = await db.all("SELECT woj as region, nazwa_1 as title, count(nazwa_1) as qty FROM ulic WHERE title IS NOT NULL GROUP BY nazwa_1, woj ORDER BY count(nazwa_1) DESC");
  const hash = {};
  for (const item of result) {
    const datum = { title: item.title, qty: item.qty };
    if (hash?.[item.region]) {
      hash[item.region].push(datum);
    } else {
      hash[item.region] = [datum];
    }
  }
  res.json(hash);
});

app.get('/api/regions', async (req, res) => {
  const allCount = await db.get("SELECT count(*) as qty FROM ulic where nazwa_1 <> '' ");
  // console.log(allCount);
  const result = await db.all("SELECT woj as woj, count(*) as qty, round(100.0 * count(*)/?) as pc FROM ulic where nazwa_1 <> '' group by woj order by qty DESC", allCount.qty);
  res.json(Object.fromEntries(result.map(item => [item.woj, [item.qty, item.pc]])));
});

app.get('/api/street/:name', async (req, res) => {
  const name = req.params.name;
  const regions = await db.all("SELECT woj as woj, count(woj) as qty FROM ulic WHERE nazwa_1 IS NOT NULL GROUP BY woj");
  const stats = Object.fromEntries(regions.map(item => [item.woj, item.qty]));
  const allCount = await db.get("SELECT count(*) as qty FROM ulic where nazwa_1 = ?", name);
  const result = await db.all("select woj as woj, count(NAZWA_1) as qty, round(100.0 * count(nazwa_1)/?) as pc from ulic where nazwa_1 = ? group by woj", allCount.qty, name);
  const reply = {
    name,
    freq: allCount.qty,
    regions: Object.fromEntries(result.map(item => [item.woj, [item.qty, (100.0 * item.qty / stats[item.woj]).toFixed(2), item.pc, stats[item.woj]]]))
  }
  res.json(reply);
});

app.get('/api/names{/:id}', async (req, res) => {
  const lim = 500;
  const id = Number(req.params.id);
  const offset = id ? id < 50 ? 0 : (id - 50) : 0;
  const result = await db.all(`SELECT row_number() over (order by COUNT(nazwa_1) DESC) as 'rank', NAZWA_1 AS name, COUNT(nazwa_1) AS qty FROM ulic GROUP BY NAZWA_1 ORDER BY qty DESC LIMIT ${offset}, ${lim}`);
  res.json(result);
});

app.get('/api/name', async (req, res) => {
  const result = await db.all("SELECT * FROM (SELECT row_number() over (order by COUNT(nazwa_1) DESC) as 'rank', NAZWA_1 AS name, COUNT(nazwa_1) AS qty FROM ulic GROUP BY NAZWA_1 ORDER BY qty DESC) as subquery WHERE name = ?", req.query.name);
  res.json(result.shift());
});

app.get('/api/words', async (req, res) => {
  const result = await db.all("SELECT LENGTH(nazwa_1) - LENGTH(REPLACE(nazwa_1,' ', '')) + 1 AS words, COUNT(*) as qty FROM ulic GROUP BY words ORDER BY words desc");
  res.json(result);
});

app.get('/api/unit', async (req, res) => {
  const result = await db.get(req.query.sym.length > 6 ? "SELECT * FROM ulic WHERE sym = ?" : "select * from terc where rowid = ?", req.query.sym);
  res.json(result);
});

app.get('/api/streets', async (req, res) => {
  let result;

  let sql = 'SELECT ulic.*, ranking.rank, ranking.qty as ttl, length(cast(ranking.rank as integer)) as ord FROM ulic join ranking on ulic.sym_ul = ranking.sym_ul WHERE ';
  if (req.query.sym.length > 6) {
    result = await db.all(sql + "sym = ?", req.query.sym);
  } else {
    const info = await db.get("select * from terc where rowid = ?", req.query.sym);
    const vals = [];
    if (info.WOJ) {
      sql += 'WOJ = ?';
      vals.push(info.WOJ);
      if (info.POW) {
        sql += ' AND POW = ?';
        vals.push(info.POW);
        if (info.GMI) {
          sql += ' AND GMI = ?';
          vals.push(info.GMI);
        }
      }
    }
    result = await db.all(sql, vals);
  }
  res.json(result);
});

app.get('/api/places', async (req, res) => {
  const table = ((req.query.woj && req.query.pow && req.query.gmi) || req.query.sym) ? 'simc' : 'terc';
  // const region = req.params.region ? String(Number(req.params.region)).padStart(2, '0') : '';
  // const district = req.params.district ? String(Number(req.params.district)).padStart(2, '0') : '';
  // console.log(`|${region}|${district}|`);
  const sql = `SELECT ROWID as key, * from ${table} where ${Object.keys(req.query).map(x => x + '=?').join(' AND ')}`;
  console.log(sql);
  const result = await db.all(sql, Object.values(req.query));
  res.json(result);
});

app.listen(port);
console.log(`Backend is at port ${port}`);
