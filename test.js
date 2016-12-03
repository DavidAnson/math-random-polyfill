"use strict";

QUnit.testDone(() => {
  Math_random_mock = null;
  crypto_getRandomValues_mock = null;
});

const number_iterations = 1000;
const number_buckets = 100;

QUnit.test("Dependencies are present", (assert) => {
  assert.expect(2);
  assert.ok(crypto && crypto.getRandomValues, "crypto.getRandomValues is present");
  assert.ok(Uint32Array, "Uint32Array is present");
});

QUnit.test("Minimum value from crypto.getRandomValues", (assert) => {
  assert.expect(2);
  Math_random_mock = () => {
    assert.ok(false, "Should not call Math.random mock");
  }
  crypto_getRandomValues_mock = (arr) => {
    arr[0] = 0;
    arr[1] = 0;
    assert.ok(true, "Called crypto.getRandomValues mock");
  };
  assert.strictEqual(Math.random(), 0.0, "Minimum value is 0.0");
});

QUnit.test("Maximum value from crypto.getRandomValues", (assert) => {
  assert.expect(2);
  Math_random_mock = () => {
    assert.ok(false, "Should not call Math.random mock");
  }
  crypto_getRandomValues_mock = (arr) => {
    arr[0] = Math.pow(2, 53 - 32) - 1;
    arr[1] = Math.pow(2, 32) - 1;
    assert.ok(true, "Called crypto.getRandomValues mock");
  };
  assert.strictEqual(Math.random(), 0.9999999999999999, "Maximum value is just under 1.0");
});

QUnit.test("Middle value from crypto.getRandomValues", (assert) => {
  assert.expect(2);
  Math_random_mock = () => {
    assert.ok(false, "Should not call Math.random mock");
  }
  crypto_getRandomValues_mock = (arr) => {
    arr[0] = Math.pow(2, 53 - 32 - 1);
    arr[1] = 0;
    assert.ok(true, "Called crypto.getRandomValues mock");
  };
  assert.strictEqual(Math.random(), 0.5, "Middle value is 0.5");
});

QUnit.test("Exception from crypto.getRandomValues", (assert) => {
  assert.expect(3);
  Math_random_mock = () => {
    assert.ok(true, "Called Math.random mock");
    return 0.123;
  }
  crypto_getRandomValues_mock = (arr) => {
    assert.ok(true, "Called crypto.getRandomValues mock");
    throw new Error();
  };
  assert.strictEqual(Math.random(), 0.123, "Fall-back value is 0.123");
});

QUnit.test("Random values are distributed evenly across buckets", (assert) => {
  assert.expect(1);
  const buckets = new Array(number_buckets);
  for(let i = 0; i < number_iterations; i++) {
    const random = Math.random();
    const bucket = Math.floor(random * number_buckets);
    buckets[bucket] = 1;
  }
  const sum = buckets.reduce((previous, current) => previous + current, 0);
  assert.strictEqual(sum, number_buckets, "All buckets filled");
});

QUnit.test("Random values are at least 0 and less than 1", (assert) => {
  assert.expect(2 * number_iterations);
  for(let i = 0; i < number_iterations; i++) {
    const random = Math.random();
    assert.ok(0 <= random, "Value is at least 0");
    assert.ok(random < 1, "Value is less than 1");
  }
});

QUnit.test("Minimum random values are unique", (assert) => {
  assert.expect(number_iterations);
  let value = 0;
  crypto_getRandomValues_mock = (arr) => {
    arr[0] = 0;
    arr[1] = value;
    value++;
  };
  let previous = -1;
  for(let i = 0; i < number_iterations; i++) {
    const random = Math.random();
    assert.ok(previous < random, "Value is greater than previous value")
    previous = random;
  }
});

QUnit.test("Maximum random values are unique", (assert) => {
  assert.expect(number_iterations);
  let value = Math.pow(2, 32) - 1;
  crypto_getRandomValues_mock = (arr) => {
    arr[0] = Math.pow(2, 53 - 32) - 1;
    arr[1] = value;
    value--;
  };
  let previous = 1;
  for(let i = 0; i < number_iterations; i++) {
    const random = Math.random();
    assert.ok(previous > random, "Value is less than previous value")
    previous = random;
  }
});
