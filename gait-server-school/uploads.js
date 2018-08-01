'use strict';
var formidable = require('formidable');
var fs = require("fs");
var util = require("util");
// var sd = require("silly-datetime");
var path = require("path");

exports.upload = function (req, res) {
  //Creates a new incoming form.
  var form = new formidable.IncomingForm();
  //设置文件上传存放地址
  form.uploadDir = "./public/image/headimage/";
  //执行里面的回调函数的时候，表单已经全部接收完毕了。
  form.parse(req, function(err, fields, files) {
      //解析客户端过来的file对象
      var file = files["file"];
      //文件名称
      var date = new Date();
      var currentTime = date.getHours()+ "" + date.getMinutes()+ "" + date.getSeconds();
      var t = currentTime;
      //生成随机数
      var ran = parseInt(Math.random() * 8999 +10000);
         //拿到扩展名
         var extname = path.extname(file.name);
         //旧的路径
         var oldpath = __dirname + "/" + file.path;
         //新的路径
         var newpath = __dirname + '/public/image/headimage/'+ t+ran+extname;
      
         //改名
         fs.renameSync(oldpath,newpath);

        //  fs.rename(oldpath,newpath,function (err) {
        //  if(err){
        //     throw  Error("change name error");
        // }  
        // });
    //    所有的文本域、单选框，都在fields存放；
    //    所有的文件域，files

    res.writeHead(200, {'content-type': 'text/plain'});
    res.end(util.inspect({successful: true,fileName: t+ran+extname}));
  });
}
