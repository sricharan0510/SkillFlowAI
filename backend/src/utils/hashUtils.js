const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function hashValue(value) {
  return bcrypt.hash(value, SALT_ROUNDS);
}

async function compareValue(value, hash) {
  return bcrypt.compare(value, hash);
}

module.exports = {
  hashValue,
  compareValue,
};
