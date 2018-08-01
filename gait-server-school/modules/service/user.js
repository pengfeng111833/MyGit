// 'use strict';

// const models = require('../model/index');
// const Fiber = require('fibers');

// const wechat = require('wechat');
// const User = models.User;
// const Device = models.Device;
// const SportRecord = models.SportRecord;
// const Role = models.Role;
// const Person = models.Person;
// const WechatUser = models.WechatUser;
// const SportHistoy = models.SportHistoy;
// const userDao = models.userDao;
// const deviceDao = models.deviceDao;
// const sportRecordDao = models.sportRecordDao;
// const roleDao = models.roleDao;
// const personDao = models.personDao;
// const wechatUserDao = models.wechatUserDao;
// const sportHistoyDao = models.sportHistoyDao;

// //创建用户
// function createUser(openId) {  
// 	let wechatUser = wechatUserDao.findOne({
// 		openId: openId
// 	});
//     if (wechatUser != null){
// 		return ;
// 	}
//     const role = roleDao.findOne({
//         name: 'user'
//     });
//     let user = new User({
//         loginName: ''
//     });
//     user.role = role;
//     userDao.create(user);
//     if (openId == undefined) {
// 		return false;
//     }
//     wechatUser = new WechatUser({
//         openId: openId,
//         user: user
//     });
//     //wechatUser.user = user;
// 	console.log('wechatUser:',wechatUser.toObject({recursive: true}));
//     wechatUserDao.create(wechatUser);

// 	return true;
// }

// //更新电池信息

// function  actionUpdateBatteryInfo (result) {
    // const id = req.params.deviceId;
	// if(id == undefined) {
         // return;
     // }
    // const device = deviceDao.findOne({
         // id: id
     // });
	// const batteryInfo = result.batteryInfo;
	// device.batteryInfo = batteryInfo;
	// console.log(device);
	// deviceDao.update(device);
	
	// return true;
// }
// module.exports = {
	// createUser
// };
