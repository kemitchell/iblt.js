module.exports = IBLT

// Based on the paper "Invertible Bloom Lookup Tables"
// by Goodrich & Mitzenmacher
// https://arxiv.org/abs/1101.2245

// TODO: Optimize for rehashing

function IBLT (options) {
  if (!this instanceof IBLT) return new IBLT(options)

  if (options.cloning) return

  // Validation
  if (!validHashes(options.hashes)) throw new Error('Invalid hashes option')
  if (!validM(options.m)) throw new Error('Invalid m option')

  // Hashes
  this.h = options.hashes
  this.k = options.hashes.length

  // Cells
  var T = this.T = []
  var m = this.m = options.m
  for (var i = 0; i < m; i++) T.push(new Cell())
}

function validHashes (argument) {
  return argument &&
    Array.isArray(argument) &&
    argument.length !== 0 &&
    argument.every(function (element) {
      return typeof element === 'function'
    })
}

function validM (argument) {
  return Number.isInteger(argument) && argument > 0
}

// See paper pages 7-8
//
// TODO: Extraneous duplicate fault tolerance (Paper section 3, page 14-15)
IBLT.prototype.insert = function (x, y) {
  var T = this.T
  var h = this.h
  var k = this.k
  for (var i = 0; i < k; i++) {
    var hix = h[i](x)
    T[hix].count += 1
    T[hix].keySum += x
    T[hix].valueSum += y
  }
}

// See paper page 8
//
// TODO: Extraneous deletion fault tolerance (Paper section 3, page 11-14)
IBLT.prototype.delete = function (x, y) {
  var T = this.T
  var h = this.h
  var k = this.k
  for (var i = 0; i < k; i++) {
    var hix = h[i](x)
    T[hix].count -= 1
    T[hix].keySum -= x
    T[hix].valueSum -= y
  }
}

// Paper section 2.3, page 8
IBLT.prototype.get = function (x) {
  var T = this.T
  var h = this.h
  var k = this.k
  for (var i = 0; i < k; i++) {
    var hix = h[i](x)
    var Thix = T[hix]
    if (Thix.count === 0) return null
    else if (Thix.count === 1) {
      if (Thix.keySum === x) {
        return Thix.valueSum
      } else {
        return null
      }
    }
  }
  return undefined
}

// Paper section 2.4, page 9
//
// TODO: "It is a fairly straightforward exercise to implement this method in
// O(m) time, say, by using a link-list-based priority queue of cells in T
// indexed by their count fields and modifying the DELETE method to update this
// queue each time it deletes an entry from B."
IBLT.prototype.listEntries = function () {
  var outputList = []
  var T = this.T
  var m = this.m
  for (var i = 0; i < m; i++) {
    var Ti = T[i]
    if (Ti.count !== 1) continue
    outputList.push([Ti.keySum, Ti.valueSum])
    this.delete(Ti.keySum, Ti.valueSum)
  }
  // If at the end of the while-loop all the entries in T are empty, then we
  // say that the method succeeded and we can confirm that the output list is
  // the entire set of entries in B. If, on the other hand, there are some
  // cells in T with non-zero counts, then the method only outputs a partial
  // list of the key-value pairs in B. This process should appear entirely
  // familiar to those who work with random graphs
  return {
    succeeded: T.every(function (cell) {
      return cell.count === 0
    }),
    outputList: outputList
  }
}

IBLT.prototype.clone = function () {
  var clone = new IBLT({cloning: true})

  // Hashes
  clone.h = this.h
  clone.k = this.k

  // Cells
  var T = this.T
  var m = this.m
  clone.m = this.m
  clone.T = []
  for (var i = 0; i < m; i++) clone.T.push(T[i].clone())

  return clone
}

function Cell () {
  this.count = 0
  this.keySum = 0
  this.valueSum = 0
}

Cell.prototype.clone = function () {
  var clone = new Cell()
  clone.count = this.count
  clone.keySum = this.keySum
  clone.valueSum = this.valueSum
  return clone
}
