#!/bin/bash

set -e

NEW_VERSION=$1
VERSION_REGEXP='[0-9]+\.[0-9]+\.[0-9]+'
FULL_VERSION_REGEXP="^${VERSION_REGEXP}$"

if [[ ! $NEW_VERSION =~ $FULL_VERSION_REGEXP ]]; then
  echo "First param should be a version like X.X.X"
  exit 1
fi

echo "[Mumuki::Styles] Updating version..."
sed -i -r "s/\"version\": \"v${VERSION_REGEXP}/\"version\": \"v${NEW_VERSION}/" package.json
sed -i -r "s/\"version\": \"v${VERSION_REGEXP}/\"version\": \"v${NEW_VERSION}/" bower.json
sed -i -r "s/VERSION = \"${VERSION_REGEXP}/VERSION = \"${NEW_VERSION}/" gem/lib/mumuki/styles/version.rb

echo "[Mumuki::Styles] Generating dist..."
yarn build

echo "[Mumuki::Styles] Committing files..."
git ls-files -z dist/ | xargs -0 git update-index --no-skip-worktree
git add dist package.json bower.json gem/lib/mumuki/styles/version.rb
git commit -m "Welcome v${NEW_VERSION}!"

echo "[Mumuki::Styles] Tagging v$NEW_VERSION..."
git tag "v${NEW_VERSION}"

echo "[Mumuki::Styles] Pushing..."
git push origin HEAD --tags

echo "[Mumuki::Styles] Pushed. GitHub Actions will do the rest"
