var config = require('../../utils/config.js');
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: '',
        openId: '',
        vshopInfo: {},
        qrcode: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            id: options.id
        });

        var that = this;
        that.setData({
            openId: app.globalData.openId
        });
        that.loadData();
        that.getWXCode();

    },

    loadData: function(isLoadMore, isHideLoading) {
        var that = this;

        if (!isHideLoading) {
            wx.showLoading({
                title: '',
                mask: true,
            });
        }

        config.httpGet(app.getUrl('VShop/GetVShopIntroduce'), {
            openId: that.data.openId,
            id: that.data.id
        }, function(res) {
            wx.hideLoading();
            if (res.success) {
                that.setData({
                    vshopInfo: res.data.result.VShop
                });
            } else {
                app.showErrorModal(res.msg);
            }
        })
    },

    getWXCode: function(callback) {
        var that = this;
        var path = 'pages/vShopHome/vShopHome?id=' + that.data.id;

        config.httpGet(app.getUrl('VShop/GetWxacode'), {
            pagePath: encodeURIComponent(path),
            width: 352
        }, function(res) {
            if (res.success) {
                that.setData({
                    qrcode: res.data
                });
            } else {
                app.showErrorModal(res.msg);
            }
        });
    },

    bindFavorite: function(e) {
        var that = this;
        app.addOrCancelFavoriteVshop(that, e, config);
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
    onShareAppMessage: function() {

    }
})