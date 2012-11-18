'use strict';

var inherits = require('util').inherits
var rules = require('./rules')

function createId () {
  return (
    Math.random().toString(16).substring(2)
  + Math.random().toString(16).substring(2)
  )
}

function find (array, id) {
  if(!id) return
  for (var k in array) {
    if(array[k].id == id) return array[k]
  }
}

//create a macgyver context
var exports = module.exports = function () {

  var contracts = {}
  var macgyver = function wrap(funx, name) {
    //if this is already wrapped don't wrap it.
    if('string' === typeof funx)
      name = funx
    if('function' !== typeof funx)
      funx = function noOp() {} //default to empty function
    if(funx.id) return funx

    var id = createId()
    var contract = {
      called: 0,   //counter of calls
      returned: 0, //counter of returns
      throws: 0,
      function: funx,
      name: name,
      get: function (id) {
        return contracts[typeof id == 'string' ? id : id.id]
      }
    }
    contract.rules = wrapped.rules = []
    contract.wrapped = wrapped
    contracts[id] = contract
    function wrapped () {
      contract.called ++
      var args = [].slice.call(arguments)
      contract.rules.forEach(function (rule) {
        if(rule.before) rule.before.call(contract, args)
      })
      //actually call the function...
      var i = contract.rules.length - 1, threw, returned

      function next () {
        var args = [].slice.call(arguments)
        var around

        while(~i && !(around = contract.rules[i--].around))
          ;
        return ( around
          ? around.call(contract, next, this, args)
          : (function () {
              try { return returned = funx.apply(this, args) }
              catch (err) { threw = true; throw err }
            }).call(this)
          )
      }
      next.apply(this, args)
      //increment count of returns
      //(this is useful for asserting when something may happen before a call ends)
      if(threw) { contract.throws ++; return }
      contract.returned ++
      //after
      contract.rules.forEach(function (rule) {
        if(rule.after) rule.after.call(contract, returned)
      })
      return returned
      //also, have after, have around...
    }
    wrapped.id = id
    //install rules.
    for (var k in rules) {
      ;(function (k){
        wrapped[k] = function () {
          var args = [].slice.call(arguments)
          //some rules don't make sense to duplicate.
          var rule = find(contract.rules, k)
          if(rule) return rule.update.apply(contract, args)
          rule = rules[k].apply(contract, args)
          if(rule) contract.rules.push(rule)
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

  macgyver.autoValidate = function () {
    process.on && process.on('exit', macgyver.validate)
    return macgyver
  }

  return macgyver
}

