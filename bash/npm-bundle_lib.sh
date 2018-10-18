#!/bin/bash

# bundles lib files

BASE_DIR=~/Dev/notes.mageshravi.com
LIB_DIR=${BASE_DIR}/static/lib
FONTS_DIR=${BASE_DIR}/static/fonts

OUTPUT_DIR=${BASE_DIR}/static

echo "Bundling files..."
echo " | (${OUTPUT_DIR})"

echo " |- css/lib.css"
cat ${LIB_DIR}/*.css > ${OUTPUT_DIR}/css/lib.css

echo " |- js/lib.js"
rm ${OUTPUT_DIR}/js/lib.js
# Order of JS files is very important.
for file in "vue.min.js" "vue-resource.min.js"
do
    echo "  |- ${file}"
    (cat "${LIB_DIR}/${file}"; echo) >> ${OUTPUT_DIR}/js/lib.js
done

echo "DONE"