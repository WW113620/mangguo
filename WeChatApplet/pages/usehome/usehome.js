// pages/usehome/usehome.js
var config = require("../../utils/config.js");
var app = getApp();

Page({
    data: {
        userInfo: {},
        isLogin: false,
        distributorInfo: {},
        distributionTitle: '我要开店'
    },
    onShow: function() {
        this.loadData();
    },
    loadData: function() {
        var that = this;
        app.getOpenId(function(openid) {
            if (openid) {
                config.httpGet(app.getUrl('UserCenter/GetUser'), {
                    openId: openid,
                    userkey: ""
                }, function(res) {
                    if (res.success) {
                        res.data.Photo = app.globalData.wxUserInfo.headImage ? app.globalData.wxUserInfo.headImage : res.data.Photo;
                        res.data.ShowBalance = "充值赠送";
                        res.data.ShowBalanceClass = "red";
                        if (!res.data.IsOpenRechargePresent) {
                            res.data.ShowBalance = res.data.Balance + "元";
                            res.data.ShowBalanceClass = "";
                        }
                        that.setData({
                            isLogin: true,
                            userInfo: res.data
                        });
                        wx.setStorageSync('userInfo', res.data);
                    }
                });

                config.httpGet(app.getUrl(app.globalData.getDistributor), {
                    openId: openid
                }, function(res) {
                    if (res.success) {
                        that.setData({
                            distributorInfo: res.data
                        })
                        if (res.data.DistributionStatus == 2) {
                            that.setData({
                                distributionTitle: "我的小店"
                            });
                        } else {
                            that.setData({
                                distributionTitle: "我要开店"
                            });
                        }
                    }
                });
            } else {
                that.setData({
                    isLogin: false
                });
            }
        }, "userhome");

    },
    bindUserTap: function(e) {
        var url = e.currentTarget.dataset.url;
        if (!this.data.isLogin) {
            url = '../login/login';
        }
        wx.navigateTo({
            url: url
        })
    },
    bindTelPhone: function(e) {
        var tel = e.currentTarget.dataset.tel;
        wx.makePhoneCall({
            phoneNumber: tel
        })
    },
    ExitLoginout: function() {
        var that = this;
        wx.showModal({
            title: '提示',
            content: '确定退出登录吗？',
            success: function(res) {
                if (res.confirm) {
                    wx.removeStorageSync('mallAppletOpenId');
                    wx.removeStorageSync("userInfo");
                    wx.removeStorageSync("distributorId");
                    app.globalData.wxUserInfo = null;
                    app.globalData.openId = "";
                    that.setData({
                        isLogin: false
                    });
                }
            }
        })
    },
    bindTelPhone: function(e) {
        var tel = e.currentTarget.dataset.tel;
        wx.makePhoneCall({
            phoneNumber: tel //仅为示例，并非真实的电话号码
        })
    },
    bindApplyDistributorTap: function(e) {
        var url = '../waitingForReview/waitingForReview?status=';
        var distributorInfo = this.data.distributorInfo;
        // distributorInfo.DistributionStatus = 4;
        if (distributorInfo.DistributionIsEnable) {
            switch (distributorInfo.DistributionStatus) {
                case 0:
                    url = "../applyDistributor/applyDistributor";
                    break;
                case 2:
                    url = "../myStore/myStore";
                    break;
                default:
                    url += distributorInfo.DistributionStatus;
            }
        } else {
            url += 5;
        }
        if (!this.data.isLogin) {
            url = '../login/login';
        }
        wx.navigateTo({
            url: url,
        })
    },
    bindFavorite: function(e) {
        var index = e.currentTarget.dataset.index;
        var url = '../favoriteProductList/favoriteProductList';
        if (!this.data.isLogin) {
            url = '../login/login';
        } else if (index == '1') {
            url = '../favoriteVshopList/favoriteVshopList';
        }

        wx.navigateTo({
            url: url
        });
    }
})