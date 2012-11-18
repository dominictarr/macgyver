var s = require('./setup')(module)

var invalid = s.invalid
var valid = s.valid

function hello () {
  console.log('hello')
}

function goodbye () {
  console.log('byebye')
}

valid('before()', function (mac) {
  var bye = mac(goodbye).once()
  var hi = mac(hello).before(bye)
  hi(); hi(); hi(); hi(); bye();
})

invalid('before() called after', function (mac) {
  var bye = mac(goodbye).once()
  var hi = mac(hello).before(bye)
  hi(); hi(); hi(); hi(); bye(); hi()
})

invalid('atLeast(2) called once', function (mac) {
  var bye = mac(goodbye).once()
  var hi = mac(hello).before(bye).atLeast(2)
  hi(); bye();
})

