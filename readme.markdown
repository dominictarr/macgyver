# macgyver

[![build status](https://secure.travis-ci.org/dominictarr/macgyver.png)](http://travis-ci.org/dominictarr/macgyver)

declarative assertion framework for invocation ordering.

when evented code really gets _mission critical_ there is one man you send in...

useful for testing streams, and other complex evented modules.

## example

``` js

var macgyver = require('macgyver')

//create a context
var mac = macgyver()

//wrap a function...

function hello () {
  console.log('hello')
}

function goodbye () {
  console.log('goodbye')
}

var hi = mac(hello)

//declare it's behaviours

hi.isCalled(1, 7) //must be called between 1 and 7 times.

var bye = mac(goodbye).once() //must be called strictly once.

hi.before(bye) //hi must be called strictly before bye is called

hi(); hi(); bye()

/*
  //this will produce an error!
  hi(); hi(); bye(); hi()
*/

mac.validate()
```

here is a real life example: [dominictarr/event-stream/test/spec.js](https://github.com/dominictarr/event-stream/blob/3f4f5cb57fb61144751ab5fe643b8974ab9007aa/test/spec.js#L14-56)

## API

create a `maggyver` context.

``` js
var macgyver = require('macgyver')
var mac = macgyver()

```

wrap a function 

``` js

function doSomething() {}

var _doSomething = mac(doSomething)

```

now, we can make declairations about how the wrapped function must be called.

### isCalled(min, max)
assert that the function is called at least `min` times, and at most `max` times.
if `min`, or `max` is null, then that bound is not checked. i.e. `mac(fun).isCalled(null, 10)`
will assert that `fun` is called not more than 10 times.

### once()
alias for `isCalled (1, 1)`

### times(n)
alias for `isCalled (n, n)`

### eventually()
alias for `isCalled (null, 1)`

### never()
alias for `isCalled (0, 0)`

### maybeOnce()
alias for `isCalled (null, 1)`

### atMost(max)
alias for `isCalled (null, max)`

### atLeast(min)
alias for `isCalled (min, null)`

### again (inc=1)
increments the number of times a function may be called.
(inc may be negative)

### before (other)

assert that a function is called before another function.
the `other` must also be a wrapped function.
`mac(first).before(second = mac(second))`

`before` does not check wether the second function is eventually called or not. use `isCalled` or an alias.

### beforeReturns (other)

just like `before` but checks that the function is called before the other function returns, so that it is possible for the first function to be called by the other.

### returns (value)

assert that a function returns a value.
if value is a function, it will be called with the return value.
``` js
//assert that fun returns a string.
mac(fun).returns(function (val) {
  assert.equal(typeof val, 'string')
})

```

the function should throw if the return value was not valid.

### isPassed (args)

assert that a function is passed the correct arguments.
if `args` is a function, that function is called as in returns.

### throws (test)

assert that a function throws. test may be a value or a function. `test` is optional. 

if supplyed `test` is called on every call.

``` js 
mac(fun).throws(function (err, threw) {
  if(threw) {
    assert.equal(err.code,'ERRCODE') //check correct error
  } else {
    //what to do if there was no error?
  }
})
```
this is useful for checking conditions about when the error should be thrown. example [stream\#write](https://github.com/dominictarr/event-stream/blob/3f4f5cb57fb61144751ab5fe643b8974ab9007aa/test/spec.js#L32-36)

### validate ()

check all rules passed. must be called once you are sure all calls are finished.
for example `process.on('exit', mac.validate)` is a good time. `validate` in necessary
to check that lower bounds of `isCalled` and aliases where met.

### autoValidate()

call validate on `process.on('exit', mac.validate)`.

## more coming!

## license

MIT / Apachce2
