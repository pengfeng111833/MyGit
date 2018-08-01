'use strict'

function check(object, rules, path) {
    console.log('object', object);
    console.log('rules', rules);
    console.log('path', path);
    if ( !path ) {
        path = '';
    }

    let optional = rules.$optional;
    if ( optional && !object ) {
        return [];
    }

    if ( !object ) {
        return [{
            type: 0,
            path: path,
            message: '字段值缺失',
        }];
    }
    else if ( !(object instanceof Object) ) {
        return [{
            type: 1,
            path: path,
            message: '字段值必须为对象',
        }];
    }

    let fieldNames = Object.keys(rules).filter(fieldName => {
        return !fieldName.startsWith('$');
    });

    return fieldNames.reduce((last, fieldName) => {
        let fieldRule = rules[fieldName];
        let fieldValue = object[fieldName];
        let nextPath = path + '.' + fieldName;
        if ( path == '' ) {
            nextPath = nextPath.slice(1);
        }

        if ( fieldRule instanceof Object &&
            fieldRule.$type === 'Array' ) {
            let array = fieldValue;

            let optional = fieldRule.$optional;
            if ( optional && !array ) {
                return [];
            }

            if ( !(array instanceof Array) ) {
                last.push({
                    type: 2,
                    path: path,
                    message: '字段值必须为数组'
                });

                return last;
            }

            return array.reduce((last, object, currentIndex) => {
                let elementPath = nextPath + '[' + currentIndex + ']';

                return last.concat(check(object, fieldRule, elementPath));
            }, []);
        }

        if ( fieldRule instanceof Object ) {
            return last.concat(check(fieldValue, fieldRule, nextPath));
        }
        else {
            let required = fieldRule;
            if ( required && !(fieldName in object) ) {
                last.push({
                    type: 0,
                    path: nextPath,
                    message: '字段值缺失'
                });
            }
        }

        return last;
    }, []);
}

module.exports = {
    check
}
