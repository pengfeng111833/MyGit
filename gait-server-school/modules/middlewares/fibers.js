'use strict'

module.exports = function(req, res, next) {
    let Fiber = require('fibers');
    var loggers = require('../lib/loggers');

    Fiber(function() {
        try {
            next();
        }
        catch (e) {
            res.json({
                successful: false,
                error: {
                    id: 1,
                    message: 'Unknown exception'
                },
                data: {
                    exception: e
                }
            });
        }
    }).run();
};
