var config = require("../../utils/config.js");
var app = getApp();
var openId;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showGotop: false,
        indexData: {},
        refreshFlag: false,
        pageLoaded: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.loadData();
    },

    loadData: function () {
        this.data.refreshFlag = false;
        var that = this;

        wx.showLoading({
            title: '正在加载...',
        });
        app.getOpenId(function (openid) {
            openId = openid;
            config.httpGet(app.getUrl(app.globalData.getGiftsIndexData), {
                openId: openid
            },
                function (res) {
                    wx.hideLoading();
                    if (res.success) {
                        that.setData({
                            indexData: res.data,
                            pageLoaded: true
                        });
                    }
                })
        }, "pointsShoppingCenter");
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        if (this.data.refreshFlag) {
            this.loadData();
        }
    },

    onPageScroll: function (e) {
        // Do something when page scroll
        var showGotop = e.scrollTop > 350;
        this.setData({
            'showGotop': showGotop
        });
    },
    bindGotop: function (e) {
        wx.pageScrollTo({
            scrollTop: 0,
            duration: 500,
        })
    },
    bindOpenUrl: function (e) {
        this.data.refreshFlag = true;
        var toUrl = e.target.dataset.url;
        var uu = app.getRequestUrl + '/m-wap/shopregisterjump/smallprogjump?' + 'toUrl=' + encodeURIComponent(toUrl);
        wx.navigateTo({
            url: "../outurl/outurl?url=" + encodeURIComponent(uu) + '&type=needLogin'
        });
    },
    bindMore: function (e) {
        this.data.refreshFlag = true;
        var pageUrl = e.currentTarget.dataset.type == '1' ? '../giftsList/giftsList' : '../integralCouponsList/integralCouponsList';
        wx.navigateTo({
            url: pageUrl,
        })
    },
    bindUserIntegral: function (e) {
        wx.navigateTo({
            url: '../userIntegral/userIntegral?integral=' + this.data.indexData.MemberAvailableIntegrals,
        });
    },
    goLogin: function (e) {
        this.data.refreshFlag = true;
        wx.navigateTo({
            url: '../login/login'
        });
    },
    bindGetUserCoupon: function (e) {
        var that = this;
        var couponItem = e.currentTarget.dataset.item;
        wx.showModal({
            content: '此券需要' + couponItem.NeedIntegral + '积分，是否兑换？',
            showCancel: true,
            cancelText: '取消',
            confirmText: '确定',
            confirmColor: '#fb1438',
            success: function (res) {
                if (res.confirm) {
                    app.getUserCoupon(couponItem.Id, function (res) {
                        if (res.success) {
                            that.loadData();
                        }
                    });
                }
            },
            fail: function (res) { },
            complete: function (res) { },
        })
    },
    bindGiftDetail: function (e) {
        wx.navigateTo({
            url: '../giftDetail/giftDetail?id=' + e.currentTarget.dataset.id,
        })
    }
})