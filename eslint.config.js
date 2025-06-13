// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
    {
        files: ['**/*.ts'],
        extends: [
            eslint.configs.recommended,
            ...tseslint.configs.recommended,
            ...tseslint.configs.stylistic,
            ...angular.configs.tsAll
        ],
        processor: angular.processInlineTemplates,
        rules: {
            '@angular-eslint/component-selector': ['error', {
                type: 'element',
                prefix: ['page', 'app'],
                style: 'kebab-case'
            }],
            '@angular-eslint/component-class-suffix': ['error', {
                suffixes: ['Page', 'Component', 'App']
            }],
            'quotes': ['error', 'single', { avoidEscape: true }],
            'indent': ['error', 4],
            '@angular-eslint/runtime-localize': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/consistent-indexed-object-style': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/consistent-type-definitions': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@angular-eslint/no-output-on-prefix': 'off',
            '@angular-eslint/no-input-rename': 'off'
        }
    },
    {
        files: ['**/*.html'],
        extends: [
            ...angular.configs.templateRecommended,
            ...angular.configs.templateAccessibility
        ],
        rules: {}
    }
);
