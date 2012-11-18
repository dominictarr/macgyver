var macgyver = require('../..')

module.exports = function (m) {
  var tests = 0

  function test (name, funx, pass) {
    m.exports[name] = function () {
      var mac = macgyver()
      try {
        funx(mac)
        mac.validate()
      } catch (err) {
        if(!pass) return console.error('expected err:', err.message)
        throw err
      }
      if(!pass)
        throw new Error('expected macgyver test to pass')
    }
  }

  return {
    valid: function valid (name, funx) {
      if(!funx) funx = name, name = 'test ' + (++tests)
      test(name + ' - valid', funx, true)
    },
    invalid: function invalid (name, funx) {
      if(!funx) funx = name, name = 'test ' + (++tests)
      test(name + ' - invalid', funx, false)
    }
  }
}
