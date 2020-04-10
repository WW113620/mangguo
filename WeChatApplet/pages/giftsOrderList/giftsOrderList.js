var config = require("../../utils/config.js");
var app = getApp();
var openId;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageSize: 10,
        currentStatus: 0,
        showEmpty: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;
        this.initData();
        app.getOpenId(function(openid) {
            openId = openid;
            that.getOrderCount();
            that.getOrders();
        })
    },

    getOrderCount: function() {
        var that = this;
        config.httpGet(app.getUrl(app.globalData.getGiftsOrderCount), {
                openId: openId
            },
            function(res) {
                if (res.success) {
                    that.setData({
                        orderCount: res.data
                    });
                } else {
                    app.showErrorModal(res.msg);
                }
            })
    },

    getOrders: function() {
        var that = this;
        var params = {
            openId: openId,
            pageSize: that.data.pageSize,
            pageNo: that.data.pageNo
        };
        if (that.data.currentStatus != 0) {
            params.status = that.data.currentStatus;
        }

        var temp = that.data.orders;
        if (that.data.pageNo == 1) {
            temp = [];
        }
        wx.showLoading({
            title: '',
            mask: true,
        })
        config.httpGet(app.getUrl(app.globalData.getGiftsMyOrderList), params, function(res) {
            if (res.success) {
                temp = temp.concat(res.data.GiftOrders);
                that.data.total = res.data.Total;
                that.setData({
                    orders: temp,
                    showEmpty: res.data.Total == 0
                })
            } else {
                app.showErrorModal(res.msg);
            }
            wx.hideLoading();
        });
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        if (this.data.orders.length < this.data.total) {
            this.data.pageNo++;
            this.getOrders();
        }
    },

    bindLoadOrders: function(e) {
        var status = e.currentTarget.dataset.status;
        if (status == this.data.currentStatus) {
            return;
        }

        this.setData({
            currentStatus: status
        });
        this.initData();
        this.getOrders();
    },

    bindConfirmOrder: function(e) {
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
            success: function(res) {
                if (res.confirm) {
                    config.httpPost(app.getUrl(app.globalData.postGiftsConfirmOrderOver), {
                        openId: openId,
                        OrderId: id
                    }, function(res) {
                        app.showErrorModal(res.msg, function() {
                            if (res.success) {
                                that.setData({
                                    currentStatus: 5
                                })
                                that.initData();
                                that.getOrders();
                                that.getOrderCount();
                            }
                        });
                    })
                }
            },
        })
    },

    initData: function() {
        this.setData({
            pageNo: 1,
            total: 5,
            orders: []
        })
    },

    bindShowLogistics: function(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '../logistics/logistics?orderid=' + id + '&frompage=gift'
        })
    },

    bindOrderDetail: function(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '../giftOrderDetail/giftOrderDetail?id=' + id
        })
    }
})