var a = require('assertions')
var s = require('./setup')(module)

var invalid = s.invalid
var valid = s.valid

function throwIt () {
  throw new Error('TEST ERROR')
}

function noop () {}

valid('throws()', function (mac) {
  var t = mac(throwIt).throws()
  t()
})

invalid('throws()', function (mac) {
  var t = mac(noop).throws(console.log)
  t()
})

