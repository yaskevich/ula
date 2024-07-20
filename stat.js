/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import csv from 'async-csv';

const curDir = path.dirname(fileURLToPath(import.meta.url));
const fileName = 'ULIC_Urzedowy_2024-06-23.csv';
const csvContent = fs.readFileSync(path.join(curDir, 'data', fileName), 'utf-8');
const csvArr = await csv.parse(csvContent, { delimiter: ';', columns: true, skip_empty_lines: true, quote: null });
const counter = {};

csvArr.forEach(x => {
    const item = x.NAZWA_1;
    if (counter[item]) {
        counter[item] += 1;
    } else {
        counter[item] = 1;
    }
}
);

const sorted = Object.entries(counter).sort(([, a], [, b]) => b - a);
// console.log(sorted);
// console.log(sorted.filter(x => x[1] > 1).forEach(
//     // x => console.log(`${String(x[0]).padEnd(20, ' ')}${String(x[1]).padStart(6, ' ')}`)
//     x => console.log(`${x[0]}\t${x[1]}`)
// ));

const table = sorted.filter(x => x[1] > 1).map(
    // x => ${String(x[0]).padEnd(20, ' ')}${String(x[1]).padStart(6, ' ')}`
    x => `${x[0]}\t${x[1]}`
).join('\n');

try {
    fs.writeFileSync('./data/freq.json', JSON.stringify(sorted, null, 2));
    fs.writeFileSync('./data/freq.csv', table);
} catch (error) {
    console.log("Writing files: FAIL", error);
}
console.log("done!");