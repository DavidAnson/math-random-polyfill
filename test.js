"use strict";

window.number_iterations = 1000;
window.number_buckets = 100;

QUnit.testDone(function () {
  Math_random_mock = null;
  crypto_getRandomValues_mock = null;
});

QUnit.test("Dependencies are present", function (assert) {
  assert.expect(2);
  assert.ok(window.Uint32Array, "Uint32Array is present");
  var crypto = window.crypto || window.msCrypto;
  assert.ok(crypto && crypto.getRandomValues, "crypto.getRandomValues is present");
});

QUnit.test("Minimum value from crypto.getRandomValues", function (assert) {
  assert.expect(2);
  Math_random_mock = function () {
    assert.ok(false, "Should not call Math.random mock");
  };
  crypto_getRandomValues_mock = function (arr) {
    arr[0] = 0;
    arr[1] = 0;
    assert.ok(true, "Called crypto.getRandomValues mock");
  };
  assert.strictEqual(Math.random(), 0.0, "Minimum value is 0.0");
});

QUnit.test("Maximum value from crypto.getRandomValues", function (assert) {
  assert.expect(2);
  Math_random_mock = function () {
    assert.ok(false, "Should not call Math.random mock");
  };
  crypto_getRandomValues_mock = function (arr) {
    arr[0] = Math.pow(2, 53 - 32) - 1;
    arr[1] = Math.pow(2, 32) - 1;
    assert.ok(true, "Called crypto.getRandomValues mock");
  };
  assert.strictEqual(Math.random(), 0.9999999999999999, "Maximum value is just under 1.0");
});

QUnit.test("Middle value from crypto.getRandomValues", function (assert) {
  assert.expect(2);
  Math_random_mock = function () {
    assert.ok(false, "Should not call Math.random mock");
  };
  crypto_getRandomValues_mock = function (arr) {
    arr[0] = Math.pow(2, 53 - 32 - 1);
    arr[1] = 0;
    assert.ok(true, "Called crypto.getRandomValues mock");
  };
  assert.strictEqual(Math.random(), 0.5, "Middle value is 0.5");
});

QUnit.test("Exception from crypto.getRandomValues", function (assert) {
  assert.expect(3);
  Math_random_mock = function () {
    assert.ok(true, "Called Math.random mock");
    return 0.123;
  };
  crypto_getRandomValues_mock = function () {
    assert.ok(true, "Called crypto.getRandomValues mock");
    throw new Error();
  };
  assert.strictEqual(Math.random(), 0.123, "Fall-back value is 0.123");
});

QUnit.test("Random values are distributed evenly across buckets", function (assert) {
  assert.expect(1);
  var buckets = new Array(number_buckets);
  for (var i = 0; i < number_iterations; i++) {
    var random = Math.random();
    var bucket = Math.floor(random * number_buckets);
    buckets[bucket] = 1;
  }
  var sum = buckets.reduce(function (previous, current) {
    return previous + current;
  }, 0);
  assert.strictEqual(sum, number_buckets, "All buckets filled");
});

QUnit.test("Random values are at least 0 and less than 1", function (assert) {
  assert.expect(2 * number_iterations);
  for (var i = 0; i < number_iterations; i++) {
    var random = Math.random();
    assert.ok(0 <= random, "Value is at least 0");
    assert.ok(random < 1, "Value is less than 1");
  }
});

QUnit.test("Minimum random values are unique", function (assert) {
  assert.expect(number_iterations);
  var value = 0;
  crypto_getRandomValues_mock = function (arr) {
    arr[0] = 0;
    arr[1] = value;
    value++;
  };
  var previous = -1;
  for (var i = 0; i < number_iterations; i++) {
    var random = Math.random();
    assert.ok(previous < random, "Value is greater than previous value");
    previous = random;
  }
});

QUnit.test("Maximum random values are unique", function (assert) {
  assert.expect(number_iterations);
  var value = Math.pow(2, 32) - 1;
  crypto_getRandomValues_mock = function (arr) {
    arr[0] = Math.pow(2, 53 - 32) - 1;
    arr[1] = value;
    value--;
  };
  var previous = 1;
  for (var i = 0; i < number_iterations; i++) {
    var random = Math.random();
    assert.ok(previous > random, "Value is less than previous value");
    previous = random;
  }
});
