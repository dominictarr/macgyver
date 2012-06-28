var a = require('assertions')

function ifNull(n) {
  return n == null ? -1 : n
}

function abbrev (func) {
  func = func.toString()
  return func.length < 80 ? func : func.substring(0, 100) + '...'
}

function between (called, min, max) {
  if(max != null && called > max) return false
  if(min != null && called < min) return false
  return true 
}

function plural (n) {
  return n > 1 ? ' times' : ' time'
}

function rangeDesc(min, max) {
  min = min == null ? null : min
  max = max == null ? null : max

  var s = ({
    '1:1'   : '*must* be called exactly once',
    '0:0'   : '*must* not be called',
    'null:1': '*may* be called',
    '1:null': '*must* eventually be called',
  })[min+':'+max] 

  if (s) return s

  
  var a = (
      min == null ? '' :
      'at least ' + min + plural(min)
    )
  var b = (
       max == null ? '' :
      'at most ' + max + plural(max)
    )
  s = '*must* be called ' + (a && b ? a + ', and ' + b : a || b)

    return s
}

exports.isCalled = function (min, max) {
    if(min != null && max != null)
      if (min > max) throw new Error('min must be smaller than max')

   function error (con) { 
      var err = new Error('contract failed: ' 
        + abbrev(con.function) 
        + ' '
        + rangeDesc(min, max)
        + ', but was called ' + con.called + plural(con.called) + '.'
      )
      err.type = 'contract'
      throw err 
    }

   return {
    //soft validation, triggered before the
    before: function (args) {
      //soft validation. fail if a call was 
      //against the rule.
      if(max != null && this.called > max)
        error(this)
    },
    validate: function () {
      //hard check against the contract.
      //triggered manually, or on process.exit.
      if(!between(this.called, min, max))
        error(this)
    }
  }
}

exports.once = function () {
  return exports.isCalled.call(this, 1, 1)
}

exports.eventually = function () {
  return exports.isCalled.call(this, null, 1)
}

exports.never = function () {
  return exports.isCalled.call(this, 0, 0)
}

exports.maybeOnce = function () {
  return exports.isCalled.call(this, null, 1)
}

exports.atLeast = function (n) {
  if(n < 1) throw new Error('ArgumentError: atLeast(n): n *must* be greater or equal to 1')
  return exports.isCalled.call(this, n, null)
}

exports.atMost = function (n) {
  if(n < 1) throw new Error('ArgumentError: atMost(n): n *must* be greater or equal to 1')
  return exports.isCalled.call(this, null, n)
}



exports.before = function (other) {
  if(!other.id)
    throw new Error('before must be passed a function wraped by macgyver')
  var oCon = this.get(other)
  function fail(con) {
    var err = new Error('contract failed: '
      + abbrev(con.function)
      + ' *must* be called before '
      + abbrev(oCon.function)
      + ' but it was called after'
    )
    err.type = 'contract'
    throw err
  }
  //to assert something is called before something else
  //it is only necessary to check when it is called.
  //there is no end validation,
  //to assert something was called, use isCalled
  return {
    before: function (args) {
      if(oCon.called) fail(this)
    }
  }
}


exports.returns = function (value) {
  //if('function' == typeof value)
  return {
    after: function (returned) {
      if('function' == typeof value)
        value(returned)
      else
        a.equal(returned, value)  
    }
  }
}
