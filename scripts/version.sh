#!/bin/sh

set -e

if [ "$(git branch --show-current)" != "master" ]; then
    echo "Need to be on master branch to run this script."
    exit 1
fi

npm run version
npm run check
npm_package_version=$(node -p "require('./package.json').version")

echo "Are you sure you want to commit ${npm_package_version}? (y/N)"
read answer
if [[ $answer != "y" ]]; then
  echo "Aborting."
  exit 1
fi
git add .
git commit -m "v${npm_package_version}"
git tag "v${npm_package_version}" -m "v${npm_package_version}"

echo "Are you sure you want to push ${npm_package_version}? (y/N)"
read answer
if [[ $answer != "y" ]]; then
  echo "Aborting."
  exit 1
fi
git push
git push origin --tags
echo "DONE!"
