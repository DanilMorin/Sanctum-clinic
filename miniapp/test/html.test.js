import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml } from '../src/utils/html.js';

test('escapeHtml escapes text and attribute control characters', () => {
  assert.equal(
    escapeHtml(`<script data-value="'">&</script>`),
    '&lt;script data-value=&quot;&#039;&quot;&gt;&amp;&lt;/script&gt;',
  );
});

test('escapeHtml handles empty values', () => {
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
});
