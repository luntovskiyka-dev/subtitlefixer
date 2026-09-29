const tokens = require('./tailwind.tokens.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: tokens,
  },
};
