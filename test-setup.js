"use strict";

window.Math_random_mock = null;
window.crypto_getRandomValues_mock = null;

(function () {
  var Math_random = Math.random.bind(Math);
  Math.random = function () {
    return (Math_random_mock || Math_random)();
  };

  var crypto = window.crypto || window.msCrypto;
  if (crypto && crypto.getRandomValues) {
    var crypto_getRandomValues = crypto.getRandomValues.bind(crypto);
    crypto.getRandomValues = function (arr) {
      (crypto_getRandomValues_mock || crypto_getRandomValues)(arr);
    };
  }
}());
