var config = require("../../utils/config.js");
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        orderDetail: {},

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var id = options.id;
        this.getOrderDetail(id);
    },

    getOrderDetail: function(id) {
        var that = this;
        wx.showLoading({
            title: '',
            mask: true,
        })
        app.getOpenId(function(openid) {
            config.httpGet(app.getUrl(app.globalData.getGiftsOrderDetail), {
                openId: openid,
                id: id
            }, function(res) {
                if (res.success) {
                    that.setData({
                        orderDetail: res.data
                    });
                } else {
                    app.showErrorModal(res.msg, function() {
                        wx.navigateBack({
                            delta: 1,
                        });
                    });
                }
                wx.hideLoading();
            })
        })
    },

    bindConfirmOrder: function (e) {
        var id = e.currentTarget.dataset.id;
        var that = this;
        wx.showModal({
            title: '确认收货',
            content: '请确保您已收到礼品，再收货！',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#212121',
            confirmText: '确定',
            confirmColor: '#fb1438',
            success: function (res) {
                if (res.confirm) {
                    config.httpPost(app.getUrl(app.globalData.postGiftsConfirmOrderOver), {
                        openId: app.globalData.openId,
                        OrderId: id
                    }, function (res) {
                        app.showErrorModal(res.msg, function () {
                            if (res.success) {
                                that.getOrderDetail(id);
                            }
                        });
                    })
                }
            },
        })
    },

    bindShowLogistics: function(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '../logistics/logistics?orderid=' + id + '&frompage=gift'
        })
    }
})