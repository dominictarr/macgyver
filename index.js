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
      called: 0,   //counter of calls
      returned: 0, //counter of returns
      function: funx, 
      get: function (id) {
        return contracts[typeof id == 'string' ? id : id.id]
      }
    }
    contract.rules = wrapped.rules = []
    contracts[id] = contract
    function wrapped () {
      var r
      contract.called ++
      var args = [].slice.call(arguments)
      contract.rules.forEach(function (rule) {
        if(rule.before) rule.before.call(contract, args)
      })
      //actually call the function...
      var i = contract.rules.length - 1
      
      function next () {
        var args = [].slice.call(arguments)
        var around 
 
        while(~i && !(around = contract.rules[i--].around))
          ;
        return ( around 
          ? around.call(contract, next, this, args)
          : funx.apply(this, args)
          )
      }
      r = next.apply(this, args)
      //increment count of returns 
      //(this is useful for asserting when something may happen before a call ends)
      contract.returned ++
      //after
      contract.rules.forEach(function (rule) {
        if(rule.after) rule.after.call(contract, r)
      })
      return r
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

