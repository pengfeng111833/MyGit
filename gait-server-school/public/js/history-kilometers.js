'use strict'

var historyKilometersPageClass = {
    el: '#page-wrapper',
    data: {

    },
    methods: {
        back: function() {
            redirectTo("sports-information.html");
        }
    },
    created: function() {
        var self = this;
        var deviceRequest = new HttpRequest('/person/devices');
        deviceRequest.getJSON(function (res) {
            if ( res.successful == true ){
                var devices = res.data.devices;
                if ( !devices.length ) {
                    return;
                }
                self.device = devices[0];
                var request = new HttpRequest('/device/' + self.device.id + '/history/distance');
                request.getJSON(function(res) {
                    if(res.successful == true){
                        var DistanceList = res.data.distance;
                        $('#myLoading').hide();
                        $('#page-wrapper').show();
                        var myChart = echarts.init($('#chart-wrapper')[0]);
                        var option = {
                            title : {
                                left: 'center',
                                text: '历史运动公里数',
                            },
                            grid : {
                                width: '80%',
                                right: '5%',
                            },
                            calculable : true,
                            xAxis : [
                                {
                                    type : 'category',
                                    boundaryGap : false,
                                    data : ['周一','周二','周三','周四','周五','周六','周日']
                                }
                            ],
                            yAxis : [
                                {
                                    type : 'value'
                                }
                            ],
                            series : [
                                {
                                    name:'公里数',
                                    // type:'line',
                                    // smooth:true,
                                    // itemStyle: {normal: {areaStyle: {type: 'default'}}},
                                    type:'line',
                                    smooth:true,
                                    symbol: 'none',
                                    sampling: 'average',
                                    itemStyle: {
                                        normal: {
                                            color: 'rgb(255, 70, 131)'
                                        }
                                    },
                                    areaStyle: {
                                        normal: {
                                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                                offset: 0,
                                                color: 'rgb(255, 158, 68)'
                                            }, {
                                                offset: 1,
                                                color: 'rgb(255, 70, 131)'
                                            }])
                                        }
                                    },
                                    data:DistanceList
                                },

                            ]
                        };
                        myChart.setOption(option);
                    }
                });
            }
        });
    }
}

Wechat.login(function(result) {

    var request = new HttpRequest('/person/personInfoIsNull');
    request.getJSON(function(res) {
        if(res.successful == false) {
            
            var historyKilometersPage = new Vue(historyKilometersPageClass);
            
        }
        else {
            alert('请先完善个人信息');
            window.location.href = Wechat.makeAuthUrl("/pages/complete-personal-information.html");
        }
    });
}, function(){
    alert('登录失败');
});
