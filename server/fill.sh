#!/bin/bash

cd "${PWD}/../data/"
DB="${PWD}/data.db"
CSV=$(find ./ -name 'ULIC*.csv')
TABLE="list"
echo $CSV $TABLE
sqlite3 $DB << EOF
delete from $TABLE;
.separator ;
.import $CSV $TABLE
EOF
