var inherits = require('util').inherits
var rules = require('./rules')

function createId () {
  return (
    Math.random().toString(16).substring(2)
  + Math.random().toString(16).substring(2) 
  )
}

//create a macgyver context
var exports = module.exports = function () {

  var contracts = {}
  var macgyver = function wrap(funx) {
    //if this is already wrapped don't wrap it.
    //hmm, no allow this so that two contexts may wrap.
    //if(funx.id) return funx
    var id = createId()
    var contract = {
      called: 0, 
      function: funx, 
      get: function (id) {
        return contracts[typeof id == 'string' ? id : id.id]
      }
    }
    contract.rules = wrapped.rules = []
    contracts[id] = contract
    function wrapped () {
      contract.called ++
      var args = [].slice.call(arguments)
      contract.rules.forEach(function (c) {
        if(c.before) c.before.call(contract, args)
      })
      //actually call the function...
      funx.apply(this, args)
      //also, have after, have around...
    }
    wrapped.id = id
    //install rules.
    for (var k in rules) {
      ;(function (k){
        wrapped[k] = function () {
          var args = [].slice.call(arguments) 
          contract.rules
            .push(rules[k].apply(contract, args))
          return this
        }
      })(k)
    }
    return wrapped
  }

  macgyver.validate = function () {
    for (var k in contracts) {
      var con = contracts[k]
      con.rules.forEach(function (rule) {
        if(rule.validate) rule.validate.call(con)
      })
    }
  }

  return macgyver
}

