/* eslint-env jest */
const create = require('./index.js');

function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

test('limits the number of running jobs', async () => {
  expect.hasAssertions();

  const limit = 3;
  const semaphore = create(limit);

  let running = 0;
  let max = 0;
  const promises = [];
  for (let i = 0; i < 10; ++i) {
    promises.push(
      semaphore(async () => {
        ++running;
        if (running > max) {
          max = running;
        }
        await delay(100);
        --running;
      })
    );
  }
  await Promise.all(promises);

  expect(max).toBe(limit);
});

test('runs jobs in the order the are submitted', async () => {
  const num = 10;
  expect.assertions(2 * num);

  const semaphore = create(4);

  const promises = [];
  const order = [];
  for (let i = 0; i < num; ++i) {
    const result = i;
    promises.push(
      semaphore(async () => {
        order.push(result);
        await delay(10);
        return result;
      })
    );
  }
  const results = await Promise.all(promises);

  for (let i = 0; i < num; ++i) {
    expect(results[i]).toBe(i);
    expect(order[i]).toBe(i);
  }
});

test('runs all jobs even if some throw', async () => {
  const num = 10;
  expect.assertions(num);

  const semaphore = create(5);

  const promises = [];
  for (let i = 0; i < num; ++i) {
    const result = i;
    promises.push(
      semaphore(async () => {
        await delay(10);

        if (result % 3 === 0) {
          throw new Error('fails');
        }
        return result;
      })
    );
  }

  for (let i = 0; i < num; ++i) {
    const promise = promises[i];
    if (i % 3 === 0) {
      try {
        await promise;
        expect(false).toBe(true);
      } catch (error) {
        expect(error.message).toBe('fails');
      }
    } else {
      const result = await promise;
      expect(result).toBe(i);
    }
  }
});
