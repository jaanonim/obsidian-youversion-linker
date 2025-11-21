git pull
pnpm run version
git add .
npm_package_version=$(node -p "require('./package.json').version")
git commit -m "v${npm_package_version}"
git tag "v${npm_package_version}" -m "v${npm_package_version}"
git push
git push origin --tags
