'use strict';

require('../common');
const assert = require('assert');
const util = require('util');
const { versions } = require('../../tools/doc/versions.js');

// At the time of writing these are the minimum expected versions.
// New versions of Node.js do not have to be explicitly added here.
const expected = [
  '12.x',
  '11.x',
  '10.x',
  '9.x',
  '8.x',
  '7.x',
  '6.x',
  '5.x',
  '4.x',
  '0.12.x',
  '0.10.x',
];

async function test() {
  const vers = await versions();
  // Coherence checks for each returned version.
  for (const version of vers) {
    const tested = util.inspect(version);
    const parts = version.num.split('.');
    const expectedLength = parts[0] === '0' ? 3 : 2;
    assert.strictEqual(parts.length, expectedLength,
                       `'num' from ${tested} should be '<major>.x'.`);
    assert.strictEqual(parts[parts.length - 1], 'x',
                       `'num' from ${tested} doesn't end in '.x'.`);
    const isEvenRelease = Number.parseInt(parts[expectedLength - 2]) % 2 === 0;
    const hasLtsProperty = version.hasOwnProperty('lts');
    if (hasLtsProperty) {
      // Odd-numbered versions of Node.js are never LTS.
      assert.ok(isEvenRelease, `${tested} should not be an 'lts' release.`);
      assert.ok(version.lts, `'lts' from ${tested} should 'true'.`);
    }
  }

  // Check that the minimum number of versions were returned.
  // Later versions are allowed, but not checked for here (they were checked
  // above).
  // Also check for the previous semver major -- From master this will be the
  // most recent major release.
  const thisMajor = Number.parseInt(process.versions.node.split('.')[0]);
  const prevMajorString = `${thisMajor - 1}.x`;
  if (!expected.includes(prevMajorString)) {
    expected.unshift(prevMajorString);
  }
  for (const version of expected) {
    assert.ok(vers.find((x) => x.num === version),
              `Did not find entry for '${version}' in ${util.inspect(vers)}`);
  }
}
test();
