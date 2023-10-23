'use strict';

module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-prettier/recommended'],
  rules: {
    /** selector class pattern must match [BEM CSS](https://en.bem.info/methodology/css) - [Regex](https://regexr.com/3apms) */
    'selector-class-pattern': null,
  },
};
