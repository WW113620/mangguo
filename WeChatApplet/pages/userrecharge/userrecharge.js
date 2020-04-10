// pages/userasset/userasset.js
var config = require("../../utils/config.js");
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that=this;
        app.getOpenId(function (openid) {
            that.setData({
            openId: openid
          });
        });
        var rule = JSON.parse(options.rule)
        this.setData({
            rule: rule,
            amount: rule[0].ChargeAmount
        })
    },
    checkAmount:function(e){
        this.setData({
            amount: e.currentTarget.dataset.amount
        })
    },
    submitRecharge: function () {
        var that = this;
        if (that.data.amount>99999){
            wx.showToast({
                title: '充值金额最大不能超过99999'
            });
        }
        config.httpPost(app.getUrl('MemberCapital/PostCharge'), {
            openId: that.data.openId,
            typeId: 'Himall.Plugin.Payment.WeiXinPay_SmallProg',
            amount: that.data.amount,
            ispresent: true
        }, function (res) {
            if (res.success) {
                var r = res.data;
                wx.requestPayment({
                    timeStamp: r.timeStamp,
                    nonceStr: r.nonceStr,
                    package: 'prepay_id=' + r.prepayId,
                    signType: 'MD5',
                    paySign: r.sign,
                    success: function (res) {
                        wx.showToast({
                            title: '充值成功'
                        });
                    },
                    fail: function (res) {

                    }
                });

            } else {
                app.showErrorModal(res.msg);
            }
        });
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

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.loadData();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})