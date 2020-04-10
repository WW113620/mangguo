var config = require("../../utils/config.js");
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        categoryIndex: 0,
        categories: [{ Id: '-1', Name: '全部商品' }],
        products: [],
        openid: '',
        pageNo: 1,
        searchKey: '',
        total: 20
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        wx.setNavigationBarTitle({
            title: options.navigationTitle,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        });
        app.getOpenId(function (openid) {
            that.setData({ openid: openid });
            config.httpGet(app.getUrl(app.globalData.getMarketCategory),
                { openId: openid },
                function (res) {
                    if (res.success) {
                        that.setData({ categories: that.data.categories.concat(res.data) });
                        that.loadProductList(that.data.categories[0].Id)
                    }
                });
        }, "distributionMarket");
    },

    loadProductList: function (categoryId) {
        var that = this;
        wx.showLoading({
            title: '',
            mask: true,
        });
        config.httpGet(app.getUrl(app.globalData.getProductList),
            {
                openId: that.data.openid,
                categoryId: (categoryId != '-1' ? categoryId : ''),
                productName: that.data.searchKey,
                pageSize: 20,
                pageNo: that.data.pageNo
            },
            function (res) {
                if (res.success) {
                    var products = that.data.products;
                    products = products.concat(res.data.rows);
                    that.setData({
                        products: products,
                        total: res.data.total
                    });
                }
                wx.hideLoading();
            });
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    bindScrollToLower: function (e) {
        if (this.data.products.length == this.data.total) {
            return;
        }

        this.data.pageNo++;
        this.loadProductList(this.data.categories[this.data.categoryIndex].Id);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (options) {
        var distributorId = wx.getStorageSync("userInfo").UserId;
        var dataset = options.target.dataset;
        var title = dataset.title;
        var path = '/pages/productdetail/productdetail?id=' + dataset.id + '&distributorId=' + distributorId;
        var imgUrl = dataset.imgurl;
        return {
            title: title,
            path: path,
            imageUrl: imgUrl
        }
    },

    initProductData: function () {
        this.data.products = [];
        this.setData({
            pageNo: 1,
            total: 20
        });
    },

    bindCategoryItemTap: function (e) {
        var currentIndex = e.currentTarget.dataset.index;
        if (currentIndex == this.data.categoryIndex) return;
        var categoryId = e.currentTarget.dataset.id;
        this.initProductData();
        this.setData({
            categoryIndex: currentIndex
        });
        this.loadProductList(categoryId);
    },

    bindSearchSubmit: function (e) {
        this.initProductData();
        this.setData({
            searchKey: e.detail.value
        });
        this.loadProductList(this.data.categories[this.data.categoryIndex].Id);
    },

    bindToProductDetail: function (e) {
        var productId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '../productdetail/productdetail?id=' + productId,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
    },

    catchTap: function (e) {
        return false;
    }
})