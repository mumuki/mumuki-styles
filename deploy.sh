#!/bin/bash

set -e

NEW_VERSION=$1
VERSION_REGEXP='[0-9]+\.[0-9]+\.[0-9]+'
FULL_VERSION_REGEXP="^${VERSION_REGEXP}$"

if [[ ! $NEW_VERSION =~ $FULL_VERSION_REGEXP ]]; then
  echo "First param should be a version like X.X.X"
  exit 1
fi

sed -i -r "s/\"version\": \"v${VERSION_REGEXP}/\"version\": \"v${NEW_VERSION}/" package.json
sed -i -r "s/\"version\": \"v${VERSION_REGEXP}/\"version\": \"v${NEW_VERSION}/" bower.json
sed -i -r "s/VERSION = \"${VERSION_REGEXP}/VERSION = \"${NEW_VERSION}/" lib/mumuki/styles/version.rb

node_modules/.bin/gulp dist

git commit dist package.json bower.json lib/mumuki/styles/version.rb -m "Welcome v${NEW_VERSION}"

git tag "v${NEW_VERSION}"
git push origin HEAD --tags

rake release
