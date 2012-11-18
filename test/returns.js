var s = require('./setup')(module)
var assert = require("assert")

var invalid = s.invalid
var valid = s.valid

var r = Math.random()

function returns (_r) {
  return _r || r
}

valid('returns() returns correct', function (mac) {
  var rs = mac(returns).returns(r)
  rs()
})

invalid('returns(), but return different', function (mac) {
  var rs = mac(returns).returns('hello')
  rs()
})

//if passed a function, use that function as an assertion
//not to test equal

valid('returns() with assertion', function (mac) {
  var rs = mac(returns).returns(function (v) {
    assert.equal(typeof v, "number")
  })
  rs()
})

invalid('returns() with failing assertion', function (mac) {
  var rs = mac(returns).returns(function (v) {
    assert.equal(typeof v, "number")
  })
  rs('hello')
})


