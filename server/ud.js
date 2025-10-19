import path, { dirname } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

dotenv.config();


const udpipe = async (id, data, lang) => {
    const body = new FormData();
    body.set('tokenizer', '');
    body.set('tagger', '');
    body.set('parser', '');
    body.set('model', lang);
    body.set('data', data);

    const response = await fetch('https://lindat.mff.cuni.cz/services/udpipe/api/process', { method: 'POST', body });

    if (response.ok) {
        const json = await response.json();
        return json.result;
    }

    console.log(`[${id}] Response status: ${response.status}`);
    // throw new Error(`Response status: ${response.status}`);
    return '';
};

const db = await open({ filename: path.join(process.env.DATA, 'data.db'), driver: sqlite3.cached.Database });

const list = (await db.all('SELECT * from ontology')).map(x => JSON.parse(x.names)).filter(x => x).flat();
// console.log(list);
// for (const item of result) {
// if (!list.includes(item.name)) {
// console.log(item);
// }
// }

const clean = (conll) => JSON.stringify(conll.split('\n').slice(7).filter(x => x).map(x => x.split('\t')));

const processNext = async () => {
    const unit = await db.get('SELECT ranking.name FROM ranking LEFT JOIN meta USING (name) WHERE id is NULL LIMIT 1');
    console.log("ud", unit);
    const text = unit.name;
    const output = await udpipe(1, text, 'pol');
    const outputLow = await udpipe(1, text.toLowerCase(), 'pol');
    await db.run('INSERT INTO meta (name, ud, udlow) VALUES (?, ?, ?)', unit.name, clean(output), clean(outputLow));
};

// await processNext();

setInterval(processNext, 1000);
