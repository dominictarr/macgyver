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

function rangeDesc(min, max) {
  function plural (n) {
    return n > 1 ? ' times.' : ' time.'
  }
  var s = (
      min == null ? '' :
      'at least ' + min + plural(min)
    )
    s += (
       max == null ? '' :
      'at most ' + max + plural(max)
    )
    return s
}

exports.isCalled = function (min, max) {
   function error (con) { 
      var err = new Error('contract failed: ' 
        + abbrev(con.function)
        + ' *must* be called '
        + rangeDesc(min, max)
        + ' but was called ' + con.called + ' times.'
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

