// pages/storeList/storeList.js
//获取应用实例
var config = require("../../utils/config.js");
var app = getApp();
Page({
    /**
       * 页面的初始数据
       */
    data: {
        pageIndex: 1,
        pageSize: 5,
        shopid:'',
        fromLatLng: '',
        isDataEnd: false,
        storeList: [],
        setCss: {}
    },
    onShareAppMessage: function () {
        return {
            title: '门店列表',
            path: '',
            success: function (res) {
            },
            fail: function (res) {
                // 转发失败
            }
        }

    },
    onLoad: function (options) {
        var that = this;
        // 页面初始化 options为页面跳转所带来的参数
        that.setData({
            fromLatLng: options.fromLatLng || wx.getStorageSync('o2oFromLatLng'),
            shopid: options.shopid,
            productid: options.productid
        });
        that.getStoreList();
    },
    getStoreList: function (pageIndex) {
        var that = this, parameters;
        if (that.data.isDataEnd) {
            return;
        }
        if (!that.data.fromLatLng) {
            app.showErrorModal('未能获取定位');
            return;
        }
        parameters = {
            pageNo: pageIndex,
            pageSize: that.data.pageSize,
            fromLatLng: that.data.fromLatLng,
            shopId: that.data.shopid,
            productid: that.data.productid
        }
        if (pageIndex == 1) {
            that.setData({
                storeList: []
            })
        }
        wx.showLoading();
        config.httpGet(app.getUrl('Home/GetStoresByProduct'), parameters, that.getStoreListData);
    },
    getStoreListData: function (res) {
        wx.hideLoading();
        var that = this;
        if (res.success) {
            res = res.data;
            if (!res.Stores || res.Stores.length < that.data.pageSize) {
                that.setData({
                    isDataEnd: true
                });
            } else {
                var pidx = that.data.pageIndex;
                that.setData({
                    pageIndex: pidx + 1
                });
            }
            var stores = that.dataActionOpera(res);
            that.setData({
                location: res.CurrentAddress,
                storeList: that.data.storeList.concat(stores),
                ProductSaleCountOnOff: res.ProductSaleCountOnOff
            });
        } else {
            wx.showModal({
                title: '提示',
                showCancel: false,
                content: res.msg,
                confirmText: '返回',
                success: function (res) {
                    if (res.confirm) {
                        wx.navigateBack();
                    }
                }
            })
        }
    },
    dataActionOpera: function (data) {
        if (data.Stores.length > 0) {
            for (var i = 0, len = data.Stores.length; i < len; i++) {
                var count = 0, types1 = new Array(), types3 = '', types2 = {};
                var actives = data.Stores[i].ShopAllActives;
                if (actives.ShopActives && actives.ShopActives.length > 0) {
                    for (var j = 0; j < actives.ShopActives.length; j++) {
                        types1.push(actives.ShopActives[j].ActiveName);
                    }
                    count++;
                }
                if (actives.IsFreeMail) {
                    types3 = '满' + actives.FreeFreightAmount + '元免配送费';
                    count++;
                }
                if (actives.ShopCoupons && actives.ShopCoupons.length > 0) {
                    types2.MinCouponPrice = actives.MinCouponPrice;
                    types2.MaxCouponPrice = actives.MaxCouponPrice;
                    count++;
                }
                data.Stores[i].ShopBranch.types1 = types1.join(",");
                data.Stores[i].ShopBranch.count = count;
                data.Stores[i].ShopBranch.types3 = types3;
                data.Stores[i].ShopBranch.types2 = types2;
            }
        }
        return data.Stores;
    },
    onReachBottom: function () {
        // 页面上拉触底事件的处理函数
        var that = this;
        var pageIndex = that.data.pageIndex;
        that.getStoreList(pageIndex);
    },
    setActive: function (e) {
        //控制门店活动的展开与隐藏
        var idx = e.currentTarget.dataset.idx;
        var obj = {};
        obj[idx] = !this.data.setCss[idx];
        this.setData({
            setCss: obj
        })
    },
    showStoreDetail: function (e) {
        var data = e.currentTarget.dataset;
        if (data.proid) {
            wx.navigateTo({
                url: '../shophome/shophome?id=' + data.id + '&productid=' + data.proid + '&fromLatLng=' + this.data.fromLatLng
            })
        } else {
            wx.navigateTo({
                url: '../shophome/shophome?id=' + data.id + '&fromLatLng=' + this.data.fromLatLng
            })
        }
    }
})