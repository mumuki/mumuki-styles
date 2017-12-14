#!/bin/bash

set -e

NEW_VERSION=$1
VERSION_REGEXP='[0-9]+\.[0-9]+\.[0-9]+'
FULL_VERSION_REGEXP="^${VERSION_REGEXP}$"

if [[ ! $NEW_VERSION =~ $FULL_VERSION_REGEXP ]]; then
  echo "First param should be a version like X.X.X"
  exit 1
fi

sed -r "s/\"version\": \"v${VERSION_REGEXP}/\"version\": \"v${NEW_VERSION}/" package.json > package.json.new
sed -r "s/\"version\": \"v${VERSION_REGEXP}/\"version\": \"v${NEW_VERSION}/" bower.json > bower.json.new

sed -r "s/VERSION = \"${VERSION_REGEXP}/VERSION = \"${NEW_VERSION}/" lib/mumuki/styles/version.rb > lib/mumuki/styles/version.rb.new

rm package.json bower.json lib/mumuki/styles/version.rb

mv package.json.new                  package.json
mv bower.json.new                    bower.json
mv lib/mumuki/styles/version.rb.new  lib/mumuki/styles/version.rb

node_modules/.bin/gulp dist
git tag "v${NEW_VERSION}"
git add .
git commit -m "Welcome v${NEW_VERSION}"
git push origin --tags

rake release
