'use strict';

function firefoxHttpRequesterFixer() {
    return function(req, res, next) {
        if ( req.headers['content-type'] && req.headers['content-type'].indexOf('application/json, application/json') != -1 ) {
            req.headers['content-type'] = 'application/json';
        } 

        next();
    }
}

module.exports = {
    firefoxHttpRequesterFixer
};
