var config = require('../../utils/config.js');
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        productList: [],
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

        config.httpGet(app.getUrl('UserCenter/GetUserCollectionProduct'),
            {
                pageSize: that.data.pageSize,
                pageNo: that.data.pageNo,
                openId: that.data.openId
            }, function (res) {
                wx.hideLoading();
                if (res.success) {
                    var temp = isLoadMore ? that.data.productList : [];
                    temp = temp.concat(res.data);

                    that.setData({
                        productList: temp,
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
        app.addOrCancelFavoriteProduct(that, e, config);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.isNoMore) return;
        var pageNo = this.data.pageNo + 1;
        this.setData({ pageNo: pageNo });
        this.loadData(true);
    }
})