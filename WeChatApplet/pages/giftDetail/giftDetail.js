var config = require("../../utils/config.js");
var wxParse = require("../wxParse/wxParse.js");
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        detail: {},
        description: '',
        id: '',
        count: 1,
        pageLoaded:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var id = options.id;
        this.data.id = id;
        var that = this;
        config.httpGet(app.getUrl(app.globalData.getGiftsDetail), {
            openId: app.globalData.openId,
            id: id
        }, function(res) {
            if (res.success) {
                that.setData({
                    detail: res.data,
                    pageLoaded:true
                })
                wxParse.wxParse('description', 'html', res.data.Description, that);
            }
        })
    },

    bindConvert: function() {
        var that = this;
        app.getOpenId(function (openid) {
            config.httpGet(app.getUrl(app.globalData.getGiftsCanBuy), {
                openId: openid,
                id: that.data.id,
                count: that.data.count
            }, function(res) {
                if (res.success) {
                    wx.navigateTo({
                        url: '../submitGiftOrder/submitGiftOrder?id=' + that.data.id + "&count=" + that.data.count
                    })
                } else {
                    wx.showToast({
                        title: res.msg,
                        icon: 'none',
                        duration: 2000,
                        mask: true
                    })
                }
            })
        })
    },

    changeCount: function(e) {
        var id = e.currentTarget.id;
        var tempCount = this.data.count;
        if (id == 'sub' && tempCount > 1) {
            tempCount--;
        } else if (id == 'plus' && tempCount < this.data.detail.ShowLimtQuantity) {
            tempCount++;
        } else {
            return;
        }

        this.setData({
            count: tempCount
        });
    },
    inputCount(e){
        this.setData({
            count: e.detail.value
        });
    }
})