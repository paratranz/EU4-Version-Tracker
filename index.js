const path = require('path')
const glob = require('glob')
const {execSync} = require('child_process')
const fs = require('fs-extra')
const defaultDir = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Europa Universalis IV'

const version = process.argv[2]
const gameDir = process.argv[3] || defaultDir

if (!/^[.\d]+$/.test(version)) {
  console.error('Please specify a valid version, eg. 1.26.1')
  process.exit(1)
}

const filelist = fs.readFileSync(path.join(__dirname, 'filelist.txt')).toString().split(/\r?\n/).filter(line => line && line.trim())

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

fs.emptyDirSync(path.join(__dirname, 'diff'))
execSync('git checkout HEAD -- diff')
execSync(`git add .`)
execSync(`git commit -am ${version}`)
execSync('node diff ' + version)