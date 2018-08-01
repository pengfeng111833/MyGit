'use strict'

const util = require('util');
const Fiber = require('fibers');

function formatTime(date) {
    return formatHourMinute(date.getHours(), date.getMinutes());
}

function formatDate(date) {
    return util.format('%d年%d月%d日', date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function formatPaddingDate(date) {
    return util.format('%d-%s-%s', 
            date.getFullYear(), 
            paddingZero(date.getMonth() + 1, 2),
            paddingZero(date.getDate(), 2));
}

function formatHourMinute(hour, minute) {
    return util.format('%s:%s', paddingZero(hour, 2), paddingZero(minute, 2));
}

function paddingZero(number, width) {
    let numberString = String(number);
    if ( numberString.length < width ) {
        numberString = '0'.repeat(width - numberString.length) + numberString;
    }

    return numberString;
}

function randomString(len, $chars) {
　　len = len || 32;
    if ( !$chars ) {
　　    $chars = 'ABCDEFabcdef0123456789';
    }
　　let maxPos = $chars.length;
　　let pwd = '';
　　for ( let i = 0; i < len; i++) {
　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
　　}
　　return pwd;
}

function currentTimestamp() {
    let now = new Date();

    return now.getTime();
}

function concatArrays(arrays) {
    return arrays.reduce((last, current) => {
        return last.concat(current);
    }, []);
}

function replaceAll(str, cond, rep) {
    return str.split(cond).join(rep);
}

function generatePassword() {
    let password = randomString(8, 'abcdefgABCDEFG1234567890+-*/');

    return password;
}

function fiberify(f) {
    return function(...args) {
        const fiber = Fiber.current;

        let result = null;
        let error = null;

        args.push((err, res) => {
            error = err;
            result = res;
            
            fiber.run();
        });

        f.apply(null, args);

        Fiber.yield();

        if ( error ) {
            throw new Error(error);
        }

        return result;
    };
}

module.exports = {
    randomString,
    currentTimestamp,
    formatTime,
    formatHourMinute,
    formatDate,
    formatPaddingDate,
    concatArrays,
    paddingZero,
    replaceAll,
    generatePassword,
    fiberify
}

fiberify(null, 1, 2, 3, 4);
