'use strict'

var sportsInfoPageClass = {
    el: '#page-wrapper',
    data: {
        fontStyle: {
            footStepsClass: 'selected',
            kilometersClass: 'normal',
            calorieClass: 'normal'
        },
        circleStyle: {
            c1Color: 'circle-selected',
            c2Color: '',
            c3Color: ''
        },
        sportsTarget: {
            quantity: '',
            unit: '步数'
        },
        sportsData: {
            footSteps: '',
            kilometers: '',
            calorie: '',
            percent: '',
        },
        rotateParam: {
            rotateFrom: 0,
            rotateTo: 0,
        },
        current: 'footSteps',
		device : '',
        testFootSteps : 9000,
        downMutex: false,
        upMutex: false,
    },
    methods: {
        back: function() {
            window.location.href = Wechat.makeAuthUrl("/pages/home.html");
        },
        forwardToFootsteps: function() {
            window.location.href = Wechat.makeAuthUrl("/pages/history-footsteps.html");
        },
        forwardToKilometers: function() {
            window.location.href = Wechat.makeAuthUrl("/pages/history-kilometers.html");
        },
        forwardToCalorie: function() {
            window.location.href = Wechat.makeAuthUrl("/pages/history-calorie.html");
        },
        c1Clicked: function() {
            this.current = 'footSteps';
            this.fontStyle.footStepsClass = 'selected';
            this.fontStyle.kilometersClass = 'normal';
            this.fontStyle.calorieClass = 'normal';
            this.circleStyle.c1Color = 'circle-selected';
            this.circleStyle.c2Color = '';
            this.circleStyle.c3Color = '';
            this.sportsTarget.quantity = this.sportsData.footSteps;
            this.sportsTarget.unit = '步数';
        },
        c2Clicked: function() {
            this.current = 'kilometers';
            this.fontStyle.footStepsClass = 'normal';
            this.fontStyle.kilometersClass = 'selected';
            this.fontStyle.calorieClass = 'normal';
            this.circleStyle.c1Color = '';
            this.circleStyle.c2Color = 'circle-selected';
            this.circleStyle.c3Color = '';
            this.sportsTarget.quantity = this.sportsData.kilometers;
            this.sportsTarget.unit = '公里';
        },
        c3Clicked: function() {
            this.current = 'calorie';
            this.fontStyle.footStepsClass = 'normal';
            this.fontStyle.kilometersClass = 'normal';
            this.fontStyle.calorieClass = 'selected';
            this.circleStyle.c1Color = '';
            this.circleStyle.c2Color = '';
            this.circleStyle.c3Color = 'circle-selected';
            this.sportsTarget.quantity = this.sportsData.calorie;
            this.sportsTarget.unit = '大卡';
        },
    },
    created: function() {
        var self = this;
		var deviceRequest = new HttpRequest('/person/devices');
		deviceRequest.getJSON(function (res) {
			if ( res.successful == true ){
                console.log('res', res.data);
				var devices = res.data.devices;
                console.log('devices', devices.length);
                if ( !(devices.length) ) {
                    alert('未绑定设备');
                    window.location.href = Wechat.makeAuthUrl("/pages/home.html");

                    return;
                }
                self.device = devices[0];

                var request = new HttpRequest('/device/' + self.device.id + '/sport_info');
                request.getJSON(function(res) {
                    if(res.successful == true){
                        //self.sportsData.footSteps = self.testFootSteps;

                        self.sportsData.footSteps = res.data.walk;
                        self.sportsData.kilometers = (res.data.distance).toFixed(3);
                        self.sportsData.calorie = (res.data.calories).toFixed(2);
                        //var cacuPercent = (parseFloat(self.testFootSteps)/parseFloat(res.data.step)*100).toFixed(2);
                        var cacuPercent = (res.data.step == 0 ? 0 : (parseFloat(res.data.walk)/parseFloat(res.data.step)*100).toFixed(2));

                        if(cacuPercent > 100)
                            self.sportsData.percent = 100;
                        else 
                            self.sportsData.percent = cacuPercent; 
                        self.sportsTarget.quantity = res.data.walk;
                        
                        $('#myLoading').hide();
                        $('#page-wrapper').show();
                        //播放旋转动画        
                        $('.circle').each(function(index, el) {
                            var num = self.sportsData.percent * 3.6;
                            if (num<=180) {
                                self.rotateParam.rotateTo = num;
                                $(this).find('.right').rotate({ 
                                                                animateFrom: self.rotateParam.rotateFrom,
                                                                animateTo: self.rotateParam.rotateTo,
                                                                duration: 1000,
                                                                easing: $.easing.easeInCirc
                                });
                                self.rotateParam.rotateFrom = self.rotateParam.rotateTo;
                            } 
                            else {
                                var left = $(this).find('.left');
                                self.rotateParam.rotateTo = num-180;
                                window.setTimeout(function() {
                                    left.rotate({
                                            animateFrom: self.rotateParam.rotateFrom,
                                            animateTo: self.rotateParam.rotateTo,
                                            duration: 1000,
                                            easing: $.easing.easeInCirc
                                    });
                                    self.rotateParam.rotateFrom = self.rotateParam.rotateTo;
                                },1000);
                                $(this).find('.right').rotate({
                                                                angle:0,
                                                                animateTo: 180,
                                                                duration: 1000,
                                                                easing: $.easing.easeInOutExpo,
                                });
                            }
                        });
               //         self.testFootSteps += 100;
                    }   
                });
                setInterval(function() {
                    var timerRequest = new HttpRequest('/device/' + self.device.id + '/sport_info');
                    timerRequest.getJSON(function(res) {
                        if(res.successful == true){
                            self.sportsData.footSteps = res.data.walk;
                        //    self.sportsData.footSteps = self.testFootSteps;
                            self.sportsData.kilometers = (res.data.distance).toFixed(3);
                            self.sportsData.calorie = (res.data.calories).toFixed(2);
                            var cacuPercent = (res.data.step == 0 ? 0 : (parseFloat(res.data.walk)/parseFloat(res.data.step)*100).toFixed(2));
                           // var cacuPercent = ((parseFloat(res.data.walk)/parseFloat(res.data.step)) * 100).toFixed(2);
                         //   var cacuPercent = ((parseFloat(self.testFootSteps)/parseFloat(res.data.step)) * 100).toFixed(2);
                           
                            if(cacuPercent > 100)
                                self.sportsData.percent = 100;
                            else 
                                self.sportsData.percent = cacuPercent; 

                            if(self.current === 'footSteps')self.sportsTarget.quantity = self.sportsData.footSteps;
                            else if(self.current === 'kilometers')self.sportsTarget.quantity = self.sportsData.kilometers;
                            else if(self.current === 'calorie')self.sportsTarget.quantity = self.sportsData.calorie;
                            //播放旋转动画        
                            $('.circle').each(function(index, el) {
                                var num = self.sportsData.percent * 3.6;
                                if (num<=180) {
                                    self.rotateParam.rotateTo = num;
                                    $(this).find('.right').rotate({ 
                                                                    animateFrom: self.rotateParam.rotateFrom,
                                                                    animateTo: self.rotateParam.rotateTo,
                                                                    duration: 1000,
                                                                    easing: $.easing.easeInCirc
                                                                });
                                    self.rotateParam.rotateFrom = self.rotateParam.rotateTo;
                                } 
                                else {
                                    var left = $(this).find('.left');
                                    self.rotateParam.rotateTo = num-180;
                                    left.rotate({
                                            animateFrom: self.rotateParam.rotateFrom,
                                            animateTo: self.rotateParam.rotateTo,
                                            duration: 1000,
                                            easing: $.easing.easeInCirc
                                    });
                                    self.rotateParam.rotateFrom = self.rotateParam.rotateTo;
                                }   
                            });
                        }
                    });
                    //self.testFootSteps += 100;
                },2000);
            }
		});
        var startX,startY,moveEndX,moveEndY;
        $(".bd-container").on("touchstart", function(e) {
            if(!self.downMutex){
                self.downMutex = true;
                startX = e.originalEvent.changedTouches[0].pageX,
                startY = e.originalEvent.changedTouches[0].pageY;
            }
            return false;
        });
        //添加滑动事件
        $(".bd-container").on("touchend", function(e) {
            if(!self.upMutex){
                self.upMutex = true;
                moveEndX = e.originalEvent.changedTouches[0].pageX;
                moveEndY = e.originalEvent.changedTouches[0].pageY;
                var X = moveEndX - startX;
                if ( X < 0 ) {
                    //left to right
                    //当前是步数
                    if(self.current === 'footSteps')
                    {
                        self.current = 'kilometers';
                        self.fontStyle.footStepsClass = 'normal';
                        self.fontStyle.kilometersClass = 'selected';
                        self.fontStyle.calorieClass = 'normal';
                        self.circleStyle.c1Color = '';
                        self.circleStyle.c2Color = 'circle-selected';
                        self.circleStyle.c3Color = '';
                        self.sportsTarget.quantity = self.sportsData.kilometers;
                        self.sportsTarget.unit = '公里';
                    }
                    else if(self.current === 'kilometers'){
                        self.current = 'calorie';
                        self.fontStyle.footStepsClass = 'normal';
                        self.fontStyle.kilometersClass = 'normal';
                        self.fontStyle.calorieClass = 'selected';
                        self.circleStyle.c1Color = '';
                        self.circleStyle.c2Color = '';
                        self.circleStyle.c3Color = 'circle-selected';
                        self.sportsTarget.quantity = self.sportsData.calorie;
                        self.sportsTarget.unit = '大卡';
                    }
                }
                else if ( X > 0 ) {
                    //right to left
                    if(self.current === 'calorie'){
                        self.current = 'kilometers';
                        self.fontStyle.footStepsClass = 'normal';
                        self.fontStyle.kilometersClass = 'selected';
                        self.fontStyle.calorieClass = 'normal';
                        self.circleStyle.c1Color = '';
                        self.circleStyle.c2Color = 'circle-selected';
                        self.circleStyle.c3Color = '';
                        self.sportsTarget.quantity = self.sportsData.kilometers;
                        self.sportsTarget.unit = '公里';
                    }
                    else if(self.current === 'kilometers'){
                        self.current = 'footSteps';
                        self.fontStyle.footStepsClass = 'selected';
                        self.fontStyle.kilometersClass = 'normal';
                        self.fontStyle.calorieClass = 'normal';
                        self.circleStyle.c1Color = 'circle-selected';
                        self.circleStyle.c2Color = '';
                        self.circleStyle.c3Color = '';
                        self.sportsTarget.quantity = self.sportsData.footSteps;
                        self.sportsTarget.unit = '步数';
                    }
                }

                setTimeout(function(){ self.downMutex = false; self.upMutex = false },200);

            }
            return false;
        });

    }
}

