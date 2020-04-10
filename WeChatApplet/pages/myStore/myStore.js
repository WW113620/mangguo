var config = require("../../utils/config.js");
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var that = this;
        app.getOpenId(function (openid) {
            config.httpGet(app.getUrl(app.globalData.getMyShop),
                { openId: openid },
                function (res) {
                    if (res.success) {
                        that.setData({ myStoreInfo: res.data });
                        wx.setStorage({
                            key: 'myStoreInfo',
                            data: res.data,
                            success: function (res) { },
                            fail: function (res) { },
                            complete: function (res) { },
                        });
                    } else {
                        app.showErrorModal(res.msg);
                    }
                });
        }, "myStore")
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        var that = this;
        var shareMsg = {
            imageUrl: that.data.myStoreInfo.ShopLogo,
            title: that.data.myStoreInfo.ShopName,
            path: 'pages/home/home?distributorId=' + that.data.myStoreInfo.MemberId
        }
        return shareMsg;
    },
    bindMycommision: function () {
        wx.navigateTo({
            url: '../myCommision/myCommision',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
    },
    bindMySubordinates: function () {
        wx.navigateTo({
            url: '../mySubordinates/mySubordinates',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
    },
    bindDistributionMarket: function () {
        wx.navigateTo({
            url: '../distributionMarket/distributionMarket?navigationTitle=' + this.data.myStoreInfo.DistributorRenameMarket,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
    },
    bindMyStoreOrder: function () {
        wx.navigateTo({
            url: '../myStoreOrder/myStoreOrder',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
    },
    bindMyStoreSetting: function () {
        var myStoreInfo = this.data.myStoreInfo;
        wx.navigateTo({
            url: '../myStoreSetting/myStoreSetting?imgUrl=' + myStoreInfo.ShopLogo + '&shopName=' + myStoreInfo.ShopName + '&isShowLogo=' + myStoreInfo.IsShowLogo
        })
    }
})