var a = require('assertions')
var s = require('./setup')

var invalid = s.invalid
var valid = s.valid

var r = Math.random()

function returns (_r) {
  return _r || r
}

valid(function (mac) {
  var rs = mac(returns).returns(r)
  rs()
})

invalid(function (mac) {
  var rs = mac(returns).returns('hello')
  rs()
})

//if passed a function, use that function as an assertion
//not to test equal

valid(function (mac) {
  var rs = mac(returns).returns(a._isNumber())
  rs()
})

invalid(function (mac) {
  var rs = mac(returns).returns(a._isNumber())
  rs('hello')
})


