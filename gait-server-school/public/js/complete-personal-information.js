'use strict'

var completePersonalInformationPageClass = {
    el: '#container',
    data: {
        personalInfo: {
            nickName: '',
            gender: '',
            weight: '',
            birthYear: '',
            height: ''
        },
        sportsTarget: {
            footSteps: 0 ,
            // kilometers: 0 ,
            // calorie: 0 ,
        },
        weightArray: [],
        birthYearArray: [],
        heightArray: [],
        footStepsArray: [],
    },
    methods: {
        showGenderPicker: function(){
            var self = this;
            console.log('111111');
            weui.picker([{label: '男',value: 0}, {label: '女',value: 1}], {
                onChange: function (result) {
                    console.log(result);
                },
                onConfirm: function (result) {
                    console.log(result);
                    switch(result[0])
                    {
                    case 0:
                        self.personalInfo.gender = '男';
                        console.log('男');
                        break;
                    case 1:
                        self.personalInfo.gender = '女';
                        console.log('女');
                        break;
                    default:
                        console.log('error');
                    }
                }
            }); 
        },
        showHeightPicker:function(){
            var self = this;
            weui.picker(this.heightArray, {
                onChange: function (result) {
                    console.log(result);
                },
                onConfirm: function (result) {
                    console.log(result);
                    self.personalInfo.height = self.heightArray[result[0]].label;
               }
            });
        },
        showWeightPicker:function(){
            var self = this;
            weui.picker(this.weightArray, {
                onChange: function (result) {
                    console.log(result);
                },
                onConfirm: function (result) {
                    console.log(result);
                    self.personalInfo.weight = self.weightArray[result[0]].label;

               }
            });            
        },
        showBirthYearPicker:function(){
            var self = this;
            weui.picker(this.birthYearArray, {
                onChange: function (result) {
                    console.log(result);
                },
                onConfirm: function (result) {
                    console.log(result);
                    self.personalInfo.birthYear = self.birthYearArray[result[0]].label;
               }
            });
        },
        showFootStepsPicker:function(){
            var self = this;
            weui.picker(this.footStepsArray, {
                onChange: function (result) {
                    console.log(result);
                },
                onConfirm: function (result) {
                    console.log(result);
                    self.sportsTarget.footSteps = self.footStepsArray[result[0]].label;
               }
            });

        },
        back: function() {
            window.location.href = Wechat.makeAuthUrl("/pages/home.html");
        },
        save: function() {
            var self = this;
            var nickName = $.trim( self.personalInfo.nickName );
            if(nickName == '' || self.personalInfo.gender == '' || self.personalInfo.weight == '' || self.personalInfo.height == '' || self.personalInfo.birthYear == '' ){
                alert('请填完所有信息');
            }
            else{
                var request = new HttpRequest('/person/complete');
                request.postJSON({
                                    nickName: nickName,
                                    sex: self.personalInfo.gender,
                                    weight: parseInt(self.personalInfo.weight),
                                    birthday: parseInt(self.personalInfo.birthYear),
                                    height: parseInt(self.personalInfo.height),
                                    step: parseInt(self.sportsTarget.footSteps)
                },function(res) {
                    if(res.successful === true)
                    {
                        alert("保存成功");
                        window.location.href = Wechat.makeAuthUrl("/pages/home.html");
                    }
                    else{
                        alert("保存失败");
                    }
                
                });
            }
        }

    },
    created: function() {
        for( var i = 120; i <= 200; i ++) this.heightArray.push({label:String(i)+' cm',value:i-120});
        for( var i = 30; i <= 100; i ++) this.weightArray.push({label:String(i)+' kg',value:i-30});
        for( var i = 1930; i <= 2017; i ++) this.birthYearArray.push({label:String(i)+' 年',value:i-1930});
        for( var i = 0; i <= 40000; i += 2000) this.footStepsArray.push({label:String(i)+' 步',value:(i/2000)});

        $('#myLoading').hide();
        $('#container').show();
        //这里写一个获取信息的func
    }
} 
Wechat.login(function(result) {
        var completePersonalInformationPage = new Vue(completePersonalInformationPageClass);
    }, function(){
        alert('登录失败');
});