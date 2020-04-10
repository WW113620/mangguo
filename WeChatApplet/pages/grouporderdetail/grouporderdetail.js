// pages/grouporderdetail/grouporderdetail.js
var config = require("../../utils/config.js");
var app = getApp();
var WxParse = require('../wxParse/wxParse.js');
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
        this.getData(options.id)
    },
    getData: function (id) {
        const that = this;
        config.httpGet(app.getUrl('FightGroup/GetFightGroupOrderDetail'), {
            id: id,
            openId: app.globalData.openId
        }, function (res) {
            res = res.data;
            var OverTime=(res.OrderDetail.Seconds < 3600 * 24 && res.OrderDetail.Seconds > 0) ? res.OrderDetail.OverTime.split('T')[1] : res.OrderDetail.OverTime.replace('T', ' ');
            res.OrderDetail.OverTime = OverTime;

            res.OrderDetail.UserInfo.forEach(function(item){
                item.JoinTime = item.JoinTime.replace('T',' ');
            });
            
            that.setData({
                OrderDetail: res.OrderDetail,
                ComCount: res.ComCount
            });

            if (res.ProductDescription) {
                WxParse.wxParse('ProductDescription', 'html', res.ProductDescription, that);
            }
        });
    },

    showComment(e) {
        wx.navigateTo({
            url: '../commentlist/commentlist?id=' + e.currentTarget.dataset.id
        })
    },

    bottomTap(e) {
        if (this.data.OrderDetail.GroupStatus!=0){
            wx.navigateTo({
                url: '../grouplist/grouplist'
            })
        }
        
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        var that = this;
        return {
            title: that.data.OrderDetail.LimitedNumber+'人团火拼团：' +that.data.OrderDetail.ProductName,
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