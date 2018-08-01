'use strict'

let models = require('../modules/model/index');
let Fiber = require('fibers');

//初始化的用户需要设置md5密码
let md5 = require('../modules/lib/security').md5;

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

function main() {
	sportHistoryDao.remove({});
	sportRecordDao.remove({});
    actionAddUserSportRecord();
	
    process.exit(0);
}

function actionAddUserSportRecord (){
	
    let result = {
		days: 8,
		stepCounts: [4000 , 8000, 6000 ,10000, 4180, 5554, 4342,1804 ],
		calories: [140,280,200,159,220,163,151,110 ],
		distance: [10, 20, 15, 24, 10.1,11.2, 10.6, 5]
	};
	const id = '5831c777ce33fe12efe71fc8';
	if(id == undefined) {
        // res.json({
            // successful: false
        // });
        return;
    }
	const personId = '5831d3ed0fd9a524542be9d6';
	const person = personDao.findOne({
        id: personId
    });
    const device = deviceDao.findOne({
        id: id
    }); 
	
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
			date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + stepCountIndex - result.days + 1); 
		}
		
		if(stepCount >= person.step){
		//	accomplishPercent = 100;
			flags = 1;
		}
		// else{
			// accomplishPercent = stepCount/person.step*100;
			// accomplishPercent.toFixed(1);
		// }
		let sportRecord = new SportRecord({
			date: date,
			step: stepCount,
			calories: result.calories[stepCountIndex],
			distance: result.distance[stepCountIndex],
		//	accomplishPercent: accomplishPercent
		});
		sportRecord.device = device;
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
            console.log('0', sortSportHistory[0].toObject());

			// console.log('time is',time);
          
            console.log('time', time, 'accomplishment', accomplishment, 'lastAccomplishment', lastAccomplishment);
			time = new Date(time.getFullYear(), time.getMonth(), time.getDate());

            // 记录的时间比当天时间小，直接新建新的日期的运动历史记录
			if(time.getTime() < date1.getTime()){
				accomplishment = flags + accomplishment;
                console.log('new accomplishment', accomplishment, 'flags', flags);
				let newSportHistory = new SportHistory({
					date: date,
					historySteps:stepCount,
					historyCalories: result.calories[stepCountIndex],
					historyDistances: result.distance[stepCountIndex],
					accomplishment: accomplishment,
					person: person
				});
				newSportHistory.device = device;
				 console.log('newSportHistory', newSportHistory.toObject());
				sportHistoryDao.create(newSportHistory);
               
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
				let newSportHistory = new SportHistory({
					date: date,
					historySteps:stepCount,
					historyCalories: result.calories[stepCountIndex],
					historyDistances: result.distance[stepCountIndex],
					accomplishment: accomplishment,
					person: person
				});
                sortSportHistory[0].accomplishment = accomplishment;
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
				historyCalories: result.calories[stepCountIndex],
				historyDistances: result.distance[stepCountIndex],
				accomplishment: flags,
				person: person
			});
		//	console.log('newSportHistory is ', newSportHistory);
			newSportHistory.device = device;
			sportHistoryDao.create(newSportHistory);
			console.log('sportHistory is now', newSportHistory.toObject());
		}			
	});
	return;
	// res.json({
		// successful: true,
	// });
}

Fiber(main).run();
