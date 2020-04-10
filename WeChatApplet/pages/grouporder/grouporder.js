// pages/grouporder/grouporder.js
var config = require("../../utils/config.js");
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageNo: 1,
        isEnd: false,
        list: [],
        getRequestUrl: app.getRequestUrl,
        isEmpty:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getData()
    },
    getData: function () {
        const that = this;
        config.httpGet(app.getUrl('FightGroup/GetFightGroupOrderByUser'), {
            pageNo: that.data.pageNo,
            pageSize: 5,
            openId: app.globalData.openId
        }, function (res) {
            res = res.data.rows;
            if (that.data.pageNo == 1 && res.length == 0) {
                that.setData({
                    isEmpty: true
                });
            }
            if (res.length < 5) {
                that.setData({
                    isEnd: true
                });
            }
            that.setData({
                list: that.data.list.concat(res)
            });
        });
    },

    showDetail(e) {
        wx.navigateTo({
            url: '../grouporderdetail/grouporderdetail?id=' + e.currentTarget.dataset.id,
        })
    },

    showOrder(e) {
        wx.navigateTo({
            url: '../orderdetails/orderdetails?orderid=' + e.currentTarget.dataset.id,
        })
    },
    goGrouplist(e) {
        wx.redirectTo({
            url: '../grouplist/grouplist',
        })
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
        if (!this.data.isEnd) {
            this.setData({
                pageNo: this.data.pageNo + 1
            })
            this.getData()
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})