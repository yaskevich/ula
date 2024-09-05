/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import csv from 'async-csv';

const curDir = path.dirname(fileURLToPath(import.meta.url));
const fileName = 'ULIC_Urzedowy_2024-06-23.csv';
const csvContent = fs.readFileSync(path.join(curDir, '..', 'data', fileName), 'utf-8').replace(/[\u200B-\u200D\uFEFF]/g, '');
const csvArr = await csv.parse(csvContent, { delimiter: ';', columns: true, skip_empty_lines: true, quote: null });
const counter = {};

const loc = {};

const wojs = {};

csvArr.forEach(x => {
    const woj = String(Number(x.WOJ));

    if (wojs[woj]) {
        wojs[woj] += 1;
    } else {
        wojs[woj] = 1;
    }

    let item = x.NAZWA_1;
    if (item.includes('Jana Pawła')) {
        item = "Jana Pawła II";
    } else if (item.includes('Piłsudskiego')) {
        item = "Piłsudskiego";
    }

    if (counter[item]) {
        counter[item] += 1;
        loc[item].push(woj);
    } else {
        counter[item] = 1;
        loc[item] = [woj];
    }
}
);

const allNum = csvArr.length;
for (let id in wojs) {
    const num = wojs[id];
    wojs[id] = [num, parseFloat((num / allNum * 100).toFixed(0))];
}
// console.log(wojs);
// process.exit();            {{val}}

const sorted = Object.entries(counter).sort(([, a], [, b]) => b - a);
const count = (arr) => arr.reduce((acc, curr) => (acc[curr] = (acc[curr] || 0) + 1, acc), {});
const objects = sorted.map(x => ({ name: x[0], freq: x[1], regions: Object.fromEntries(Object.entries(count(loc[x[0]])).map((item) => [[item[0]], [item[1], Number((item[1] / wojs[item[0]][0] * 100).toFixed(2) || 0)]])) }));
const table = sorted.filter(x => x[1] > 1).map(
    // x => ${String(x[0]).padEnd(20, ' ')}${String(x[1]).padStart(6, ' ')}`
    x => `${x[0]}\t${x[1]}`
).join('\n');

try {
    fs.writeFileSync(path.join(curDir, '..', 'data', 'freq.json'), JSON.stringify({
        regions: wojs,
        streets: objects
    }, null, 2));
    fs.writeFileSync(path.join(curDir, '..', 'data', 'freq.csv'), table);
} catch (error) {
    console.log("Writing files: FAIL", error);
}
console.log("done!");