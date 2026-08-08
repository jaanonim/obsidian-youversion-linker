set -e

git pull
npm run version
npm run check
git add .
npm_package_version=$(node -p "require('./package.json').version")
git commit -m "v${npm_package_version}"
git tag "v${npm_package_version}" -m "v${npm_package_version}"
git push
git push origin --tags
