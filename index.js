const path = require('path')
const glob = require('glob')
const {execSync} = require('child_process')
const fs = require('fs-extra')
const defaultDir = fs.readFileSync('./gamedir.txt').toString()

const version = fs.readFileSync(path.join(__dirname, 'version.txt')).toString().trim()
const gameDir = process.argv[2] || defaultDir

if (!/^[.\d]+$/.test(version)) {
  console.error('Please specify a valid version, eg. 1.26.1')
  process.exit(1)
}
const diffDir = path.join(__dirname, 'diff')

const filelist = fs
  .readFileSync(path.join(__dirname, 'filelist.txt'))
  .toString()
  .split(/\r?\n/)
  .filter(line => line && line.trim())

const files = []

for (const item of filelist) {
  const results = glob.sync(item, {
    cwd: gameDir
  })
  files.push(...results)
}

for (const filename of files) {
  fs.copySync(path.join(gameDir, filename), path.join(__dirname, filename))
  console.log(filename, 'copied')
}

fs.removeSync(path.join(__dirname, 'diff'))

execSync(`git add .`)
execSync(`git commit -am ${version}`)

const changedFiles = execSync('git diff --name-only HEAD~1')
  .toString()
  .split(/\r?\n/)
  .filter(file => /\//.test(file))

fs.removeSync(diffDir)

for (const file of changedFiles) {
  if (!file || !fs.existsSync(file)) {
    continue
  }
  if (!/\.(txt|yml|csv)$/.test(file) || /diff/.test(file) || !/\//.test(file)) {
    continue
  }
  fs.outputFileSync(path.join(diffDir, file), fs.readFileSync(file))
  console.log(file, 'copied')
}

execSync(`git add .`)
execSync(`git commit -a -m "diff ${version}"`)
