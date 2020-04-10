var config = require("../../utils/config.js");
var app = getApp();

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        showPop: {
            type: Boolean,
            value: false
        },
        focusFlag: {
            type: Boolean,
            value: false
        }
    },

    /**
     * 组件的初始数据
     */
    data: {},

    /**
     * 组件的方法列表
     */
    methods: {
        bindCancel: function() {
            this.setData({
                showPop: false
            });
        },
        bindSubmitPayPassword: function(e) {
            var password = e.detail.value.password;
            var pw = e.detail.value.pw;
            var that = this;

            if (password.length == 0 || pw.length == 0 || pw != password) {
                var msg = password.length == 0 ? '请输入交易密码' : (pw.length == 0 ? '请输入确认密码' : '交易密码输入不一致');
                wx.showToast({
                    title: msg,
                    icon: 'none',
                    image: '',
                    mask: true,
                })
                return;
            }

            config.httpPost(app.getUrl(app.globalData.postInitPayPassowrd), {
                openId: app.globalData.openId,
                password: password
            }, function(res) {
                var msg = res.msg;
                if (res.success) {
                    msg = '密码设置成功';
                    that.triggerEvent('submitsuccess');
                    that.setData({
                        showPop: false
                    });
                }

                wx.showToast({
                    title: msg,
                    icon: 'none',
                    image: '',
                    mask: true,
                });
                
            });

        },
    }
})