#!/bin/bash

cd "${PWD}/../data/"
DB="${PWD}/data.db"
CSV='./gram/morphyNet-pol.derivational.v1.tsv'
TABLE="morph"
echo $CSV $TABLE
sqlite3 $DB << EOF
delete from $TABLE;
.mode tabs
.import $CSV $TABLE
EOF
