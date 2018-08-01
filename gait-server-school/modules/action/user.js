'use strict';

let config = require('../../config');
const models = require('../model/index');
const Fiber = require('fibers');
const lib = {
    wechatDevice: require('../lib/wechat_device'),
    md5: require('../lib/security'),
    loggers: require('../lib/loggers')
};
const hx_md5 = require('../middlewares/myutil');

const fs = require('fs');
const outputLogger = lib.loggers.output;


const User = models.User;
const Reset = models.Reset;
const Device = models.Device;
const Phone = models.Phone;
const SportMatch = models.SportMatch;
const Attend = models.Attend;
const AttendGroup = models.AttendGroup;
const RankReward = models.RankReward;
const SportRecord = models.SportRecord;
const Role = models.Role;
const Person = models.Person;
const Check = models.Check;
const Product = models.Product;
const Exchange = models.Exchange;
const StepExchange = models.StepExchange;
const JumpInfo = models.JumpInfo;
const WechatUser = models.WechatUser;
const SportHistory = models.SportHistory;
const GameScore = models.GameScore;
const City = models.City;
const Statistics = models.Statistics;
const userDao = models.userDao;
const resetDao = models.resetDao;
const deviceDao = models.deviceDao;
const phoneDao = models.phoneDao;
const sportMatchDao = models.sportMatchDao;
const attendDao = models.attendDao;
const attendGroupDao = models.attendGroupDao;
const RankRewardDao = models.RankRewardDao;//积分排行榜奖励表
const sportRecordDao = models.sportRecordDao;
const jumpInfoDao = models.jumpInfoDao;
const roleDao = models.roleDao;
const personDao = models.personDao;
const checkDao = models.checkDao;
const productDao = models.productDao;
const exchangeDao = models.exchangeDao;
const stepExchangeDao = models.stepExchangeDao;
const wechatUserDao = models.wechatUserDao;
const sportHistoryDao = models.sportHistoryDao;
const gameScoreDao = models.gameScoreDao;
const cityDao = models.cityDao;
const statisticsDao = models.statisticsDao;
// const userService = require('../service/user');

function compare(propertyName) {
    return function(object1, object2) {
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        if (value2 < value1) {
            return -1;
        }
        else if (value2 > value1) {
            return 1;
        }
        else {
            return 0;
        }
    }
}

function arrayPull(array, person){
    let index = -1;
    for(let i=0;i<array.length;i++){
        if(array[i].id == person.id){
            index = i;
            break;
        }
    }
    if(index != -1){
        array.splice(index, 1);
        return 1;
    }
    else{
        outputLogger.info("not in array");
        return 0;
    }
}

const actionPersonIsNull = {
	handler(req, res) {
		const id = req.session.login.user;
        if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }
		const user = userDao.findOne({
			id: id
		});
		const person = personDao.findOne({
			user: user
		});
		if(person == null){
            outputLogger.info('the person is null');
			res.json({
				successful: true
			});
		}
		else{
			res.json({
				successful: false
			});
		}
        return;
    }
};

//新增用户接口  pengfeng  2017-10-16  
const actionInitUser = {
	handler(req, res) {
	let password = hx_md5.md5(req.body.password);
    let user = new User({
		loginName: req.body.loginName,
		password: password
    });
    const role = roleDao.findOne({
        name: 'user'
	});
	let userOld = userDao.findOne({
		loginName : req.body.loginName
	});
	if(userOld != null){
	    outputLogger.info('the user is aready exist');
	    res.json({
		   successful: false,
		   err : "the user is aready exist"
	    });
        return;
	}
    if(user == undefined) {
        return;
	}
    user.role = role;
	userDao.create(user);
	res.json({
		successful: true,
		userId : user.id
	});
   }
}

//用户登录接口  pengfeng  2017-10-13 
const actionUserLogin ={
	handler(req, res) {
		const loginName = req.body.loginName;
		const password = hx_md5.md5(req.body.password);
        if(loginName == undefined || password == undefined) {
            res.json({
                successful: false
            });
            return;
        }
		const user = userDao.findOne({
			loginName: loginName,
			password:password
		});
		let person = personDao.findOne({
			user: user
		});
		if(user == null){
            outputLogger.info('the password or user is null');
			res.json({
				successful: false
			});
		}
		else{//判断用户信息是否初始化，没有则返回isinit = false
			if(person != null){
			  res.json({
				successful: true,
				isInit:true,
				userId : user.id
			 });
		   }
		   else{
			  res.json({
				successful: true,
				isInit:false,
				userId : user.id
			 });
		   }
		}
        return;
    }
};

const actionInitInfo = {
    fields: {
        nickName: true,
        sex: true,
        weight: true,
        height: true,
        birthday: true,
        step: true
    },
    handler(req,res) {
		const id = req.session.login.userId;
        console.log(`User ${id} init info`);
        if(id == undefined) {
			outputLogger.info('no id');
            res.json({
                successful: false
            });
            return;
        }
		const user = userDao.findOne({
			id: id
		});
		let person = personDao.findOne({
			user: user
		});
		let newPerson = personDao.findOne({
			nickName: req.body.nickName
		});
		if(person != null  || newPerson != null){
            // outputLogger.info('id is ', person.devices[0].id);
            res.json({
                successful: false,
                error: {
                    message: 'The person has been initalized'
                }
            });
			return ;
		}
		let step = req.body.step;
		if( !step ){
		    step = 8000;
		}
        person = new Person({
            nickName: req.body.nickName,
            sex: req.body.sex,
            weight: req.body.weight,
            height: req.body.height,
			birthday: req.body.birthday,
			devices:[],
            step: step,
			user: user,
        });

        let devices = deviceDao.find({
            user: user.id
        });

        person.devices = devices;

        personDao.create(person);

        res.json({
            successful: true
        });
    }
};

const actionInitInfo_app = {
    handler(req,res) {
		const id = req.body.userId;
        if(id == undefined) {
			outputLogger.info('no userid');
            res.json({
                successful: false
            });
            return;
        }
		const user = userDao.findOne({
			id: id
		});
		let person = personDao.findOne({
			user: user
		});

		let newPerson = personDao.findOne({
			nickName: req.body.nickName
		});
		if(person != null  || newPerson != null){
            outputLogger.info('id is ', person.id);
            res.json({
                successful: false,
                error: {
                    message: 'The person is exist'
                }
            });
			return ;
		}
		let step = req.body.step;
		if( !step ){
		    step = 8000;
		}
        person = new Person({
            nickName: req.body.nickName,
            sex: req.body.sex,
            weight: req.body.weight,
			height: req.body.height,
			phone : req.body.phone,
			birthday: req.body.birthday,
			useCredit:0,
			creditTotal:0,
			money: 0,
            step: step,
			user: user,
        });
        personDao.create(person);
        res.json({
            successful: true
        });
    }
};


const actionUpdateInfo = {
    fields: {
        nickName: true,
        sex: true,
        weight: true,
        height: true,
        birthday: true,
        step: true
    },
    handler(req, res) {
        const id = req.session.login.user;
        if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }
		const user = userDao.findOne({
			id: id
		});
		const person = personDao.findOne({
			user: user
		});
        person.nickName = req.body.nickName;
        person.sex = req.body.sex;
        person.weight = req.body.weight;
        outputLogger.info('weight is :',person.weight);
        person.height = req.body.height;
        outputLogger.info('height is :',person.height);
        person.birthday = req.body.birthday;
		outputLogger.info('birthday is :',person.birthday);
        let step = req.body.step;
        if(step == 0){
            step = 8000;
        }
        person.step = step;
        personDao.update(person);
        res.json({
            successful: true
        });
    }
};


const actionUpdateInfo_app = {
    fields: {
        nickName: true,
        sex: true,
        weight: true,
        height: true,
        birthday: true,
        step: true
    },
    handler(req, res) {
        const id = req.body.userId;
        if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }
		const user = userDao.findOne({
			id: id
		});
		const person = personDao.findOne({
			user: user
		});
        person.nickName = req.body.nickName;
        person.sex = req.body.sex;
        person.weight = req.body.weight;
        person.height = req.body.height;
        person.birthday = req.body.birthday;
		person.phone = req.body.phone;
        let step = req.body.step;
        if(step == 0){
            step = 8000;
        }
        person.step = step;
        personDao.update(person);
        res.json({
            successful: true
        });
    }
};


//用户重置密码  
const actionResetPassword = {
	handler(req, res) {
		const userName = req.body.userName;//用户名
		const nickName = req.body.nickName;//用户昵称
		const user = userDao.findOne({
			loginName: userName
		});
		const person = personDao.findOne({
			user: user.id
		});
		if(person.nickName == nickName)
		{
			user.password = "e10adc3949ba59abbe56e057f20f883e";
			userDao.update(user);
			res.json({
				successful: true,
				message : "reset success !" 	
			})
		}
		else
		{
			res.json({
				successful: false,
				message : "userName or nickName is not exist !" 	
			})
		}
	}
};

//用户修改头像关联接口  2018-05-30
const actionUpdateHeadImage = {
	handler(req, res) {
		const userId = req.params.userId;
		const headImageUrl = req.body.headImageUrl;
		const user = userDao.findOne({
			id: userId
		});
		user.headImageUrl = headImageUrl;
		userDao.update(user);
		res.json({
			successful: true,
			message : "update headImage success !" 	
		})
	}
};

//用户重新设置密码  
const actionUpdatePassword = {
	handler(req, res) {
		const userId = req.params.userId;
		const user = userDao.findOne({
			id: userId
		});
		const password = hx_md5.md5(req.body.password);
		user.password = password;
		userDao.update(user);
		res.json({
			successful: true,
			message : "update password success !" 	
		})
	}
};

//添加签到记录的方法  
const actionCheckAdd = {
	handler(req, res) {
		const userId = req.params.userId;
		const user = userDao.findOne({
			id: userId
		});
		let oldmoney = 0;
		let date = new Date();
		let today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const checks = checkDao.count({
			user:user.id,
			checkTime:{
				$gte: today
			}
		});
		if(checks >0)
		{
			res.json({
				successful: false,
				message:"Today is checked !"
            });
            return;
		}
		const moneys =  parseFloat(Math.random().toFixed(1));
		// money = money * 0.9 + 0.1  //呗，区间0.1-1
		let checkInfo = new Check({
			user: user,//用户ID
			checkTime: new Date(),//登录签到时间
			credit: 100,//领取积分
			money : moneys,//随机红包不能大于0.2
			statu: 1//状态（0是未签到 1已经签到）
		});

		const person = personDao.findOne({
			user: user.id
		});
		

		if(person.money !=null)
		   person.money += moneys;
		else
		   person.money = moneys;
		if(person.creditTotal != null)
			person.creditTotal += 50;//签到积分加50
		else
			person.creditTotal = 50;
		oldmoney = person.money ;
		personDao.update(person);
		
		if(checkInfo != null){
			checkDao.create(checkInfo);
			res.json({
				successful: true,
				statu :1,
				money: moneys,
				oldmoney: oldmoney,
				newCredit: 50,
				creditToal: person.creditToal,
				useCredit:	person.useCredit ? null : 0	  
			});
		}
		else{
			res.json({
				successful: false,
				statu :0 	
			})
		}
	}
};

//得到签到信息记录 
const actionCheckInfo = {
    handler(req, res) {
		const id = req.params.userId;
		if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }
		const user = userDao.findOne({
			id: userId
		});
		const checkInfo = CheckDao.findOne({
			user: user
		});
		
        res.json({
            successful: true,
            data: {
				checkTime: checkInfo.checkTime,//登录签到时间
				credit: checkInfo.credit,//领取积分
				money: checkInfo.money,
				statu : checkInfo.statu
            }
        });
	}
}

