// tokenBlocklist.js
const tokenBlocklist = new Set()

module.exports = {
  add: token => tokenBlocklist.add(token),
  has: token => tokenBlocklist.has(token)
}
