var a = require('assertions')
var macgyver = require('..')
exports.valid = valid
exports.invalid = invalid

function test (funx, pass) {
  var mac = macgyver()
  try {
    funx(mac)
    mac.validate()
  } catch (err) {
    if(!pass) return console.error('expected err:', err.message)
    throw err
  }
}

function valid (funx) {
  test(funx, true)
}

function invalid (funx) {
  test(funx, false)
}


