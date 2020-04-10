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
        openId: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onShow: function(options) {
        var that = this;
        that.setData({
            openId: app.globalData.openId
        });
        that.loadData();
    },

    loadData: function(isLoadMore, ishideLoading) {
        var that = this;
        if (!isLoadMore) {
            this.setData({
                pageNo: 1
            });
        }
        if (!ishideLoading) {
            wx.showLoading({
                title: '',
                mask: true,
            })
        }

        config.httpGet(app.getUrl('VShopHome/GetVShopHome'), {
            pageNo: that.data.pageNo,
            pageSize: that.data.pageSize,
            openId: that.data.openId
        }, function(res) {
            wx.hideLoading();
            if (res.success) {
                var temp = isLoadMore ? that.data.vshopList : [];
                if (!isLoadMore && res.TopVShop.Success=="true") {
                    temp.push(res.TopVShop);
                }
                temp = temp.concat(res.HotShop);

                that.setData({
                    vshopList: temp,
                    total: res.total
                });
            } else {
                app.showErrorModal(res.msg);
            }
        })
    },

    bindMore: function() {
        wx.navigateTo({
            url: '../vShopList/vShopList'
        })
    },

    bindVshop: function(e) {
        var shopid = e.currentTarget.dataset.shopid;
        wx.navigateTo({
            url: '../vShopHome/vShopHome?id=' + shopid,
        })
    },

    bindFavorite: function(e) {
        var that = this;
        app.addOrCancelFavoriteVshop(that, e, config);
    },

    bindProductDetail: function(e) {
        var id = e.currentTarget.dataset.id;

        wx.navigateTo({
            url: '../productdetail/productdetail?id=' + id
        })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        if (this.data.total <= this.data.vshopList.length) return;
        var pageNo = this.data.pageNo + 1;
        this.setData({
            pageNo: pageNo
        });
        this.loadData(true);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})