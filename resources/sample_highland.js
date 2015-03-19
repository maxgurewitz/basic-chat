// Sample highland stream semantics:
//
// Highland streams are lazily evaluated.
// Evaulation is triggered by 'thunks'.
// E.g. toArray triggers a thunk

hl([1,2,3,4])
  .map(function (x) {
      return x + 1;
  }).toArray(function (arr) {
    //arr is [2,3,4,5]
  });

// Streams can represent asynchronous operations, similar to promises.
var request = hl($.post('/api/foo'));

// Streams can represent list of future events.
var clicks = hl('click', htmlElement);

// Higher order (nested) streams can be useful!
// The following code would execute the contained requests in parallel
hl([request1, request2, request3])
  .parallel()
  .toArray(function (arr) {
    //arr is [response1, response2, response3]
  });

// Streams with generators can be used to represent infinite values
var powersOfTwo = hl(function (push, next) {
  this.num = this.num ? this.num*2 : 2;
  push(null, this.num); 
  next(); 
})

powersOfTwo
  .take(3)
  .toArray(function (arr) {
    //arr is [2,4,8] 
  });
