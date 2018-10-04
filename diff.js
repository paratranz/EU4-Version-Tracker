const path = require('path')
const fs = require('fs-extra')
const {execSync} = require('child_process')

const version = process.argv[2]

if (!/^[.\d]+$/.test(version)) {
  console.error('Please specify a valid version, eg. 1.26.1')
  process.exit(1)
}

const changedFiles = execSync('git diff --name-only HEAD HEAD~1').toString()
  .split(/\r?\n/).filter(file => /\//.test(file) && !/diff\//.test(file))
const diffDir = path.join(__dirname, 'diff')
fs.emptyDirSync(diffDir)
for (const file of changedFiles) {
  if (!file) {
    continue
  }
  fs.outputFileSync(path.join(diffDir, file), fs.readFileSync(file))
  console.log(file, 'copied')
}

execSync(`git add .`)
execSync(`git commit -am "Diff ${version}"`)