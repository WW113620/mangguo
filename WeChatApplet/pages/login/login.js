// pages/login/login.js
var app = getApp();
var islogin = true;
var distributorId;

Page({
    data: {
        disabled: true,
        userName: "",
        password: "",
        hidePwd: true,
        isauthed: true
    },
    onLoad: function (options) {
        var that = this;
        // 查看是否授权
        wx.getSetting({
            success: function (res) {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                } else {
                    that.setData({
                        isauthed: false
                    })
                }
            }
        })
    },
    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
        // 页面显示
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    },
    bindUserNameInput: function (e) {
        this.setData({
            userName: e.detail.value
        })
    },
    bindPwdInput: function (e) {
        this.setData({
            password: e.detail.value
        })
        if (this.data.userName.length > 0 && this.data.password.length > 0) {
            this.setData({
                disabled: false
            })
        }
        else {
            this.setData({
                disabled: true
            })
        }
    },
    showPwdChange: function () {
        this.setData({
            hidePwd: !this.data.hidePwd
        })
    },
    bindGetUserInfo: function (e) {
        var type = e.currentTarget.dataset.type;
        if (type == 'byuser') {
            this.loginbyUser();
        } else {
            islogin = true;
            this.quickLogin();
        }
    },
    loginbyUser: function (e) {
        //账号登录
        const uname = this.data.userName;
        const pwd = this.data.password;
        if (pwd.length < 6) {
            app.showErrorModal("密码长度不能少于6位");
            return;
        }
        wx.showLoading({
            title: '正在登录',
            mask: true
        })
        app.getWxUserInfo(function (wxUserInfo) {
            wx.request({
                url: app.getUrl("login/getLoginByUserName"),
                data: {
                    openId: wxUserInfo.openId,
                    userName: uname,
                    password: pwd,
                    nickName: wxUserInfo.nikeName,
                    unionId: wxUserInfo.unionId,
                    encryptedData: wxUserInfo.encryptedData,
                    session_key: wxUserInfo.session_key,
                    iv: wxUserInfo.iv
                },
                success: function (result) {
                    result = result.data;
                    wx.hideLoading();
                    if (result.success) {
                        //app.setUserInfo(result.data);
                        app.setUserInfo(wxUserInfo);
                        app.getUserCenterInfo();
                        wx.navigateBack();
                    } else {
                        app.showErrorModal(result.msg);
                    }
                }
            })
        })
    },
    quickLogin: function (e) {
        //信任登录
        distributorId = wx.getStorageSync("distributorId");
        wx.showLoading({
            title: '登录中',
            mask: true,
        })
        app.getWxUserInfo(function (wxUserInfo) {
            var params = {
                openId: wxUserInfo.openId,
                nickName: wxUserInfo.nikeName,
                unionId: wxUserInfo.unionId,
                headImage: wxUserInfo.headImage,
                encryptedData: wxUserInfo.encryptedData,
                session_key: wxUserInfo.session_key,
                iv: wxUserInfo.iv
            };
            if (distributorId) {
                params.spreadId = distributorId;
            }

            wx.request({
                url: app.getUrl("Login/GetQuickLogin"),
                data: params,
                success: function (result) {
                    result = result.data;
                    wx.hideLoading();
                    if (result.success) {
                        //app.setUserInfo(result.data);
                        app.setUserInfo(wxUserInfo);
                        wx.navigateBack();
                        app.getUserCenterInfo();
                    }
                }
            })
        })
    }
})