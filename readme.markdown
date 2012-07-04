# macgyver

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

here is a real life example:

https://github.com/dominictarr/event-stream/blob/master/test/spec.js#L13-57 

## more coming!

## license

MIT / Apachce2
