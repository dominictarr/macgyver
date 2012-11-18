var s = require('./setup')(module)

var invalid = s.invalid
var valid = s.valid

function hello () {
  console.log('hello')
}

function goodbye () {
  console.log('byebye')
}

invalid('once() called 0', function (mac) {
//  console.log(mac(hello))
  var hi = mac(hello).once()
})

valid('once() called 1', function (mac) {
  var hi = mac(hello).once()
  hi()
})

invalid('once() called 2', function (mac) {
  var hi = mac(hello).once()
  hi(); hi()
})


