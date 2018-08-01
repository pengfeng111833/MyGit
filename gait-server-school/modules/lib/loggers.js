'use strict';

let log4js = require('log4js');
log4js.configure({
    appenders: [
        {
            type: 'console'
        },
        {
            type: 'file',
            filename: 'logs/access.log',
            maxLogSize: 1024 * 1024 * 16,
            backups: 3,
            category: 'access'
        },
        {
            type: 'file',
            filename: 'logs/output.log',
            maxLogSize: 1024 * 1024 * 16,
            backups: 3,
            category: 'output'
        }
    ]
});

let outputLogger = log4js.getLogger('output');
outputLogger.setLevel('DEBUG');

let accessLogger = log4js.getLogger('access');
accessLogger.setLevel('INFO');

module.exports = {
    output: outputLogger,
    access: accessLogger
};
