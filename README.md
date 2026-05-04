rm -rf node_modules package-lock.json   # purana hatao
npm install                              # fresh install + lockfile generate
git add package.json package-lock.json
git commit -m "Fresh install with lockfile"
git push
