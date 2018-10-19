#!/bin/bash

# moves files defined in npm dependencies to /static/lib/ directory

if [ -z ${BASE_DIR+x} ]; then
    echo -e "\e[0;37m \e[41m BASE_DIR not defined \e[0m"
    exit 1
fi

LIB_DIR=${BASE_DIR}/static/lib
FONTS_DIR=${BASE_DIR}/static/fonts
NODE_MODULES=${BASE_DIR}/node_modules

echo "Creating folders..."
if [ ! -d "${LIB_DIR}" ]; then
    echo " |- lib (${LIB_DIR})"
    mkdir -p ${LIB_DIR}
else
    echo " |- Skipping lib (exists)"
fi

if [ ! -d "${FONTS_DIR}" ]; then
    echo " |- fonts (${FONTS_DIR})"
    mkdir -p ${FONTS_DIR}
else
    echo " |- Skipping fonts (exists)"
fi

# step into node_modules folder
cd ${NODE_MODULES}

echo "Copying files from..."

# echo " |- FontAwesome"
# cp -r font-awesome/css/font-awesome.min.css ${LIB_DIR}/
# cp -r font-awesome/fonts/* ${FONTS_DIR}/

# echo " |- Handlebars"
# cp handlebars/dist/handlebars.min.js ${LIB_DIR}/

# echo " |- jQuery"
# cp jquery/dist/jquery.min.js ${LIB_DIR}/

# echo " |- jQuery UI"
# cp jquery-ui-dist/jquery-ui.min.js ${LIB_DIR}/

echo " |- Normalize.css"
cp normalize.css/normalize.css ${LIB_DIR}/

echo " |- Vue.js"
cp vue/dist/vue.min.js ${LIB_DIR}/

echo " |- Vue-resource.js"
cp vue-resource/dist/vue-resource.min.js ${LIB_DIR}/

source ${BASE_DIR}/bash/npm-bundle_lib.sh