Wechat.login(function(result) {
    Wechat.applyJsConfig(function() {
        openWXDeviceLib(function(res) {
            var deviceRequest = new HttpRequest('/person/devices');
            deviceRequest.getJSON(function( res ){
                var devices = res.data.devices;
                var device = devices[0];
                var deviceId = device.wechatId;
                connectWXDevice(deviceId, function(res){
                    console.log('connectres',res);
                    var insoleMessage = new InsoleMessage({head:{},body:{},});
                    insoleMessage.initRequest({
                        seq: 0,
                        body: new ArrayBuffer(0),
                        command: InsoleHead.Command.JSSDKReq,
                    });
                    var binary = insoleMessage.ToBase64();
                    bindReceiveDataEvent( device );
                    sendDataToWXDevice(deviceId, binary, function( res ){
                        console.log('发送数据');
                    });
                    // setInterval( function(){
                    //     sendDataToWXDevice(deviceId, binary, function( res ){
                    //         console.log('发送数据');
                    //     });
                    //         //发送数据
                    // } ,10000);
                });
            });
        });
    },function(err) {
        alert("配置微信JDK错误");
    });
    var request = new HttpRequest('/person/personInfoIsNull');
    request.getJSON(function(res) {
        if(res.successful == false) {
			
            var sportsInfoPage = new Vue(sportsInfoPageClass);
			
        }
        else {
            alert('请先完善个人信息');
            window.location.href = Wechat.makeAuthUrl("/pages/complete-personal-information.html");
        }
    });
}, function(){
    alert('登录失败');
});

