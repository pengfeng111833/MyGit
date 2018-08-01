'use strict';

let models = require('../modules/model/index');
let Fiber = require('fibers');

//初始化的用户需要设置md5密码
let md5 = require('../modules/lib/security').md5;

const User = models.User;
const Device = models.Device;
const SportRecord = models.SportRecord;
const Privilege = models.Privilege;
const Role = models.Role;
const Person = models.Person;
const WechatUser = models.WechatUser;
const SportHistoy = models.SportHistoy;
const userDao = models.userDao;
const deviceDao = models.deviceDao;
const sportRecordDao = models.sportRecordDao;
const privilegeDao = models.privilegeDao;
const roleDao = models.roleDao;
const personDao = models.personDao;
const wechatUserDao = models.wechatUserDao;
const sportHistoryDao = models.sportHistoryDao;

function main() {
    sportHistoryDao.remove({});
    userDao.remove({});
    deviceDao.remove({});
    sportRecordDao.remove({});
    privilegeDao.remove({});
    roleDao.remove({});
    personDao.remove({});
    wechatUserDao.remove({});

    createPrivilege();
    createUserRole();
    createUser();
	creatDevice();
	createSportRecord();
    createPerson();

    process.exit(0);
}

function createPrivilege() {
    let privilege = new Privilege({
        name: 'user_privilege'
    });
    privilegeDao.create(privilege);
}

function createUserRole() {
    let privilege = privilegeDao.findOne({
        name: 'user_privilege'
    });
    let userRole = new Role({
        name: 'user',
        privileges: [privilege]
    });
    roleDao.create(userRole);
}

function createUser(){
    let role = roleDao.findOne({
        name: 'user'
    });
    let user = new User({
        loginName: 'hammer',
    });
    user.role = role;
    userDao.create(user);
}

function creatDevice() {
	let user = userDao.findOne({
        loginName: 'hammer',
    });
    let devices = new Device({
        macAddress: 'xiedian',
		snCode: '123456',
		batteryInfo: '100',
		version: 'v1.1.0',
		wechatId: 'b26b2605009568',
		wechatType: 'gh_340e1d67a71b',
		users: [user]
    });
    deviceDao.create(devices);
	console.log(devices.toObject({recursive: true}));
}

function createSportRecord() {
	let devices = deviceDao.findOne({
		macAddress: 'xiedian'
	});
    let sportrecord = new SportRecord({
        date: new Date(),
        distance: 213,
        calories: 3000,
        step: 300,
        accomplishPercent: 21 ,
		device: devices
    });
	sportrecord.device = devices;
    sportRecordDao.create(sportrecord);
	console.log(sportrecord.toObject({recursive: true}));
}

function createPerson() {
    let user = userDao.findOne({
        loginName: 'hammer'
    });
	let devices = deviceDao.findOne({
		macAddress: 'xiedian'
	})
    let person = new Person({
        sex: '男',
        birthday: '1999',
        height: 200,
        weight: 50,
        nickName: 'hammer',
        step: 8000,
		devices: [devices],
		user: user
    });
    person.user = user;
    personDao.create(person);
    console.log('person', person.toObject({recursive: true}));
} 

function createSportHistoy(){
	let user = userDao.findOne({
        loginName: 'hammer'
    });
	let person = personDao.findOne({
		user: user.id
	})
	let sportHistory = {
		date: new Date(),
		acomplishment: 0,
		historyDistances: 0,
		historySteps: 0,
		historyCalories: 0,
		person: person
	}
}
Fiber(main).run();
