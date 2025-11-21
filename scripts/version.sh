pnpm run version
git add .
npm_package_version=$(node -p "require('./package.json').version")
git commit -m "v${npm_package_version}"
git tag "v${npm_package_version}"
git push origin main --tags
