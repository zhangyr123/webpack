module.exports = {
    "parser": "babel-eslint",
    "extends": "airbnb-base",
    "env": {
        "browser": true,
        "node": true
    },
    "rules": {
        "import/extensions": [2, "never", { "web.js": "never", "json": "never" }],
        "import/no-extraneous-dependencies": [2, { "devDependencies": true }],
        "import/no-unresolved": [2, { "ignore": ["antd-mobile"] }]
        // "indent": ["error", 2],
        // "no-unused-vars": ["warn", { "vars": "all", "args": "after-used"}]
    }
}