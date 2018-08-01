'use strict'

const models = require('../modules/model/index');

const createFiber = require('fibers');


const fs = require('fs');
const iconv = require('iconv-lite');

const Device = models.Device;
const Person = models.Person;
const WechatUser = models.WechatUser;
const deviceDao = models.deviceDao;
const personDao = models.personDao;
const wechatUserDao = models.wechatUserDao;

function main() {
    let file = './data/openId.txt';
    let version = "1.5.0";
    let person = personDao.find({
    });
    for(let i=0;i<person.length;i++){
        if(person[i].devices.length == 0){
            let wechatUser = wechatUserDao.findOne({
                user: person[i].user.id
            });
            let arr = "";
            if(wechatUser == null){
                arr = person[i].nickName + "\n";
            }
            else{
                arr = wechatUser.openId + "\n";
            }
            fs.appendFile(file, arr, function(err){
                if(err)
                    console.log("fail " + err);
                else
                    console.log(arr);
            });
        }
        else{
            for(let j=0;j<person[i].devices.length;j++){
                let device = deviceDao.findOne({
                    id: person[i].devices[j].id
                });
                if(device.version != version){
                    let wechatUser = wechatUserDao.findOne({
                        user: person[i].user.id
                    });
                    let arr = "";
                    if(wechatUser == null){
                        arr = person[i].nickName + "\n";
                    }
                    else{
                        arr = wechatUser.openId + "\n";
                    }
                    fs.appendFile(file, arr, function(err){
                        if(err)
                            console.log("fail " + err);
                        else
                            console.log(arr);
                    });
                    break;
                }
            }
        }
    }
}

createFiber(main).run();