var a = require('assertions')
var s = require('./setup')

var invalid = s.invalid
var valid = s.valid

function createObj() {
  return {
    a: function () {
      console.log('a')
    },
    b: function () {
      console.log('b1')
      this.a()
    }
  }
}

valid(function (mac) {
  var obj = createObj()
  obj.b = mac(obj.b)
  obj.a = mac(obj.a).beforeReturns(obj.b)

  obj.a()
  obj.b() 
})

valid(function (mac) {
  var obj = createObj()
  obj.b = mac(obj.b)
  obj.a = mac(obj.a).beforeReturns(obj.b)

  obj.b()//because b calls a 
})

invalid(function (mac) {
  var obj = createObj()
  obj.b = mac(obj.b)
  obj.a = mac(obj.a).beforeReturns(obj.b)

  obj.b()
  obj.b()// fails because on the second call, b has returned. 
})





