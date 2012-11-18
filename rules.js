var assert = require("assert")

function ifNull(n) {
  return n == null ? -1 : n
}
function p(s) {
  return '('+s+')'
}
function bt(s) {
  return '`' + s + '`'
}

function abbrev (contract) {

  var func = contract.function.toString()
  var name = contract.name

  return [
    (name ? bt(name) : ''),
    p( func.length < 80
      ? func : func.substring(0, 100) + '...')
  ].join(': ')
}

function between (called, min, max) {
  if(max != null && called > max) return false
  if(min != null && called < min) return false
  return true
}

function plural (n) {
  return n > 1 || n === 0 ? ' times' : ' time'
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
   var err = new Error()
   function error (con) {
      err.message = (
        'broke contract: '
        + abbrev(con)
        + ' '
        + rangeDesc(min, max)
        + ', but was '
        + ( con.called === 0
          ? 'not called.'
          : 'called ' + con.called + plural(con.called) + '.'
        )
        + '\ncontract defined at:'
      )
      err.type = 'contract'
      throw err
    }

   return {
    //soft validation, triggered before the
    id: 'isCalled',
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
    },
    update: function (_min, _max, change) {
      if(change) {
          min == null || (min += change)
          max == null || (max += change)
      } else
        min = _min; max = _max

      if(max != null && this.called > max)
        error(this)
    }
  }
}

exports.once = function () {
  return exports.isCalled.call(this, 1, 1)
}

exports.twice = function () {
  return exports.isCalled.call(this, 2, 2)
}

exports.times = function (n) {
  return exports.isCalled.call(this, n, n)
}

exports.eventually = function () {
  return exports.isCalled.call(this, null, 1)
}

exports.never = function () {
  return exports.isCalled.call(this, 0, 0)
}

exports.maybeOnce = function () {
  return exports.isCalled.call(this, 0, 1)
}

exports.atLeast = function (n) {
  if(n < 1) throw new Error('ArgumentError: atLeast(n): n *must* be greater or equal to 1')
  return exports.isCalled.call(this, n, null)
}

exports.atMost = function (n) {
  if(n < 1) throw new Error('ArgumentError: atMost(n): n *must* be greater or equal to 1')
  return exports.isCalled.call(this, null, n)
}

exports.again = function (n) {
  //tell isCalled to increment expectations
  return this.wrapped.isCalled.call(this, null, null, n == null ? 1 : n)
}

function fail(con, oCon) {
  var err = new Error('contract failed: '
    + abbrev(con)
    + ' *must* be called before '
    + abbrev(oCon)
    + ' but it was called after'
  )
  err.type = 'contract'
  throw err
}

function expectWrapped(name, other) {
  if(!other.id)
    throw new Error(name + ' must be passed a function wraped by macgyver')
}

//to assert something is called before something else
//it is only necessary to check when it is called.
//there is no end validation,
//to assert something was called, use isCalled
exports.before = function (other) {
  expectWrapped('before', other)
  var oCon = this.get(other)
  return {
    before: function (args) {
      if(oCon.called) fail(this, oCon)
    }
  }
}

exports.beforeReturns = function (other) {
  expectWrapped('before', other)
  var oCon = this.get(other)
  return {
    before: function (args) {
      if(oCon.returned) fail(this, oCon)
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
        assert.equal(returned, value) //, 'function: ' + this.function + ' *must* return ' + JSON.stringify(value))
    }
  }
}

exports.isPassed = function (value) {
  //if('function' == typeof value)
  return {
    before: function (args) {
      if('function' == typeof value)
        value(args)
      else
        assert.deepEqual(args, value) //, 'function: ' + this.function + '*must* be passed' + JSON.stringify(value))
    }
  }
}


exports.throws = function (test) {
  return {
    around: function (funx, context, args) {
      var r
      try {
        r = funx.apply(context, args)
      } catch (err) {
        return test && test(err, true)
      }
      if(test)
        test(undefined, false)
      else
        throw new Error('function: ' + this.function + ' *must* throw')
      return r
    }
  }
}
