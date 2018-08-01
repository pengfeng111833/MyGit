'use strict'

let loggers = require('../lib/loggers');
let outputLogger = loggers.output;

let granter = require('../lib/granter');
let fieldChecker = require('../lib/field.js');
let errors = require('../../config/index').errors;

function isStandardException(e) {
    return e instanceof Object &&
        'id' in e &&
        'message' in e;
}

module.exports = function(func, grantOptions, fieldOptions) {
    return function(req, res) {
        try {
            if ( grantOptions && !granter.authorize(req, grantOptions) ) {
                throw errors.NoPrivileges;
            }

            if ( fieldOptions && fieldOptions.fields ) {
                let fieldCheckResult = fieldChecker.check(req.body, fieldOptions.fields);
                if ( fieldCheckResult.length > 0 ) {
                    console.log(fieldCheckResult);
                    throw {
                        id: errors.FieldsError.id,
                        message: errors.FieldsError.message,
                        details: fieldCheckResult
                    };
                }
            }

            func(req, res);
        }
        catch (e) {
            outputLogger.error(e);

            if ( isStandardException(e) ) {
                res.json({
                    successful: false,
                    error: {
                        id: e.id,
                        message: e.message
                    }
                });
            }
            else {
                res.json({
                    successful: false,
                    error: {
                        id: 1,
                        message: 'Unexpected internal error.'
                    }
                });
            }
        }
    }
}

