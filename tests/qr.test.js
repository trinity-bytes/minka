import { test } from "node:test";
import assert from "node:assert/strict";
import { qrMatrix, qrPath, logoArea, isInArea, codeIssuedAt } from "../src/scripts/lib/qr.js";

const CODE = "MINKA-DET-1760000000000-1a2b3c";

test("qrMatrix encodes a real QR: square, version-sized, level H", () => {
  const { matrix, size, version } = qrMatrix(CODE);
  // A version-v symbol is 17 + 4v modules wide (21, 25, 29, 33, ...).
  assert.equal(size, 17 + 4 * version);
  assert.equal(matrix.length, size);
  for (const row of matrix) assert.equal(row.length, size);
  // 30 bytes at level H need version 4 (34-byte capacity); version 3 holds 24.
  assert.equal(version, 4);
  assert.equal(size, 33);
});

test("qrMatrix keeps the three finder patterns dark at the corners", () => {
  const { matrix, size } = qrMatrix(CODE);
  for (const [x, y] of [[0, 0], [size - 1, 0], [0, size - 1]]) {
    assert.equal(matrix[y][x], true);
  }
  // The finder ring is followed by a light separator row/column.
  assert.equal(matrix[7][0], false);
  assert.equal(matrix[0][7], false);
});

test("qrPath draws one unit rectangle run per horizontal dark run", () => {
  const matrix = [
    [true, true, false],
    [false, true, false],
    [true, false, true],
  ];
  assert.equal(qrPath(matrix), "M0 0h2v1h-2zM1 1h1v1h-1zM0 2h1v1h-1zM2 2h1v1h-1z");
});

test("qrPath offsets every run by the quiet-zone margin", () => {
  assert.equal(qrPath([[true]], { margin: 4 }), "M4 4h1v1h-1z");
});

test("qrPath leaves the cleared logo area empty", () => {
  const matrix = [
    [true, true, true],
    [true, true, true],
    [true, true, true],
  ];
  const clear = { start: 1, end: 2 };
  assert.equal(qrPath(matrix, { clear }), "M0 0h3v1h-3zM0 1h1v1h-1zM2 1h1v1h-1zM0 2h3v1h-3z");
});

test("qrPath returns an empty string for an empty matrix", () => {
  assert.equal(qrPath([]), "");
  assert.equal(qrPath([[false, false]]), "");
});

test("logoArea centers an odd-sized square of at most the given ratio", () => {
  assert.deepEqual(logoArea(33, 0.2), { start: 14, end: 19 }); // 5 modules = 15%
  assert.deepEqual(logoArea(29, 0.2), { start: 12, end: 17 });
  const { start, end } = logoArea(33, 0.2);
  assert.ok((end - start) / 33 <= 0.2);
  assert.equal(start, 33 - end); // symmetric
});

test("logoArea never returns a negative or empty area for tiny codes", () => {
  assert.deepEqual(logoArea(21, 0), { start: 10, end: 11 });
});

test("isInArea checks both axes against a half-open range", () => {
  const area = { start: 2, end: 4 };
  assert.equal(isInArea(2, 3, area), true);
  assert.equal(isInArea(4, 3, area), false);
  assert.equal(isInArea(3, 1, area), false);
  assert.equal(isInArea(3, 3, null), false);
});

test("codeIssuedAt reads the issue timestamp embedded in Mink'a codes", () => {
  assert.equal(codeIssuedAt("MINKA-DET-1760000000000-1a2b3c")?.getTime(), 1760000000000);
  assert.equal(codeIssuedAt("MINKA-1760000000000-ff")?.getTime(), 1760000000000);
});

test("codeIssuedAt returns null for codes without a timestamp", () => {
  assert.equal(codeIssuedAt("Sin generar"), null);
  assert.equal(codeIssuedAt(""), null);
  assert.equal(codeIssuedAt("MINKA-DET-12-ab"), null);
});
