export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        // URLs emitted by dependency and release automation cannot always be wrapped.
        // Keep every other Conventional Commit rule active for automated commits.
        'body-max-line-length': [0, 'always', Infinity],
    },
};
