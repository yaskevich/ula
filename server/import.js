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
const fileName = 'ULIC_Urzedowy_2024-06-23.csv';
const csvContent = fs.readFileSync(path.join(dataDir, fileName), 'utf-8').replace(/[\u200B-\u200D\uFEFF]/g, '');
const csvArr = await csv.parse(csvContent, { delimiter: ';', columns: true, skip_empty_lines: true, quote: null });

const insert = db.prepare('insert into list (woj, pow, gmi, rodz_gmi, sym, sym_ul, cecha, nazwa_1, nazwa_2, stan_na) values (?,?,?,?,?,?,?,?,?,?)');
const select = db.prepare('SELECT count(*) as qty FROM list');

await db.exec('BEGIN');

try {
    await db.exec('DROP TABLE IF EXISTS "list"');
    await db.exec('CREATE TABLE IF NOT EXISTS "list"("WOJ" TEXT, "POW" TEXT, "GMI" TEXT, "RODZ_GMI" TEXT, "SYM" TEXT, "SYM_UL" TEXT, "CECHA" TEXT, "NAZWA_1" TEXT, "NAZWA_2" TEXT, "STAN_NA" TEXT)');


    for (var i = 0; i < csvArr.length - 1; i++) {
        const x = csvArr[i];
        insert.run(x.WOJ, x.POW, x.GMI, x.RODZ_GMI, x.SYM, x.SYM_UL, x.CECHA, x.NAZWA_1, x.NAZWA_2, x.STAN_NA);
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
const allCount = await select.get();
// 296306 via CLI import
console.log('⬞ CSV', csvArr.length);
console.log('⬞ SQL', allCount.qty);
db.close();
console.log('⬞ done!');
