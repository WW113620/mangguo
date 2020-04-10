// pages/groupcall/groupcall.js
var config = require("../../utils/config.js");
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        getRequestUrl: app.getRequestUrl,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that=this;
        config.httpGet(app.getUrl('FightGroup/GetFightGroupOrderDetail'), {
            id: options.id,
            openId: app.globalData.openId
        }, function (res) {
            res = res.data;
            that.setData({
                OrderDetail: res.OrderDetail,
                orderid: options.id
            });
        });
    },
    goGroupDetail(){
        if (this.data.OrderDetail.GroupStatus==1)
        wx.redirectTo({
            url: '../grouporderdetail/grouporderdetail?id=' + this.data.orderid,
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        var that = this;
        return {
            title: that.data.OrderDetail.LimitedNumber + '人团火拼团：' + that.data.OrderDetail.ProductName,
            path: '/pages/groupproduct/groupproduct?id=' + that.data.OrderDetail.ActiveId + '&grouId=' + that.data.OrderDetail.GroupId,
            imageUrl: that.data.OrderDetail.IconUrl,
            success: function (res) {
                // 转发成功
                wx.showToast({
                    title: "邀请好友成功",
                    icon: 'success',
                    duration: 2000
                })
            }
        }
    }
})