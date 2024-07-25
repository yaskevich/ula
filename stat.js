/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import csv from 'async-csv';

const curDir = path.dirname(fileURLToPath(import.meta.url));
const fileName = 'ULIC_Urzedowy_2024-06-23.csv';
const csvContent = fs.readFileSync(path.join(curDir, 'data', fileName), 'utf-8').replace(/[\u200B-\u200D\uFEFF]/g, '');
const csvArr = await csv.parse(csvContent, { delimiter: ';', columns: true, skip_empty_lines: true, quote: null });
const counter = {};

const loc = {};

csvArr.forEach(x => {
    let item = x.NAZWA_1;
    if (item.includes('Jana Pawła')){
        item = "Jana Pawła II";
    } else if (item.includes('Piłsudskiego')){
        item = "Piłsudskiego";
    }
    if (counter[item]) {
        counter[item] += 1;
        loc[item].push(x.WOJ);
    } else {
        counter[item] = 1;
        loc[item] = [x.WOJ];
    }
}
);

const sorted = Object.entries(counter).sort(([, a], [, b]) => b - a);
// console.log(sorted);
// console.log(sorted.filter(x => x[1] > 1).forEach(
//     // x => console.log(`${String(x[0]).padEnd(20, ' ')}${String(x[1]).padStart(6, ' ')}`)
//     x => console.log(`${x[0]}\t${x[1]}`)
// ));



const count = (arr) => arr.reduce((acc, curr) => (acc[curr] = (acc[curr] || 0) + 1, acc), {});
const objects = sorted.map(x => ({[x[0]]: { name: x[0], freq: x[1], regions: count (loc[x[0]]) }})); 
// process.exit();

const table = sorted.filter(x => x[1] > 1).map(
    // x => ${String(x[0]).padEnd(20, ' ')}${String(x[1]).padStart(6, ' ')}`
    x => `${x[0]}\t${x[1]}\t${[...new Set(loc[x[0]])]}`
).join('\n');

try {
    fs.writeFileSync('./data/freq.json', JSON.stringify(objects, null, 2));
    fs.writeFileSync('./data/freq.csv', table);
} catch (error) {
    console.log("Writing files: FAIL", error);
}
console.log("done!");