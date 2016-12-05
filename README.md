# math-random-polyfill

> A browser-based polyfill for JavaScript's `Math.random()` that tries to make it more random

[The MDN documentation for Math.random()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random) explicitly warns that return values should not be used for cryptographic purposes.
Failing to heed that advice can lead to problems, such as those documented in the article [TIFU by using Math.random()](https://medium.com/@betable/tifu-by-using-math-random-f1c308c4fd9d#.lf1mchyk9).
However, there are scenarios - especially involving legacy code - that don't lend themselves to easily replacing `Math.random()` with [`crypto.getRandomValues()`](https://developer.mozilla.org/en-US/docs/Web/API/RandomSource/getRandomValues).
For those scenarios, `math-random-polyfill.js` attempts to provide a more random implementation of `Math.random()` to mitigate some of its disadvantages.

> **Important**: If at all possible, use `crypto.getRandomValues()` directly.
> `math-random-polyfill.js` tries to improve the security of legacy scripts, but is not a substitute for properly implemented cryptography.

## Usage

Add `math-random-polyfill.js` to your project and reference it from a web page just like any other script:

```html
<script src="math-random-polyfill.js"></script>
```

Do this as early as possible for the broadest impact - some scripts capture `Math.random()` during initial load and won't benefit if loaded before `math-random-polyfill.js`.

## Implementation

`math-random-polyfill.js` works by intercepting calls to `Math.random()` and returning the same `0 <= value < 1` based on random data provided by `crypto.getRandomValues()`.
Values returned by `Math.random()` should be completely unpredictable and evenly distributed - both of which are true of the random bits returned by `crypto.getRandomValues()`.
The [polyfill](https://en.wikipedia.org/wiki/Polyfill) maps those values into [floating point numbers](https://en.wikipedia.org/wiki/Floating_point) by using the random bits to create integers distributed evenly across the range `0 <= value < Number.MAX_SAFE_INTEGER` then dividing by `Number.MAX_SAFE_INTEGER + 1`.
This maintains the greatest amount of randomness and precision during the transfer from the integer domain to the floating point domain.

> An alternate approach that uses random bits to create floating point numbers directly suffers from the problem that the binary representation of those numbers is non-linear and therefore the resulting values would not be uniformly distributed.

The code and tests for `math-random-polyfill.js` are implemented in [ECMAScript 5](https://en.wikipedia.org/wiki/ECMAScript#5th_Edition) and should work on all browsers that implement `crypto.getRandomValues()` and [`Uint32Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array).

## Testing

Tests are known to pass on the following browsers:

- Chrome
- Edge
- Internet Explorer 11

They may pass on other browsers as well - [run the `math-random-polyfill.js` test suite](http://DavidAnson.github.io/math-random-polyfill) to check.
