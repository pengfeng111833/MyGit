'use strict';

const Fiber = require('fibers');
const models = require('../modules/model');
const deviceDao = models.deviceDao;
const wechatUserDao = models.wechatUserDao;

function main() {
    const devices = deviceDao.find({
        version: {
            $ne: '1.4.4'
        }
    });

    devices.forEach(device => {
        const user = device.user;
        if ( !user ) {
            return;
        }

        const wechatUser = wechatUserDao.findOne({
            user: user.id
        });

        console.log(wechatUser.openId);
    });

    process.exit(0);
}

Fiber(main).run();
