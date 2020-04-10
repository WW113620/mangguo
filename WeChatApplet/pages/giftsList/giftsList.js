var config = require('../../utils/config.js');
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        gifts: [],
        openid: '',
        pageNo: 1,
        total: 20
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.loadGifts();
    },

    loadGifts: function() {
        var that = this;
        wx.showLoading({
            mask: true
        });
        config.httpGet(app.getUrl(app.globalData.getGiftsList), {
            openId: app.globalData.openId,
            pageSize: 20,
            pageNo: that.data.pageNo
        }, function(res) {
            wx.hideLoading();
            if (res.success) {
                var temp = that.data.gifts;
                temp = that.data.gifts.length == 0 ? res.data.Gifts : temp.concat(res.data.Gifts);
                that.setData({
                    gifts: temp,
                    total: res.data.Total,
                    pageNo: that.data.pageNo++
                })
            }
        })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        if (this.data.gifts.length < this.data.total) {
            loadGifts();
        }
    },

    bindGiftDetail: function(e) {
        wx.navigateTo({
            url: '../giftDetail/giftDetail?id=' + e.currentTarget.dataset.id,
        })
    }
})