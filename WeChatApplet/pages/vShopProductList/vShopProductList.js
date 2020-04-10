var config = require('../../utils/config.js');
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        listStyle: '',
        id: '', //店铺id
        cid: '',
        orderKey: 1, //排序项（1：默认，2：销量，3：价格，4：评论数，5：上架时间）
        orderType: 1, //排序方式（1：升序，2：降序）
        pageNo: 1,
        pageSize: 10,
        keywords: '',
        productList: [],
        isNoMore: false,
        focus:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            cid: options.cid,
            id: options.id,
            focus:options.focus
        });
        this.loadData();
    },

    loadData: function(isLoadMore) {
        if (!isLoadMore) {
            this.setData({
                pageNo: 1
            });
        }
        var that = this;
        var params = {
            keywords: this.data.keywords,
            orderKey: this.data.orderKey,
            orderType: this.data.orderType,
            pageNo: this.data.pageNo,
            pageSize: this.data.pageSize
        };
        if (this.data.cid) {
            params.cid = this.data.cid;
        }
        if (this.data.id) {
            params.vshopId = this.data.id;
        }

        wx.showLoading({
            title: '',
            mask: true,
        })
        config.httpGet(app.getUrl('VShop/GetVShopSearchProducts'), params, function(res) {
            wx.hideLoading();
            if (res.success) {
                res = res.data.result;
                var temp = isLoadMore ? that.data.productList : [];
                temp = temp.concat(res.Products);
                that.setData({
                    productList: temp,
                    total: res.total,
                    isNoMore: temp.length == res.total
                });
            } else {
                app.showErrorModal(res.msg);
            }
        });
    },

    bindChangeListStyle: function() {
        var style = this.data.listStyle;
        if (style == '') {
            style = 'table';
        } else {
            style = '';
        }
        this.setData({
            listStyle: style
        });
    },

    bindSearchSubmit: function(e) {
        var value = e.detail.value;
        this.setData({
            keywords: value
        });
        this.loadData();
    },

    bindChangeOrderKey: function(e) {
        var orderKey = e.currentTarget.dataset.orderkey;
        var orderType = this.data.orderType;
        if (this.data.orderKey != orderKey) {
            orderType = 1;
        } else {
            orderType = orderType == 1 ? 2 : 1;
        }
        this.setData({
            orderKey: orderKey,
            orderType: orderType
        });
        this.loadData();
    },

    bindProductDetail: function (e) {
        var id = e.currentTarget.dataset.productid;

        wx.navigateTo({
            url: '../productdetail/productdetail?id=' + id
        })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        if (this.data.total == this.data.productList.length) return;
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