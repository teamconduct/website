// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
    {
        files: ['**/*.ts', '**/*.js'],
        extends: [
            eslint.configs.recommended,
            ...tseslint.configs.recommended,
            ...tseslint.configs.stylistic,
            ...angular.configs.tsAll
        ],
        processor: angular.processInlineTemplates,
        languageOptions: {
            parserOptions: {
                project: 'tsconfig.(app|spec).json',
            }
        },
        rules: {
            '@angular-eslint/directive-selector': ['error', {
                type: 'attribute',
                prefix: 'app',
                style: 'camelCase'
            }],
            '@angular-eslint/component-selector': ['error', {
                type: 'element',
                prefix: 'app',
                style: 'kebab-case'
            }],
            'quotes': ['error', 'single'],
            'indent': ['error', 4],
            'comma-dangle': ['error', 'never'],
            '@typescript-eslint/no-inferrable-types': 'off',
            '@angular-eslint/no-output-on-prefix': 'off',
            'semi': ['error', 'always'],
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/consistent-indexed-object-style': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/consistent-type-definitions': 'off',
            '@angular-eslint/component-class-suffix': 'off',
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
