#!/bin/bash

# bundles lib files

if [ -z ${BASE_DIR+x} ]; then
    echo -e "\e[0;37m \e[41m BASE_DIR not defined \e[0m"
    exit 1
fi

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