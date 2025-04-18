/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import csv from 'async-csv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const db = new DatabaseSync(path.join(dataDir, 'data.db'));

const files = ['ULIC', 'TERC', 'SIMC'];

for (const item of files) {
    const itemRegexp = new RegExp(item + ".*?\.csv");
    const itemCSV = fs.readdirSync(dataDir).find(x => x.match(itemRegexp));
    // console.log(item, itemCSV);
    if (!itemCSV) {
        console.error(`${item} file is not present!`);
        process.exit();
    }

    const csvContent = fs.readFileSync(path.join(dataDir, itemCSV), 'utf-8').replace(/[\u200B-\u200D\uFEFF]/g, '');
    const csvArr = await csv.parse(csvContent, { delimiter: ';', columns: true, skip_empty_lines: true, quote: null });
    const keys = Object.keys(csvArr[0]);

    await db.exec('BEGIN');
    try {
        await db.exec(`DROP TABLE IF EXISTS "${item}"`);
        const newSQL = `CREATE TABLE IF NOT EXISTS "${item}"(${keys.map(x => `"${x.toUpperCase()}" TEXT`).join(', ')})`;
        // console.log(newSQL);
        await db.exec(newSQL);
        const inSQL = `INSERT INTO ${item} (${keys.join(', ')}) VALUES (${"?,".repeat(keys.length).slice(0, -1)})`;
        // console.log(inSQL);
        const insert = db.prepare(inSQL);

        for (var i = 0; i < csvArr.length - 1; i++) {
            const x = csvArr[i];
            const params = keys.map(y => x[y.toUpperCase()]);
            insert.run(...params);
            // if (i && !(i % 100000)) {
            //     console.log(i);
            // }
        }
    } catch (error) {
        await db.exec('ROLLBACK');
        db.close();
        process.exit();
    }

    await db.exec('COMMIT');
    // console.log("commit");
    const select = db.prepare(`SELECT count(*) as qty FROM ${item}`);
    const allCount = await select.get();
    // 296306 via CLI import
    console.log('⬞ CSV', csvArr.length);
    console.log('⬞ SQL', allCount.qty);
    console.log(`⬞ ${item} → done!`);
}

db.close();



