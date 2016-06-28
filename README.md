```javascript
var IBLT = require('iblt')
var assert = require('assert')
var murmur = require('murmurhash').v3

var m = 10

var table = new IBLT({
  m: m,
  hashes: [single, double, triple]
})

function single (argument) {
  return murmur(Number(argument).toString()) % m
}

function double (argument) {
  return murmur(murmur(Number(argument).toString())) % m
}

function triple (argument) {
  return murmur(murmur(murmur(Number(argument).toString()))) % m
}

table.insert(100, 123)
table.insert(200, 456)
table.insert(300, 789)

assert.equal(table.get(100), 123)
assert.equal(table.get(200), 456)
assert.equal(table.get(300), 789)

table.delete(300, 789)
assert.equal(table.get(300), null)

var clone = table.clone()

assert(clone instanceof IBLT)

var entries = table.listEntries()

assert(entries.succeeded)

assert(entries.outputList.some(function (x) {
  return x[0] === 100 && x[1] === 123
}))

assert(entries.outputList.some(function (x) {
  return x[0] === 200 && x[1] === 456
}))

clone.insert(400, 246)

var cloneEntries = clone.listEntries()

assert(cloneEntries.succeeded)

assert(cloneEntries.outputList.some(function (x) {
  return x[0] === 100 && x[1] === 123
}))

assert(cloneEntries.outputList.some(function (x) {
  return x[0] === 200 && x[1] === 456
}))

assert(cloneEntries.outputList.some(function (x) {
  return x[0] === 400 && x[1] === 246
}))
```
