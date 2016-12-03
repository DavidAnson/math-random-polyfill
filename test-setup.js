"use strict";

let Math_random_mock = null;
const Math_random = Math.random.bind(Math);
Math.random = () => {
  return (Math_random_mock || Math_random)();
}

let crypto_getRandomValues_mock = null;
if (crypto && crypto.getRandomValues) {
  const crypto_getRandomValues = crypto.getRandomValues.bind(crypto);
  crypto.getRandomValues = (arr) => {
    (crypto_getRandomValues_mock || crypto_getRandomValues)(arr);
  }
}
