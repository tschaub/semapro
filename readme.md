# semapro

Provides a semaphore for limiting the number of promise based jobs running at once.

```js
import create from 'semapro';

// allow up to three jobs to be running at once
const semaphore = create(3); 

// call the semaphore with a function that returns a promise
semaphore(() => Promise.resolve('result')).then(result => {
  // result === 'result'
});
```

See the tests for usage with async/await.
