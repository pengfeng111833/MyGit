'use strict'

var loggers = require('../lib/loggers');

function authorize(req, options) {
    let loginInfo = req.session.login;
    let requireLogin = options.login;
    let requiredPrivileges = options.privileges;
    let requiredRoles = options.roles;
    if ( requiredPrivileges ) {
        requireLogin = true;
    }

    if ( !requireLogin ) {
        return true;
    }

    if ( !loginInfo ) {
		
        return false;
    }

    if ( !requiredPrivileges && !requiredRoles) {
        return true;
    }

    if ( requiredPrivileges ) {
        let result = true;
        let user = loginInfo.user;
        return requiredPrivileges.reduce((lastResult, requiredPrivilege) => {
            let hasPrivilege = user.role.privileges.find(privilege => {
                return requiredPrivilege == privilege.name
            });
            
            if ( !hasPrivilege ) {
                return false;
            }

            return lastResult;
        }, true);
    }

    if ( requiredRoles ) {
        let result = true;
        let user = loginInfo.user;

        return requiredRoles.find(roleName => roleName == user.role.name);
    }

    return false;
}

module.exports = {
    authorize
};
