var config = require('../../utils/config.js');
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        vshopList: [],
        pageNo: 1,
        pageSize: 10,
        total: 10,
        openId: '',
        isNoMore: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onShow: function (options) {
        var that = this;
        app.getOpenId(function (openid) {
            that.setData({ openId: openid });
            that.loadData();
        })
    },

    loadData: function (isLoadMore, isHideLoading) {
        var that = this;
        if (!isLoadMore) {
            this.setData({
                pageNo: 1
            });
        }
        if (!isHideLoading) {
            wx.showLoading({
                title: '',
                mask: true,
            });
        }

        config.httpGet(app.getUrl('UserCenter/GetUserCollectionShop'),
            {
                pageSize: that.data.pageSize,
                pageNo: that.data.pageNo,
                openId: that.data.openId
            }, function (res) {
                wx.hideLoading();
                if (res.success) {
                    var temp = isLoadMore ? that.data.vshopList : [];
                    temp = temp.concat(res.data);

                    that.setData({
                        vshopList: temp,
                        isNoMore: res.data.length < that.data.pageSize
                    });
                } else {
                    app.showErrorModal(res.msg);
                }
            })
    },

    bindProductDetail: function (e) {
        var id = e.currentTarget.dataset.id;

        wx.navigateTo({
            url: '../productdetail/productdetail?id=' + id
        })
    },

    bindFavorite: function (e) {
        var that = this;
        app.addOrCancelFavoriteVshop(that, e, config);
    },

    bindVshop: function (e) {
        var shopid = e.currentTarget.dataset.shopid;
        wx.navigateTo({
            url: '../vShopHome/vShopHome?id=' + shopid,
        })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.isNoMore) return;
        var pageNo = this.data.pageNo+1;
        this.setData({ pageNo: pageNo });
        this.loadData(true);
    }
})