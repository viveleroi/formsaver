#!/bin/bash
find . -name .svn -exec rm -rf {} \;
find . -name .DS_Store -exec rm -rf {} \;
mkdir build
mkdir build/chrome
cd chrome
zip -r formsaver.jar .
cd ..
cp chrome/formsaver.jar build/chrome/formsaver.jar
rm chrome/formsaver.jar
cp -R defaults build/
cp install.rdf build/install.rdf
cp chrome.manifest build/chrome.manifest
cd build
zip -r formsaver.xpi .
mv formsaver.xpi ../formsaver.xpi
cd ..
rm -rf build
echo -n extension build successful
