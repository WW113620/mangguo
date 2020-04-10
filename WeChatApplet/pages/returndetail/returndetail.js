// returndetail.js
var util = require('../../utils/util.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        RefundInfo: null,
        ProgressStatue: [],
        Credentials: [],
        isExpend: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            id: options.id
        });
        this.getReturnDetail();
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        if (this.data.id) {
            this.getReturnDetail();
        }
    },
    getReturnDetail:function(){
        var that = this;
        app.getOpenId(function (openid) {
            wx.request({
                url: app.getUrl(app.globalData.getReturnDetail),
                data: {
                    openId: openid,
                    returnId: that.data.id
                },
                success: function (result) {
                    result = result.data;
                    if (result.success) {
                        var temprefund = result.data;
                        that.setData({
                            RefundInfo: temprefund,
                            Credentials: temprefund.UserCredentials
                        });
                        wx.setNavigationBarTitle({
                            title: temprefund.IsOnlyRefund ? "退款详情" : "退货详情"
                        })
                        that.ShowProgress(temprefund);
                    } else {
                        if (result.code == '502') {
                            wx.navigateTo({
                                url: '../login/login'
                            })
                        }
                        else {
                            wx.showModal({
                                title: '提示',
                                content: result.msg,
                                showCancel: false,
                                success: function (res) {
                                    if (res.confirm) {
                                        wx.navigateBack({ delta: 1 })
                                    }
                                }
                            })
                        }
                    }
                }
            });
        });
    },
    prevImage: function (e) {
        var that = this,
            idx = e.target.dataset.index,
            current = e.target.dataset.src;

        wx.previewImage({
            current: current,
            urls: that.data.Credentials
        });
    },
    ExpendProgress: function () {
        this.setData({
            isExpend: !this.data.isExpend
        });
    },
    ShowProgress: function (refundInfo) {
        this.setData({
            ProgressStatue: refundInfo
        });
    },
    SendGood: function (e) {
        var id = e.currentTarget.dataset.id;
        var skuid = e.currentTarget.dataset.skuid;
        wx.navigateTo({
            url: '../applysendgood/applysendgood?id=' + id + '&&skuId=' + skuid
        });

    },
    goToProductDetail: function (e) {
        var that = this;
        var productid = e.currentTarget.dataset.productid;
        wx.navigateTo({
            url: '../productdetail/productdetail?id=' + productid
        });
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

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

    }
})