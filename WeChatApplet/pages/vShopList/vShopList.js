var config = require('../../utils/config.js');
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        vshopList:[],
        pageNo:1,
        pageSize:10,
        total:10,
        openId:'',
        isNoMore:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onShow: function(options) {
        var that = this;
            that.setData({openId:app.globalData.openId});
            that.loadData();
    },

    loadData:function(isLoadMore,isHideLoading){
        var that = this;
        if (!isLoadMore) {
            this.setData({
                pageNo: 1
            });
        }
        if (!isHideLoading){
            wx.showLoading({
                title: '',
                mask: true,
            });
        }
        
        config.httpGet(app.getUrl('VShop/GetVShops'),
        {
            pageSize:that.data.pageSize,
            pageNo:that.data.pageNo,
            openId:that.data.openId
        },function(res){
            wx.hideLoading();
            if (res.success) {
                res = res.data.result;
                var temp = isLoadMore ? that.data.vshopList : [];
                temp = temp.concat(res.VShops);

                that.setData({
                    vshopList: temp,
                    total: res.total,
                    isNoMore: temp.length == res.total
                });
            } else {
                app.showErrorModal(res.msg);
            }
        })
    },

    bindVshop: function (e) {
        var shopid = e.currentTarget.dataset.shopid;
        wx.navigateTo({
            url: '../vShopHome/vShopHome?id=' + shopid,
        })
    },

    bindFavorite: function (e) {
        var that = this;
        app.addOrCancelFavoriteVshop(that, e, config);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.total <= this.data.vshopList.length) return;
        var pageNo = this.data.pageNo + 1;
        this.setData({ pageNo: pageNo });
        this.loadData(true);
    }
})