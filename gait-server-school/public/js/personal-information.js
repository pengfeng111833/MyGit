'use strict'

var personalInfoPageClass = {
    el: '#page-wrapper',
    data: {
        heightArray: [],
        weightArray: [],
        birthYearArray: [],
        sportsTargetArray: [],
        personalInfo: {
            nickName: '',
            height: '',
            weight: '',
            birthYear: '',
            gender: '',
            birth: '',
        },
        sportsTarget: {
            footSteps: 0,
        },
        headImageUrl: '',
    },
    methods: {
        heightClicked: function() {
            var self = this;
            weui.picker(this.heightArray, {
                onChange: function (result) {
                },
                onConfirm: function (result) {
                    self.personalInfo.height = result[0]; 
                    var request = new HttpRequest('/person/update');
                    request.postJSON({
                        nickName　: self.personalInfo.nickName,
                        sex : self.personalInfo.gender,
                        weight : parseInt(self.personalInfo.weight),
                        height : parseInt(self.personalInfo.height),
                        birthday : self.personalInfo.birth,
                        step : parseInt(self.sportsTarget.footSteps),
                    },function( res) {
                        if(res.successful == true){
                        }
                        else{
                            alert('更新错误');
                        }
                    });
                }
            });
        },
        weightClicked: function() {
            var self = this;
            weui.picker(this.weightArray, {
                onChange: function (result) {
                },
                onConfirm: function (result) {
                    self.personalInfo.weight = result[0];
                    var request = new HttpRequest('/person/update');
                    request.postJSON({
                        nickName　: self.personalInfo.nickName,
                        sex : self.personalInfo.gender,
                        weight : parseInt(self.personalInfo.weight),
                        height : parseInt(self.personalInfo.height),
                        birthday : self.personalInfo.birth,
                        step : parseInt(self.sportsTarget.footSteps),
                    },function( res) {
                        if(res.successful == true){
                        }
                        else{
                            alert('更新错误');
                        }
                    });
                }
            });
        },
        birthYearClicked: function() {
            var self = this;
            weui.picker(this.birthYearArray, {
                onChange: function (result) {
                },
                onConfirm: function (result) {
                    self.personalInfo.birthYear = result[0];
                    var request = new HttpRequest('/person/update');
                    request.postJSON({
                        nickName　: self.personalInfo.nickName,
                        sex : self.personalInfo.gender,
                        weight : parseInt(self.personalInfo.weight),
                        height : parseInt(self.personalInfo.height),
                        birthday : self.personalInfo.birth,
                        step : parseInt(self.sportsTarget.footSteps),
                    },function( res) {
                        if(res.successful == true){
                        }
                        else{
                            alert('更新错误');
                        }
                    });
                }
            });
        },
        genderClicked: function() {
            var self = this;
            weui.picker([{label:'男',value:'男'},{label:'女',value:'女'},], {
                onChange: function (result) {
                },
                onConfirm: function (result) {
                    self.personalInfo.gender = result[0];
                    var request = new HttpRequest('/person/update');
                    request.postJSON({
                        nickName　: self.personalInfo.nickName,
                        sex : self.personalInfo.gender,
                        weight : parseInt(self.personalInfo.weight),
                        height : parseInt(self.personalInfo.height),
                        birthday : self.personalInfo.birth,
                        step : parseInt(self.sportsTarget.footSteps),
                    },function( res) {
                        if(res.successful == true){
                        }
                        else{
                            alert('更新错误');
                        }
                    });
                }
            });
        },
        sportsTargetClicked: function() {
            var self = this;
            weui.picker(this.sportsTargetArray, {
                onChange: function (result) {
                },
                onConfirm: function (result) {
                    self.sportsTarget.footSteps = result[0];
                    var request = new HttpRequest('/person/update');
                    request.postJSON({
                        nickName　: self.personalInfo.nickName,
                        sex : self.personalInfo.gender,
                        weight : parseInt(self.personalInfo.weight),
                        height : parseInt(self.personalInfo.height),
                        birthday : self.personalInfo.birth,
                        step : parseInt(self.sportsTarget.footSteps),
                    },function( res) {
                        if(res.successful == true){
                        }
                        else{
                            alert('更新错误');
                        }
                    });
                }
            });
        },
    },
    created: function() {
        for( var i = 140; i <= 200; i ++) this.heightArray.push({label:i+'cm',value:i});
        for( var i = 30; i <= 100; i ++) this.weightArray.push({label:i+'kg',value:i});
        for( var i = 1930; i <= 2000; i ++) this.birthYearArray.push({label:i+'年',value:i});
        for( var i = 0; i <= 60000; i += 2000) this.sportsTargetArray.push({label:i+'步',value:i});

        var self = this;
        var request = new HttpRequest('/person/getUserInfo');
        request.getJSON(function(res) {
            if( res.successful == true ){
                self.personalInfo.birth = res.data.birthday;
                var date = new Date( res.data.birthday );
                self.personalInfo.nickName = res.data.nickName;
                self.personalInfo.height = parseInt(res.data.height);
                self.personalInfo.weight = parseInt(res.data.weight);
                self.personalInfo.birthYear = date.getFullYear().toString();
                self.personalInfo.gender = res.data.sex;
                self.sportsTarget.footSteps = parseInt(res.data.step);
                self.headImageUrl = res.data.headImageUrl;
                $('#myLoading').hide();
                $('#page-wrapper').show();
            }
        });
   }
}

Wechat.login(function(result) {

    var request = new HttpRequest('/person/personInfoIsNull');
    request.getJSON(function(res) {
        if(res.successful == false) {
            var personalInfoPage = new Vue(personalInfoPageClass);
        }
        else {
            alert('请先完善个人信息');
            window.location.href = Wechat.makeAuthUrl("/pages/complete-personal-information.html");
        }
    });

}, function(){
    alert('登录失败');
});
