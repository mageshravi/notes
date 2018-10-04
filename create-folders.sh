#!/bin/bash

CYAN='\e[0;36m'
NC='\e[0m' # NO_COLOR
color=${CYAN}
tag='INFO'

# Make folders required for npm-frontend-workflow

for folder in scripts scripts-es6 scss static static/css static/js static/images static/wicons public public/css public/js
do
    mkdir ${folder}
    echo -e "${color}[${tag}] Creating folder: ${folder}${NC}"
done
