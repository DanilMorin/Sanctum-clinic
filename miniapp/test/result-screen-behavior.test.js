import assert from 'node:assert/strict';
import test from 'node:test';

import { isPageScrolledToEnd } from '../src/features/quiz/result-screen-behavior.js';

test('isPageScrolledToEnd detects content below the viewport', () => {
  assert.equal(
    isPageScrolledToEnd({
      viewportHeight: 852,
      scrollOffset: 0,
      pageHeight: 1200,
    }),
    false,
  );
});

test('isPageScrolledToEnd allows subpixel rounding at the page end', () => {
  assert.equal(
    isPageScrolledToEnd({
      viewportHeight: 852,
      scrollOffset: 347.5,
      pageHeight: 1200,
    }),
    true,
  );
});

test('isPageScrolledToEnd treats short content as already complete', () => {
  assert.equal(
    isPageScrolledToEnd({
      viewportHeight: 852,
      scrollOffset: 0,
      pageHeight: 700,
    }),
    true,
  );
});
