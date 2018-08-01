'use strict';

const models = require('../model/index');

const deviceDao = models.deviceDao;
const personDao = models.personDao;
const wechatUserDao = models.wechatUserDao;

const WechatBindRecords = {
};

const lib = {
    wechat: require('../lib/wechat'),
    wechatDevice: require('../lib/wechat_device'),
    insole_device: require('../lib/insole_device')
};
const InsoleHead = lib.insole_device.InsoleHead;

function bindDevice(openId, deviceId) {
    console.log('Bind device');
    console.log('OpenId:', openId);
    console.log('DeviceId:', deviceId);

    let wechatUser = wechatUserDao.findOne({
        openId: openId
    });

    let device = deviceDao.findOne({
        wechatId: deviceId
    });

    if ( wechatUser && device ) {
        let user = wechatUser.user;
		let deviceUser = device.user;
        if(deviceUser){
            let api = lib.wechat.getApi();
            api.sendText(openId, "您所选择的设备已被他人绑定");
			return false;
		}
		personDao.update({
            user: user.id
        }, {
            $push: {
                devices: device.id
            }
        });
        console.log("person update");
		let date = new Date();
		let nowDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        deviceDao.update({
            wechatId: deviceId
        }, {
            $set: {
				user: user.id,
				needInit: true,
				boundTime: nowDate
            }
        });
        console.log("device update");
    }
    else {
        // 用户尚未关注，需要延迟绑定
        WechatBindRecords[openId] = deviceId;
    }
}

function unbindDevice(openId, deviceId) {
    console.log('Unbind device');
    console.log('OpenId:', openId);
    console.log('DeviceId:', deviceId);

    let wechatUser = wechatUserDao.findOne({
        openId: openId
    });

    let device = deviceDao.findOne({
        wechatId: deviceId
    });

    if ( wechatUser && device ) {
        let user = wechatUser.user;
        let person = personDao.findOne({
            user: user
        });
		
		if ( !device.user ){
			return false
		}
		if ( device.user.id != person.user.id ){
			return false
		}

        personDao.update({
            user: user.id
        }, {
            $pull: {
                devices: device.id
            }
        });

        deviceDao.update({
            wechatId: deviceId
        }, {
			$set:{
				needInit: false
			},
			$unset:{
				user: true
			}
        });
    }
}

function delayBindDevice(openId) {
    var deviceId = WechatBindRecords[openId];
    // 读取绑定记录并绑定设备
    // 待完善个人信息的时候再将设备绑定到person
    if ( deviceId ) {
        delete WechatBindRecords[openId];

        console.log('Process delayed bind');
        console.log('OpenId:', openId);
        console.log('DeviceId:', deviceId);

        let wechatUser = wechatUserDao.findOne({
            openId: openId
        });

        let device = deviceDao.findOne({
            wechatId: deviceId
        });

        if ( wechatUser && device ) {
            let user = wechatUser.user;
			let deviceUser = device.user;
			
			if(deviceUser){
				return false;
			}

            deviceDao.update({
                wechatId: deviceId
            }, {
                $set:{
					user: user.id,
					needInit: true
                }
            });
        }
    }
}

module.exports = {
    bindDevice,
    unbindDevice,
    delayBindDevice
};
