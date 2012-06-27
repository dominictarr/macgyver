var macgyver = require('..')

var a = require('assertions')

function test (funx, pass) {
  var mac = macgyver()
  try {
  funx(mac)
  } catch (err) {
    if(!pass && err.type == 'contract') return
    throw err
  }
  if(pass)
    mac.validate()
  else
    a.throws(function () {
      mac.validate()
    }, a._property('type', 'contract'))
}

function valid (funx) {
  test(funx, true)
}

function invalid (funx) {
  test(funx, false)
}

function hello () {
  console.log('hello')
}

function goodbye () {
  console.log('byebye')
}

invalid(function (mac) {
//  console.log(mac(hello))
  var hi = mac(hello).isCalled(1, 1)
})

valid(function (mac) {
  var hi = mac(hello).isCalled(1, 1)
  hi()
})
invalid(function (mac) {
  var hi = mac(hello).isCalled(1, 1)
  hi(); hi()
})

valid(function (mac) {
  var bye = mac(goodbye).isCalled(1, 1)
  var hi = mac(hello).before(bye)
  hi(); hi(); hi(); hi(); bye();
})

invalid(function (mac) {
  var bye = mac(goodbye).isCalled(1, 1)
  var hi = mac(hello).before(bye)
  hi(); hi(); hi(); hi(); bye(); hi()
})

invalid(function (mac) {
  var bye = mac(goodbye).isCalled(1, 1)
  var hi = mac(hello).before(bye).isCalled(2)
  hi(); bye();
})


console.log('PASSED')
