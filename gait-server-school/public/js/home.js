'use strict'


var homePageClass = {
    el : '#page-wrapper',
    data : {
        nickName : 'blend',
        headImageUrl : '',
        hasBinded : false,
        accomplishment : 0,
        boundInfo : '未绑定',
        temperature : '',
    },
    methods : {
        forwardToPersonalInfo : function() {
            window.location.href = Wechat.makeAuthUrl("/pages/personal-information.html");
        },
        forwardToSportsInfo : function() {
            window.location.href = Wechat.makeAuthUrl("/pages/sports-information.html");
        },
        forwardToHelp : function() {
            window.location.href = Wechat.makeAuthUrl("/pages/help.html");
        },
        forwardToDeviceInfo : function() {
            window.location.href = Wechat.makeAuthUrl("/pages/device-information.html");
        },
        forwardToGaitAnalysis : function() {
            window.location.href = Wechat.makeAuthUrl("/pages/gait-analysis.html");
        },
        deviceClicked: function(){
            if(this.hasBinded == true) this.forwardToDeviceInfo();
        }
    },
    created: function() {
        var self = this;
        var request = new HttpRequest('/person/abstract');
        request.getJSON(function(res) {
            if(res.successful == true){
                var info = res.data;
                self.nickName = info.nickName;
                self.headImageUrl = info.headImageUrl;
                self.accomplishment = info.accomplishment;
                self.temperature = info.temperature;
                self.hasBinded = info.boundInfo;
                if(self.hasBinded == false)self.boundInfo = '未绑定';
                else self.boundInfo = '已绑定';
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
            var homePage = new Vue(homePageClass);
        }
        else {
            alert('请先完善个人信息');
            window.location.href = Wechat.makeAuthUrl("/pages/complete-personal-information.html");
        }
    });

}, function(){
    alert('登录失败');
});