//查询当月签到的历史信息集合
const actionCheckList = {
	handler(req, res) {
		const userId = req.params.userId;
		const user = userDao.findOne({
			id: userId
		});

        const checkInfo = checkDao.find({
			user: user, 
			$sort: {
				checkTime: -1
			},
			$limit: 30
		});
		outputLogger.info(checkInfo);
		
		let checkTimeList = [];
		let creditList = [];
		let statuList = [];
		let moneyList = [];

		if(checkInfo != null){			
			checkInfo.forEach(checkIndex => {
				checkTimeList.push(checkIndex.checkTime);
				creditList.push(checkIndex.credit);
				moneyList.push(checkIndex.money),
				statuList.push(checkIndex.statu);
		  });
		  outputLogger.info(checkInfo);
			res.json({
				successful: true,
				data : {
					checkTime: checkTimeList,
					credit: creditList,
					money: moneyList,
					statu: statuList//0未签到1已签到
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//查询连续七天签到的用户信息列表
const actionCheckSevenDayList = {
	handler(req, res) {
		let date = new Date();
		let start = new Date(date.getFullYear(), date.getMonth(), date.getDate()-7);
		let endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		outputLogger.info(start);
		outputLogger.info(endTime);
        const checkInfo = checkDao.find({
			checkTime: {
				$gte: start,
				$lte: endTime
			}, 
			$sort: {
				user:-1,
				checkTime: -1
			}
		});
		outputLogger.info(checkInfo);
		
		let checkTimeList = [];
		let userIdList = [];
		let userList = [];
		let personList = [];

		if(checkInfo != null){			
			checkInfo.forEach(checkIndex => {
				checkTimeList.push(checkIndex.checkTime);
				userIdList.push(checkIndex.user.id);
				const person = personDao.findOne({
					user:checkIndex.user.id
				});
				userList.push(checkIndex.user.loginName);
				personList.push(person.nickName);
		  });
		  outputLogger.info(checkInfo);
			res.json({
				successful: true,
				data : {
					checkTime: checkTimeList,
				    userid: userIdList,
					user: userList,
					person: personList
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};

// {"produceName": "FeeLT运动鞋垫","remark":"普通护足运动鞋垫","color": "红色","size":"34-38",
// "total":1000,"price":59,"needCredit":1000,"useCredit":1000,"money" :0,"explain":"积分兑换"}
//添加产品信息的方法  
const actionProductAdd = {
	handler(req, res) {
		let productInfo = new Product({
			produceName: req.body.produceName,//用户ID
			images:"",
    	 	remark:req.body.remark,//产品描述
    		color: req.body.color,//颜色
    		size:req.body.size,//规格
    		total:req.body.total,//总数
    		price:req.body.price,//产品价格
    		needCredit:req.body.needCredit,//产品需要积分
    		useCredit:req.body.useCredit,//最高可使用积分
    		money : req.body.money,//现金部分
    		explain:req.body.explain//兑换说明
		});

		if(productInfo != null){
			productDao.create(productInfo);
			res.json({
				successful: true		 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};

//得到产品信息记录 
const actionProductInfo = {
    handler(req, res) {
		const id = req.params.productId;
		if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }
		const productInfo = productDao.findOne({
			id: id
		});
		
        res.json({
            successful: true,
            data: {
				produceName: productInfo.produceName,//用户ID
				remark: productInfo.remark,//产品描述
			    color: productInfo.color,//颜色
			    size: productInfo.size,//规格
			    total: productInfo.total,//总数
			    price: productInfo.price,//产品价格
			    needCredit: productInfo.needCredit,//产品需要积分
			    useCredit: productInfo.useCredit,//最高可使用积分
			    money : productInfo.money,//现金部分
			    explain: productInfo.explain//兑换说明
            }
        });
	}
}

//查询所有产品信息集合
const actionProductList = {
	handler(req, res) {
        const productInfo = productDao.find({
			$sort: {
				date: -1
			},
			$limit: 200
		});
		
		let produceIdList = [];
		let produceNameList = [];
		let remarkList = [];
		let colorList = [];
		let sizeList = [];//规格
		let totalList = [];//总数
		let priceList = [];//产品价格
		let needCreditList = [];//产品需要积分
		let useCreditList = [];//最高可使用积分
		let moneyList = [];//现金部分
		let explainList = [];//兑换说明

		if(productInfo != null){			
			productInfo.forEach(productIndex => {
				produceIdList.push(productIndex.id);
				produceNameList.push(productIndex.produceName);
				remarkList.push(productIndex.remark);
				colorList.push(productIndex.color);
				sizeList.push(productIndex.size);
				totalList.push(productIndex.total);
				priceList.push(productIndex.price);
				needCreditList.push(productIndex.needCredit);
				useCreditList.push(productIndex.useCredit);
				moneyList.push(productIndex.money);
				explainList.push(productIndex.explain);
		  });
		  outputLogger.info(productInfo);
			res.json({
				successful: true,
				data : {
					id: produceIdList,
					produceName: produceNameList,
					remark: remarkList,
					color: colorList,
					size : sizeList,
					total : totalList,
					price : priceList,
					needCredit: needCreditList,
					useCredit:useCreditList,
					money: moneyList,
					explain: explainList
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//查询用户的活跃信息
// 用户名，出生日期，终端，上次同步数据时间，最近一周同步次数，最近一个月同步次数
const actionPersonHotList = {
	handler(req, res) {
        const personInfo = personDao.find({
			"__v":0
		});
		let nickNameList = [];//用户名
		let birthdayList = [];//生日
		let phoneList = [];//电话
		let deviceList = [];//终端id
		let preTimeList = [];//上次同步时间
		let weekList = [];//最近一周同步次数
		let monthList = [];//最近一个月同步次数
			
		let date = new Date();
		let start = new Date(date.getFullYear(), date.getMonth(), date.getDate()-7);
		let monthStart = new Date(date.getFullYear(), date.getMonth()-1, date.getDate());

		if(personInfo != null){			
			personInfo.forEach(personIndex => {
				nickNameList.push(personIndex.nickName);
				birthdayList.push(personIndex.birthday);
				phoneList.push(personIndex.phone);
				deviceList.push(personIndex.devices);

                //求上次同步数据时间
				let sportRecord = sportRecordDao.findOne({
					device: personIndex.devices,
					$sort: {
						date: -1
					},
					$limit: 1
				});
				if(sportRecord.length != 0){
					preTimeList.push(sportRecord[0].date);
				}
				else{
					preTimeList.push(0);
				}

                //最近一周同步次数
				let sportRecordCount = sportRecordDao.count({
					device: personIndex.devices,
					$gte:{
						date:start
					}
				});
				if(sportRecordCount.length != 0){
					weekList.push(sportRecordCount);
				}
				else{
					weekList.push(0);
				}


                //最近一个月同步次数
				let sportMonthCount = sportRecordDao.count({
					device: personIndex.devices,
					$gte:{
						date: monthStart
					}
				});
				if(sportRecordCount.length != 0){
					monthList.push(sportMonthCount);
				}
				else{
					monthList.push(0);
				}


		  });
			res.json({
				successful: true,
				data : {
					nickName: nickNameList,
					birthday: birthdayList,
					phone: phoneList,
					devices : deviceList
					// preTime : preTimeList,
					// week : weekList,
					// month: monthList
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};

//得到注册用户数，绑定终端数，昨日同步数据人数
const actionPersonSportCount = {
    handler(req, res) {
		
		let date = new Date();
		let start = new Date(date.getFullYear(), date.getMonth(), date.getDate()-1);
		const person = personDao.count({});
		const device = deviceDao.count({});
		const pre_device = deviceDao.count({
			boundTime: {
				$gte: start
			},
		});
		const sportHistory = sportHistoryDao.count({	
            date: {
				$gte: start
			},
		});
        res.json({
            successful: true,
            data: {
				personTotal: person,//用户总数
				deviceNum: device,//终端总数
				pre_deviceNum:pre_device,//昨天新增终端数
			    sportHistoryNum: sportHistory//昨天同步终端人数
            }
        });
	}
}


//今天同步数据人员列表
const actionTodaySport = {
    handler(req, res) {
		let date = new Date();
        let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const TopSportHistory = sportHistoryDao.find({
            date: {
                $gte: start
                },
            $sort: {
                date: -1
            }
        });
		outputLogger.info(TopSportHistory.length);
		let deviceList = [];//同步的mac地址
		let personIdList = [];//同步的人员
		let personNameList = [];//同步的人员
        for(let i=0;i<TopSportHistory.length;i++)
        {
			deviceList.push(TopSportHistory[i].device.id);
            personIdList.push(TopSportHistory[i].person.id);
            personNameList.push(TopSportHistory[i].person.nickName);
        }
		res.json({
        successful: true,
        data: {				
			     devices: deviceList,//今天同步终端id
				 personId: personIdList,
				 personName: personNameList
            }
        });
	}
}

//七天内同步数据人员列表
const actionWeekSport = {
    handler(req, res) {
		let date = new Date();
		let start = new Date(date.getFullYear(), date.getMonth(), date.getDate()-7);
		let endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const TopSportHistory = sportHistoryDao.find({
            date: {
				$gte: start,
				$lte: endTime
                },
            $sort: {
                date: -1
            }
        });
		outputLogger.info(TopSportHistory.length);
		let deviceList = [];//同步的mac地址
		let personIdList = [];//同步的人员
		let personNameList = [];//同步的人员
        for(let i=0;i<TopSportHistory.length;i++)
        {
			deviceList.push(TopSportHistory[i].device.id);
            personIdList.push(TopSportHistory[i].person.id);
            personNameList.push(TopSportHistory[i].person.nickName);
        }
		res.json({
        successful: true,
        data: {				
			     devices: deviceList,//今天同步终端id
				 personId: personIdList,
				 personName: personNameList
            }
        });
	}
}

//当日步数前3的用户
const actionTopSetpSport = {
    handler(req, res) {
		let date = new Date();
        let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const TopSportHistory = sportHistoryDao.find({
            date: {
                $gte: start
                },
            $sort: {
                historySteps: -1
			},
			$limit:3
        });
		outputLogger.info(TopSportHistory.length);
		let personIdList = [];//同步的人员
		let personNameList = [];//同步的人员
        for(let i=0;i<TopSportHistory.length;i++)
        {
            personIdList.push(TopSportHistory[i].person.id);
            personNameList.push(TopSportHistory[i].person.nickName);
        }
		res.json({
        successful: true,
        data: {				
				 personId: personIdList,
				 personName: personNameList
            }
        });
	}
}
//统计七天内终端步数大于1500步的用户
const actionMaxSetpList = {
    handler(req, res) {
		let date = new Date();
        let start = new Date(date.getFullYear(), date.getMonth(), date.getDate()-7);
        let endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const TopSportHistory = sportHistoryDao.find({
			historySteps:{$gte: 1500},
            date: {
				$gte: start,
				$lte: endTime
                },
            $sort: {
                historySteps: -1
			}
        });
		outputLogger.info(TopSportHistory.length);
		let personIdList = [];//同步的人员
		let personNameList = [];//同步的人员
        for(let i=0;i<TopSportHistory.length;i++)
        {
            personIdList.push(TopSportHistory[i].person.id);
            personNameList.push(TopSportHistory[i].person.nickName);
        }
		res.json({
        successful: true,
        data: {				
				 personId: personIdList,
				 personName: personNameList
            }
        });
	}
}

//用户打卡数和同步数据情况 
const actionAllPersonSport = {
    handler(req, res) {
        const userList = personDao.find({
			$sort:{_id:-1}
		});
		let personIdList = [];//打卡的人员id
		let personNameList = [];//打卡同步的人员name
		let phoneList = [];
		let daysList = [];
		let checkList = [];
		let historyCount = [];
        for(let i=0;i<userList.length;i++)
        {
            personIdList.push(userList[i].id);
			personNameList.push(userList[i].nickName);
			phoneList.push(userList[i].phone);
			const checks = checkDao.count({
				user:userList[i].user.id
			});
			checkList.push(checks);
			const historys = sportHistoryDao.count({
				person:userList[i].id
			});
			historyCount.push(historys);
			daysList.push(userList[i].days);
		}
		outputLogger.info(userList.length);
		res.json({
        successful: true,
        data: {				
				 personId: personIdList,
				 personName: personNameList,
				 phone: phoneList,
				 days:userList.daysList,
				 historyNum : historyCount,
				 checkNum: checkList
            }
        });
	}
}

//当日打卡用户列表
const actionCheckInfoList = {
    handler(req, res) {
		let date = new Date();
        let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const checkList = checkDao.find({
            checkTime: {
                $gte: start
                },
            $sort: {
                checkTime: -1
			}
        });
		outputLogger.info(checkList.length);
		let personIdList = [];//打卡的人员id
		let personNameList = [];//打卡同步的人员name
        for(let i=0;i<checkList.length;i++)
        {
            personIdList.push(checkList[i].user.id);
            personNameList.push(checkList[i].user.loginName);
        }
		res.json({
        successful: true,
        data: {				
				 personId: personIdList,
				 personName: personNameList
            }
        });
	}
}


// {"user": "5a6998f35096da2645ac474a","product":2,"num":1,"useCredit":1000,
// "money":1,"statu":1}
//添加积分兑换信息的方法  
const actionExchangeAdd = {
	handler(req, res) {
		let userId = req.body.userId;
		let useCredit= req.body.useCredit;
		const user = userDao.findOne({
			id: userId
		});
		let productId = req.body.product;
		const product = productDao.findOne({
			id: productId
		});
		const person = personDao.findOne({
			user: user.id
		});
		if(useCredit != 0)
		    person.useCredit += useCredit;//兑换的积分
	    else
		    preson.useCredit = 0;
	    personDao.update(person);

		let exchangeInfo = new Exchange({
			user: user,//用户ID
			product: product,//产品名称
			num:req.body.num,//数量
			useCredit:req.body.useCredit,//所用积分
			money:req.body.money,//现金
			exchangeTime:new Date(),
			statu:req.body.statu//状态
		});

		if(exchangeInfo != null){
			exchangeDao.create(exchangeInfo);
			res.json({
				successful: true		 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//账户下所有终端步数兑换成积分记录新增接口   new 2018-05-30  
// {"userId":"5a6998f35096da2645ac474a","macAddress" : "DF:E1:FC:1E:86:AE"}
const actionExchangeUserStep = {
	handler(req, res) {
		const userId = req.params.userId;
		const deviceList = [];
		const exchangeRunList = [];
		const exchangeWalkList = [];
		const remarkList = [];
		const exchangeTimeList = [];
		const user = userDao.findOne({
			id: userId
		});
		const person = personDao.findOne({
			user: user.id
		});
		const devices = deviceDao.find({
			user: user.id
		});
        let date = new Date();
		let endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()-1);
		let startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	
	 devices.forEach(deviceIndex => {
		const sportRecord = sportHistoryDao.find({
			device: deviceIndex.id,
			date: {
				   $gte: endTime,
				   $lte: startTime
				},
			$sort: {
				date: -1
			},
			$limit: 1
		});
	    deviceList.push(deviceIndex.macAddress);
		if(deviceIndex.remark == null)
		    remarkList.push("0");
	    else
		    remarkList.push(deviceIndex.remark);	
		if(sportRecord[0] != undefined && sportRecord[0] != null) {
			let runNum = sportRecord[0].run;
			let walkNum = sportRecord[0].walk;
	
			let runCredit = 0;
			let walkCredit = 0;
			if(runNum != null && runNum >0)
				runCredit = runNum;
			if(walkNum != null && walkNum >0)
				walkCredit = walkNum/10;
	
			let totalExchange = runCredit + walkCredit
	
			if(person.creditTotal != null )
				person.creditTotal += totalExchange;//兑换的积分
			else
				preson.creditTotal = 0;
			personDao.update(person);
		
   		const Exchanges = stepExchangeDao.count({
			macAddress: deviceIndex.macAddress,
			exchangeTime: {
				   $gte: startTime,
				}
		});

		let stepExchange = new StepExchange({
				user: user,//用户ID
				macAddress: deviceIndex.macAddress,//产品名称
				exchangeRun: runNum,//兑换跑步步数
				exchangeWalk: walkNum,//兑换走路步数
				exchangeTime :new Date(),//兑换时间
				status :1 // 兑换状态
			});
			if(stepExchange != null){
				if(Exchanges <= 0)
				{
					stepExchangeDao.create(stepExchange);
					exchangeRunList.push(runNum);
					exchangeWalkList.push(walkNum);
					exchangeTimeList.push(new Date());
				}
				else{
					exchangeRunList.push(0);
					exchangeWalkList.push(0);
					exchangeTimeList.push(0);
				}
			}
			else{
				exchangeRunList.push(0);
				exchangeWalkList.push(0);
				exchangeTimeList.push(0);
			}
		}
		else{
			exchangeRunList.push(0);
			exchangeWalkList.push(0);
			exchangeTimeList.push(0);
		}
	 });
	 res.json({
		successful: true,
		data: {
		    device: deviceList,
		    remark: remarkList,
		    exchangeRun: exchangeRunList,
		    exchangeWalk: exchangeWalkList,
		    exchangeTime: exchangeTimeList	
		}	 
	 });
	 return;
   }
};


//步数兑换成积分记录新增接口   new 2018-04-10  
// {"userId":"5a6998f35096da2645ac474a","macAddress" : "DF:E1:FC:1E:86:AE"}
const actionNewExchangeStep = {
	handler(req, res) {
		const userId = req.body.userId;
		const macAddress = req.body.macAddress;

		let date = new Date();
		let exchangeDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const Exchanges = stepExchangeDao.count({
			macAddress: macAddress,
			exchangeTime: {
				   $gte: exchangeDate,
				}
		});
		if(Exchanges > 0)
		{
			res.json({
				successful: false,
				message:"Step is Exchanged !"
			});
			return;	
		}

		const user = userDao.findOne({
			id: userId
		});
		const devices = deviceDao.findOne({
			macAddress: macAddress
		});

		let endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()-1);
		let startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const sportRecord = sportHistoryDao.find({
			device: devices.id,
			date: {
				   $gte: endTime,
				   $lte: startTime
				},
			$sort: {
				date: -1
			},
			$limit: 1
		});

		if(sportRecord[0] == undefined) {
            res.json({
				successful: false,
				massage:"sprotInfo is null !"
            });
            return;
		}
		let runNum = sportRecord[0].run;
		let walkNum = sportRecord[0].walk;

		let runCredit = 0;
		let walkCredit = 0;
		if(runNum != null && runNum >0)
			runCredit = runNum;
		if(walkNum != null && walkNum >0)
		    walkCredit = walkNum/10;

		const person = personDao.findOne({
			user: user.id
		});
		let totalExchange = runCredit + walkCredit
		outputLogger.info(totalExchange);
		if(person.creditTotal != null )
			person.creditTotal += totalExchange;//兑换的积分
		else
			preson.creditTotal = 0;
		personDao.update(person);

		
		let stepExchange = new StepExchange({
			user: user,//用户ID
			macAddress: macAddress,//产品名称
			exchangeRun: runNum,//兑换跑步步数
			exchangeWalk: walkNum,//兑换走路步数
			exchangeTime :new Date(),//兑换时间
			status :1 // 兑换状态
		});
		if(stepExchange != null){
			stepExchangeDao.create(stepExchange);
			res.json({
				successful: true,
				exchangeRun: runNum,
				exchangeWalk: walkNum		 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};

//步数兑换成积分记录新增接口   new 2018-03-05  
// {"userId":"5a6998f35096da2645ac474a","macAddress" : "DF:E1:FC:1E:86:AE"}
const actionExchangeStep = {
	handler(req, res) {
		const userId = req.body.userId;
		const macAddress = req.body.macAddress;
		const user = userDao.findOne({
			id: userId
		});
		const devices = deviceDao.findOne({
			macAddress: macAddress
		});
		let date = new Date();
		let day = date.getDate();

		let endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()-1);
		let startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const sportRecord = sportRecordDao.find({
			device: devices.id,
			date: {
				   $gte: endTime,
				   $lte: startTime
				},
			$sort: {
				date: -1
			},
			$limit: 1
		});

		if(sportRecord[0] == undefined) {
            res.json({
				successful: false,
				massage:"sprotInfo is null !"
            });
            return;
		}
		let runNum = sportRecord[0].run;
		let walkNum = sportRecord[0].walk;

		// if(runNum <200 || walkNum<2000)
		// {
		// 	res.json({
		// 		successful: false,
		// 		massage:"当前步数不足，跑步低于200或者走路低于2000，继续努力加油"
        //     });
        //     return;
		// }
		let runCredit = 0;
		let walkCredit = 0;
		if(runNum != null && runNum >0)
			runCredit = runNum;
		if(walkNum != null && walkNum >0)
		    walkCredit = walkNum/10;

		const person = personDao.findOne({
			user: user.id
		});
		let totalExchange = runCredit + walkCredit
		outputLogger.info(totalExchange);
		if(person.creditTotal != null )
			person.creditTotal += totalExchange;//兑换的积分
		else
			preson.creditTotal = 0;
		personDao.update(person);
		outputLogger.info(person.creditTotal);
		let stepExchange = new StepExchange({
			user: user,//用户ID
			macAddress: macAddress,//产品名称
			exchangeRun: runNum,//兑换跑步步数
			exchangeWalk: walkNum,//兑换走路步数
			exchangeTime :new Date(),//兑换时间
			status :1 // 兑换状态
		});
		if(runNum == null){
			runNum = 0;
		}
		if(walkNum == null){
			walkNum = 0;
		}
		if(stepExchange != null){
			stepExchangeDao.create(stepExchange);
			res.json({
				successful: true,
				exchangeRun: runNum,
				exchangeWalk: walkNum		 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//添加积分兑换信息的方法  
const actionStepExchangeAdd = {
	handler(req, res) {
		let StepExchange = new StepExchange({
			user: req.body.userId,//用户ID
			macAddress:req.body.macAddress,//产品名称
			exchangeRun: req.body.exchangeRun,//兑换跑步步数
			exchangeWalk:req.body.exchangeWalk,//兑换走路步数
			exchangeTime :new Date(),//兑换时间
			status :req.body.status // 兑换状态
		});

		if(StepExchange != null){
			stepExchangeDao.create(StepExchange);
			res.json({
				successful: true		 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//得到用户所有终端的步数兑换积分的记录 
const actionUserStepExchange = {
    handler(req, res) {
		const userId = req.params.userId;
		const user = userDao.findOne({
			id: userId
		});
		if(user == undefined) {
            res.json({
				successful: false,
				massage:"user is not exits"
            });
            return;
		}

		let date = new Date();
		const deviceList = [];
		const remarkList = [];
		const exchangeRunList = [];
		const exchangeWalkList = [];
		const exchangeTimeList = [];
		const statueList = [];
		let startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const devices = deviceDao.find({
			user: user.id
		});
	
	 devices.forEach(deviceIndex => {
		deviceList.push(deviceIndex.macAddress);
		if(deviceIndex.remark == null)
		   remarkList.push(0);
		else
		   remarkList.push(deviceIndex.remark);
		let stepExchange = stepExchangeDao.findOne({
			macAddress: deviceIndex.macAddress,
			exchangeTime: {
				   $gte: startDate,
				}
			});

		if(stepExchange != null)
		{
		   let runs = 0;
		   let walks = 0;
		   if(stepExchange.exchangeWalk != null){
			   walks = stepExchange.exchangeWalk;
		   }
		   if(stepExchange.exchangeRun != null){
			   runs = stepExchange.exchangeRun;
		   }
		   exchangeRunList.push(runs);
		   exchangeWalkList.push(walks);
		   exchangeTimeList.push(stepExchange.exchangeTime);
		   statueList.push(stepExchange.status);
		}
		else{
			exchangeRunList.push(0);
			exchangeWalkList.push(0);
			exchangeTimeList.push(0);
			statueList.push(0);
		}
	});
	res.json({
		successful: true,
		data: {
			macAddress: deviceList,//终端mac
			remark : remarkList,//设备名称
			exchangeRun: exchangeRunList,//兑换跑步步数
			exchangeWalk: exchangeWalkList,//兑换走路步数
			exchangeTime : exchangeTimeList,//兑换时间
			status : statueList // 兑换状态
		}
	});
  }
}

//得到步数兑换积分的记录 
const actionStepExchangeInfo = {
    handler(req, res) {
		const userId = req.params.userId;
		const user = userDao.findOne({
			id: userId
		});
		if(user == undefined) {
            res.json({
                successful: false
            });
            return;
		}

		let date = new Date();
		let startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		//查找用户的最后一条兑换记录
		let stepExchange = stepExchangeDao.findOne({
			user: user.id,
			exchangeTime:{
				$gte: startDate
			}
		});

		outputLogger.info(stepExchange);
		if(stepExchange != null)
		{
		   let runs = 0;
		   let walks = 0;
		   if(stepExchange.exchangeWalk != null){
			   walks = stepExchange.exchangeWalk;
		   }
		   if(stepExchange.exchangeRun != null){
			   runs = stepExchange.exchangeRun;
		   }
           res.json({
              successful: true,
              data: {
				  macAddress:stepExchange.macAddress,//产品名称
				  exchangeRun: runs,//兑换跑步步数
				  exchangeWalk: walks,//兑换走路步数
				  exchangeTime :stepExchange.exchangeTime,//兑换时间
				  status :stepExchange.status // 兑换状态
              }
          });
		}else{
			res.json({
				successful: false,
				message:"today is no changed info"
			});
			return;
		}
	}
}


//得到积分兑换信息记录 
const actionExchangeInfo = {
    handler(req, res) {
		const userId = req.params.userId;
		const user = userDao.findOne({
			id: userId
		});
		if(user == undefined) {
            res.json({
                successful: false
            });
            return;
		}
		let exchangeInfo = exchangeDao.find({
			user: user.id,
			$sort: {
				exchangeTime: -1
			},
			$limit: 1
		});
		if(exchangeInfo[0] == undefined) {
            res.json({
				successful: false,
				massage:"No exchange data !"
            });
            return;
		}
		outputLogger.info(exchangeInfo[0]);
        res.json({
            successful: true,
            data: {
				  product: exchangeInfo[0].product.produceName,//产品
				  num: exchangeInfo[0].num,//数量
				  useCredit: exchangeInfo[0].useCredit,//所用积分
				  money: exchangeInfo[0].money,//现金
				  exchangeTime:exchangeInfo[0].exchangeTime,//兑换时间
				  statu: exchangeInfo[0].statu//状态
            }
        });
	}
}

//查询所有积分兑换信息集合
const actionExchangeList = {
	handler(req, res) {
		const userId = req.params.userId;
		const user = userDao.findOne({
			id: userId
		});
        const exchangeInfo = exchangeDao.find({
			user: user.id,
			$sort: {
				exchangeTime: -1
			},
			$limit: 200
		});
		
		let productList = [];
		let numList = [];
		let useCreditList = [];
		let moneyList = [];//金额
		let statuList = [];//状态
		let exchangeTimeList =[];
		if(exchangeInfo != null || exchangeInfo != undefined){			
			exchangeInfo.forEach(exchangeIndex => {
				productList.push(exchangeIndex.product.produceName);//产品
				numList.push(exchangeIndex.num);//数量
				useCreditList.push(exchangeIndex.useCredit);//所用积分
				moneyList.push(exchangeIndex.money);//现金
				exchangeTimeList.push(exchangeIndex.exchangeTime);//兑换时间
				statuList.push(exchangeIndex.statu);//状态
		  });
			res.json({
				successful: true,
				data : {
					product: productList,//产品
					num: numList,//数量
					useCredit: useCreditList,//所用积分
					money: moneyList,//现金
					exchangeTime:exchangeTimeList,//兑换时间
					statu: exchangeInfo.statu//状态
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};

//修改用户积分数
const actionUpdateCredit = {
    handler(req, res) {
        const id = req.params.userId;
        if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }
		const user = userDao.findOne({
			id: id
		});
		const person = personDao.findOne({
			user: user
		});
		if(preson.creditTotal == null)
		    person.creditTotal = req.body.creditTotal;
		else
            person.creditTotal += req.body.creditTotal;  
		if(preson.useCredit == null)
			person.useCredit = 0;
        personDao.update(person);
        res.json({
            successful: true
        });
    }
};

const actionUpdateStep_app = {
    handler(req, res) {
        const id = req.body.userId;
        if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }
		const user = userDao.findOne({
			id: id
		});
		const person = personDao.findOne({
			user: user
		});
        let step = req.body.step;
        if(step == 0){
            step = 8000;
        }
        person.step = step;
        personDao.update(person);
        res.json({
            successful: true
        });
    }
};

const actionGetPersonInfo = {
    handler(req, res) {
		const id = req.session.login.user;
		if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }
		const user = userDao.findOne({
			id: id
		});
		const person = personDao.findOne({
			user: user
		});
        res.json({
            successful: true,
            data: {
				nickName: person.nickName, 
                headImageUrl: user.headImageUrl,
				sex: person.sex,
				weight: person.weight,
				height: person.height, 
				birthday: person.birthday,
				step: person.step
            }
        });
	}
}


//得到个人信息 {"userId":"5a6998f35096da2645ac474a"}
const actionGetPersonInfo_app = {
    handler(req, res) {
		const id = req.params.userId;
		if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }
		const user = userDao.findOne({
			id: id
		});
		const person = personDao.findOne({
			user: user
		});
		if(person.useCredit == null)
			person.useCredit = 0;	
		if(person.creditTotal == null)
		    person.creditTotal = 0;
		if(person.money == null)
		    person.money = 0;
        res.json({
            successful: true,
            data: {
				nickName: person.nickName, 
                headImageUrl: user.headImageUrl,
				sex: person.sex,
				weight: person.weight,
				height: person.height, 
				phone: person.phone,
				creditTotal:person.creditTotal,
				money:person.money,
				useCredit: person.useCredit,
				birthday: person.birthday,
				step: person.step
            }
        });
	}
}

const actionUserProfile = {
    handler(req, res) {
        const id = req.session.login.user;
        const deviceId = req.params.deviceId;
        if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }
        const user = userDao.findOne({
            id: id
        });
        const person = personDao.findOne({
            user: user
        });
        const device = deviceDao.findOne({
            id: deviceId
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
        age = Number.parseInt(age);
        let sex = 0;
        if(person.sex == '男'){
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
        res.json({
            successful: true,
            data: userProfileData
        });
    }
}

const actionUserProfile_app = {
    handler(req, res) {
        const id = req.body.userId;
        const macAddress = req.params.macAddress;
        if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }
        const user = userDao.findOne({
            id: id
        });
        const person = personDao.findOne({
            user: user
        });
        const device = deviceDao.findOne({
            macAddress: macAddress
		});
		if(device != null){
          let needInit = device.needInit;
          let init_sport_data = 0;
          if(needInit == true){
            init_sport_data = 1;
            device.needInit = false;
            deviceDao.update(device);
          } 
		}
        let myDate = new Date();
        let nowYear = myDate.getFullYear();
        let birYear = person.birthday.getFullYear();
        let age = nowYear - birYear;
        age = Number.parseInt(age);
        let sex = 0;
        if(person.sex == '男'){
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
        res.json({
            successful: true,
            data: userProfileData
        });
    }
}


const actionGetPersonDevices = {
    handler(req, res) {
		const id = req.session.login.user;
		if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }

		const user = userDao.findOne({
			id: id
		});
		const person = personDao.findOne({
			user: user
		});

        res.json({
            successful: true,
            data: {
                devices: Device.toObjectArray(person.devices, {
                    recursive: true
                })
            }
        });
	}
}

const actionGetHistoryDistance = {
    handler(req, res) {
        const id = req.params.deviceId;
        const device = deviceDao.findOne({
			id: id
        });
		if(device == null) {
            res.json({
                successful: false
            });
            return;
        }
		let sportHistory = sportHistoryDao.find({
			device: device.id,
			$sort: {
				date: -1
			},
			$limit: 7
		});
		let historyDistance = [];
		if( sportHistory.length != 0 ){
			sportHistory.forEach(sportHistoryIndex => {
				historyDistance.push(sportHistoryIndex.historyDistances);
			});
			let count =sportHistory.length;
			for(let i = 7; i>count ; i--){
				historyDistance.push(0);
			}
		}
		else{
			historyDistance = [0,0,0,0,0,0,0]; 
		}
        outputLogger.info('historyDistance is',historyDistance);
        res.json({
            successful: true,
            data: {
    			distance: historyDistance
            }
        });
    }
};

const actionGetHistorySteps = {
    handler(req, res) {
        const id = req.params.deviceId;
        const device = deviceDao.findOne({
            id: id
        });
        if(device == null) {
            res.json({
                successful: false
            });
            return;
        }
        let sportHistory = sportHistoryDao.find({
            device: device.id,
            $sort: {
                date: -1
            },
            $limit: 7
        });
        let historyStep = [];
        if( sportHistory.length != 0 ){
            sportHistory.forEach(sportHistoryIndex => {
                historyStep.push(sportHistoryIndex.historySteps);
            });
            let count =sportHistory.length;
            for(let i = 7; i>count ; i--){
                historyStep.push(0);
            }
        }
        else{
            historyStep = [0,0,0,0,0,0,0]; 
        }
        outputLogger.info('historyStep is',historyStep);
        res.json({
            successful: true,
            data: {
    			step: historyStep  
            }
        });
    }
};


const actionGetHistoryCalories = {
    handler(req, res) {
        const id = req.params.deviceId;
		const device = deviceDao.findOne({
			id: id
        });
		if(device == null) {
            res.json({
                successful: false
            });
            return;
        }
		let sportHistory = sportHistoryDao.find({
			device: device.id,
			$sort: {
				date: -1
			},
			$limit: 7
		});
		let historyCalories = [];
		if( sportHistory.length != 0 ){
			sportHistory.forEach(sportHistoryIndex => {
				historyCalories.push(sportHistoryIndex.historyCalories);
			});
			let count =sportHistory.length;
			for(let i = 7; i>count ; i--){
				historyCalories.push(0);
            }  
            outputLogger.info('historyCalories', historyCalories);
		}
		else{
			historyCalories = [0,0,0,0,0,0,0]; 
		}
        res.json({
            successful: true,
            data: {
    			calories: historyCalories
            }
        });
    }
};

const actionGetSportModel = {
    handler(req, res) {
        const id = req.params.deviceId;
		const device = deviceDao.findOne({
			id: id
        });
		if(device == null) {
            res.json({
                successful: false
            });
            return;
        }
		const sportRecord = sportRecordDao.findOne({
    		device: device.id
    	})
		let sportRecords = sportRecordDao.find({
			device: device.id,
			$sort: {
				date: -1
			},
			$limit: 1
		});
       if(sportRecords.length != 0){
            res.json({
				successful: true,
				data: {
					walk: sportRecords[0].step,
					run: sportRecords[0].run,
					jump:sportrecord[0].jump,
					upstairs : sportRecords[0].upstairs ,
					downstairs: sportRecords[0].downstairs,
					sportTime: sportRecords[0].sportTime
				//	acomplishPercent:sportRecords[0].accomplishPercent
				}
			});
			return ;
		}
        res.json({
            successful: false
		});
    }
};


//设置跳跃时间的方法  
const actionJumpTime = {
	handler(req, res) {
		const macAddress = req.params.macAddress;
        const device = deviceDao.findOne({
            macAddress: macAddress
        });
		if(device != null){
			device.jumpTime = req.body.time;//10秒，30秒，60秒，120秒
			deviceDao.update(device);
			res.json({
				successful: true		 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//添加终端reset记录
// http://localhost:3000/device/5a6998f35096da2645ac474a/resetAdd
// {"macAddress": "DF:E1:FC:1E:86:AE","resetNum": 200,"runOld":300,"walkOld":100,"walkReset":300,"runReset":200,"sportTime":20,"sportTimeReset":30}  
const actionResetAdd = {
	handler(req, res) {
		const userId = req.params.userId;
		const macAddress = req.body.macAddress;
		const users = userDao.findOne({
			id: userId
		});
		const device = deviceDao.findOne({
			macAddress: macAddress
		});
		let date = new Date();
		let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		let oldReset = resetDao.findOne({
			device: device.id,
			creatTime:{
				$gte: start
		}}); 
		if(oldReset != null){
			if(oldReset.walkReset != req.body.walkReset || oldReset.runReset != req.body.runReset){
				oldReset.resetNum += 1;
			 }
			   oldReset.walkOld = req.body.walkOld;
			   oldReset.runOld = req.body.runOld;
			   oldReset.walkReset = req.body.walkReset;
			   oldReset.runReset = req.body.runReset;
			   oldReset.sportTime = req.body.sportTime;
			   oldReset.sportTimeReset = req.body.sportTimeReset;
			   oldReset.creatTime = date;
			   resetDao.update(oldReset);
	       }
		  else{
			let Resets = new Reset({
				user : users,
				device: device,
				runOld: req.body.runOld,//上一次固件步数
				walkOld: req.body.walkOld,//上一次固件走路
				walkReset: req.body.walkReset,//reset走路
				runReset: req.body.runReset,//reset跑步数
				sportTime :req.body.sportTime,//运动时间
				sportTimeReset : req.body.sportTimeReset,
				resetNum:1,
				creatTime: date
			}); 
			resetDao.create(Resets);
		  }
		res.json({
			successful: true		 
		});
		return;
	}
};


//终端reset记录查询  2018-05-22
const actionResetInfo = {
	handler(req, res) {
		const macAddress = req.params.macAddress;
		const device = deviceDao.findOne({
			macAddress: macAddress
		});
		let date = new Date();
		let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		let oldReset = resetDao.findOne({
			device: device.id,
			creatTime:{
				$gte: start
			}}); 
		if(oldReset != null){
			res.json({
				successful: true,
				data : {
					runOld: oldReset.runOld,//上一次固件步数
				    walkOld: oldReset.walkOld,//上一次固件走路
				    walkReset: oldReset.walkReset,//reset走路
					runReset: oldReset.runReset,//reset跑步数
					sportTime : oldReset.sportTime,//运动时间
					sportTimeReset : oldReset.sportTimeReset,
					resetNum: oldReset.resetNum,
					creatTime: oldReset.creatTime
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//当日所有终端reset记录查询  2018-05-24
const actionAllResetList = {
	handler(req, res) {
		let runOldList =[];//上一次固件步数
		let walkOldList =[];//上一次固件走路
		let walkResetList =[];//reset走路
		let runResetList =[];//reset跑步数
		let sportTimeList =[];//运动时间
		let sportTimeResetList =[]; //reset运动时间
		let resetNumList =[];     //reset次数
		let creatTimeList =[];  //修改时间
		let deviceList = [];  //终端mac地址
		let userNameList = [];
		let date = new Date();
		let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		let oldReset =  resetDao.find({
			creatTime:{
				$gte: start
		}}); 
		for(let i=0;i<oldReset.length;i++)
        {
			deviceList.push(oldReset[i].device.macAddress);
			userNameList.push(oldReset[i].user.loginName);
			runOldList.push(oldReset[i].runOld);//上一次固件步数
			walkOldList.push(oldReset[i].walkOld);//上一次固件走路
			walkResetList.push(oldReset[i].walkReset);//reset走路
			runResetList.push(oldReset[i].runReset);//reset跑步数
			sportTimeList.push(oldReset[i].sportTime);//运动时间
			sportTimeResetList.push(oldReset[i].sportTimeReset);
			resetNumList.push(oldReset[i].resetNum);
			creatTimeList.push(oldReset[i].creatTime);
		 }
	   res.json({
				successful: true,
				data : {
					userName: userNameList,
					device: deviceList,
					runOld: runOldList,//上一次固件步数
				    walkOld: walkOldList,//上一次固件走路
				    walkReset: walkResetList,//reset走路
					runReset: runResetList,//reset跑步数
					sportTime : sportTimeList,//运动时间
					sportTimeReset : sportTimeResetList,
					resetNum: resetNumList,
					creatTime: creatTimeList
				}	 
		});
	}
};


//账户下所有终端reset记录查询  2018-05-22
const actionMacResetList = {
	handler(req, res) {
		const userId = req.params.userId;
		let date = new Date();
		let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const user = userDao.findOne({
			id: userId
		});
	    const oldReset =  resetDao.find({
		    user: user.id,
			creatTime:{
				$gte: start
		}}); 
		let runOldList =[];//上一次固件步数
		let walkOldList =[];//上一次固件走路
		let walkResetList =[];//reset走路
		let runResetList =[];//reset跑步数
		let sportTimeList =[];//运动时间
		let sportTimeResetList =[]; //reset运动时间
		let resetNumList =[];     //reset次数
		let creatTimeList =[];  //修改时间
		let deviceList = [];  //终端mac地址
	    oldReset.forEach(deviceIndex => {
			deviceList.push(deviceIndex.device.macAddress);
			runOldList.push(deviceIndex.runOld);//上一次固件步数
			walkOldList.push(deviceIndex.walkOld);//上一次固件走路
			walkResetList.push(deviceIndex.walkReset);//reset走路
			runResetList.push(deviceIndex.runReset);//reset跑步数
			sportTimeList.push(deviceIndex.sportTime);//运动时间
			sportTimeResetList.push(deviceIndex.sportTimeReset);
			resetNumList.push(deviceIndex.resetNum);
			creatTimeList.push(deviceIndex.creatTime);
	   });	
	   res.json({
				successful: true,
				data : {
					device: deviceList,
					runOld: runOldList,//上一次固件步数
				    walkOld: walkOldList,//上一次固件走路
				    walkReset: walkResetList,//reset走路
					runReset: runResetList,//reset跑步数
					sportTime : sportTimeList,//运动时间
					sportTimeReset : sportTimeResetList,
					resetNum: resetNumList,
					creatTime: creatTimeList
				}	 
		});
	}
};

//排行榜积分领取记录添加
// {"macAddress": "DF:E1:FC:1E:86:AE","credit": 3000}  
const actionRankRewardAdd = {
	handler(req, res) {
		const userId = req.params.userId;
		const macAddress = req.body.macAddress;
		const users = userDao.findOne({
			id: userId
		});
		let date = new Date();
		let endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const RankRewardCount = RankRewardDao.count({
			macAddress: macAddress,
			creatTime:{
				$gte: endTime
			}
		});
		if(RankRewardCount > 0){
			res.json({
				successful: false,		 
				message:"this RankReward is exist !"
			});
			return;
		}
		let RankRewardInfo = new RankReward({
			user: users,
			macAddress: macAddress,
			credit: req.body.credit,
			creatTime: new Date()
		});

		if(RankRewardInfo != null){
			RankRewardDao.create(RankRewardInfo);
			res.json({
				successful: true		 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//查询积分排行榜奖励信息
const actionRankRewardInfo = {
	handler(req, res) {
		const userId = req.params.userId;
		const user = userDao.findOne({
			id: userId
		});
		const person = personDao.findOne({
			user: user
		});
		let date = new Date();
		let endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const RankRewards = RankRewardDao.findOne({
			user: userId,
			creatTime:{
				$gte: endTime
			}
		});
		if(RankRewards != null){
			res.json({
				successful: true,
				data : {
					userName: RankRewards.user.loginName,
					macAddress: RankRewards.macAddress,
					credit: RankRewards.credit,
					creatTime: RankRewards.creatTime,
					creditTotal: person.creditTotal,
					useCredit: person.useCredit
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//添加周末赛事参赛人员记录接口
const actionAttendAdd = {
	handler(req, res) {
		const matchId = req.params.matchId;
		const userId = req.body.userId;
		const match = sportMatchDao.findOne({
			id: matchId
		});

		const user = userDao.findOne({
			id: userId
		});
		const person = personDao.findOne({
			user: user
		});
		const attendCount = attendDao.count({
			match: match,
			person: person.id
		});
		if(attendCount > 0)
		{
			res.json({
				successful: false,		 
				message:"this user is attend  !"
			});
			return;
		}
		// let attendInfo = new Attend({
		// 	match : match,
		// 	person: person,
		// 	rewardStatue :0,
		// 	order:0
		// });

		// if(attendInfo != null){
		// 	match.num += 1;
		// 	attendDao.create(attendInfo);
		// 	sportMatchDao.update(match);
		// 	res.json({
		// 		successful: true		 
		// 	});
		// }
		// else{
		// 	res.json({
		// 		successful: false
		// 	})
		// }
		
        //暂停报名
		res.json({
			successful: false
		})
	}
};

//查询人员所有的参赛信息集合
const actionAttendMatchList = {
	handler(req, res) {
		const userId = req.params.userId;
		const user = userDao.findOne({
			id: userId
		});
		const person = personDao.findOne({
			user: user
		});
        const attendInfo = attendDao.find({
			person: person.id
		});

		let matchIdList = [];
		let matchTitleList = [];
		let nickNameList = [];

		if(attendInfo != null && attendInfo.length >0){			
			attendInfo.forEach(attendIndex => {
				matchIdList.push(attendIndex.match.id);
				matchTitleList.push(attendIndex.match.title);
				nickNameList.push(attendIndex.person.nickName);
		  });
			res.json({
				successful: true,
				data : {
					matchId: matchIdList,
					matchTitle: matchTitleList,
					nickName: nickNameList
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//查询参赛人员和步数信息集合并排序   2018-06-03
const actionAttendResult = {
	handler(req, res) {
	  const matchId = req.params.matchId;
	  const attendInfo = attendDao.find({
	      match: matchId
	  });
	  const matchInfo = sportMatchDao.findOne({
		  id : matchId
	  });
	        let personList = [];
	        let nickNameList = [];
	        let steps = [];
	        let date = new Date();
	        let currentTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(),date.getHours(), date.getMinutes());
            let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            let beginTime = new Date(matchInfo.creatTime.getFullYear(), matchInfo.creatTime.getMonth(), matchInfo.creatTime.getDate());
            let stopTime = new Date(matchInfo.creatTime.getFullYear(), matchInfo.creatTime.getMonth(), matchInfo.creatTime.getDate(),21,59,59);
            let endTime = new Date(matchInfo.creatTime.getFullYear(), matchInfo.creatTime.getMonth(), matchInfo.creatTime.getDate(),23,59,59);
	        let newSort = [];
	        let newArr = [];
	        let personId = [];
	        if(attendInfo != null && attendInfo.length > 0){            
	            attendInfo.forEach(attendIndex => {
	                nickNameList.push(attendIndex.person.nickName);
	                personId.push(attendIndex.person.id);
	         });

	        if(currentTime > stopTime)
            {
                start = endTime;
            }

	       for(let x=0;x<personId.length;x++){
		      let historySport = sportHistoryDao.find({
			  person: personId[x],
			  date:{
				  $gte: beginTime,
				  $lte: start
			  },
			  $sort: {
				date: -1
			 }
		});
	
		//多个终端的判断
		if(historySport.length != 0){
			let step = 0;
			historySport.forEach(historySportIndex => {
				step += historySportIndex.historySteps;
			});
			steps.push(step);
		}
		else
		    steps.push(0);
       }

	         nickNameList.forEach((currentValue,index)=>newSort.push({nickName:currentValue,step:steps[index]}));
	         newArr = newSort.sort(compares);
	            res.json({
	                successful: true,
	                data : newArr 
	            });
	        }
	        else{
	            res.json({
	                successful: false
	            })
	        }
	    }
	};
	

//查询参赛人员和步数信息集合
const actionAttendList = {
	handler(req, res) {
		const matchId = req.params.matchId;
        const attendInfo = attendDao.find({
			match: matchId
		});

		let personList = [];
		let nickNameList = [];
		let steps = [];
		let date = new Date();
		let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		
		if(attendInfo != null && attendInfo.length > 0){			
			attendInfo.forEach(attendIndex => {
				nickNameList.push(attendIndex.person.nickName);
				let historySport = sportHistoryDao.find({
					person: attendIndex.person.id,
					date:{
						$gte: start
					},
					$sort: {
						date: -1
					},
					$limit: 1
				});
				if(historySport.length != 0)
					steps.push(historySport[0].historySteps);
				else
				    steps.push(0);
		  });
			res.json({
				successful: true,
				data : {
					nickName: nickNameList,
					step : steps
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};



//删除周末赛事参赛团队记录接口
const actionAttendGroupExit = {
	handler(req, res) {
		const matchId = req.params.matchId;
		const userId = req.body.userId;
		const nickName = req.body.nickName;
		const groupName = req.body.groupName;
		const match = sportMatchDao.findOne({
			id: matchId
		});

		const user = userDao.findOne({
			id: userId
		});
		const person = personDao.findOne({
			user: user
		});
		const personDel = personDao.findOne({
            nickName: nickName
		})
		const attendGroupInfo = attendGroupDao.findOne({
			match: match,
			groupName:groupName,
			person: personDel.id
		});
		if(attendGroupInfo != null)
		{
			attendGroupDao.remove({"_id":attendGroupInfo.id});
			match.num -= 1;
			sportMatchDao.update(match);
			res.json({
				successful: true,		 
				message:"this user is delete  !"
			});
			return;
		}
		else{
			res.json({
				successful: false,		 
				message:"this user is not in this group  !"
			});
			return;
		}
	}
};

//添加周末赛事参赛团队记录接口
// http://localhost:3000/device/5b2b05814cf3f06ae9504980/attendGroupAdd
// {"userId":"5afd6b5f172dfa0e77365a36","groupName":"Meteor", "isCaptain" : 0}
const actionAttendGroupAdd = {
	handler(req, res) {
		const matchId = req.params.matchId;
		const userId = req.body.userId;
		const groupName = req.body.groupName;
		const isCaptain = req.body.isCaptain;
		const match = sportMatchDao.findOne({
			id: matchId
		});

		const user = userDao.findOne({
			id: userId
		});
		const person = personDao.findOne({
			user: user
		});
		const attendGroupCount = attendGroupDao.count({
			match: match,
			person: person.id
		});
		const attendGroupName = attendGroupDao.count({
			match: match,
			groupName: groupName
		});
		if(attendGroupCount > 0)
		{
			res.json({
				successful: false,		 
				message:"this user is attend this group  !"
			});
			return;
		}
		if(attendGroupName > 0 && isCaptain == 1)
		{
			res.json({
				successful: false,		 
				message:"this group is exits !"
			});
			return;
		}
		let attendGroupInfo = new AttendGroup({
			match : match,
			person: person,
			groupName: groupName,
			isCaptain: isCaptain,
			creatTime: new Date(),
			order:0
		});

		//团队赛报名接口
		if(attendGroupInfo != null){
			match.num += 1;
			attendGroupDao.create(attendGroupInfo);
			sportMatchDao.update(match);
			res.json({
				successful: true		 
			});
		}
		else{
			res.json({
				successful: false
			})
		}

		// //暂停报名
		// res.json({
		// 		successful: false
		// })
	}
};


//查询人员所有的团队参赛信息及步数总成绩集合  2018-06-11
const actionAttendGroupTotal = {
	handler(req, res) {
		const matchId = req.params.matchId;
		//得到所有跑步队伍的名称
        const attendGroupName = attendGroupDao.find({
			match: matchId,
			isCaptain :1
		});
		
		let nickNameList = [];
		let groupNameList = [];
		let stepList = [];
		let newArr = [];
		let newSort = [];

		let groups = 0;
		let steps = 0;
		let date = new Date();
		let start = new Date(date.getFullYear(), date.getMonth(), date.getDate()-2);

		if(attendGroupName != null && attendGroupName.length > 0){			
			attendGroupName.forEach(attendGroupIndex => {
				nickNameList.push(attendGroupIndex.person.nickName);
				groupNameList.push(attendGroupIndex.groupName);
			    const attendGroupInfo = attendGroupDao.find({
					match: matchId,
					groupName: attendGroupIndex.groupName
				});
				for (let i = 0, len = attendGroupInfo.length; i < len; i++) {
					let historySport = sportHistoryDao.find({
						person: attendGroupInfo[i].person.id,
						date:{
							$gte: start
						},
						$sort: {
							date: -1
						}
					});
					//多个终端的判断
					if(historySport.length != 0){
						historySport.forEach(historySportIndex => {
							steps += historySportIndex.historySteps;
						});	
						groups += steps;
					    stepList.push(steps);
						// newSort.push({groupName:attendGroupIndex.groupName,nickName: attendGroupInfo[i].person.nickName,sonstep: steps});
						
					}
					else{
						stepList.push(0);
						// newArr.push({groupName:attendGroupIndex.groupName,step:0,captain:attendGroupIndex.person.nickName});	
						// newSort.push({groupName:attendGroupIndex.groupName,nickName: attendGroupInfo[i].person.nickName,sonstep: 0});
					}
				}	
				newArr.push({groupName:attendGroupIndex.groupName,step:groups,captain:attendGroupIndex.person.nickName});	
		  });
			res.json({
				successful: true,
				data :newArr,
				member: stepList
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};

//查询人员所有的团队参赛信息及步数成绩集合  2018-05-18
const attendGroupMatchScoreList = {
	handler(req, res) {
		const matchId = req.params.matchId;
		const matchInfo = sportMatchDao.findOne({
			id : matchId
		});
        const attendGroupInfo = attendGroupDao.find({
			match: matchId
		});

		let personList = [];
		let isCaptainList = [];
		let nickNameList = [];
		let groupNameList = [];
		let creatTimeList = [];
		let stepList = [];

		let date = new Date();
        let currentTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(),date.getHours(), date.getMinutes());
		let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		let beginTime = new Date(matchInfo.creatTime.getFullYear(), matchInfo.creatTime.getMonth(), matchInfo.creatTime.getDate());
		let stopTime = new Date(matchInfo.creatTime.getFullYear(), matchInfo.creatTime.getMonth(), matchInfo.creatTime.getDate(),21,59,59);
		let endTime = new Date(matchInfo.creatTime.getFullYear(), matchInfo.creatTime.getMonth(), matchInfo.creatTime.getDate(),23,59,59);

		if(attendGroupInfo != null && attendGroupInfo.length > 0){			
			attendGroupInfo.forEach(attendGroupIndex => {
				personList.push(attendGroupIndex.person.id);
				if(attendGroupIndex.isCaptain !=null)
				   isCaptainList.push(attendGroupIndex.isCaptain);
			    else
				   isCaptainList.push(0);
				nickNameList.push(attendGroupIndex.person.nickName);
				groupNameList.push(attendGroupIndex.groupName);
				creatTimeList.push(attendGroupIndex.creatTime);
				if(currentTime > stopTime)
				{
					start = endTime;
				}
				let historySport = sportHistoryDao.find({
					person: attendGroupIndex.person.id,
					date:{
						$gte: beginTime,
						$lte: start
					},
					$sort: {
						date: -1
					}
				});
			
				//单个终端的情况
				// if(historySport.length != 0)
				//     stepList.push(historySport[0].historySteps);
				// else
				//     stepList.push(0);

				//多个终端的判断
				if(historySport.length != 0){
					let steps = 0;
					historySport.forEach(historySportIndex => {
						steps += historySportIndex.historySteps;
					});
					stepList.push(steps);
				}
				else
				  stepList.push(0);
		  });
			res.json({
				successful: true,
				data : {
					person: personList,
					isCaptain: isCaptainList,
					nickName: nickNameList,
					groupName: groupNameList,
					creatTime: creatTimeList,
					step : stepList
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};

//查询人员所有的团队参赛信息集合
const actionAttendGroupMatchList = {
	handler(req, res) {
		const userId = req.params.userId;
		const user = userDao.findOne({
			id: userId
		});
		const person = personDao.findOne({
			user: user
		});
        const attendGroupInfo = attendGroupDao.find({
			person: person.id,
			$sort:{
				creatTime:-1
			}
		});
        outputLogger.info(attendGroupInfo);
		let matchIdList = [];
		let groupNameList = [];
		let matchTitleList = [];
		let nickNameList = [];
		let creatTimeList = [];
		let isCaptainList = [];

		if(attendGroupInfo != null && attendGroupInfo.length > 0){			
			attendGroupInfo.forEach(attendGroupIndex => {
				matchIdList.push(attendGroupIndex.match.id);
				matchTitleList.push(attendGroupIndex.match.title);
				groupNameList.push(attendGroupIndex.groupName);
				creatTimeList.push(attendGroupIndex.creatTime);
				if(attendGroupIndex.isCaptain !=null)
				   isCaptainList.push(attendGroupIndex.isCaptain);
			    else
				   isCaptainList.push(0);
				nickNameList.push(attendGroupIndex.person.nickName);
		  });
			res.json({
				successful: true,
				data : {
					matchId: matchIdList,
					matchTitle: matchTitleList,
					groupName : groupNameList,
					creatTime : creatTimeList,
					isCaptain: isCaptainList,
					nickName: nickNameList
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};

//查询团队人员的步数总数
const attendGroupTotalScore = {
	handler(req, res) {
		const matchId = req.params.matchId;
		const groupName = req.body.groupName;
        const attendGroupInfo = attendGroupDao.find({
			match: matchId,
			groupName:groupName,
			$sort:{
				creatTime:-1
			}
		});
		let nickNameList = [];
		let stepCount = 0;
		let date = new Date();
		let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		
		if(attendGroupInfo != null && attendGroupInfo.length > 0){			
			attendGroupInfo.forEach(attendGroupIndex => {
				nickNameList.push(attendGroupIndex.person.nickName);
                //查询人员历史步数
				let historySport = sportHistoryDao.find({
					person: attendGroupIndex.person.id,
					date:{
						$gte: start
					},
					$sort: {
						date: -1
					}
				});
			
				//多个终端的判断
				if(historySport.length != 0){
					historySport.forEach(historySportIndex => {
						stepCount += historySportIndex.historySteps;
					});
				}
		  });
			res.json({
				successful: true,
				data : {
					nickName: nickNameList,
					step : stepCount
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};

//查询团队人员的步数列表
const actionAttendGroupScoreList = {
	handler(req, res) {
		const matchId = req.params.matchId;
		const groupName = req.body.groupName;
        const attendGroupInfo = attendGroupDao.find({
			match: matchId,
			groupName: groupName,
			$sort:{
				creatTime:-1
			}
		});
		let personIdList = [];
		let nickNameList = [];
		let isCaptainList = [];
		let stepList = [];
		let date = new Date();
		let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		
		if(attendGroupInfo != null && attendGroupInfo.length > 0){			
			attendGroupInfo.forEach(attendGroupIndex => {
				personIdList.push(attendGroupIndex.person.id);
				nickNameList.push(attendGroupIndex.person.nickName);
				if(attendGroupIndex.isCaptain !=null)
				   isCaptainList.push(attendGroupIndex.isCaptain);
				else
				   isCaptainList.push(0);
				let historySport = sportHistoryDao.find({
					person: attendGroupIndex.person.id,
					date:{
						$gte: start
					},
					$sort: {
						date: -1
					}
				});
			
				//多个终端的判断
				if(historySport.length != 0){
					let steps = 0;
					historySport.forEach(historySportIndex => {
						steps += historySportIndex.historySteps;
					});
					stepList.push(steps);
				}
				else
				  stepList.push(0);
		    });
			res.json({
				successful: true,
				data : {
					// personId: personIdList,
					nickName: nickNameList,
					isCaptain : isCaptainList,
					step : stepList
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//查询所有人员终端固件版本
const actionDeviceVerson = {
	handler(req, res) {
		const matchId = req.params.matchId;
        const person = personDao.find({});
		let newSort = [];

		if(person != null && person.length > 0){			
			for(let i=0;i<person.length;i++){
				const devices = deviceDao.findOne({
					user: person[i].user.id
				});
				if(devices != null){
					newSort.push({nickName:person[i].nickName,version:devices.version,macAddress:devices.macAddress});
				}
				// else{
				// 	newSort.push({nickName:person[i].nickName,version:0});
				// }
		  };
			res.json({
				successful: true,
				data : newSort	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//查询参赛团队终端固件版本信息集合
const actionAttendGroupVerson = {
	handler(req, res) {
		const matchId = req.params.matchId;
        const attendGroupInfo = attendGroupDao.find({
			match: matchId
		});
		let newSort = [];

		if(attendGroupInfo != null && attendGroupInfo.length > 0){			
			attendGroupInfo.forEach(attendIndex => {
				
				const persons = personDao.findOne({
					id: attendIndex.person
				});
				const devices = deviceDao.findOne({
					user: persons.user.id
				});
				if(devices != null){
					// attendIndex.groupName,
					newSort.push({nickName:attendIndex.person.nickName,version:devices.version});
				}
				else{
					newSort.push({nickName:attendIndex.person.nickName,version:0});
				}
		  });
			res.json({
				successful: true,
				data : newSort	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//查询参赛团队信息集合
const actionAttendGroupList = {
	handler(req, res) {
		const matchId = req.params.matchId;
        const attendGroupInfo = attendGroupDao.find({
			match: matchId
		});

		let personList = [];
		let orderList = [];
		let nickNameList = [];
		let groupNameList = [];
		let creatTimeList = [];

		if(attendGroupInfo != null && attendGroupInfo.length > 0){			
			attendGroupInfo.forEach(attendIndex => {
				personList.push(attendIndex.person.id);
				nickNameList.push(attendIndex.person.nickName);
				groupNameList.push(attendIndex.groupName);
				creatTimeList.push(attendIndex.creatTime);
				orderList.push(attendIndex.order);
		  });
			res.json({
				successful: true,
				data : {
					person: personList,
					nickName: nickNameList,
					groupName: groupNameList,
					creatTime: creatTimeList,
					order: orderList
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//添加周末赛事信息记录接口
//http://localhost:3000/device/5a6998f35096da2645ac474a/sportMatchAdd
//{"title": "第九场周末活动，个人排名赛","content":"这个周末不再重复 6月10日 团队赛的高强度，而是做一些细水流长的耐力锻炼。","rule": "提前在个人赛事版块报名参加个人赛(注意：报名参赛是步数达标获奖的必要条件)，比赛当天，穿 FeeLT 智能鞋垫逛街、走路、或者跑步，在晚上10点前同步数据，系统会在个人赛事版块根据大家提交的步数成绩进行排名","reward": "超过 30000 步：个人奖金 30 元红包","num":0,"maxNum":10000,"isgroup":0,"startTime":"2018-06-17","endTime":"2018-06-16"}
const actionSportMatchAdd = {
	handler(req, res) {
		const userId = req.params.userId;
		const user = userDao.findOne({
			id: userId
		});

        outputLogger.info(user.loginName);
		let matchInfo = new SportMatch({
			user: user,
			title: req.body.title,
			content: req.body.content,
			rule: req.body.rule,
			reward: req.body.reward,
			isgroup: req.body.isgroup,
			endTime: req.body.endTime,
			creatTime: req.body.startTime,
			maxNum:req.body.maxNum,
			num:0,
			statue:0
		});
        outputLogger.info(matchInfo.title);
		if(matchInfo != null){
			sportMatchDao.create(matchInfo);
			res.json({
				successful: true		 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//修改周末赛事的信息状态  2018-06-06
const actionSportMatchStatue = {
	handler(req, res) {
		let matchId = req.params.matchId;
        const matchInfo = sportMatchDao.find({
			id: matchId,
			$sort:{
				creatTime :-1
			}
		});
	    
		if(matchInfo != null){
		   matchInfo.statue = 1;
		   sportMatchDao.update(matchInfo);
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//查询历史周末赛事的信息
const actionHistoryMatchInfo = {
	handler(req, res) {
		let matchId = req.params.matchId;
        const matchInfo = sportMatchDao.find({
			id: matchId,
			statue:1,
			$sort:{
				creatTime :-1
			}
		});
		let maxNum = 1000;
		let endTime = 0;
		if(matchInfo[0].maxNum != null)
		  maxNum = matchInfo[0].maxNum;
		if(matchInfo[0].endTime != null)
		  endTime = matchInfo[0].endTime;
		if(matchInfo != null){
			res.json({
				successful: true,
				data : {
					title: matchInfo[0].title,
					content: matchInfo[0].content,
					rule: matchInfo[0].rule,
					reward: matchInfo[0].reward,
					isgroup: matchInfo[0].isgroup,
					endTime: endTime,
					maxNum: maxNum,
					num: matchInfo[0].num,
					creatTime: matchInfo[0].creatTime
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};

//查询周末赛事的信息
const actionSportMatchInfo = {
	handler(req, res) {
		let matchId = req.params.matchId;
        const matchInfo = sportMatchDao.find({
			id: matchId,
			$sort:{
				creatTime :-1
			}
		});
		let maxNum = 1000;
		let endTime = 0;
		if(matchInfo[0].maxNum != null)
		  maxNum = matchInfo[0].maxNum;
		if(matchInfo[0].endTime != null)
		  endTime = matchInfo[0].endTime;
		if(matchInfo != null){
			res.json({
				successful: true,
				data : {
					title: matchInfo[0].title,
					content: matchInfo[0].content,
					rule: matchInfo[0].rule,
					reward: matchInfo[0].reward,
					isgroup: matchInfo[0].isgroup,
					num: matchInfo[0].num,
					maxNum: maxNum,
					endTime : endTime,
					creatTime: matchInfo[0].creatTime
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//查询历史周末赛事信息集合
const actionHistoryMatchList = {
	handler(req, res) {
        const matchInfo = sportMatchDao.find({
			statue:1,
			$sort:{
				creatTime:-1
			}
		});
		let matchIdList = [];
		let titleList = [];
		let contentList = [];
		let ruleList = [];
		let rewardList = [];
		let isgroupList = [];
		let numList = [];
		let maxNumList = [];
		let endTimeList = [];
		let creatTimeList = [];

		if(matchInfo != null){			
			matchInfo.forEach(matchIndex => {
				matchIdList.push(matchIndex.id);
				outputLogger.info(matchIndex.id);
				titleList.push(matchIndex.title);
				contentList.push(matchIndex.content);
				ruleList.push(matchIndex.rule);
				rewardList.push(matchIndex.reward);
				isgroupList.push(matchIndex.isgroup);
				numList.push(matchIndex.num);
				if(matchIndex.maxNum != null)
				   maxNumList.push(matchIndex.maxNum);
				else
				   maxNumList.push(0);
				if(matchIndex.endTime != null)
				   endTimeList.push(matchIndex.endTime);
			    else
				   endTimeList.push(0);
				creatTimeList.push(matchIndex.creatTime);
		  });
			res.json({
				successful: true,
				data : {
					matchId:matchIdList,
					title: titleList,
					content: contentList,
					rule: ruleList,
					reward: rewardList,
					isgroup: isgroupList,
					num: numList,
					maxNum :maxNumList,
					serviceTime:new Date(),
					endTime : endTimeList,
					creatTime: creatTimeList,
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//查询周末赛事信息集合
const actionSportMatchList = {
	handler(req, res) {
        const matchInfo = sportMatchDao.find({
			statue:0,
			$sort:{
				creatTime:-1
			}
		});
		let disclaimer = 0;
		if(matchInfo[0].disclaimer !=null)
		   disclaimer = matchInfo[0].disclaimer;
		let matchIdList = [];
		let titleList = [];
		let contentList = [];
		let ruleList = [];
		let rewardList = [];
		let isgroupList = [];
		let numList = [];
		let maxNumList = [];
		let endTimeList = [];
		let creatTimeList = [];

		if(matchInfo != null){			
			matchInfo.forEach(matchIndex => {
				matchIdList.push(matchIndex.id);
				outputLogger.info(matchIndex.id);
				titleList.push(matchIndex.title);
				contentList.push(matchIndex.content);
				ruleList.push(matchIndex.rule);
				rewardList.push(matchIndex.reward);
				isgroupList.push(matchIndex.isgroup);
				numList.push(matchIndex.num);
				if(matchIndex.maxNum != null)
				   maxNumList.push(matchIndex.maxNum);
				else
				   maxNumList.push(0);
				if(matchIndex.endTime != null)
				   endTimeList.push(matchIndex.endTime);
			    else
				   endTimeList.push(0);
				creatTimeList.push(matchIndex.creatTime);
		  });
			res.json({
				successful: true,
				data : {
					matchId:matchIdList,
					title: titleList,
					content: contentList,
					rule: ruleList,
					reward: rewardList,
					isgroup: isgroupList,
					num: numList,
					maxNum: maxNumList,
					disclaimer: disclaimer,
					serviceTime:new Date(),
					endTime : endTimeList,
					creatTime: creatTimeList,
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};

//添加手机记录的方法
// http://localhost:3000/device/5a6998f35096da2645ac474a/phoneAdd
// {"macAddress": "2B:2B:2B:2B:2B","wifiAddress": "2C:2C:2C:2C:2C","phoneCode": "小米7","company": "小米","cpu":"xiaolong 845","version":"miui 9.5"}  
const actionPhoneAdd = {
	handler(req, res) {
		const userId = req.params.userId;
		const macAddress = req.body.macAddress;
		const user = userDao.findOne({
			id: userId
		});
		const phoneCount = phoneDao.count({
			macAddress: macAddress
		});
		if(phoneCount > 0)
		{
			res.json({
				successful: false,		 
				message:"this phone is exist !"
			});
			return;
		}
		let phoneInfo = new Phone({
			user: user,
			macAddress: macAddress,
			wifiAddress: req.body.wifiAddress,
			phoneCode: req.body.phoneCode,
			company: req.body.company,
			cpu:req.body.cpu,
			version:req.body.version,
			creatTime: new Date()
		});

		if(phoneInfo != null){
			phoneDao.create(phoneInfo);
			res.json({
				successful: true		 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//查询手机的信息
const actionPhoneInfo = {
	handler(req, res) {
		const macAddress = req.params.macAddress;
        const phoneInfo = phoneDao.find({
			macAddress: macAddress,
			$sort: {
				creatTime: -1
			},
			$limit: 1
		});
		if(phoneInfo != null){
			res.json({
				successful: true,
				data : {
					user: phoneInfo[0].user.loginName,
					macAddress: phoneInfo[0].macAddress,
					wifiAddress: phoneInfo[0].wifiAddress,
					phoneCode: phoneInfo[0].phoneCode,
					company: phoneInfo[0].company,
					cpu: phoneInfo[0].cpu,
					version: phoneInfo[0].version,
					creatTime: phoneInfo[0].creatTime
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};

//查询个人手机信息集合
const actionPhoneList = {
	handler(req, res) {
		const userId = req.params.userId;
        const phoneInfo = phoneDao.find({
			user: userId
		});
		
		let macAddressList = [];
		let wifiAddressList = [];
		let phoneCodeList = [];
		let companyList = [];
		let cpuList = [];
		let versionList = [];
		let creatTimeList = [];

		if(phoneInfo != null){			
			phoneInfo.forEach(phoneIndex => {
				macAddressList.push(phoneIndex.macAddress);
				wifiAddressList.push(phoneIndex.wifiAddress);
				phoneCodeList.push(phoneIndex.phoneCode);
				companyList.push(phoneIndex.company);
				cpuList.push(phoneIndex.cpu);
				versionList.push(phoneIndex.version);
				creatTimeList.push(phoneIndex.creatTime);
		  });
			res.json({
				successful: true,
				data : {
					macAddress: macAddressList,
					wifiAddress: wifiAddressList,
					phoneCode: phoneCodeList,
					company: companyList,
					cpu: cpuList,
					company: companyList,
					version: versionList,
					creatTime: creatTimeList,
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//添加跳跃记录的方法  
const actionJumpAdd = {
	handler(req, res) {
		const macAddress = req.params.macAddress;
		let jumpInfo = new JumpInfo({
			macAddress: macAddress,
			jumpSum: req.body.jumpSum,
			beginTime: req.body.beginTime,
			endTime: req.body.endTime,
			jumpTime:req.body.jumpTime //10秒，30秒，60秒，120秒
		});

		if(jumpInfo != null){
			jumpInfoDao.create(jumpInfo);
			res.json({
				successful: true		 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};

//查询跳跃的信息
const actionJumpInfo = {
	handler(req, res) {
		const macAddress = req.params.macAddress;
        const jumpInfo = jumpInfoDao.find({
			macAddress: macAddress,
			$sort: {
				date: -1
			},
			$limit: 1
		});
		if(jumpInfo != null){
			res.json({
				successful: true,
				data : {
					jumpSum: jumpInfo[0].jumpSum,
					beginTime: jumpInfo[0].beginTime,
					endTime: jumpInfo[0].endTime,
					jumpTime: jumpInfo[0].jumpTime //10秒，30秒，60秒，120秒
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};

//查询跳跃的历史信息集合
const actionJumpInfoList = {
	handler(req, res) {
		const macAddress = req.params.macAddress;
		const year = req.body.year;
        const month = req.body.month;
        const start = new Date(year, month);
        const end = new Date(year, month+1);
        const monthLength = new Date(year, month+1, 0).getDate();

        const jumpInfo = jumpInfoDao.find({
			macAddress: macAddress, 
			$sort: {
				date: -1
			},
			$limit: 200
		});
		outputLogger.info(jumpInfo);
		
		let jumpSumList = [];
		let beginTimeList = [];
		let endTimeList = [];
		let jumpTimeList = [];
8
		if(jumpInfo != null){			
		  jumpInfo.forEach(jumpIndex => {
			jumpSumList.push(jumpIndex.jumpSum);
			beginTimeList.push(jumpIndex.beginTime);
			endTimeList.push(jumpIndex.endTime);
			jumpTimeList.push(jumpIndex.jumpTime);
		  });
		  outputLogger.info(jumpSumList);
			res.json({
				successful: true,
				data : {
					jumpSum: jumpSumList,
					beginTime: beginTimeList,
					endTime: endTimeList,
					jumpTime: jumpTimeList //10秒，30秒，60秒，120秒
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//根据mac地址查询deviceid
const actionGetDeviceId = {
handler(req, res) {
	const macAddress = req.params.macAddress;
	if(!macAddress) {
		res.json({
			successful: false
		});
		return;
	}
	const device = deviceDao.findOne({
		macAddress: macAddress
	});
	if(device != null){
		res.json({
			successful: true,
			data: {
				id: device.id,
				macAddress: device.macAddress,
				user: device.user,
				wechatId: device.wechatId
			}
		});
	}
	else{
		res.json({
			successful: false
		})
	}
}
};

const actionDeviceBoundInfo = {
	handler(req, res) {
		const id = req.params.deviceId;
        const device = deviceDao.findOne({
            id: id
		});
		if(device != null){
			res.json({
				successful: true,
				data: {
					batteryInfo: device.batteryInfo,
					snCode: device.snCode,
					macAddress: device.macAddress,
					version: device.version,
					remark: device.remark,
					boundTime: device.boundTime
				}
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


const actionDeviceBoundInfo_app = {
	handler(req, res) {
		const macAddress = req.params.macAddress;
        const device = deviceDao.findOne({
            macAddress: macAddress
		});
		if(device != null){
			res.json({
				successful: true,
				data: {
					batteryInfo: device.batteryInfo,
					snCode: device.snCode,
					macAddress: device.macAddress,
					version: device.version,
					remark: device.remark,
					boundTime: device.boundTime
				}
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};

//根据用户ID返回终端绑定信息列表
const actionDeviceboundList_app = {
	handler(req, res) {
		const userId = req.params.userId;
        const device = deviceDao.find({
            user: userId
		});
		let deviceIdList = [];
		let batteryInfoList = [];
		let snCodeList = [];
		let macAddressList = [];
		let versionList = [];
		let remarkList = [];
		let boundTimeList = [];
		device.forEach(deviceIndex => {
			    deviceIdList.push(deviceIndex.id);
				batteryInfoList.push(deviceIndex.batteryInfo);
				snCodeList.push(deviceIndex.snCode);
				macAddressList.push(deviceIndex.macAddress);
				versionList.push(deviceIndex.version);
				remarkList.push(deviceIndex.remark);
				boundTimeList.push(deviceIndex.boundTime);
		});
	   if(device != null){
			res.json({
				successful: true,
				data: {
					deviceId : deviceIdList,
					snCode: snCodeList,
					batteryInfo: batteryInfoList,
					macAddress: macAddressList,
					version: versionList,
					remark: remarkList,
					boundTime: boundTimeList
				}
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


//解除绑定
const actionDeviceUnbound = {
    handler(req, res) {
        const id = req.params.deviceId;
        const api = lib.wechatDevice.getApi();
        const device = deviceDao.findOne({
            id: id
        });

        const userId = req.session.login.user;
        if(userId == undefined) {
            res.json({
                successful: false
            });
            return;
        }
        const user = userDao.findOne({
            id: userId
        });
        const wechatUser = wechatUserDao.findOne({
            user: user
        });
        const openId = wechatUser.openId;
        const deviceId = device.wechatId;
        const ticket = req.body.ticket;
        const data = api.getDeviceUnbind(ticket, deviceId, openId);
        outputLogger.info('deviceunbind data', data);

        if ( wechatUser && device ) {
            let person = personDao.findOne({
                user: user
            });
			const deviceUser = device.user;
			if(!deviceUser){
                outputLogger.info("device has no user");
				res.json({
					successful: false
				});
				return ;
			}
			if(deviceUser.id != person.user.id){
                outputLogger.info("deviceuser", deviceUser);
                outputLogger.info("personuser", person.user);
                outputLogger.info("user is not the device's user");
				res.json({
					successful: false
				});
				return ;
			}				
            personDao.update({
                user: user.id
            }, {
                $pull: {
                    devices: device.id
                }
			});
            deviceDao.update({
                id: device.id
            }, {
                $unset: {
                    user: true
                }
            });
        }

        res.json({
            successful: true
        });
    }
};

//app端终端跟person绑定,并且向person表的device集合里插入终端id   
const actionDeviceNewbound_app = {
    handler(req, res) {
		const macAddress = req.params.macAddress;
        const userId = req.body.userId;
        if(userId == undefined) {
            res.json({
                successful: false
            });
            return;
		}
        const user = userDao.findOne({
            id: userId
		});	
		const old_device = deviceDao.findOne({
			macAddress : macAddress
		});
		outputLogger.info(old_device);
		let ishave = 0;//当ishave等于0代表新终端，等于1代表老终端
		if(old_device != null){
		  ishave = 1;
		  if(old_device.user != null){
			outputLogger.info("device has user");
			res.json({
				successful: false,
				error:"device has bind"
			});
			return ;
		  }
		}
		let devices = new Device();
		if(old_device == null){
		 devices = new Device({
			macAddress: req.params.macAddress,
			snCode: 'CIAE012BF7',
			version: req.body.version,
			wechatId: 'b26b2605009568',
			wechatType: 'gh_340e1d67a71b',
			boundTime:new Date(),
			user: user
		  });
		 deviceDao.create(devices);
		}
		else{
		   devices = old_device;
		   old_device.boundTime = new Date();
		   deviceDao.update({ macAddress: devices.macAddress}, { $push: {user:user }});
		   deviceDao.update(old_device);
		}			
		personDao.update({ user: user.id}, { $push: {devices: devices.id }});
		const person = personDao.findOne({
            user: user
		});	
        outputLogger.info(ishave);
		if(person !=null){
          res.json({
			 successful: true,
			 isOld : ishave
          });
	     }else{
			res.json({
			   successful: true,
			   device: []
			});
		 }
    }
};


//app端解除绑定
const actionDeviceUnbound_app = {
    handler(req, res) {
        const macAddress = req.params.macAddress;
        const device = deviceDao.findOne({
            macAddress: macAddress
        });

        const userId = req.body.userId;
        if(userId == undefined) {
            res.json({
                successful: false
            });
            return;
        }
        const user = userDao.findOne({
            id: userId
        });

        if ( device ) {
            let person = personDao.findOne({
                user: user
			});
			const deviceUser = device.user;
			outputLogger.info(deviceUser);
			if(!device){
			  if(device.user != null){
                outputLogger.info("device has no user");
				res.json({
					successful: false,
					error:"device has no user"
				});
				return ;
			  }
			}
			if(deviceUser.id != person.user.id){
                outputLogger.info("deviceuser", deviceUser);
                outputLogger.info("personuser", person.user);
                outputLogger.info("user is not the device's user");
				res.json({
					successful: false
				});
				return ;
			}	
			resetDao.remove({"device":device.id});			
            personDao.update({
                user: user.id
            }, {
                $pull: {
                    devices: device.id
                }
            });
            deviceDao.update({
                id: device.id
            }, {
                $unset: {
                    user: true
                }
            });
        }//返回用户已经绑定的终端列表
		const person = personDao.findOne({
            user: user
		});	
        res.json({
			successful: true
        });
    }
};

const actionSaveBatteryInfo = {
	handler(req, res) {
		const id = req.params.deviceId;		
		const batteryInfo = req.body.batteryLevel;
        const device = deviceDao.findOne({
            id: id
        });
		if(!device || !batteryInfo) {
            res.json({
                successful: false
            });
            return;
        }
		device.batteryInfo = batteryInfo;
		deviceDao.update(device);
		res.json({
            successful: true
        });
	}
};


const actionSaveBatteryInfo_app = {
	handler(req, res) {
		const macAddress = req.params.macAddress;		
		const batteryInfo = req.body.batteryLevel;
        const device = deviceDao.findOne({
            macAddress: macAddress
        });
		if(!device || !batteryInfo) {
            res.json({
                successful: false
            });
            return;
        }
		device.batteryInfo = batteryInfo;
		deviceDao.update(device);
		res.json({
            successful: true
        });
	}
};

const actionSaveSportInfo = {
	handler(req, res) {
		const id = req.session.login.user;
        const deviceId = req.params.deviceId;
		if(!deviceId) {
            res.json({
                successful: false
            });
            return;
        }
		const device = deviceDao.findOne({
			id: deviceId
		});
		const user = userDao.findOne({
            id: id
        });
		if(!user) {
            res.json({
                successful: false
            });
            return;
        }
        const person = personDao.findOne({
            user: user
        });
		if(req.body.days > 1) {
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
				let time1 = new Date(date.getFullYear(), date.getMonth(), date.getDate()); 
				if(time.getTime() == time1.getTime()){
					// sportHistoryDao.remove({});
					// sportRecordDao.remove({});
				}
			}
		}
		
	    let date = new Date();
		let startTimes = new Date(date.getFullYear(), date.getMonth(),date.getDate());
		
		let sportrecord = sportHistoryDao.find({
			person: person.id,
			date:{
				$gte: startTimes
			    },
			$sort: {
				date: -1
				}
		});

		if(sportrecord.length == 0){
			person.days += 1;
			personDao.update(person);
		}
		
		for(let stepCountIndex = req.body.days; stepCountIndex>=0; stepCountIndex--){
			let stepCount = req.body.stepCounts[stepCountIndex];
        	outputLogger.info('stepCount', stepCount, 'stepCountIndex', stepCountIndex);
			let sportHistory = sportHistoryDao.find({
				device: device.id,
                
                $limit: 1
			});
			let historyCalories = 0;
			let historyDistance = 0;
			let historySteps = 0;
			let accomplishment = 0;
			let newAccomplishment = 0;
			let accomplishmentTime = new Date(0);
			let totleStep = 0;
			if(person.accomplishmentTime){
				accomplishmentTime = new Date(person.accomplishmentTime.getFullYear(), person.accomplishmentTime.getMonth(), person.accomplishmentTime.getDate());
			}
			let flags = 0;
			let date = new Date();
			let date1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
			if(stepCountIndex){
				date = new Date(date.getFullYear(), date.getMonth(), date.getDate()-stepCountIndex, 23, 59, 59);
			}
			let totleDevice = deviceDao.find({
			 	user: user
			 });
			if(date1.getTime() != accomplishmentTime.getTime()){
				newAccomplishment = person.accomplishment;
				totleDevice.forEach(deviecIndex => {
					let todaySportHistory = sportHistoryDao.find({
						device: deviecIndex.id,
						
						$sort: {
							date: -1
						},
						$limit: 1
					});
					if(todaySportHistory.length != 0){
						let thisDate = new Date(todaySportHistory[0].date.getFullYear(),todaySportHistory[0].date.getMonth(),todaySportHistory[0].date.getDate());
						if(thisDate.getTime() == date1.getTime() && deviecIndex.id != device.id){
							totleStep += todaySportHistory[0].historySteps;
						}
					}
				});
				totleStep += stepCount;
				if(totleStep >= person.step){
					newAccomplishment += 1;
					person.accomplishmentTime = date;
					person.accomplishment = newAccomplishment;
					personDao.update(person);
					outputLogger.info("update accomplishment");
				}
			}
			
			outputLogger.info('date1 is',date1);
			
			let sportRecord = new SportRecord({
				date: date,
				step: stepCount,
				calories: req.body.calories[stepCountIndex],
				distance: req.body.distance[stepCountIndex],
				walk: req.body.walk[stepCountIndex],
				run: req.body.run[stepCountIndex],
				jump:req.body.jump[stepCountIndex],
				upstairs: req.body.upstairs[stepCountIndex],
				downstairs: req.body.downstairs[stepCountIndex],
				sportTime: req.body.sportTime[stepCountIndex],
				temperature: req.body.temperature
			});
			sportRecord.device = device;
			outputLogger.info('sportRecord is',sportRecord.toObject());
			sportRecordDao.create(sportRecord);

			if(sportHistory.length != 0){
				let sortSportHistory = sportHistoryDao.find({
					device: device.id,
					$sort: {
						date: -1
					},
					$limit: 2
				});
				let time = sortSportHistory[0].date;
				time = new Date(time.getFullYear(), time.getMonth(), time.getDate());
                let date2 =  new Date(date.getFullYear(), date.getMonth(), date.getDate()-stepCountIndex);

				// 记录的时间比当天时间小，直接新建新的日期的运动历史记录
				if(time.getTime() < date2.getTime()){
					let newSportHistory = new SportHistory({
						date: date,
						historySteps:stepCount,
						historyCalories: req.body.calories[stepCountIndex],
						historyDistances: req.body.distance[stepCountIndex],
						person: person
					});
					newSportHistory.device = device;
					sportHistoryDao.create(newSportHistory);
					outputLogger.info('newSportHistory', newSportHistory.toObject());
				}
				else if(time.getTime() == date2.getTime()){
                    let newSportHistory = sportHistoryDao.findOne({
                        id: sortSportHistory[0].id
                    });
                    if(newSportHistory){
                        outputLogger.info('newSportHistory is',newSportHistory.toObject());
                    }
                    newSportHistory.date = date;
                    newSportHistory.historySteps = stepCount;
                    newSportHistory.historyCalories = req.body.calories[stepCountIndex];
                    newSportHistory.historyDistances = req.body.distance[stepCountIndex];
                    sportHistoryDao.update(newSportHistory);
                    outputLogger.info('update', sortSportHistory[0].toObject());
                }
                else{
                    continue;
                }
			}
			else{
				outputLogger.info('create newSportHistory');
				let newSportHistory = new SportHistory({
					date: date,
					historySteps:stepCount,
					historyCalories: req.body.calories[stepCountIndex],
					historyDistances: req.body.distance[stepCountIndex],
					person: person
				});
				newSportHistory.device = device;
				sportHistoryDao.create(newSportHistory);
			}
		}
		res.json({
				successful: true,
				accomplishment: person.accomplishment,
				days: person.days
		});
	}
};


//通过app保存的运动数据
// http://localhost:3000/device/DF:E1:FC:1E:86:AE/SaveSportInfo_app
// {"days":2,"stepCounts":[6555,6333,6111],"distance": [100,100,100],"walk": [4682,5555,6666],"run": [1111,222,333],"jump":[100,100,100],"upstairs": [100,100,100],"downstairs": [100,100,100],"sportTime": [20,20,20]}
const actionSaveSportInfo_app = {
	handler(req, res) {
        const macAddress = req.params.macAddress;
		if(!macAddress) {
            res.json({
                successful: false
            });
            return;
        }
		const device = deviceDao.findOne({
			macAddress: macAddress
		});
		const user = userDao.findOne({
            id: device.user
        });
		if(!user) {
            res.json({
                successful: false
            });
            return;
        }
        const person = personDao.findOne({
            user: user
		});
		
		let date = new Date();
		let startTimes = new Date(date.getFullYear(), date.getMonth(),date.getDate());
		
		let sportrecord = sportHistoryDao.find({
			person: person.id,
			date:{
				$gte: startTimes
			    },
			$sort: {
				date: -1
				}
		});

		if(sportrecord.length == 0){
			person.days += 1;
			personDao.update(person);
		}
		
		
		for(let stepCountIndex = req.body.days; stepCountIndex>=0; stepCountIndex--){
			let stepCount = req.body.stepCounts[stepCountIndex];
        	outputLogger.info('stepCount', stepCount, 'stepCountIndex', stepCountIndex);
			let sportHistory = sportHistoryDao.find({
				device: device.id,
                
                $limit: 1
			});
			let historyCalories = 0;
			let historyDistance = 0;
			let historySteps = 0;
			let accomplishment = 0;
			let newAccomplishment = 0;
			let accomplishmentTime = new Date(0);
			let totleStep = 0;
			if(person.accomplishmentTime){
				accomplishmentTime = new Date(person.accomplishmentTime.getFullYear(), person.accomplishmentTime.getMonth(), person.accomplishmentTime.getDate());
			}
			let flags = 0;
			let date = new Date();
			let date1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
			if(stepCountIndex){
				date = new Date(date.getFullYear(), date.getMonth(), date.getDate()-stepCountIndex, 23, 59, 59);
			}
			let totleDevice = deviceDao.find({
			 	user: user
			 });
			if(date1.getTime() != accomplishmentTime.getTime()){
				newAccomplishment = person.accomplishment;
				totleDevice.forEach(deviecIndex => {
					let todaySportHistory = sportHistoryDao.find({
						device: deviecIndex.id,
						
						$sort: {
							date: -1
						},
						$limit: 1
					});
					if(todaySportHistory.length != 0){
						let thisDate = new Date(todaySportHistory[0].date.getFullYear(),todaySportHistory[0].date.getMonth(),todaySportHistory[0].date.getDate());
						if(thisDate.getTime() == date1.getTime() && deviecIndex.id != device.id){
							totleStep += todaySportHistory[0].historySteps;
						}
					}
				});
				totleStep += stepCount;
				if(totleStep >= person.step){
					newAccomplishment += 1;
					person.accomplishmentTime = date;
					person.accomplishment = newAccomplishment;
					personDao.update(person);
					outputLogger.info("update accomplishment");
				}
			}
			
			outputLogger.info('date1 is',date1);
			
			let sportRecord = new SportRecord({
				date: date,
				step: stepCount,
				calories: 0,
				distance: req.body.distance[stepCountIndex],
				walk: req.body.walk[stepCountIndex],
				run: req.body.run[stepCountIndex],
				jump:req.body.jump[stepCountIndex],
				upstairs: req.body.upstairs[stepCountIndex],
				downstairs: req.body.downstairs[stepCountIndex],
				sportTime: req.body.sportTime[stepCountIndex],
				temperature: req.body.temperature
			});
			sportRecord.device = device;
			outputLogger.info('sportRecord is',sportRecord.toObject());
			sportRecordDao.create(sportRecord);

			if(sportHistory.length != 0){
				let sortSportHistory = sportHistoryDao.find({
					device: device.id,
					$sort: {
						date: -1
					},
					$limit: 2
				});
				let time = sortSportHistory[0].date;
				time = new Date(time.getFullYear(), time.getMonth(), time.getDate());
                let date2 =  new Date(date.getFullYear(), date.getMonth(), date.getDate()-stepCountIndex);

				// 记录的时间比当天时间小，直接新建新的日期的运动历史记录
				if(time.getTime() < date2.getTime()){
					let newSportHistory = new SportHistory({
						date: date,
						historySteps:stepCount,
						historyCalories: 0,
						historyDistances: req.body.distance[stepCountIndex],
						person: person
					});
					newSportHistory.device = device;
					sportHistoryDao.create(newSportHistory);
					outputLogger.info('newSportHistory', newSportHistory.toObject());
				}
				else if(time.getTime() == date2.getTime()){
                    let newSportHistory = sportHistoryDao.findOne({
                        id: sortSportHistory[0].id
                    });
                    if(newSportHistory){
                        outputLogger.info('newSportHistory is',newSportHistory.toObject());
                    }
                    newSportHistory.date = date;
                    newSportHistory.historySteps = stepCount;
                    newSportHistory.historyCalories = 0;
                    newSportHistory.historyDistances = req.body.distance[stepCountIndex];
                    sportHistoryDao.update(newSportHistory);
                    outputLogger.info('update', sortSportHistory[0].toObject());
                }
                else{
                    continue;
                }
			}
			else{
				outputLogger.info('create newSportHistory');
				let newSportHistory = new SportHistory({
					date: date,
					historySteps:stepCount,
					historyCalories: 0,
					historyDistances: req.body.distance[stepCountIndex],
					person: person
				});
				newSportHistory.device = device;
				sportHistoryDao.create(newSportHistory);
			}
		}
		res.json({
				successful: true,
				accomplishment: person.accomplishment,
				days: person.days
		});
	}
};


//通过app保存的运动数据
// http://localhost:3000/device/DF:E1:FC:1E:86:AE/NewSaveSportInfo_app
// {"days":2,"stepCounts":[6555,6333,6111],"distance": [100,100,100],"walk": [4682,5555,6666],"run": [1111,222,333],"jump":[100,100,100],"upstairs": [100,100,100],"downstairs": [100,100,100],"sportTime": [20,20,20]}
// {"days":0,"stepCounts":[365],"distance": [100],"walk": [265],"run": [100],"jump":[100],"upstairs": [100],"downstairs": [100],"sportTime": [20]}  
const actionNewSaveSportInfo_app = {
	handler(req, res) {
		const macAddress = req.params.macAddress;
		let date = new Date();
	    let startTimes = new Date(date.getFullYear(), date.getMonth(),date.getDate());
		if(!macAddress) {
            res.json({
                successful: false
            });
            return;
        }
		const device = deviceDao.findOne({
			macAddress: macAddress
		});
		const user = userDao.findOne({
            id: device.user
        });
		if(!user) {
            res.json({
                successful: false
            });
            return;
        }
        const person = personDao.findOne({
            user: user
        });		

		let sportrecord = sportHistoryDao.find({
			person: person.id,
			date:{
				$gte: startTimes
			    },
			$sort: {
				date: -1
				}
		});

		if(sportrecord.length == 0){
			person.days += 1;
			personDao.update(person);
		}

		for(let stepCountIndex = req.body.days; stepCountIndex>=0; stepCountIndex--){
			let stepCount = req.body.stepCounts[stepCountIndex];
        	// outputLogger.info('stepCount', stepCount, 'stepCountIndex', stepCountIndex);
			let sportHistory = sportHistoryDao.find({
				device: device.id,
                $limit: 1
			});
			let historyCalories = 0;
			let historyDistance = 0;
			let historySteps = 0;
			let accomplishment = 0;
			let newAccomplishment = 0;
			let accomplishmentTime = new Date(0);
			let totleStep = 0;
			if(person.accomplishmentTime){
				accomplishmentTime = new Date(person.accomplishmentTime.getFullYear(), person.accomplishmentTime.getMonth(), person.accomplishmentTime.getDate());
			}
			let flags = 0;
			let date = new Date();
			let date1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
			if(stepCountIndex){
				date = new Date(date.getFullYear(), date.getMonth(), date.getDate()-stepCountIndex, 23, 59, 59);
			}
			let totleDevice = deviceDao.find({
			 	user: user
			 });
			if(date1.getTime() != accomplishmentTime.getTime()){
				newAccomplishment = person.accomplishment;
				totleDevice.forEach(deviecIndex => {
					let todaySportHistory = sportHistoryDao.find({
						device: deviecIndex.id,
						
						$sort: {
							date: -1
						},
						$limit: 1
					});
					if(todaySportHistory.length != 0){
						let thisDate = new Date(todaySportHistory[0].date.getFullYear(),todaySportHistory[0].date.getMonth(),todaySportHistory[0].date.getDate());
						if(thisDate.getTime() == date1.getTime() && deviecIndex.id != device.id){
							totleStep += todaySportHistory[0].historySteps;
						}
					}
				});
				totleStep += stepCount;
				if(totleStep >= person.step){
					newAccomplishment += 1;
					person.accomplishmentTime = date;
					person.accomplishment = newAccomplishment;
					personDao.update(person);
					outputLogger.info("update accomplishment");
				}
			}
			
			// outputLogger.info('date1 is',date1);
			let newSportRecord = new SportRecord({
				date: date,
				step: stepCount,
				calories: 0,
				distance: req.body.distance[stepCountIndex],
				walk: req.body.walk[stepCountIndex],
				run: req.body.run[stepCountIndex],
				jump:req.body.jump[stepCountIndex],
				upstairs: req.body.upstairs[stepCountIndex],
				downstairs: req.body.downstairs[stepCountIndex],
				sportTime: req.body.sportTime[stepCountIndex],
				temperature: req.body.temperature
			});
			newSportRecord.device = device;
			newSportRecord.person = person;
			if(req.body.walk[stepCountIndex] >= 200000){
				newSportRecord.walk = 0;
			}
			if(req.body.run[stepCountIndex] >= 200000){
				newSportRecord.run = 0;
			}
			if(stepCount >= 200000)	{
			    newSportRecord.steps = 0;
			}

		// 	//判断固件数据reset开始  2018-05-17
		// 	let sportrecordInfo = sportRecordDao.find({
		// 		device: device.id,
		// 		date:{
		// 			$gte:date1
		// 		},
		// 		$sort: {
		// 			date: -1
		// 		},
		// 		$limit: 1
		//    });

		//    let walkOld = 0 ;
		//    let runOld = 0 ;
		//    let walkReset = 0;
		//    let runReset = 0;
		//    let walk = req.body.walk[stepCountIndex];
		//    let run = req.body.run[stepCountIndex];

		//    if(sportrecordInfo.length > 0){
		// 	   walkOld = sportrecordInfo[0].walk;
		// 	   runOld = sportrecordInfo[0].run;
		//   }

		//    let oldReset = resetDao.findOne({
		// 		device: device.id,
		// 		creatTime:{
		// 			$gte:date1
		// 		}}); 
		// 		outputLogger.info(oldReset);
		//    if(oldReset != null){
		// 		walkOld = oldReset.walkOld;
		// 		runOld = oldReset.runOld;
		// 		walkReset = oldReset.walkReset;
		// 		runReset = oldReset.runReset;

		// 		oldReset.runOld= run,//上一次固件步数
		// 		oldReset.walkOld= walk//上一次固件走路
		// 		resetDao.update(oldReset);
		//    }

		//   if(walkOld + runOld > walk + run) {
		// 	walkReset = walkReset + walkOld;
		// 	runReset = runReset + runOld;
		// 	if(oldReset != null){
		// 		oldReset.walkReset= walkReset,//上一次固件步数
		// 		oldReset.runReset= runReset,//上一次固件走路
		// 		oldReset.resetNum += 1,
		// 		resetDao.update(oldReset);
		// 	}
		// 	else{
        //         let Resets = new Reset({
		// 			user : user,
		// 			runOld: runOld,//上一次固件步数
		// 			walkOld: walkOld,//上一次固件走路
		// 			walkReset: walkReset,//reset走路
		// 			runReset: runReset,//reset跑步数
		// 			device: device,
		// 			resetNum:1,
		// 			creatTime: date
		// 		}); 
		// 		resetDao.create(Resets);
		// 	}
		//  }
		//  newSportRecord.step = walk + walkReset + run + runReset;
		//  newSportRecord.walk = walk + walkReset,
		//  newSportRecord.run = run + runReset;
		//  //判断固件数据reset结束  2018-05-17

			// // 测试版本
			// let deviceId = device.id;
			// let steps = 0;
			// if(deviceId == "5acdab9ace986015032ebc4d"){
			// 	steps = req.body.run[stepCountIndex] + 17500,
			// 	outputLogger.info(steps);
			//    //测试
		    //    sportRecord.step = steps;
			//    sportRecord.walk = req.body.walk[stepCountIndex],
			//    sportRecord.run = steps - req.body.walk[stepCountIndex];
			// }

			outputLogger.info('sportRecord is',newSportRecord.toObject());
			sportRecordDao.create(newSportRecord);
			let dates = new Date();
			let startDate =  new Date(dates.getFullYear(), dates.getMonth(), dates.getDate()-stepCountIndex);
			let endDate =  new Date(dates.getFullYear(), dates.getMonth(), dates.getDate()-stepCountIndex+1);
			let sortSportHistory = sportHistoryDao.find({
				device: device.id,
				date:{
					 $gt:startDate,
					 $lt:endDate
				},
				$sort: {
					date: -1
				},
				$limit: 1
			});
			if(sortSportHistory.length == 0)
			{
				let newSportHistory = new SportHistory({
					date: date,
					historySteps:stepCount,
					historyCalories: 0,
					historyDistances: req.body.distance[stepCountIndex],
					walk: req.body.walk[stepCountIndex],
					run: req.body.run[stepCountIndex],
					person: person
				});
					newSportHistory.device = device;
					if(req.body.walk[stepCountIndex] >= 200000){
						newSportHistory.walk = 0;
					}
					if(req.body.run[stepCountIndex] >= 200000){
						newSportHistory.run = 0;
					}
					if(stepCount >= 200000)	{
						newSportHistory.historySteps = 0;
					}
					sportHistoryDao.create(newSportHistory);
					outputLogger.info('newSportHistory', newSportHistory.toObject());
			}
			else if(sportHistory.length > 0){
				let newSportHistory = sportHistoryDao.findOne({
					id: sortSportHistory[0].id
				});
				 if(newSportHistory){
					outputLogger.info('newSportHistory is',newSportHistory.toObject());
				}

				// // 测试版本
				// let deviceId = newSportHistory.device.id;
				// let steps = 0;
				// if(deviceId == "5acdab9ace986015032ebc4d")
				// {
				//   steps = req.body.run[stepCountIndex] + 17500,
				//   outputLogger.info(steps);
			    //   //测试
				//   newSportHistory.historySteps = steps;
				//   newSportHistory.walk = req.body.walk[stepCountIndex],
				//   newSportHistory.run = steps - req.body.walk[stepCountIndex];
				// }
				//正式版
				newSportHistory.historySteps = stepCount;
				newSportHistory.walk = req.body.walk[stepCountIndex],
				newSportHistory.run = req.body.run[stepCountIndex];
				newSportHistory.historyCalories = 0;
				newSportHistory.historyDistances = req.body.distance[stepCountIndex];
				newSportHistory.date = date;	
				newSportHistory.person = person;
				if(req.body.walk[stepCountIndex] >= 200000){
					newSportHistory.walk = 0;
				}
				if(req.body.run[stepCountIndex] >= 200000){
					newSportHistory.run = 0;
				}
				if(stepCount >= 200000)	{
					newSportHistory.historySteps = 0;
				}
				
			// 	//历史记录reset判断 2018-05-20
			//    newSportHistory.historySteps = walk + walkReset + run + runReset;
			//    newSportHistory.walk = walk + walkReset,
			//    newSportHistory.run = run + runReset;
            //    //历史记录reset判断结束
			if(sortSportHistory[0].walk + sortSportHistory[0].run < req.body.walk[stepCountIndex] + req.body.run[stepCountIndex])
			   sportHistoryDao.update(newSportHistory);
			   outputLogger.info('update', sortSportHistory[0].toObject());
			}
			else{
				   continue;
				}
		}
		res.json({
				successful: true
		});
	}
};

//通过app保存的运动数据
// http://localhost:3000/device/DF:E1:FC:1E:86:AE/NewSaveSportInfo_app
// {"days":0,"stepCounts":[365],"distance": [100],"walk": [265],"run": [100],"jump":[100],"upstairs": [100],"downstairs": [100],"sportTime": [20]}  
const actionSaveMacSport = {
	handler(req, res) {
        const macAddress = req.params.macAddress;
		let date = new Date();
	    let startTimes = new Date(date.getFullYear(), date.getMonth(),date.getDate());
		if(!macAddress) {
            res.json({
                successful: false
            });
            return;
        }
		const device = deviceDao.findOne({
			macAddress: macAddress
		});
		const user = userDao.findOne({
            id: device.user
        });
		if(!user) {
            res.json({
                successful: false
            });
            return;
        }
        const person = personDao.findOne({
            user: user
        });		
		let sportrecord = sportHistoryDao.find({
			person: person.id,
			date:{
				$gte: startTimes
			},
			$sort: {
				date: -1
			}
		});

	    if(sportrecord.length == 0){
		   person.days += 1;
		   personDao.update(person);
	    }

		for(let stepCountIndex = req.body.days; stepCountIndex>=0; stepCountIndex--){
			let stepCount = req.body.stepCounts[stepCountIndex];
        	// outputLogger.info('stepCount', stepCount, 'stepCountIndex', stepCountIndex);
			let sportHistory = sportHistoryDao.find({
				device: device.id,
                $limit: 1
			});
			let historyCalories = 0;
			let historyDistance = 0;
			let historySteps = 0;
			let accomplishment = 0;
			let newAccomplishment = 0;
			let accomplishmentTime = new Date(0);
			let totleStep = 0;
			if(person.accomplishmentTime){
				accomplishmentTime = new Date(person.accomplishmentTime.getFullYear(), person.accomplishmentTime.getMonth(), person.accomplishmentTime.getDate());
			}
			let flags = 0;
			let date = new Date();
			let date1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
			if(stepCountIndex){
				date = new Date(date.getFullYear(), date.getMonth(), date.getDate()-stepCountIndex, 23, 59, 59);
			}
			let totleDevice = deviceDao.find({
			 	user: user
			 });
			if(date1.getTime() != accomplishmentTime.getTime()){
				newAccomplishment = person.accomplishment;
				totleDevice.forEach(deviecIndex => {
					let todaySportHistory = sportHistoryDao.find({
						device: deviecIndex.id,
						
						$sort: {
							date: -1
						},
						$limit: 1
					});
					if(todaySportHistory.length != 0){
						let thisDate = new Date(todaySportHistory[0].date.getFullYear(),todaySportHistory[0].date.getMonth(),todaySportHistory[0].date.getDate());
						if(thisDate.getTime() == date1.getTime() && deviecIndex.id != device.id){
							totleStep += todaySportHistory[0].historySteps;
						}
					}
				});
				totleStep += stepCount;
				if(totleStep >= person.step){
					newAccomplishment += 1;
					person.accomplishmentTime = date;
					person.accomplishment = newAccomplishment;
					personDao.update(person);
					outputLogger.info("update accomplishment");
				}
			}
			
			// outputLogger.info('date1 is',date1);
			let newSportRecord = new SportRecord({
				date: date,
				step: stepCount,
				calories: 0,
				distance: req.body.distance[stepCountIndex],
				walk: req.body.walk[stepCountIndex],
				run: req.body.run[stepCountIndex],
				jump:req.body.jump[stepCountIndex],
				upstairs: req.body.upstairs[stepCountIndex],
				downstairs: req.body.downstairs[stepCountIndex],
				sportTime: req.body.sportTime[stepCountIndex],
				temperature: req.body.temperature,
			});
			newSportRecord.device = device;
			newSportRecord.person = person;
			if(req.body.walk[stepCountIndex] >= 200000){
				newSportRecord.walk = 0;
			}
			if(req.body.run[stepCountIndex] >= 200000){
				newSportRecord.run = 0;
			}
			if(stepCount >= 200000)	{
			    newSportRecord.steps = 0;
			}

			outputLogger.info('sportRecord is',newSportRecord.toObject());
			sportRecordDao.create(newSportRecord);
			let dates = new Date();
			let startDate =  new Date(dates.getFullYear(), dates.getMonth(), dates.getDate()-stepCountIndex);
			let endDate =  new Date(dates.getFullYear(), dates.getMonth(), dates.getDate()-stepCountIndex+1);
			let sortSportHistory = sportHistoryDao.find({
				device: device.id,
				date:{
					 $gt:startDate,
					 $lt:endDate
				},
				$sort: {
					date: -1
				},
				$limit: 1
			});
			if(sortSportHistory.length == 0)
			{
				let newSportHistory = new SportHistory({
					date: date,
					historySteps:stepCount,
					historyCalories: 0,
					historyDistances: req.body.distance[stepCountIndex],
					walk: req.body.walk[stepCountIndex],
					run: req.body.run[stepCountIndex],
					person: person
				});
					newSportHistory.device = device;
					if(req.body.walk[stepCountIndex] >= 200000){
						newSportHistory.walk = 0;
					}
					if(req.body.run[stepCountIndex] >= 200000){
						newSportHistory.run = 0;
					}
					if(stepCount >= 200000)	{
						newSportHistory.historySteps = 0;
					}
					sportHistoryDao.create(newSportHistory);
					outputLogger.info('newSportHistory', newSportHistory.toObject());
			}
			else if(sportHistory.length > 0){
				let newSportHistory = sportHistoryDao.findOne({
					id: sortSportHistory[0].id
				});
				 if(newSportHistory){
					outputLogger.info('newSportHistory is',newSportHistory.toObject());
				}
				newSportHistory.historySteps = stepCount;
				newSportHistory.walk = req.body.walk[stepCountIndex],
				newSportHistory.run = req.body.run[stepCountIndex];
				newSportHistory.historyCalories = 0;
				newSportHistory.historyDistances = req.body.distance[stepCountIndex];
				newSportHistory.date = date;	
				newSportHistory.person = person;
				if(req.body.walk[stepCountIndex] >= 200000){
					newSportHistory.walk = 0;
				}
				if(req.body.run[stepCountIndex] >= 200000){
					newSportHistory.run = 0;
				}
				if(stepCount >= 200000)	{
					newSportHistory.historySteps = 0;
				}

			if(sortSportHistory[0].walk + sortSportHistory[0].run < req.body.walk[stepCountIndex] + req.body.run[stepCountIndex])
			   sportHistoryDao.update(newSportHistory);
			   outputLogger.info('update', sortSportHistory[0].toObject());
			}
			else{
				   continue;
				}
		}
		res.json({
				successful: true
		});
	}
};


const actionAllUserHistory = {
    handler(req, res) {
        const year = req.body.year;
		const month = req.body.month;
		const start = new Date(year, month);
		const end = new Date(year, month+5);

		let sportHistory = sportHistoryDao.find({
			date: {
				$gte: start,
				$lte: end
				},
			$sort: {
				date: -1,
				person:1
			}
		});
		let historyStep = [];
		let historyDistance = [];
		let historyCalorie = [];
		let personList = [];
		let DateList = [];

		if( sportHistory.length != 0 ){
			var n = 0;
			for(var i = 1; i<= sportHistory.length; i++){
				if(n == sportHistory.length){
						break;
				}
				let step = 0;
				let distance = 0;
				let calories = 0;
				let persons = 0;
				let dates = 0;
					step += sportHistory[n].historySteps;
					distance += sportHistory[n].historyDistances;
					persons = sportHistory[n].person.nickName;
					dates = sportHistory[n].date; 
					calories += sportHistory[n].historyCalories;
					n++;
					if(n == sportHistory.length){
						break;
					}
				historyStep.push(step);
				personList.push(persons);
				DateList.push(dates);
				historyDistance.push(distance);
				historyCalorie.push(calories);
			}
		}
		else{
			for(let i = sportHistory.length; i>0 ; i--){
				personList.push(0);
				historyStep.push(0);
				historyDistance.push(0);
				historyCalorie.push(0);
			}
		}
        outputLogger.info('historyStep is',historyStep);
        res.json({
            successful: true,
            data: {
				person: personList,
				distance: historyDistance,
				calorie: historyCalorie,
    			step: historyStep
            }
        });
    }
};

//得到用户名，电话和最后同步时间的接口  2018-05-1
const actionUserLastHistory = {
    handler(req, res) {
		const person = personDao.find({});
		if(person == null) {
            res.json({
                successful: false
            });
            return;
		}
		let nickNameList = [];
		let phoneList = [];
		let dateList = [];

		person.forEach(personIndex => {
			let sportHistory = sportHistoryDao.find({
				person: personIndex.id,
				$sort: {
					date: -1
				},
				$limit: 1
			});
			nickNameList.push(personIndex.nickName);
			phoneList.push(personIndex.phone);
			dateList.push(sportHistory.date);
		});

        res.json({
            successful: true,
            data: {
				nickName: nickNameList,
				phone: phoneList,
    			date: dateList
            }
        });
    }
};




const actionGetHistory = {
    handler(req, res) {
		const userId = req.body.userId
        const year = req.body.year;
		const month = req.body.month;
		const start = new Date(year, month);
		const end = new Date(year, month+1);
		const monthLength = new Date(year, month+1, 0).getDate();


		const person = personDao.findOne({
			user: userId
		});
		if(person == null) {
            res.json({
                successful: false
            });
            return;
        }
		let sportHistory = sportHistoryDao.find({
			person: person.id,
			date: {
				$gte: start,
				$lte: end
				},
			$sort: {
				date: 1
			}
		});
		let historyStep = [];
		let historyDistance = [];
		let historyCalorie = [];

		if( sportHistory.length != 0 ){
			var n = 0;
			for(var i = 1; i<=monthLength; i++){
				if(n == sportHistory.length){
						break;
				}
				let step = 0;
				let distance = 0;
				let calories = 0;
				while(i == sportHistory[n].date.getDate()){
					step += sportHistory[n].historySteps;
					distance += sportHistory[n].historyDistances;
					calories += sportHistory[n].historyCalories;
					n++;
					if(n == sportHistory.length){
						break;
					}
				}
				historyStep.push(step);
				historyDistance.push(distance);
				historyCalorie.push(calories);
			}
			
			let count =historyStep.length;
			for(let i = monthLength; i>count ; i--){
				historyStep.push(0);
				historyDistance.push(0);
				historyCalorie.push(0);
			}
		}
		else{
			for(let i = monthLength; i>0 ; i--){
				historyStep.push(0);
				historyDistance.push(0);
				historyCalorie.push(0);
			}
		}
        outputLogger.info('historyStep is',historyStep);
        res.json({
            successful: true,
            data: {
				distance: historyDistance,
				calorie: historyCalorie,
    			step: historyStep,
				stepTarget: person.step
            }
        });
    }
};


const actionDoubleHistory = {
    handler(req, res) {
		const userId = req.body.userId
        const year = req.body.year;
		const month = req.body.month;
		const start = new Date(year, month);
		const end = new Date(year, month+1);
		const monthLength = new Date(year, month+1, 0).getDate();


		const person = personDao.findOne({
			user: userId
		});

		const devices = deviceDao.find({
            user: userId
        });
		if(person == null) {
            res.json({
                successful: false
            });
            return;
        }
		let historyStep = [];
		let historyDistance = [];
		let historyCalorie = [];
		let deviceList = [];

		devices.forEach(deviceIndex => {
			let sportHistory = sportHistoryDao.find({
				device: deviceIndex.id,
				date: {
					$gte: start,
					$lte: end
					},
				$sort: {
					date: 1
				},
				$limit: 30
			});
			deviceList.push(deviceIndex.macAddress);
			if(sportHistory.length != 0){
				var n = 0;
				for(var i = 1; i<=monthLength; i++){
					if(n == sportHistory.length){
				     	break;
					}
					let step = 0;
					let distance = 0;
					let calories = 0;
					while(i == sportHistory[n].date.getDate()){
						step += sportHistory[n].historySteps;
						distance += sportHistory[n].historyDistances;
						calories += sportHistory[n].historyCalories;
						n++;
						if(n == sportHistory.length){
							break;
						}
					}
					outputLogger.info(sportHistory.length);
					if(i == 1)
					{
					   historyStep.push("|");
					   historyDistance.push("|");
					   historyCalorie.push("|");
					}
					historyStep.push(step);
					historyDistance.push(distance);
					historyCalorie.push(calories);
					}
					
					let count =historyStep.length;
					for(let i = monthLength; i>count ; i--){
						historyStep.push(0);
						historyDistance.push(0);
						historyCalorie.push(0);
					}
				}
				else{
					for(let i = monthLength; i>0 ; i--){
						historyStep.push(0);
						historyDistance.push(0);
						historyCalorie.push(0);
					}
				}
			});
  
        // outputLogger.info('historyStep is',historyStep);
        res.json({
            successful: true,
            data: {
				device:deviceList,
    			step: historyStep,
				distance: historyDistance,
				calorie: historyCalorie,
				stepTarget: person.step
            }
        });
    }
};

const actionGetPageInfo = {
    handler(req, res) {
		const id = req.session.login.user;
		if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }
		let boundInfo = false;
		let accomplishment = 0;
		let days = 0;
		const user = userDao.findOne({
			id: id
		});
		const person = personDao.findOne({
			user: user
		});
		const device = deviceDao.find({
			user: user.id
		});
		let updateTime = 0;
		const sportHistory = sportHistoryDao.find({
			person: person.id,
			$sort: {
			    date: -1
			},
			$limit: 1
        });
        let skin = 1;
        if(person.skin){
            skin = person.skin;
        }
        if(sportHistory.length != 0){
            let month = sportHistory[0].date.getMonth() + 1;
            let day = sportHistory[0].date.getDate();
            let hour = sportHistory[0].date.getHours();
            let minute = sportHistory[0].date.getMinutes();
            let min = "";
            if(minute.toString().length == 1){
                min = "0"+minute.toString();
            }
            else{
                min = minute.toString();
            }
            updateTime = month+"月"+day+"日"+hour+":"+min+"更新";
        }
        let hint = 0;
        if(user.applied_list.length){
            hint = 1;
        }
		if(person.accomplishment){
			accomplishment = person.accomplishment;
		}
        if(person.days){
			days = person.days;
		}
		

		let deviceList = [];
		let wechatList = [];
		// let distanceList = [];
		// let caloriesList = [];
		let totalStepList = [];
		let walkList = [];
		let runList = [];
		let upstairsList = [];
		let downstairsList = [];
		let sportTimeList = [];
		// let temperatureList = [];
		
		device.forEach(deviceIndex => {
			let sportRecord = sportRecordDao.find({
				device: deviceIndex.id,
				$sort: {
					date: -1
				},
				$limit: 1
			});
			deviceList.push(deviceIndex.id);
			wechatList.push(deviceIndex.wechatId);
			if(sportRecord.length != 0){
				let date = new Date();
				let todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
				let date2 = sportRecord[0].date;
				let recordDate = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
				if(todayDate.getTime() == recordDate.getTime()){
					// distanceList.push(sportRecord[0].distance);
					// caloriesList.push(sportRecord[0].calories);
					totalStepList.push(sportRecord[0].step);
					// temperatureList.push(sportRecord[0].temperature);
					if( typeof(sportRecord[0].run) == 'number' ){
						walkList.push(sportRecord[0].walk);
						runList.push(sportRecord[0].run);
						upstairsList.push(sportRecord[0].upstairs);
						downstairsList.push(sportRecord[0].downstairs);
						sportTimeList.push(sportRecord[0].sportTime);
					}
					else{
						walkList.push(0);
						runList.push(0);
						upstairsList.push(0);
						downstairsList.push(0);
						sportTimeList.push(0);
					}
				}
				else{
					totalStepList.push(0);
					// distanceList.push(0);
					// caloriesList.push(0);
					walkList.push(0);
					runList.push(0);
					upstairsList.push(0);
					downstairsList.push(0);
					sportTimeList.push(0);
					// temperatureList.push(0);
				}
			}
			else{
				totalStepList.push(0);
				// distanceList.push(0);
				// caloriesList.push(0);
				walkList.push(0);
				runList.push(0);
				upstairsList.push(0);
				downstairsList.push(0);
				sportTimeList.push(0);
				// temperatureList.push(0);
			}
		});
		
		if (person.devices.length != 0 ) {
			boundInfo = true;
		}

        res.json({
            successful: true,
            data: {
                personId: person.id,
                updateTime: updateTime,
                hint: hint,
                skin: skin,
                nickName: person.nickName,
                headImageUrl: user.headImageUrl,
                accomplishment: accomplishment,
				days: days,
                boundInfo: boundInfo,
				sportInfo: {
						stepTarget: person.step,
						device: deviceList,
						wechat: wechatList,
						// distance: distanceList,
						// calories: caloriesList,
						totalStep: totalStepList,
						walk: walkList,
						run: runList,
						upstairs : upstairsList,
						downstairs: downstairsList,
						sportTime: sportTimeList,
						// temperature: temperatureList
				}
            }
        });
	}
}

const actionNewAbstract = {
    handler(req, res) {
		const id = req.params.userId;
		if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }
		let boundInfo = false;
		let monthSteps = 0; //每月历史总步数
		let accomplishment = 0;
		//打卡信息
		let checkTimeList = [];
		let creditList = [];
		let statuList = [];
		let moneyList = [];

		//reset信息
		let runOldList =[];//上一次固件步数
		let walkOldList =[];//上一次固件走路
		let walkResetList =[];//reset走路
		let runResetList =[];//reset跑步数
		let sportTimesList =[];//运动时间
		let sportTimeResetList =[]; //reset运动时间
		let resetNumList =[];     //reset次数
		let creatTimeList =[];  //修改时间
		let resetDeviceList = [];  //终端mac地址

		let days = 0;
		const user = userDao.findOne({
			id: id
		});
		const person = personDao.findOne({
			user: user
		});
		const device = deviceDao.find({
			user: user.id
		});
		const deviceDay = deviceDao.findOne({
			user: user.id
		});
		// //获取终端历史记录信息判断运动天数
		// const sportHistoryDay = sportHistoryDao.count({
		// 	person: person.id
		// });
		const sportFinishDay = sportHistoryDao.count({
			person : person.id,
			historySteps: {
				$gte: person.step
			}
		});

        //得到个人每月历史总步数   2018-05-30
        let date = new Date();
        let start = new Date(date.getFullYear(), date.getMonth());
		let end = new Date(date.getFullYear(), date.getMonth()+1);
		const monthLength = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
        let sportHistorySum = sportHistoryDao.find({
            person: person.id,
            date: {
                $gte: start,
                $lte: end
                },
            $sort: {
                date: 1
            }
        });
        if( sportHistorySum.length != 0 ){
	            var n = 0;
	            for(var i = 1; i<=monthLength; i++){
	                if(n == sportHistorySum.length){
	                        break;
	                }
	                while(i == sportHistorySum[n].date.getDate()){
		                monthSteps += sportHistorySum[n].historySteps;
	                    n++;
	                    if(n == sportHistorySum.length){
	                        break;
	                    }
	                }
	            }
	        }


	//得到最近8天的打卡信息  2018-05-30
	const checkInfo = checkDao.find({
		user: user, 
		$sort: {
			checkTime: -1
		},
		$limit: 8
	});

	if(checkInfo != null){			
		checkInfo.forEach(checkIndex => {
			checkTimeList.push(checkIndex.checkTime);
			creditList.push(checkIndex.credit);
			moneyList.push(checkIndex.money),
			statuList.push(checkIndex.statu);
	  });
	}

	//查询个人账户下所有终端reset情况
	let startTimes = new Date(date.getFullYear(), date.getMonth(),date.getDate());
    const oldReset =  resetDao.find({
		user: user.id,
		creatTime:{
			$gte: startTimes
	}}); 
	oldReset.forEach(deviceIndex => {
		resetDeviceList.push(deviceIndex.device.macAddress);
		runOldList.push(deviceIndex.runOld);//上一次固件步数
		walkOldList.push(deviceIndex.walkOld);//上一次固件走路
		walkResetList.push(deviceIndex.walkReset);//reset走路
		runResetList.push(deviceIndex.runReset);//reset跑步数
		sportTimesList.push(deviceIndex.sportTime);//运动时间
		sportTimeResetList.push(deviceIndex.sportTimeReset);
		resetNumList.push(deviceIndex.resetNum);
		creatTimeList.push(deviceIndex.creatTime);
   });

		let updateTime = 0;
		const sportHistory = sportHistoryDao.find({
			person: person.id,
			$sort: {
			    date: -1
			},
			$limit: 1
        });
        let skin = 1;
        if(person.skin){
            skin = person.skin;
        }
        if(sportHistory.length != 0){
            let month = sportHistory[0].date.getMonth() + 1;
            let day = sportHistory[0].date.getDate();
            let hour = sportHistory[0].date.getHours();
            let minute = sportHistory[0].date.getMinutes();
            let min = "";
            if(minute.toString().length == 1){
                min = "0"+minute.toString();
            }
            else{
                min = minute.toString();
            }
            updateTime = month+"月"+day+"日"+hour+":"+min+"更新";
        }
        let hint = 0;
        if(user.applied_list.length){
            hint = 1;
        }
		if(sportFinishDay){
			accomplishment = sportFinishDay;//运动达标天数
		}
        // if(sportHistoryDay){
		// 	days = sportHistoryDay;//运动历史天数
		// }
		days = person.days;
		

		let deviceList = [];
		let wechatList = [];
		// let distanceList = [];
		// let caloriesList = [];
		let totalStepList = [];
		let walkList = [];
		let runList = [];
		let jumpList = [];
		let upstairsList = [];
		let downstairsList = [];
		let sportTimeList = [];
		// let temperatureList = [];
		
		device.forEach(deviceIndex => {
			let sportRecord = sportRecordDao.find({
				device: deviceIndex.id,
				$sort: {
					date: -1
				},
				$limit: 1
			});
			deviceList.push(deviceIndex.macAddress);
			wechatList.push(deviceIndex.wechatId);
			if(sportRecord.length != 0){
				let date = new Date();
				let todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
				let date2 = sportRecord[0].date;
				let recordDate = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
				if(todayDate.getTime() == recordDate.getTime()){
					// distanceList.push(sportRecord[0].distance);
					// caloriesList.push(sportRecord[0].calories);
					totalStepList.push(sportRecord[0].step);
					// temperatureList.push(sportRecord[0].temperature);
					if( typeof(sportRecord[0].run) == 'number' ){
						walkList.push(sportRecord[0].walk);
						runList.push(sportRecord[0].run);
						jumpList.push(sportRecord[0].jump);
						upstairsList.push(sportRecord[0].upstairs);
						downstairsList.push(sportRecord[0].downstairs);
						sportTimeList.push(sportRecord[0].sportTime);
					}
					else{
						walkList.push(0);
						runList.push(0);
						jumpList.push(0);
						upstairsList.push(0);
						downstairsList.push(0);
						sportTimeList.push(0);
					}
				}
				else{
					totalStepList.push(0);
					// distanceList.push(0);
					// caloriesList.push(0);
					walkList.push(0);
					runList.push(0);
					jumpList.push(0);
					upstairsList.push(0);
					downstairsList.push(0);
					sportTimeList.push(0);
					// temperatureList.push(0);
				}
			}
			else{
				totalStepList.push(0);
				// distanceList.push(0);
				// caloriesList.push(0);
				walkList.push(0);
				runList.push(0);
				jumpList.push(0);
				upstairsList.push(0);
				downstairsList.push(0);
				sportTimeList.push(0);
				// temperatureList.push(0);
			}
		});
		
		if (person.devices.length != 0 ) {
			boundInfo = true;
		}

        res.json({
            successful: true,
            data: {
                personId: person.id,
                hint: hint,
                skin: skin,
				boundInfo: boundInfo,

                updateTime: updateTime,
                nickName: person.nickName,
                headImageUrl: user.headImageUrl,
                accomplishment: accomplishment,
				days: days,
				monthStep : monthSteps,
				checkInfo:{
					checkTime: checkTimeList,
					credit: creditList,
					money: moneyList,
					statu: statuList//0未签到1已签到
				},
				resetInfo:{
					userName: person.nickName,
					device: resetDeviceList,
					runOld: runOldList,//上一次固件步数
				    walkOld: walkOldList,//上一次固件走路
				    walkReset: walkResetList,//reset走路
					runReset: runResetList,//reset跑步数
					sportTime : sportTimesList,//运动时间
					sportTimeReset : sportTimeResetList,
					resetNum: resetNumList,
					creatTime: creatTimeList
				},
				sportInfo: {
						stepTarget: person.step,
						device: deviceList,
						wechat: wechatList,
						// distance: distanceList,
						// calories: caloriesList,
						// temperature: temperatureList
						totalStep: totalStepList,
						walk: walkList,
						run: runList,
						jump: jumpList,
						upstairs : upstairsList,
						downstairs: downstairsList,
						sportTime: sportTimeList,
				}
            }
        });
	}
}

const actionGetPageInfo_app = {
    handler(req, res) {
		const id = req.params.userId;
		if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }
		let boundInfo = false;
		let accomplishment = 0;
		let days = 0;
		const user = userDao.findOne({
			id: id
		});
		const person = personDao.findOne({
			user: user
		});
		const device = deviceDao.find({
			user: user.id
		});
		const deviceDay = deviceDao.findOne({
			user: user.id
		});
		// //获取终端历史记录信息判断运动天数
		// const sportHistoryDay = sportHistoryDao.count({
		// 	person: person.id
		// });
		const sportFinishDay = sportHistoryDao.count({
			person : person.id,
			historySteps: {
				$gte: person.step
			}
		});
		let updateTime = 0;
		const sportHistory = sportHistoryDao.find({
			person: person.id,
			$sort: {
			    date: -1
			},
			$limit: 1
        });
        let skin = 1;
        if(person.skin){
            skin = person.skin;
        }
        if(sportHistory.length != 0){
            let month = sportHistory[0].date.getMonth() + 1;
            let day = sportHistory[0].date.getDate();
            let hour = sportHistory[0].date.getHours();
            let minute = sportHistory[0].date.getMinutes();
            let min = "";
            if(minute.toString().length == 1){
                min = "0"+minute.toString();
            }
            else{
                min = minute.toString();
            }
            updateTime = month+"月"+day+"日"+hour+":"+min+"更新";
        }
        let hint = 0;
        if(user.applied_list.length){
            hint = 1;
        }
		if(sportFinishDay){
			accomplishment = sportFinishDay;//运动达标天数
		}
        // if(sportHistoryDay){
		// 	days = sportHistoryDay;//运动历史天数
		// }
		days = person.days;		

		let deviceList = [];
		let wechatList = [];
		// let distanceList = [];
		// let caloriesList = [];
		let totalStepList = [];
		let walkList = [];
		let runList = [];
		let jumpList = [];
		let upstairsList = [];
		let downstairsList = [];
		let sportTimeList = [];
		// let temperatureList = [];
		
		device.forEach(deviceIndex => {
			let sportRecord = sportRecordDao.find({
				device: deviceIndex.id,
				$sort: {
					date: -1
				},
				$limit: 1
			});
			deviceList.push(deviceIndex.macAddress);
			wechatList.push(deviceIndex.wechatId);
			if(sportRecord.length != 0){
				let date = new Date();
				let todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
				let date2 = sportRecord[0].date;
				let recordDate = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
				if(todayDate.getTime() == recordDate.getTime()){
					// distanceList.push(sportRecord[0].distance);
					// caloriesList.push(sportRecord[0].calories);
					totalStepList.push(sportRecord[0].step);
					// temperatureList.push(sportRecord[0].temperature);
					if( typeof(sportRecord[0].run) == 'number' ){
						walkList.push(sportRecord[0].walk);
						runList.push(sportRecord[0].run);
						jumpList.push(sportRecord[0].jump);
						upstairsList.push(sportRecord[0].upstairs);
						downstairsList.push(sportRecord[0].downstairs);
						sportTimeList.push(sportRecord[0].sportTime);
					}
					else{
						walkList.push(0);
						runList.push(0);
						jumpList.push(0);
						upstairsList.push(0);
						downstairsList.push(0);
						sportTimeList.push(0);
					}
				}
				else{
					totalStepList.push(0);
					// distanceList.push(0);
					// caloriesList.push(0);
					walkList.push(0);
					runList.push(0);
					jumpList.push(0);
					upstairsList.push(0);
					downstairsList.push(0);
					sportTimeList.push(0);
					// temperatureList.push(0);
				}
			}
			else{
				totalStepList.push(0);
				// distanceList.push(0);
				// caloriesList.push(0);
				walkList.push(0);
				runList.push(0);
				jumpList.push(0);
				upstairsList.push(0);
				downstairsList.push(0);
				sportTimeList.push(0);
				// temperatureList.push(0);
			}
		});
		
		if (person.devices.length != 0 ) {
			boundInfo = true;
		}

        res.json({
            successful: true,
            data: {
                personId: person.id,
                hint: hint,
                skin: skin,
				boundInfo: boundInfo,

                updateTime: updateTime,
                nickName: person.nickName,
                headImageUrl: user.headImageUrl,
                accomplishment: accomplishment,
				days: days,
				sportInfo: {
						stepTarget: person.step,
						device: deviceList,
						wechat: wechatList,
						// distance: distanceList,
						// calories: caloriesList,
						// temperature: temperatureList
						totalStep: totalStepList,
						walk: walkList,
						run: runList,
						jump: jumpList,
						upstairs : upstairsList,
						downstairs: downstairsList,
						sportTime: sportTimeList,
				}
            }
        });
	}
}


const actionModifyRemark = {
	handler(req, res) {
		const id = req.params.deviceId;
        const device = deviceDao.findOne({
            id: id
        });
		if(device != null){
			device.remark = req.body.remark;
			deviceDao.update(device);
			res.json({
				successful: true		 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};


const actionModifyRemark_app = {
	handler(req, res) {
		const macAddress = req.params.macAddress;
        const device = deviceDao.findOne({
            macAddress: macAddress
        });
		if(device != null){
			device.remark = req.body.remark;
			deviceDao.update(device);
			res.json({
				successful: true		 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};

const actionSaveGameScore = {
	handler(req, res) {
		const id = req.session.login.user;
		const gameType = req.body.gameType;
		const score = req.body.score;
		if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }
		const user = userDao.findOne({
			id: id
		});
		const person = personDao.findOne({
			user: user
		});


        let percent = 0;
		const totle = gameScoreDao.find({
		    gameType: gameType
		});
		if(totle.length){
			const excess = gameScoreDao.find({
                gameType: gameType,
				score: {
					$lte: score
				}
			});
			percent = excess.length/totle.length;
		}
		else{
			percent = 1;
		}
		outputLogger.info("percent is ", percent);

// <<<<<<< HEAD
        const sameScore = gameScoreDao.findOne({
            gameType: gameType,
            person: person,
            score: score
        });
        if(sameScore == null){
            let newGameScore = new GameScore({
                gameType: gameType,
                score: score,
                person: person
            });
            gameScoreDao.create(newGameScore);
            outputLogger.info('newGameScore is',newGameScore.toObject());
        }

		let topNameList = [];
		let topScoreList = [];
		let ranking = 0;
		const topScore = gameScoreDao.find({
		    gameType: gameType,
		    $sort: {
					score: -1
			}
		});
		let flag = 0;
		for(let i=0;i<5;i++){
		    if(topScore.length <= i){
		        break;
		    }
		    topNameList.push(topScore[i].person.nickName);
		    topScoreList.push(topScore[i].score);
		    if(topScore[i].score == score && topScore[i].person.id == person.id && !flag){
		        outputLogger.info("top 5");
		        ranking = i+1;
		        flag = 1;
		    }
		}
		if(!flag){
		    outputLogger.info("not in top 5");
		    let thisNameList = [];
		    let thisScoreList = [];
		    const thisScore1  = gameScoreDao.find({
		        gameType: gameType,
                score: {
                    $gt: score
                },
		        $sort: {
		            score: -1
		        }
		    });
		    const thisScore2  = gameScoreDao.find({
		        gameType: gameType,
                score:  score
		    });
		    ranking = thisScore1.length;
		    for(let i=0;i<thisScore2.length;i++){
		        ranking += 1;
		        if(thisScore2[i].person.id == person.id){
		            outputLogger.info("ranking is: ", ranking);
		            break;
		        }
		    }
            for(let i=0;i<5;i++){
                thisNameList.push(topScore[ranking+i-3].person.nickName);
                thisScoreList.push(topScore[ranking+i-3].score);
                if(topScore.length <= i || topScore.length <= ranking+i-2){
                    outputLogger.info("before break, totle: ", topScore.length, "index: ", ranking+i-3);
                    break;
                }
            }
            gameScoreDao.remove({"score":0});
            res.json({
                successful: true,
                data: {
                    percent: percent,
                    top: {
                        name: topNameList,
                        score: topScoreList
                    },
                    ranking: ranking,
                    my: {
                        name: thisNameList,
                        score: thisScoreList
                    }
                }
            });
            return;
		}

        gameScoreDao.remove({"score":0});
        res.json({
			successful: true,
			data: {
				percent: percent,
				top: {
                    name: topNameList,
                    score: topScoreList
				},
				ranking: ranking
			}
		});
		return;
	}
};

const actionQueryBuddy = {
	handler(req, res) {
		const id = req.session.login.user;
		if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }
        let user = userDao.findOne({
			id: id
		});
		let buddy_list = [];
		let apply_list = [];
		let applied_list = [];
		let state_list = [];
		let agree_list = [];
		let disagree_list = [];
		if(user == null) {
            res.json({
                successful: false
            });
            return;
        }
		buddy_list = user.buddy_list;
		applied_list = user.applied_list;
		agree_list = user.agree_list;
		disagree_list = user.disagree_list;
        buddy_list.sort(compare("nickName"));
        applied_list.sort(compare("nickName"));
        let buddyPersonIdList = [];
        let buddyNickNameLIst = [];
        let buddyHeadImageUrlList = [];
        for(let i=0;i<buddy_list.length;i++){
            buddyPersonIdList.push(buddy_list[i].id);
            buddyNickNameLIst.push(buddy_list[i].nickName);
            buddyHeadImageUrlList.push(buddy_list[i].user.headImageUrl);
        }

        let appliedPersonIdList = [];
        let appliedNickNameLIst = [];
        let appliedHeadImageUrlList = [];
        for(let i=0;i<applied_list.length;i++){
            appliedPersonIdList.push(applied_list[i].id);
            appliedNickNameLIst.push(applied_list[i].nickName);
            appliedHeadImageUrlList.push(applied_list[i].user.headImageUrl);
        }

        let agreeNickNameLIst = [];
        let agreeHeadImageUrlList = [];
        for(let i=0;i<agree_list.length;i++){
            agreeNickNameLIst.push(agree_list[i].nickName);
            agreeHeadImageUrlList.push(agree_list[i].user.headImageUrl);
        }

        let disagreeNickNameLIst = [];
        let disagreeHeadImageUrlList = [];
        for(let i=0;i<disagree_list.length;i++){
            disagreeNickNameLIst.push(disagree_list[i].nickName);
            disagreeHeadImageUrlList.push(disagree_list[i].user.headImageUrl);
        }

        user.agree_list = [];
        user.disagree_list = [];
        userDao.update(user);

        res.json({
			successful: true,
			data: {
				buddy: {
                    personId: buddyPersonIdList,
                    nickname: buddyNickNameLIst,
                    headImageUrl: buddyHeadImageUrlList
				},
				applied: {
                    personId: appliedPersonIdList,
                    nickname: appliedNickNameLIst,
                    headImageUrl: appliedHeadImageUrlList
				},
				agree: {
                    nickname: agreeNickNameLIst,
                    headImageUrl: agreeHeadImageUrlList
				},
				disagree: {
                    nickname: disagreeNickNameLIst,
                    headImageUrl: disagreeHeadImageUrlList
				}
			}
		})
	}
};

const actionBuddyInfo = {
    handler(req, res) {
		const id = req.session.login.user;
		const personId = req.body.personId;
		if(id == undefined || personId == undefined) {
            res.json({
                successful: false
            });
            return;
        }
        const user = userDao.findOne({
            id: id
        });
        const personSelf = personDao.findOne({
            user: user
        });
        if(personSelf.id == personId){
            res.json({
                successful: false,
                error: 1002
            });
            return;
        }
        let state =0;
        for(let i=0;i<user.buddy_list.length;i++){
            if(user.buddy_list[i].id == personId){
                state = 1;
                break;
            }
        }
		let accomplishment = 0;
		let days = 0;
		const person = personDao.findOne({
			id: personId
		});
		const device = deviceDao.find({
			user: person.user.id
		});
		const sportHistory = sportHistoryDao.find({
			person: person.id,
			$sort: {
			    date: -1
			},
			$limit: 1
        });
        let updateTime = 0;
        if(sportHistory.length != 0){
            let month = sportHistory[0].date.getMonth() + 1;
            let day = sportHistory[0].date.getDate();
            let hour = sportHistory[0].date.getHours();
            let minute = sportHistory[0].date.getMinutes();
            let min = "";
            if(minute.toString().length == 1){
                min = "0"+minute.toString();
            }
            else{
                min = minute.toString();
            }
            updateTime = month+"月"+day+"日"+hour+":"+min+"更新";
        }
		if(person.accomplishment){
			accomplishment = person.accomplishment;

		}
        if(person.days){
			days = person.days;
		}


		let deviceList = [];
		// let distanceList = [];
		// let caloriesList = [];
		let totalStepList = [];
		let walkList = [];
		let runList = [];
		let upstairsList = [];
		let downstairsList = [];
		let sportTimeList = [];
		// let temperatureList = [];

		device.forEach(deviceIndex => {
			let sportRecord = sportRecordDao.find({
				device: deviceIndex.id,
				$sort: {
					date: -1
				},
				$limit: 1
			});
			deviceList.push(deviceIndex.id);
			if(sportRecord.length != 0){
				let date = new Date();
				let todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
				let date2 = sportRecord[0].date;
				let recordDate = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
				if(todayDate.getTime() == recordDate.getTime()){
					// distanceList.push(sportRecord[0].distance);
					// caloriesList.push(sportRecord[0].calories);
					totalStepList.push(sportRecord[0].step);
					// temperatureList.push(sportRecord[0].temperature);
					if( typeof(sportRecord[0].run) == 'number' ){
						walkList.push(sportRecord[0].walk);
						runList.push(sportRecord[0].run);
						upstairsList.push(sportRecord[0].upstairs);
						downstairsList.push(sportRecord[0].downstairs);
						sportTimeList.push(sportRecord[0].sportTime);
					}
					else{
						walkList.push(0);
						runList.push(0);
						upstairsList.push(0);
						downstairsList.push(0);
						sportTimeList.push(0);
					}
				}
				else{
					totalStepList.push(0);
					// distanceList.push(0);
					// caloriesList.push(0);
					walkList.push(0);
					runList.push(0);
                    upstairsList.push(0);
                    downstairsList.push(0);
					sportTimeList.push(0);
					temperatureList.push(0);
				}
			}
			else{
				totalStepList.push(0);
				// distanceList.push(0);
				// caloriesList.push(0);
				walkList.push(0);
				runList.push(0);
                upstairsList.push(0);
                downstairsList.push(0);
				sportTimeList.push(0);
				temperatureList.push(0);
			}
		});

        res.json({
            successful: true,
            data: {
                nickName: person.nickName,
                state: state,
                headImageUrl: person.user.headImageUrl,
                accomplishment: accomplishment,
				days: days,
				updateTime: updateTime,
				sportInfo: {
						stepTarget: person.step,
						// distance: distanceList,
						// calories: caloriesList,
						totalStep: totalStepList,
						walk: walkList,
						run: runList,
						upstairs: upstairsList,
						downstairsList: downstairsList,
						sportTime: sportTimeList,
						// temperature: temperatureList
				}
            }
        });
	}
}

const actionSubmitState = {
	handler(req, res) {
		const id = req.session.login.user;
		const personId = req.body.personId;
		const state = req.body.state;
        let user1 = userDao.findOne({
            id: id
        });
        const person1 = personDao.findOne({
            user: id
        });
        const person2 = personDao.findOne({
            id: personId
        });
        if(person2 == null) {
            res.json({
                successful: false
            });
            return;
        }
        let user2 = person2.user;

        if(state == 1){
            //同意
            if(!arrayPull(user1.applied_list, person2)){
                res.json({
                    successful: false
                });
                return
            }
            user1.buddy_list.push(person2);
            userDao.update(user1);
            outputLogger.info("agree update user1");
            if(!arrayPull(user2.apply_list, person1)){
                res.json({
                    successful: false
                });
                return
            }
            user2.buddy_list.push(person1);
            user2.agree_list.push(person1);
            userDao.update(user2);
            outputLogger.info("agree update user2");
        }
        else{
            //拒绝
            if(!arrayPull(user1.applied_list, person2)){
                res.json({
                    successful: false
                });
                return
            }
            userDao.update(user1);
            outputLogger.info("disagree update user1");
            if(!arrayPull(user2.apply_list, person1)){
                res.json({
                    successful: false
                });
                return
            }
            user2.disagree_list.push(person1);
            userDao.update(user2);
            outputLogger.info("disagree update user2");
        }
        res.json({
            successful: true
        });
	}
};

const actionChangeState = {
	handler(req, res) {
		const id = req.session.login.user;
		const personId = req.body.personId;
		const state = req.body.state;
        let user1 = userDao.findOne({
            id: id
        });
        const person1 = personDao.findOne({
            user: id
        });
        if(person1.id == personId){
            res.json({
                successful: false,
                error: 1002
            });
            return;
        }
        const person2 = personDao.findOne({
            id: personId
        });
        if(person2 == null) {
            res.json({
                successful: false
            });
            return;
        }
        let user2 = person2.user;

        if(state == 1){
            //申请
            for(let i=0;i<user1.apply_list.length;i++){
                if(user1.apply_list[i].id == personId){
                    res.json({
                        successful: false,
                        error: 1001
                    })
                    return;
                }
            }
            user1.apply_list.push(person2);
            userDao.update(user1);
            outputLogger.info("add update user1");
            user2.applied_list.push(person1);
            userDao.update(user2);
            outputLogger.info("add update user2");
        }
        else{
            //删除
            if(!arrayPull(user1.buddy_list, person2)){
                res.json({
                    successful: false
                });
                return
            }
            userDao.update(user1);
            outputLogger.info("drop update user1");
            if(!arrayPull(user2.buddy_list, person1)){
                res.json({
                    successful: false
                });
                return
            }
            userDao.update(user2);
            outputLogger.info("drop update user2");
        }
        res.json({
            successful: true
        });
	}
};


const actionTopReward_app = {
	handler(req, res) {
        let topPersonId = [];
        let topNickname = [];
		let topHeadImageUrl = [];
        let codes = 0;
        let topStep = [];
        let date = new Date();
        let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const TopSportHistory = sportHistoryDao.find({
            date: {
				   $gte: start
				},
            $sort: {
                historySteps: -1
			},
			$limit:3
		});

        for(let i=0;i<TopSportHistory.length;i++){
			topPersonId.push(TopSportHistory[i].person.id);
			let personId = TopSportHistory[i].person.id;
			const persons = personDao.findOne({
				id: personId
			});

			if(persons != null ){
			  if(i == 0 ){
				if(persons.creditTotal == null){
					persons.creditTotal = 5000;
					codes = 5000;
				}
				else
				{
					persons.creditTotal += 5000;  
					codes = 5000;
				}
			  }
			  else if(i == 1){
			    if(persons.creditTotal == null){
				   persons.creditTotal = 3000;
				   codes = 3000;
			    }
			    else
			    {
				   persons.creditTotal += 3000;  
				   codes = 3000;
			    }
			}
			else if(i == 2 ){
				if(persons.creditTotal == null){
					persons.creditTotal = 2000;
					codes = 2000;
				 }
				 else
				 {
					persons.creditTotal += 2000;  
					codes = 2000;
				 } 
			}

		    const RankRewardCount = RankRewardDao.count({
			    macAddress: TopSportHistory[i].device.macAddress,
			    creatTime:{
				    $gte: start
			    }
		    });
			   let RankRewardInfo = new RankReward({
				  user: persons.user,
				  macAddress: TopSportHistory[i].device.macAddress,
				  credit: codes,
				  creatTime: new Date()
			  });
	
			if(RankRewardInfo != null && RankRewardCount == 0){
				RankRewardDao.create(RankRewardInfo);
				personDao.update(persons);
			}
	      }
            topNickname.push(TopSportHistory[i].person.nickName);
            topStep.push(TopSportHistory[i].historySteps);
	 }
		outputLogger.info("query ranking list");
        res.json({
            successful: true,
            data: {
                    personId: topPersonId,
                    nickname: topNickname,
					step: topStep
                 }
           });
           return;
	}
};


const actionallRankingList = {
	handler(req, res) {
        let topPersonId = [];
        let topNickname = [];
        let topHeadImageUrl = [];
        let topStep = [];
        let date = new Date();
        let start = new Date(date.getFullYear(), date.getMonth(), date.getDate()-1);
        const TopSportHistory = sportHistoryDao.find({
            date: {
				   $gte: start
				},
            $sort: {
                historySteps: -1
			},
			$limit: 100
		});

        for(let i=0;i<TopSportHistory.length;i++){
			topPersonId.push(TopSportHistory[i].person.id);
            topNickname.push(TopSportHistory[i].person.nickName);
            topStep.push(TopSportHistory[i].historySteps);
		}
		outputLogger.info("query ranking list");
        res.json({
            successful: true,
            data: {
                    personId: topPersonId,
                    nickname: topNickname,
                    step: topStep
                 }
           });
           return
	}
};

const actionRankingList_app = {
	handler(req, res) {
        let topPersonId = [];
        let topNickname = [];
        let topHeadImageUrl = [];
        let topStep = [];
        let date = new Date();
        let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const TopSportHistory = sportHistoryDao.find({
            date: {
				   $gte: start
				},
            $sort: {
                historySteps: -1
			},
			$limit:3
		});

        for(let i=0;i<TopSportHistory.length;i++){
			topPersonId.push(TopSportHistory[i].person.id);
            topNickname.push(TopSportHistory[i].person.nickName);
            topStep.push(TopSportHistory[i].historySteps);
		}
		outputLogger.info("query ranking list");
        res.json({
            successful: true,
            data: {
                    personId: topPersonId,
                    nickname: topNickname,
                    step: topStep
                 }
           });
           return
	}
};

//返回首页图片的接口
const actionFirstImageInfo = {
	handler(req, res) {
		// let images = req.params.image;
	 res.json({
		successful: true,
		appleStoreUrl : "itms-apps://itunes.apple.com/cn/app/id1352165791?mt=8&action=write-review",
        startImage : "http://api.feelt-sport.com/image/advertisement/teamcompetition_20180605.jpg",
        version : 2018062101,
        versionInfor : "优化团队参赛以及鞋垫故障时，重启鞋垫操作"
	   });
	 return;
   }
};

//获取前十排行榜并返回当前用户积分奖励
// http://localhost:3000/person/5a6998f35096da2645ac474a/TenRewardRank
const actionTenRewardRank = {
	handler(req, res) {
        let topPersonId = [];
        let topNickname = [];
        let topHeadImageUrl = [];
		let topStep = [];
		let newSteps = [];
		let newSort = [];
		let newArr = [];
		let codes = 0;
		let userId = req.params.userId;
        let date = new Date();
        let currentTime = date.getHours()+ "" + date.getMinutes();
        let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const TopSportHistory = sportHistoryDao.find({
            date: {
				   $gte: start
				},
            $sort: {
				historySteps: -1
			},
			$limit:15
		});
        for(let i=0;i<TopSportHistory.length;i++){
			let personId = TopSportHistory[i].person.id;
			const persons = personDao.findOne({
				id: personId
			});

			if(persons != null  && currentTime > 800 && currentTime < 2359){
			  if(i == 0 ){
				if(persons.creditTotal == null){
					persons.creditTotal = 5000;
					codes = 5000;
				}
				else
				{
					persons.creditTotal += 5000;  
					codes = 5000;
				}
			  }
			  else if(i == 1){
				if(persons.creditTotal == null){
				   persons.creditTotal = 3000;
				   codes = 3000;
				}
				else
				{
				   persons.creditTotal += 3000;  
				   codes = 3000;
				}
			}
			else if(i == 2 ){
				if(persons.creditTotal == null){
					persons.creditTotal = 2000;
					codes = 2000;
				 }
				 else
				 {
					persons.creditTotal += 2000;  
					codes = 2000;
				 } 
			}
			else {
					persons.creditTotal += 0;  
					codes = 0;
				 } 
			
			const RankRewardCount = RankRewardDao.count({
				macAddress: TopSportHistory[i].device.macAddress,
				creatTime:{
					$gte: start
				}
			});
			   let RankRewardInfo = new RankReward({
				  user: persons.user,
				  macAddress: TopSportHistory[i].device.macAddress,
				  credit: codes,
				  creatTime: new Date()
			  });
			if(RankRewardInfo != null && RankRewardCount == 0 && codes > 0){
				RankRewardDao.create(RankRewardInfo);
				personDao.update(persons);
			}
		  }
           //判断用户数组里是否包含已经存在的用户id
			if(topPersonId.includes(TopSportHistory[i].person.id))
			{
				 let indexs = indexOf(topPersonId, TopSportHistory[i].person.id);
				 let steps = TopSportHistory[i].historySteps + TopSportHistory[indexs].historySteps;
				for (let i = 0, len = topPersonId.length; i < len; i++) {
					if (topPersonId[i] === TopSportHistory[indexs].person.id) {
						topStep.splice(i,1,steps) ;//将用户步数替换成累加后的步数
					}
				}
			}
			else{
				topPersonId.push(TopSportHistory[i].person.id);
				topNickname.push(TopSportHistory[i].person.nickName);
				topStep.push(TopSportHistory[i].historySteps);
			}
		}
		outputLogger.info(topPersonId);
		// topPersonId.forEach((currentValue,index)=>topStep[index])
       for(let x=0;x<topPersonId.length;x++){
		let historySport = sportHistoryDao.find({
			person: topPersonId[x],
			date:{
				$gte: start
			},
			$sort: {
				date: -1
			}
		});
	
		//多个终端的判断
		if(historySport.length != 0){
			let steps = 0;
			historySport.forEach(historySportIndex => {
				steps += historySportIndex.historySteps;
			});
			newSteps.push(steps);
		}
		else
		    newSteps.push(0);
       }
		outputLogger.info(newSteps);

		topNickname.forEach((currentValue,index)=>newSort.push({nickName:currentValue,step:newSteps[index]}));
		newArr = newSort.sort(compares);

		const user = userDao.findOne({
			id: userId
		});
		const person = personDao.findOne({
			user: user
		});
		const RankRewards = RankRewardDao.findOne({
			user: userId,
			creatTime:{
				$gte: start
			}
		});
		let rewardCredit = 0;
		let creditTotal = 0;
		let useCredit = 0;
		if(person != null){
			if(person.creditTotal !=null)
			   creditTotal = person.creditTotal;        //排行榜步数奖励积分
			if(person.useCredit != null)
			   useCredit = person.useCredit;
		}
		let ranktime = 0;
		let rankMacAddress = 0;
		if(RankRewards != null){
			if(RankRewards.credit !=null)
				rewardCredit =RankRewards.credit;        //排行榜步数奖励积分
			ranktime = RankRewards.creatTime;
			rankMacAddress = RankRewards.device.macAddress;
		}
        res.json({
            successful: true,
			data: newArr,
			reward:{
				userName: person.nickName,
				macAddress: rankMacAddress,
				credit: rewardCredit,
				creatTime: ranktime,
				creditTotal: creditTotal,
				useCredit: useCredit
			}	 
           });
           return
	}
};



const actionNewTopTenRankList_app = {
	handler(req, res) {
        let topPersonId = [];
        let topNickname = [];
        let topHeadImageUrl = [];
		let topStep = [];
		let newSteps = [];
		let newSort = [];
		let newArr = [];
        let codes = 0;
        let date = new Date();
        let currentTime = date.getHours()+ "" + date.getMinutes();
        let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const TopSportHistory = sportHistoryDao.find({
            date: {
				   $gte: start
				},
            $sort: {
				historySteps: -1
			},
			$limit:15
		});
        for(let i=0;i<TopSportHistory.length;i++){
			let personId = TopSportHistory[i].person.id;
			const persons = personDao.findOne({
				id: personId
			});

			if(persons != null  && currentTime > 800 && currentTime < 2359){
			  if(i == 0 ){
				if(persons.creditTotal == null){
					persons.creditTotal = 5000;
					codes = 5000;
				}
				else
				{
					persons.creditTotal += 5000;  
					codes = 5000;
				}
			  }
			  else if(i == 1){
				if(persons.creditTotal == null){
				   persons.creditTotal = 3000;
				   codes = 3000;
				}
				else
				{
				   persons.creditTotal += 3000;  
				   codes = 3000;
				}
			}
			else if(i == 2 ){
				if(persons.creditTotal == null){
					persons.creditTotal = 2000;
					codes = 2000;
				 }
				 else
				 {
					persons.creditTotal += 2000;  
					codes = 2000;
				 } 
			}
			else {
					persons.creditTotal += 0;  
					codes = 0;
				 } 
			
			const RankRewardCount = RankRewardDao.count({
				macAddress: TopSportHistory[i].device.macAddress,
				creatTime:{
					$gte: start
				}
			});
			   let RankRewardInfo = new RankReward({
				  user: persons.user,
				  macAddress: TopSportHistory[i].device.macAddress,
				  credit: codes,
				  creatTime: new Date()
			  });
			if(RankRewardInfo != null && RankRewardCount == 0 && codes > 0){
				RankRewardDao.create(RankRewardInfo);
				personDao.update(persons);
			}
		  }
           //判断用户数组里是否包含已经存在的用户id
			if(topPersonId.includes(TopSportHistory[i].person.id))
			{
				 let indexs = indexOf(topPersonId, TopSportHistory[i].person.id);
				 let steps = TopSportHistory[i].historySteps + TopSportHistory[indexs].historySteps;
				for (let i = 0, len = topPersonId.length; i < len; i++) {
					if (topPersonId[i] === TopSportHistory[indexs].person.id) {
						topStep.splice(i,1,steps) ;//将用户步数替换成累加后的步数
					}
				}
			}
			else{
				topPersonId.push(TopSportHistory[i].person.id);
				topNickname.push(TopSportHistory[i].person.nickName);
				topStep.push(TopSportHistory[i].historySteps);
			}
		}
		outputLogger.info(topPersonId);
		// topPersonId.forEach((currentValue,index)=>topStep[index])
       for(let x=0;x<topPersonId.length;x++){
		let historySport = sportHistoryDao.find({
			person: topPersonId[x],
			date:{
				$gte: start
			},
			$sort: {
				date: -1
			}
		});
	
		//多个终端的判断
		if(historySport.length != 0){
			let steps = 0;
			historySport.forEach(historySportIndex => {
				steps += historySportIndex.historySteps;
			});
			newSteps.push(steps);
		}
		else
		    newSteps.push(0);
       }
		outputLogger.info(newSteps);

		topNickname.forEach((currentValue,index)=>newSort.push({nickName:currentValue,step:newSteps[index]}));
		newArr = newSort.sort(compares);
        res.json({
            successful: true,
            data: newArr
           });
           return
	}
};

const actionTopTenRankList_app = {
	handler(req, res) {
        let topPersonId = [];
        let topNickname = [];
        let topHeadImageUrl = [];
		let topStep = [];
		let newSort = [];
        let codes = 0;
		let date = new Date();
        let currentTime = date.getHours()+ "" + date.getMinutes();
        let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const TopSportHistory = sportHistoryDao.find({
            date: {
				   $gte: start
				},
            $sort: {
                historySteps: -1
			},
			$limit:16
		});

        for(let i=0;i<TopSportHistory.length;i++){
			let personId = TopSportHistory[i].person.id;
			const persons = personDao.findOne({
				id: personId
			});

			if(persons != null && currentTime > 800 && currentTime < 2359){
			  if(i == 0 ){
				if(persons.creditTotal == null){
					persons.creditTotal = 5000;
					codes = 5000;
				}
				else
				{
					persons.creditTotal += 5000;  
					codes = 5000;
				}
			  }
			  else if(i == 1){
				if(persons.creditTotal == null){
				   persons.creditTotal = 3000;
				   codes = 3000;
				}
				else
				{
				   persons.creditTotal += 3000;  
				   codes = 3000;
				}
			}
			else if(i == 2 ){
				if(persons.creditTotal == null){
					persons.creditTotal = 2000;
					codes = 2000;
				 }
				 else
				 {
					persons.creditTotal += 2000;  
					codes = 2000;
				 } 
			}
			else {
					persons.creditTotal += 0;  
					codes = 0;
				 } 
			
			const RankRewardCount = RankRewardDao.count({
				macAddress: TopSportHistory[i].device.macAddress,
				creatTime:{
					$gte: start
				}
			});
			   let RankRewardInfo = new RankReward({
				  user: persons.user,
				  macAddress: TopSportHistory[i].device.macAddress,
				  credit: codes,
				  creatTime: new Date()
			  });
	
			if(RankRewardInfo != null && RankRewardCount == 0 && codes > 0){
				RankRewardDao.create(RankRewardInfo);
				personDao.update(persons);
			}
		  }
           //判断用户数组里是否包含已经存在的用户id
			if(topPersonId.includes(TopSportHistory[i].person.id))
			{
				 let indexs = indexOf(topPersonId, TopSportHistory[i].person.id);
				 let steps = TopSportHistory[i].historySteps + TopSportHistory[indexs].historySteps;
				for (let i = 0, len = topPersonId.length; i < len; i++) {
					if (topPersonId[i] === TopSportHistory[indexs].person.id) {
						topStep.splice(i,1,steps) ;//将用户步数替换成累加后的步数
					}
				}
			}
			else{
				topPersonId.push(TopSportHistory[i].person.id);
				topNickname.push(TopSportHistory[i].person.nickName);
				topStep.push(TopSportHistory[i].historySteps);
			}
		}
		topNickname.forEach((currentValue,index)=>newSort.push({nickName:currentValue,step:topStep[index]}));
		outputLogger.info(newSort.sort(compares));
		outputLogger.info("query ranking list");
        res.json({
            successful: true,
            data: {
                    personId: topPersonId,
                    nickname: topNickname,
					step: topStep
                 }
           });
           return
	}
};

var compares = function (obj1, obj2) {
	var val1 = obj1.step;
	var val2 = obj2.step;
	if (val1 > val2) {
		return -1;
	} else if (val1 < val2) {
		return 1;
	} else {
		return 0;
	}
}



 function compare(x, y) {//比较函数
	if (x < y) {
		return -1;
	} else if (x > y) {
		return 1;
	} else {
		return 0;
	}
}

function indexOf(arr, str){
    // 如果可以的话，调用原生方法
    if(arr && arr.indexOf){
        return arr.indexOf(str);
    }
     
    var len = arr.length;
    for(var i = 0; i < len; i++){
        // 定位该元素位置
        if(arr[i] == str){
            return i;
        }
    }
     
    // 数组中不存在该元素
    return -1;
}

const actionRankingList = {
	handler(req, res) {
		const id = req.session.login.user;
        const user = userDao.findOne({
            id: id
        });
        let topPersonId = [];
        let topNickname = [];
        let topHeadImageUrl = [];
        let topStep = [];
        let topState = [];
        let date = new Date();
        let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const TopSportHistory = sportHistoryDao.find({
            date: {
				$gte: start
				},
            $sort: {
                historySteps: -1
            }
        });
        for(let i=0;topPersonId.length<5;i++){
            let flag = 0;
            if(i < TopSportHistory.length){
                for(let j=0;j<topPersonId.length;j++){
                    if(topPersonId[j] == TopSportHistory[i].person.id){
                        flag = 1;
                        break;
                    }
                }
                if(flag){
                    continue;
                }
                topPersonId.push(TopSportHistory[i].person.id);
                topNickname.push(TopSportHistory[i].person.nickName);
                topHeadImageUrl.push(TopSportHistory[i].person.user.headImageUrl);
                topStep.push(TopSportHistory[i].historySteps);
                topState.push(0);
                for(let j=0;j<user.buddy_list.length;j++){
                    if(user.buddy_list[j].id == TopSportHistory[i].person.id){
                        topState[i] = 1;
                        break;
                    }
                }
            }
            else{
                break;
            }
        }

        let buddyList = [];
        let buddyPersonId = [];
        let buddyNickname = [];
        let buddyHeadImageUrl = [];
        let buddyStep = [];
        for(let i=0;i<user.buddy_list.length;i++){
            let thisPerson = {};
            let thisSportHistory = sportHistoryDao.find({
                person: user.buddy_list[i].id,
                date: {
				    $gte: start
				},
                $limit: 1
            });
            if(thisSportHistory.length != 0){
                thisPerson = {
                    personId: user.buddy_list[i].id,
                    nickname: user.buddy_list[i].nickName,
                    headImageUrl: user.buddy_list[i].user.headImageUrl,
                    step: thisSportHistory[0].historySteps
                };
            }
            else{
                thisPerson = {
                    personId: user.buddy_list[i].id,
                    nickname: user.buddy_list[i].nickName,
                    headImageUrl: user.buddy_list[i].user.headImageUrl,
                    step: 0
                };
            }
            buddyList.push(thisPerson);
        }
        buddyList.sort(compare("step"));

        for(let i=0;i<buddyList.length;i++){
            buddyPersonId.push(buddyList[i].personId);
            buddyNickname.push(buddyList[i].nickname);
            buddyHeadImageUrl.push(buddyList[i].headImageUrl);
            buddyStep.push(buddyList[i].step);
        }
        outputLogger.info("query ranking list");
        res.json({
            successful: true,
            data: {
                top: {
                    personId: topPersonId,
                    nickname: topNickname,
                    headImageUrl: topHeadImageUrl,
                    step: topStep,
                    state: topState
                },
                buddy: {
                    personId: buddyPersonId,
                    nickname: buddyNickname,
                    headImageUrl: buddyHeadImageUrl,
                    step: buddyStep
                }
            }
        });
        return
	}
};

const actionModifySkin = {
	handler(req, res) {
		const id = req.session.login.user;
		const skin = req.body.skin;
        if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }
		const user = userDao.findOne({
			id: id
		});
		const person = personDao.findOne({
			user: user
		});
		if(person == null){
            outputLogger.info('the person is null');
			res.json({
				successful: false
			});
			return;
		}
		person.skin = skin;
		personDao.update(person);
		outputLogger.info("modify skin");
		res.json({
		    successful: true
		});
		return;
	}
};

const actionModifyVersion = {
	handler(req, res) {
		const id = req.session.login.user;
        const deviceId = req.params.deviceId;
		const version = req.body.version;
        if(id == undefined) {
            res.json({
                successful: false
            });
            return;
        }
		const device = deviceDao.findOne({
            id: deviceId
        });
		if(device == null){
            outputLogger.info('the device is null');
			res.json({
				successful: false
			});
			return;
		}
		device.version = version;
		deviceDao.update(device);
		outputLogger.info("modify version");
		res.json({
		    successful: true
		});
		return;
	}
};


//查询分享信息
const actionGetShareInfo = {
	handler(req, res) {
		const userId = req.params.userId;
        const person = personDao.findOne({
			user: userId
		});
		if(person != null){
			res.json({
				successful: true,
				data : {
					totalCredit: person.totalCredit
				}	 
			});
		}
		else{
			res.json({
				successful: false
			})
		}
	}
};

//安卓端保存版本信息的方法  pengfeng  2017-11-13
const actionModifyVersion_app = {
	handler(req, res) {
        const macAddress = req.params.macAddress;
		const version = req.body.version;
		const device = deviceDao.findOne({
            macAddress: macAddress
		});
		
		if(device == null){
            outputLogger.info('the device is null');
			res.json({
				successful: false
			});
			return;
		}
		device.version = version;
		deviceDao.update(device);
		outputLogger.info("modify version");
		res.json({
		    successful: true
		});
		return;
	}
};

const actionGetPosition = {
	handler(req, res) {
		const cityList = cityDao.find({
		    $sort: {
		        rank: 1
		    }
        });
        let city = [];
        for(let i=0;i<cityList.length;i++){
            city.push({"name": cityList[i].name, "value": cityList[i].num});
        }
		outputLogger.info("city number", city.length);
		res.json({
		    successful: true,
		    data: city
		});
		return;
	}
};

const actionStatistics = {
	handler(req, res) {
	    const time = req.body.time;
		const mark = req.body.mark;
		let statistics = new Statistics({
		    time: time,
		    mark: mark
		});
		statisticsDao.create(statistics);
		let test = statisticsDao.find({
		    mark: mark
		})
		outputLogger.info("new statistics", statistics.toObject());
		res.json({
		    successful: true
		});
		return;
	}
};

//qq微信第三方登录方式 pengfeng   2017-11-20
const actionWechatQQLogin_app = {
	handler(req, res) {
    let openId = req.body.openId;
    let wechatUser = wechatUserDao.findOne({
		openId: openId
	});
	if(wechatUser != null){
		let person = personDao.findOne({
			user: wechatUser.user.id
		});
		if(person != null){
			res.json({
				successful: true,
				isInit:true,
				userId : wechatUser.user.id
			});
		}else{
			res.json({
				successful: true,
				isInit:false,
				userId : wechatUser.user.id
			});
		}
        return ;
	}
	else{
		res.json({
			successful: false,
			error:"wechat openId is not exist"
		});
        return ;
	}
  }
};

//上传图片的接口
const actionUploadImage ={
  handler(req, res) {
    if(req.files.image.path){
        var tmp_path = req.files.image.path;
        var img_url =  req.files.image.name;
        var formatImage = img_url;
        var target_path = './public/images/' + formatImage;
        fs.rename(tmp_path, target_path, function(err) {  // 移动文件
            if (err) throw err;
            // 删除临时文件夹文件,
            fs.unlink(tmp_path, function() {
                var imgurl = 'http://api.feelt-sport.com/images/' + formatImage;
				res.json({
					successful: true,
                    image_url: imgurl
				});
            });
        });
    }
  }
};


//qq微信第三方首次登录并绑定用户 pengfeng   2018-06-22
const actionWechatBind = {
	handler(req, res) {
	  let openId = req.body.openId;
	  let userName = req.body.userName;
	  let password = req.body.password;
	  let wechatUser = wechatUserDao.findOne({
		  openId: openId
	  });
	  if (wechatUser != null){
		 res.json({
			successful: false,
			error:"wechat is exist "
		 });
		 return ;
	  }

	let pass = hx_md5.md5(password);
	const user = userDao.findOne({
		loginName: userName,
		password : pass
	 });
	  if (openId == undefined) {
		  res.json({
			 successful: false,
			 error:"openId is undefined "
		  });
		  return ;
	  }
	  wechatUser = new WechatUser({
		  openId: openId,
		  user: user,
		  creatTime:new Date()
	  });
	  wechatUserDao.create(wechatUser);
	  res.json({
		  successful: true,
		  user: user.id
	  });
	  return;
	}
  };
  

//qq微信第三方首次登录并添加用户 pengfeng   2018-04-21
const actionWechatCreate_app = {
  handler(req, res) {
	let openId = req.body.openId;
	let nickName = req.body.nickname;
	let wechatUser = wechatUserDao.findOne({
		openId: openId
	});
	if (wechatUser != null){
	   res.json({
		  successful: false,
		  error:"wechat is exist "
       });
	   return ;
	}
    const role = roleDao.findOne({
	   name: 'user'
    });

	let password = hx_md5.md5("123");
    let user = new User({
		loginName: nickName,
		password: password
    });

	user.role = role;
	userDao.create(user);
	if (openId == undefined) {
		res.json({
		   successful: false,
		   error:"openId is undefined "
		});
		return ;
	}
	wechatUser = new WechatUser({
		openId: openId,
		user: user,
		creatTime:new Date()
    });
	wechatUserDao.create(wechatUser);
	res.json({
		successful: true,
		user: user.id
	});
	return;
  }
};

module.exports = {
    actionDeviceUnbound,
	actionDeviceUnbound_app,
	actionDeviceNewbound_app,
	actionDeviceBoundInfo,
	actionDeviceBoundInfo_app,
	actionDeviceboundList_app,
	actionGetPageInfo,
	actionGetPageInfo_app,
	actionNewAbstract,
	actionGetPersonInfo,
	actionGetPersonInfo_app,
    actionGetPersonDevices,
	actionUpdateInfo,
	actionUpdateInfo_app,
	actionUpdateCredit,
	actionCheckAdd,
	actionResetPassword,
	actionUpdatePassword,
	actionUpdateHeadImage,
	actionCheckInfo,
	actionCheckList,
	actionCheckSevenDayList,
	actionProductAdd,
	actionProductInfo,
	actionProductList,
	actionPersonHotList,
	actionPersonSportCount,
	actionTodaySport,
	actionWeekSport,
	actionTopSetpSport,
	actionMaxSetpList,
	actionCheckInfoList,
	actionAllPersonSport,
	actionExchangeAdd,
	actionExchangeStep,
	actionExchangeUserStep,
	actionNewExchangeStep,
	actionStepExchangeAdd,
	actionStepExchangeInfo,
	actionUserStepExchange,
	actionExchangeInfo,
	actionExchangeList,
	actionUpdateStep_app,
	actionWechatQQLogin_app,
	actionWechatCreate_app,
	actionWechatBind,
	actionUploadImage,
	actionInitUser,
	actionUserLogin,
	actionInitInfo,
	actionInitInfo_app,
	actionGetHistoryDistance,
	actionGetHistorySteps,
	actionGetHistoryCalories,
	actionPersonIsNull,
	actionGetSportModel,
	actionGetDeviceId,
	actionUserProfile,
	actionJumpTime,
	actionJumpAdd,
	actionPhoneAdd,
	actionSportMatchAdd,
	actionSportMatchStatue,
	actionSportMatchInfo,
	actionHistoryMatchInfo,
	actionSportMatchList,
	actionHistoryMatchList,
	actionAttendAdd,
	actionAttendList,
	actionAttendResult,
	actionAttendMatchList,
	actionAttendGroupAdd,
	actionAttendGroupExit,
	actionAttendGroupList,
	actionAttendGroupVerson,
	actionDeviceVerson,
	actionAttendGroupMatchList,
	attendGroupMatchScoreList,
	actionAttendGroupTotal,
	actionAttendGroupScoreList,
	attendGroupTotalScore,
	actionRankRewardAdd,
	actionResetAdd,
	actionResetInfo,
	actionMacResetList,
	actionAllResetList,
	actionRankRewardInfo,
	actionJumpInfo,
	actionPhoneInfo,
	actionPhoneList,
	actionJumpInfoList,
	actionUserProfile_app,
	actionSaveBatteryInfo,
	actionSaveBatteryInfo_app,
    actionSaveSportInfo,
	actionSaveSportInfo_app,
	actionNewSaveSportInfo_app,
	actionSaveMacSport,
	actionGetHistory,
	actionUserLastHistory,
	actionAllUserHistory,
	actionDoubleHistory,
	actionModifyRemark,
	actionModifyRemark_app,
	actionSaveGameScore,
	actionQueryBuddy,
	actionBuddyInfo,
    actionSubmitState,
    actionChangeState,
	actionRankingList,
	actionallRankingList,
	actionRankingList_app,
	actionTopTenRankList_app,
	actionNewTopTenRankList_app,
	actionTenRewardRank,
	actionFirstImageInfo,
	actionTopReward_app,
    actionModifySkin,
	actionModifyVersion,
	actionModifyVersion_app,
	actionGetShareInfo,
    actionGetPosition,
    actionStatistics
};