'use strict';

var less = require('less');

module.exports = function processor(content, attrs, argv, scope) {
    less.render(content, {
        paths: [scope.getDirname()],
        syncImport: true,
        relativeUrls: true
    }, function (error, output) {
        if (error) {
            throw error;
        }
        else {
            content = output.css;
        }
    });
    return content;
};