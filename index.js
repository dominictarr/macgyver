
var assert = require('assert')

function F (name, testContext) {

  var exports = function () {
    return F.apply(null, arguments)
    //install arg checking on this?
  }


// # returns
//
// assert that a function returns a particular result
// if `expected` is a function...  apply it as an assertion.
// if it is something else, assert that the return value is deepEqual to it.
//

  exports.returns = returns

  function returns (funx, expected, message) {
    if('function' !== typeof funx)
      throw new Error('expected function as first argument, got:' + funx)
   if(2 > arguments.length)
      throw new Error('expected at least two args:' + funx)

    return function returns_wrapper() {
      var args = [].slice.call(arguments)
      // if it throws that means this test failed
      // also have a throws, and mayThrow(func, returns, throws)
      // make a contract that this should return? (wouldn't return if it threw)
      // and then verify that if it doen't throw...
      // create a contract with the expected... and then call it? with the actual ?
      // it's completely different to the OO way...
      // it's function oriented !
      var check = contract([funx, 'must return', message], -1, -1, expected, arguments.callee)
      var actual = funx.apply(this, args)
      check(actual)
      return actual
    }
  }

//
//  # isPassed
// 
// assert that a function is passed the correct arguments.
// expected must be an array, or an assertion function
// 
  
  exports.isPassed = isPassed
  function isPassed (funx, expected, message) {
  
    if('function' !== typeof funx)
      throw new Error('isPassed (funx, expected, message): expected function as first argument, got:' + funx)
    if(2 > arguments.length)
      throw new Error('isPassed (funx, expected, message): expected at least two args, got:' + arguments.length)
    if('function' !== expected && !Array.isArray(expected))
      throw new Error('isPassed (funx, expected, message): expected must be either an array or an assertion function, was:' + expected)
      
    var check = contract(message || [funx, 'must be called with', expected, message ], -1, -1, expected, arguments.callee)
    return function isPassed_wrapper() {
      var args = [].slice.call(arguments)
      check(args)
      return funx.apply(this, args)
    }
  }

//
// # throws
//
// assert that a function throws
// expected is either the error that should be thrown, or an assertion function.
//

  exports.throws = throws

  function throws (funx, expected, /*catchIt, */message) {
    if('function' !== typeof funx)
      throw new Error('expected function as first argument, got:' + funx)
   if(2 > arguments.length)
      throw new Error('expected at least two args:' + funx)

    var check = contract([funx, 'must throw', expected, message ], -1, -1, expected, arguments.callee)
    return function throws_wrapper() {
  
      var args = [].slice.call(arguments)
      //if it does not throws that means this test failed
      try {
        funx.apply(this, args)
      } catch (err) {  
        check(err)
        throw err
      }
      check(new Error('did not throw'))
    }
  }

  //
  // # isCalled (funx, min, max, message)
  //
  // assert that a function is called.
  // assert function is called at least min times, and at most max times.
  // if max == -1 then there is no max times
  //
  //  adverb        min, max
  //  ----------------------
  //  once          1,  1
  //  eventually    1, -1
  //  never         0,  0
  //  maybe         0,  1
  //  times         n,  n
  //  at least      n, -1
  //  at most       0,  n
  

  exports.isCalled = isCalled
  function isCalled (funx, min, max, message) {
    if('function' !== typeof funx)
      throw new Error('expected function as first argument, got:' + funx)
    var occured = contract([funx, adverb(min, max)], min, max, null, arguments.callee)
    return function isCalled_wrapperf() {
      var args = [].slice.call(arguments)
      occured()
      return funx.apply(this, args)
    }
  }

  exports.callsback = callsback

  function callsback (funct)  {
    if('function' !== typeof funct)
      throw new Error('expected function as first argument, got:' + funx)
    return function () {
      var args = [].slice.call(arguments)
        , cb = args.pop()
      args.push(isCalled(cb, 1, 1, [funct, 'must callback']))
      return funct.apply(this, args)
    }
  }


  var contracts = []

  function contract (message, min, max, expected, caller) {

    var con = {
      message   : message
    , times     : 0
    , min       : min
    , max       : max
    , failures  : []
    }
    Error.captureStackTrace(con, caller || arguments.callee)
    contracts.push(con)
    return function (actual, message2) {
      con.times ++
      if(arguments.length)
      try {
//        check(actual, expected, message2 || message)
        if('function' === typeof expected)
          expected(actual)
        else
          assert.equal(actual, expected)

      } catch (err) {
        con.failures.push(err)
        return
      }
    }
  }

  //  adverb        min, max
  //------------------------
  //  once          1, 1
  //  eventually    1, -1
  //  never         0, 0
  //  mayOccurOnce  0, 1
  //  times         n, n
  //  atleast       n, -1
  //------------------------

  function adverb (min, max) {
    if(-1 != max && min > max)
      throw new Error('adverb (min, max): max (' + max + ') cannot be smaller than (' + min + ') times')
  
    return min == 1 && max == 1 ? 'must be called once.'
        : min == 1 && -1 == max ? 'must be called.'
        : min == 0 && max == 0  ? 'must never be called.'
        : min == 0 && max == 1  ? 'may occur once.'
        : min == 0 && max > 1   ? 'may occur up to ' + max + ' times.'
        : min > 0 && max == -1  ? 'must occur at least ' + min + ' times.'
                                : -'must occur between' + min + ' and ' + max + ' times.'
  }

  function indent (str) {
    return str.split('\n').map(function (line) {
      return '  ' + line
    }).join('\n')
  }
  function buildMessage (bad) {
    return bad.map(function (c) {
      return [
        c.message.map(function (i) {
          return 'function' == typeof i ? i._name || i.name || i.toString().slice(111) : i
        }).join(' ')
      , indent(c.stack) //shorten this as much as possible
      , c.failures.map(function (err) {
          var message
          if(err.name == 'AssertionError')
            message = [err.name +':', err.actual, err.operator, err.expected].join(' ')
          return !err ? err : /*message + '\n' +*/ err.message + '\n' + err.stack || JSON.stringify(err)          
        }).join('/n')
      ].join('/n')
    }).join('/n')
  }

  exports.verify = verify
  function verify ()  {
    var unfurfilled = contracts.filter(function (c) {
    
      //('*****************************', c.min, c.times, c.max, (~c.max && c.times > c.max) || (~c.min && c.times < c.min))
      return (c.failures.length || (~c.max && c.times > c.max) || (~c.min && c.times < c.min))
    })
    if(unfurfilled.length) {
      throw new Error(buildMessage(unfurfilled))
    }
  }
  
  exports.setName = function (funx, name) {
    funx._name = name
    return funx
  }
  
  if('function' === typeof testContext)
    try {
      console.log('running test context')
      testContext(exports)
    } catch (err) {
      throw err
    }

  return exports
}


module.exports = F('')