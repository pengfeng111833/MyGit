'use strict'

var historyFootstepsPageClass = {
    el: '#page-wrapper',
    data: {
		device : ''
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
                var request = new HttpRequest('/device/' + self.device.id + '/history/steps');
                request.getJSON(function(res) {
                    if(res.successful == true){
                        var stepList = res.data.step;
                        $('#myLoading').hide();
                        $('#page-wrapper').show();
                        var myChart = echarts.init($('#chart-wrapper')[0]);
                        var option = {
                            title : {
                                left: 'center',
                                text: '历史运动步数',
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
                                    name:'卡路里数',
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
                                    data:stepList
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
            
            var historyFootstepsPage = new Vue(historyFootstepsPageClass);
            
        }
        else {
            alert('请先完善个人信息');
            window.location.href = Wechat.makeAuthUrl("/pages/complete-personal-information.html");
        }
    });
}, function(){
    alert('登录失败');
});
