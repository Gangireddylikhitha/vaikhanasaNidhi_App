const test = require('node:test');
const assert = require('node:assert/strict');
const { isPdfFile } = require('../src/middleware/upload');

test('accepts standard PDF mime types', () => {
  assert.equal(isPdfFile({ mimetype: 'application/pdf', originalname: 'book.pdf' }), true);
  assert.equal(isPdfFile({ mimetype: 'application/x-pdf', originalname: 'book.pdf' }), true);
});

test('accepts empty or generic mime type when the filename is a PDF', () => {
  assert.equal(isPdfFile({ mimetype: '', originalname: 'book.PDF' }), true);
  assert.equal(isPdfFile({ mimetype: 'application/octet-stream', originalname: 'book.pdf' }), true);
});

test('rejects non-PDF uploads', () => {
  assert.equal(isPdfFile({ mimetype: 'image/png', originalname: 'book.png' }), false);
  assert.equal(isPdfFile({ mimetype: 'application/json', originalname: 'book.json' }), false);
});
