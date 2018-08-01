'use strict';

function check(data) {
    if (!data) {
        return false;
    }
    
    let mustFieldNames = ['loginName', 'name', 'password', ];
    let optionalFieldNames = ['mac', 'deviceId'];
    return data.reduce(function(flag, one){
        let fieldNames = Object.keys(one);
        let result = true;
        mustFieldNames.forEach(fieldName => {
            if (fieldNames.indexOf(fieldName) == -1) {
                result = false;
            }
        });
        fieldNames.forEach(fieldName => {
            if (mustFieldNames.indexOf(fieldName) == -1 && optionalFieldNames.indexOf(fieldName) == -1) {
                result = false;
            }
        });
        return result && flag;
    }, true);
}

module.exports = {
    getCheck: check
}