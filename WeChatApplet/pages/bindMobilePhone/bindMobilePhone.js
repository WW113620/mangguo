var config = require("../../utils/config.js");
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        changePwd: false,
        cellPhone: '',
        imgCodeData: {},
        time:0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;
        var userInfo = wx.getStorageSync("userInfo");
        var tel = userInfo.CellPhone;
        this.setData({
            changePwd: (tel && tel.length > 0),
            cellPhone: tel,
            CellPhoneStr: tel?(tel.substr(0, 3) + '****' + tel.substr(7)):''
        });
        wx.setNavigationBarTitle({
            title: this.data.changePwd ? '重置交易密码' : '绑定手机',
        });
        that.loadImageCheckCode();
    },

    loadImageCheckCode: function() {
        var that = this;
        config.httpGet(app.getUrl(app.globalData.getImageCheckCode), {}, function(res) {
            if (res.success) {
                that.setData({
                    imgCodeData: res.data
                });
            }
        });
    },

    bindChangePwdFormSubmit: function(e) {
        var that = this;
        var id = e.detail.target.id;
        var password = e.detail.value.password;
        var pw = e.detail.value.pw;
        var checkCode = e.detail.value.checkCode;

        if (id == 'sendCode') {
            this.bindSendCheckCode();
            return;
        }

        if (password.length == 0 || pw.length == 0 || pw != password || checkCode.length == 0) {
            var msg = password.length == 0 ? '请输入新交易密码' : (pw.length == 0 ? '请输入确认交易密码' : (pw != password ? '交易密码输入不一致' : '请输入手机验证码'));
            wx.showToast({
                title: msg,
                icon: 'none',
                image: '',
                mask: true,
            })
            return;
        }

        this.verifyCheckCode(checkCode, function(certificate) {
            config.httpPost(app.getUrl(app.globalData.postChangePayPwd), {
                openId: app.globalData.openId,
                Certificate: certificate,
                Password: password
            }, function(res) {
                var msg = '新密码设置成功';
                if (!res.success) {
                    msg = res.msg;
                } else {
                    setTimeout(function() {
                        wx.navigateBack({
                            delta: 1,
                        });
                    }, 1500);
                }
                wx.showToast({
                    title: msg,
                    icon: 'none',
                    mask: true,
                });
            });
        })
    },

    verifyCheckCode: function(checkCode, successCallback) {
        var that = this;
        var url = this.data.changePwd ? app.getUrl(app.globalData.getCheckPhoneOrEmailCheckCode) : app.getUrl(app.globalData.bindGetCheckPhoneOrEmailCheckCode);
        var params = {
            openId: app.globalData.openId,
            checkCode: checkCode,
            contact: that.data.cellPhone
        };

        config.httpGet(url,
            params,
            function(res) {
                if (res.success && (successCallback instanceof Function)) {
                    successCallback(res.data);
                } else {
                    wx.showToast({
                        title: res.msg,
                        icon: 'none',
                        mask: true,
                    });
                }
            });
    },

    bindSendCheckCode: function(imgCode, checkBind) {
        if (this.data.time>0){
            return;
        }
        var params = {
            openId: app.globalData.openId,
            contact: this.data.cellPhone
        };
        if (imgCode) {
            params.id = this.data.imgCodeData.Id;
            params.imageCheckCode = imgCode;
            params.checkBind = true;
        }

        var that=this,
            url = this.data.changePwd ? app.getUrl(app.globalData.getPhoneOrEmailCheckCode) : app.getUrl(app.globalData.bindGetPhoneOrEmailCheckCode);
        config.httpGet(url,
            params,
            function(res) {
                var msg = '验证码已发送至您的手机';
                if (!res.success) {
                    msg = res.msg;
                }else{
                    that.setData({
                        time:60
                    });
                    that.setTimePlay();
                }
                wx.showToast({
                    title: msg,
                    icon: 'none',
                    duration: 2000,
                    mask: true,
                })
            });
    },

    setTimePlay() {
        var that = this;
        setInterval(function () {
            that.setData({
                time: that.data.time - 1
            })
        }, 1000);
    },

    bindMobileFormSubmit: function(e) {
        var that = this;
        var id = e.detail.target.id;
        var phone = e.detail.value.phone;
        var imgCode = e.detail.value.imgCode;
        var checkCode = e.detail.value.checkCode;
        this.setData({
            cellPhone: phone
        });

        if (id == 'sendCode' && phone.length > 0 && imgCode.length > 0) {
            this.bindSendCheckCode(imgCode, true);
            return;
        }

        if (phone.length == 0 || imgCode.length == 0 || checkCode.length == 0) {
            var msg = phone.length == 0 ? '请输入手机号码' : (imgCode.length == 0 ? '请输入图形验证码' : '请输入手机验证码');
            wx.showToast({
                title: msg,
                icon: 'none',
                image: '',
                mask: true,
            })
            return;
        }

        this.verifyCheckCode(checkCode, function(certificate) {
            var msg = '已成功绑定手机';
            var userInfo = wx.getStorageSync("userInfo");
            userInfo.CellPhone = phone;
            wx.setStorageSync("userInfo", userInfo);
            that.setData({
                changePwd: true
            });
            wx.showToast({
                title: msg,
                icon: 'none',
                mask: true,
            });
        })
    }
})