'use strict';

const models = require('../model/index');
const Fiber = require('fibers');

const lib = {
    wechatDevice: require('../lib/wechat_device'),
    insole_device: require('../lib/insole_device')
};
const wechat = require('wechat');
const User = models.User;
const Device = models.Device;
const SportRecord = models.SportRecord;
const Role = models.Role;
const Person = models.Person;
const WechatUser = models.WechatUser;
const SportHistory = models.SportHistory;
const userDao = models.userDao;
const deviceDao = models.deviceDao;
const sportRecordDao = models.sportRecordDao;
const roleDao = models.roleDao;
const personDao = models.personDao;
const wechatUserDao = models.wechatUserDao;
const sportHistoryDao = models.sportHistoryDao;

const creatFiber = require('fibers');

function createUser(openId) {  
	let wechatUser = wechatUserDao.findOne({
		openId: openId
	});
    if (wechatUser != null){
		return false;
	}
    const role = roleDao.findOne({
        name: 'user'
    });
    let user = new User({
        loginName: ''
    });
    user.role = role;
    userDao.create(user);
    if (openId == undefined) {
		return false;
    }
    wechatUser = new WechatUser({
        openId: openId,
        user: user
    });
    //wechatUser.user = user;
	console.log('wechatUser:',wechatUser.toObject({recursive: true}));
    wechatUserDao.create(wechatUser);

	return true;
}

const UserProfile = lib.insole_device.UserProfile;
const InsoleRequest = lib.insole_device.InsoleRequest;
const InsoleResponse = lib.insole_device.InsoleResponse;
const InsoleHead = lib.insole_device.InsoleHead;

const ErrorResponse = new InsoleResponse({
    command: InsoleHead.Command.ErrorResp,
    body: new Buffer(0)
});
//���µ����Ϣ

function  actionUpdateBatteryInfo (deviceId, result, seq) {
	let device = deviceDao.findOne({
        wechatId: deviceId
    });
	if(device == null) {
         return ErrorResponse.toBuffer();
     }
	const batteryInfo = result.batteryLevel;
	device.batteryInfo = batteryInfo;
//	console.log(device);
	deviceDao.update(device);
	const batteryLevelResponse = new InsoleResponse({
		command: InsoleHead.Command.BatteryLevelResp,
        seq: seq,
		body: new Buffer(0)
	});
    return batteryLevelResponse.toBuffer();
}

let stepFlag = 0;

