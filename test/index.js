var a = require('assertions')
var s = require('./setup')

var invalid = s.invalid
var valid = s.valid

function hello () {
  console.log('hello')
}

function goodbye () {
  console.log('byebye')
}

invalid(function (mac) {
//  console.log(mac(hello))
  var hi = mac(hello).once()
})

valid(function (mac) {
  var hi = mac(hello).once()
  hi()
})

invalid(function (mac) {
  var hi = mac(hello).once()
  hi(); hi()
})

valid(function (mac) {
  var bye = mac(goodbye).once()
  var hi = mac(hello).before(bye)
  hi(); hi(); hi(); hi(); bye();
})

invalid(function (mac) {
  var bye = mac(goodbye).once()
  var hi = mac(hello).before(bye)
  hi(); hi(); hi(); hi(); bye(); hi()
})

invalid(function (mac) {
  var bye = mac(goodbye).once()
  var hi = mac(hello).before(bye).atLeast(2)
  hi(); bye();
})

console.log('PASSED')
