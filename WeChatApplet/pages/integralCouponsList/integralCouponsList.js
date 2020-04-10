var config = require("../../utils/config.js");
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        integralCoupons: [],
        openid: '',
        pageNo: 1,
        total: 20
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.loadIntegralCoupons();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        if (this.data.integralCoupons.length < this.data.total) {
            this.loadIntegralCoupons();
        }
    },

    loadIntegralCoupons: function() {
        var that = this;
        wx.showLoading({
            mask: true
        });
        config.httpGet(app.getUrl(app.globalData.getIntegralCoupon), {
            openId: app.globalData.openId,
            pageSize: 20,
            pageNo: that.data.pageNo
        }, function(res) {
            wx.hideLoading();
            if (res.success) {
                var temp = that.data.integralCoupons;
                temp = that.data.integralCoupons.length == 0 ? res.data.Data : temp.concat(res.data.Data);
                that.setData({
                    integralCoupons: temp,
                    total: res.data.total,
                    pageNo: that.data.pageNo++
                })
            }
        })
    },

    bindGetUserCoupon: function(e) {
        var that = this;
        var couponItem = e.currentTarget.dataset.item;
        wx.showModal({
            content: '此券需要' + couponItem.NeedIntegral + '积分，是否兑换？',
            showCancel: true,
            cancelText: '取消',
            confirmText: '确定',
            confirmColor: '#fb1438',
            success: function(res) {
                if (res.confirm) {
                    app.getUserCoupon(couponItem.Id, function(res) {
                        if (res.success) {
                            that.loadData();
                        }
                    });
                }
            },
            fail: function(res) {},
            complete: function(res) {},
        })
    }
})