function actionAddSportRecord (openId, deviceId, result, seq){
	let device = deviceDao.findOne({
        wechatId: deviceId
    });
	if(device == null) {
         return ErrorResponse.toBuffer();
    }
	let wechatUser = wechatUserDao.findOne({
		openId: openId
	});
	if(wechatUser == null) {
         return ErrorResponse.toBuffer();
    }
	let user = userDao.findOne({
		id: wechatUser.user
	})
	if(user == null) {
         return ErrorResponse.toBuffer();
    }
	const person = personDao.findOne({
        user: user
    });
	if(result.days>1){
		const sortSportHistory = sportHistoryDao.find({
			device: device.id,

			$sort: {
				date: -1
			},
			$limit: 2
        });
		if(sortSportHistory[0] !=null ){
			let time = sortSportHistory[0].date;
			time = new Date(time.getFullYear(), time.getMonth(), time.getDate());
			let date = new Date();
			let date1 = new Date(date.getFullYear(), date.getMonth(), date.getDate()); 
			if(time.getTime() == date1.getTime()){
				// sportHistoryDao.remove({});
				// sportRecordDao.remove({});
			}
		}
	}
	result.stepCounts.forEach((stepCount, stepCountIndex) => {
        console.log('stepCount', stepCount, 'stepCountIndex', stepCountIndex);
		let sportHistory = sportHistoryDao.findOne({
			device: device.id
		});
	//	let accomplishPercent = 0;
		let historyCalories = 0;
		let historyDistance = 0;
		let historySteps = 0;
		let accomplishment = 0;
        let lastAccomplishment = 0;
		let flags = 0;
		let date = new Date();
		let date1 = new Date(date.getFullYear(), date.getMonth(), date.getDate()); 
		if(stepCountIndex < result.days-1){
//			date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + stepCountIndex - result.days + 1); 
			date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - stepCountIndex ); 
		}
		
		if(stepCount >= person.step){
			flags = 1;
		}
        console.log('date1 is',date1);
//		let sortSportRecord = sportRecordDao.find({
//			device: device.id,
//			$sort: {
//				date: -1
//			},
//			$limit: 1
//		});
//		if(sortSportRecord[0]!=null){
//			let sportTime = sortSportRecord[0].date;
//            console.log('sportTime111 is ',sportTime);
//			sportTime = new Date(sportTime.getFullYear(), sportTime.getMonth(), sportTime.getDate());
//			console.log('sport Time 222 is',sportTime);
//            if(date1.getTime() == sportTime.getTime()){
//				let steps = sortSportRecord[0].step;
//                console.log('steps is',steps);
//				if(steps > stepCount){
//					let temp = stepCount;
//					stepCount = stepCount+steps-stepFlag;
//					stepFlag = temp;
//				    console.log('stepCount is',stepCount);
//                }
//			}
//			else{
//				stepFlag = 0;
//			}
//		}
		
		let sportRecord = new SportRecord({
			date: date,
			step: stepCount,
			calories: result.calories[stepCountIndex]/1000,
			distance: result.distance[stepCountIndex]/100000,
		//	accomplishPercent: accomplishPercent
		});
		sportRecord.device = device;
        console.log('sportRecord is',sportRecord.toObject());
		sportRecordDao.create(sportRecord);
		
		if(sportHistory != null){
			let sortSportHistory = sportHistoryDao.find({
				device: device.id,
				$sort: {
					date: -1
				},
				$limit: 2
			});
			let time = sortSportHistory[0].date;
            accomplishment = sortSportHistory[0].accomplishment;
  //          console.log('0', sortSportHistory[0].toObject());

			// console.log('time is',time);
          
            console.log('time', time, 'accomplishment', accomplishment, 'lastAccomplishment', lastAccomplishment);
			time = new Date(time.getFullYear(), time.getMonth(), time.getDate());

            // ��¼��ʱ��ȵ���ʱ��С��ֱ���½��µ����ڵ��˶���ʷ��¼
			if(time.getTime() < date1.getTime()){
				accomplishment = flags + accomplishment;
                console.log('new accomplishment', accomplishment, 'flags', flags);
				let newSportHistory = new SportHistory({
					date: date,
					historySteps:stepCount,
					historyCalories: result.calories[stepCountIndex]/1000,
					historyDistances: result.distance[stepCountIndex]/100000,
					accomplishment: accomplishment,
					person: person
				});
				newSportHistory.device = device;
				sportHistoryDao.create(newSportHistory);
                console.log('newSportHistory', newSportHistory.toObject());
			}
			if(time.getTime() == date1.getTime()){
                console.log('== hanppened',sortSportHistory[0].accomplishment);
				if(sortSportHistory[0].accomplishment != null){
                    let yesterdayAccomp = 0;
                    if ( sortSportHistory[1] != undefined) {
                        console.log('1',sortSportHistory[1].toObject());
    					yesterdayAccomp = sortSportHistory[1].accomplishment;
                    }
					if(yesterdayAccomp == accomplishment){
						accomplishment = flags + accomplishment;
					}
				}
				else{
					accomplishment = flags;
				}
				let newSportHistory = sportHistoryDao.findOne({
                    id: sortSportHistory[0].id
				});	
                if(newSportHistory){
                    console.log('newSportHistory is',newSportHistory.toObject());
                }
                newSportHistory.date = date;
                newSportHistory.historySteps = stepCount;
				newSportHistory.historyCalories = result.calories[stepCountIndex]/1000;
				newSportHistory.historyDistances = result.distance[stepCountIndex]/100000;
				newSportHistory.accomplishment = accomplishment;
            //    sortSportHistory[0].accomplishment = accomplishment;
			    sportHistoryDao.update(newSportHistory);
                console.log('update', sortSportHistory[0].toObject());
			//	console.log('sportHistory is nnn ', newSportHistory.toObject());
			}
		}
		else{
            console.log('create newSportHistory');
			let newSportHistory = new SportHistory({
				date: date,
				historySteps:stepCount,
				historyCalories: result.calories[stepCountIndex]/1000,
				historyDistances: result.distance[stepCountIndex]/100000,
				accomplishment: flags,
				person: person
			});
			newSportHistory.device = device;
			sportHistoryDao.create(newSportHistory);
		//	console.log('sportHistory is now', newSportHistory.toObject());
		}			
	});
	const sportResultsResponse = new InsoleResponse({
        command: InsoleHead.Command.SportResultsResp,
        seq: seq,
        body: new Buffer(0)
    });
    return sportResultsResponse.toBuffer();
}

//�����豸��Ϣ
function actionGetUserProfile(deviceId, openId, seq) {
	const wechatUser = wechatUserDao.findOne({
		openId: openId
	});
	let device = deviceDao.findOne({
        wechatId: deviceId
    });
	if(device == null) {
         return ErrorResponse.toBuffer();
    }
    if(wechatUser == null){
        return ErrorResponse.toBuffer();
    }
	const user = userDao.findOne({
		id: wechatUser.user
	});
    if(user == null){
        return ErrorResponse.toBuffer();
    }
	const person = personDao.findOne({
		user: user
	});	
	let needInit = device.needInit;
	let init_sport_data = 0;
	if(needInit == true){
		init_sport_data = 1;
		device.needInit = false;
		deviceDao.update(device);
	}
	let myDate = new Date();
    let nowYear = myDate.getFullYear();
    let birYear = person.birthday.getFullYear();
    let age = nowYear - birYear; 
	console.log('age1 is ',age);
    age = Number.parseInt(age);
    console.log('age2 is ',age);
    let sex =0;
	if(person.sex == '��' ){
		sex = 1;
	}
    const userProfileData = {
        sex: sex,
        age: age,
        weight: person.weight,
		height: person.height,
        stepTarget: person.step,
        caloriesTarget: 0,
        distanceTarget: 0,
        time: new Date(),
		needInit: init_sport_data
    };

    const userProfile = new UserProfile(userProfileData);
	const userProfileResponse = new InsoleResponse({
        command: InsoleHead.Command.UserProfileResp,
        seq: seq,
        body: userProfile.toBuffer()
    });
    return userProfileResponse.toBuffer();
}
module.exports = {
	createUser,
	actionUpdateBatteryInfo,
	actionAddSportRecord,
	actionGetUserProfile
};
