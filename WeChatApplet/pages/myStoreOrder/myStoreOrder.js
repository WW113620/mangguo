var config = require("../../utils/config.js");
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageNo: 1,
        total: 10,
        pageLoaded:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.loadOrderList();
    },

    loadOrderList: function() {
        var that = this;
        wx.showLoading({
            title: '',
            mask: true
        })

        config.httpGet(app.getUrl(app.globalData.getShopOrder), {
            openId: app.globalData.openId,
            pageSize: 10,
            pageNo: that.data.pageNo
        }, function(res) {
            wx.hideLoading();
            if (res.success) {
                var temp = that.data.orders;
                if (temp) {
                    temp = temp.concat(res.data.rows);
                } else {
                    temp = res.data.rows;
                }
                that.setData({
                    orders: temp,
                    total: res.data.total,
                    pageLoaded:true
                });
            }
        });
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        if (this.data.orders && this.data.orders.length == this.data.total) {
            return;
        }

        this.data.pageNo++;
        this.loadOrderList();
    },

    bindToProductDetail: function(e) {
        var productId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '../productdetail/productdetail?id=' + productId,
            success: function(res) {},
            fail: function(res) {},
            complete: function(res) {},
        })
    }
})