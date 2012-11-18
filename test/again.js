var s = require('./setup')(module)

var invalid = s.invalid
var valid = s.valid

function hello () {
  console.log('hello')
}

function goodbye () {
  console.log('byebye')
}

valid('once() then again()', function (mac) {
  var hi = mac(hello).once()
  hi()
  hi.again()
  hi()
})

invalid('once(), called, again(), but not called', function (mac) {
  var hi = mac(hello).once()
  hi()
  hi.again()
//  hi.isCalled(null, null, 1)
})

valid('once(), then retracted again(-1)', function (mac) {
  var hi = mac(hello).once()
  hi.again(-1)
//  hi.isCalled(null, null, 1)
})

