This package naively implements the data structure described in [_Invertible Bloom Lookup Tables_ by Goodrich & Mitzenmacher](https://arxiv.org/abs/1101.2245).

The examples in this file are run as the package's test suite.

## Initialization

```javascript
var IBLT = require('iblt')

var m = 10

var table = new IBLT({
  m: m,
  hashes: [single, double, triple]
})

var murmur = require('murmurhash').v3

function single (argument) {
  return murmur(Number(argument).toString()) % m
}

function double (argument) {
  return murmur(murmur(Number(argument).toString())) % m
}

function triple (argument) {
  return murmur(murmur(murmur(Number(argument).toString()))) % m
}
```

## Insert, Get, Delete

```javascript
table.insert(100, 123)
table.insert(200, 456)
table.insert(300, 789)

var assert = require('assert')

assert.equal(table.get(100), 123)
assert.equal(table.get(200), 456)
assert.equal(table.get(300), 789)

table.delete(300, 789)

assert.equal(table.get(300), null)
```

## Clone and List Entries

```javascript
var clone = table.clone()

assert(clone instanceof IBLT)

var entries = table.listEntries() // destructive

assert(entries.succeeded)

assert(entries.outputList.some(function (x) {
  return x[0] === 100 && x[1] === 123
}))

assert(entries.outputList.some(function (x) {
  return x[0] === 200 && x[1] === 456
}))
```

## Cells

```javascript
var cells = clone.T

assert(cells.every(function (cell) {
  return cell &&
    'count' in cell &&
    'keySum' in cell &&
    'valueSum' in cell
}))
```
