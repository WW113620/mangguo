// pages/address/address.js
var config = require("../../utils/config.js");
var app = getApp();

Page({
    data: {
        CanDeliveAddressList: [],
        CanNotDeliveAddressList: []
    },
    onShow(){
        this.initData();
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        if (options.pageurl){
            this.setData({
                pageurl: options.pageurl,
                shopBranchId: options.shopBranchId
            });
        }
    },
    initData: function () {
        var that = this;
        app.getOpenId(function (openId) {
            var parameters = {
                openId: openId,
                shopBranchId: that.data.shopBranchId || 0
            }
            wx.showNavigationBarLoading();
            config.httpGet(app.getUrl(app.globalData.getUserShippingAddress), parameters, that.getUserShippingAddressData);
        })
    },
    getUserShippingAddressData: function (res) {
        var that = this;
        wx.hideNavigationBarLoading();
        if (res.success) {
            that.setData({
                CanDeliveAddressList: res.data.CanDeliveAddressList,
                CanNotDeliveAddressList: res.data.CanNotDeliveAddressList
            })
            wx.hideNavigationBarLoading();
        }
    },

    getAddressResultData: function (res) {
        var that = this;
        wx.hideNavigationBarLoading();
        if (res.success) {
            app.getOpenId(function (openId) {
                var parameters = {
                    openId: openId
                }
                wx.hideNavigationBarLoading();
                config.httpGet(app.getUrl(app.globalData.getUserShippingAddress), parameters, that.getUserShippingAddressData);
            })
        }
    },

    bindRadioAddressChange: function (e) {
        var that = this;
        var shippingId = e.currentTarget.dataset.shippingid;
        app.getOpenId(function (openId) {
            var parameters = {
                openId: openId,
                shippingId: shippingId
            }
            wx.showNavigationBarLoading();
            config.httpGet(app.getUrl(app.globalData.setDefaultShippingAddress), parameters, that.getAddressResultData);
        })
    },

    bindDeleteAddressTap: function (e) {
        var that = this;
        var shippingId = e.currentTarget.dataset.shippingid;
        wx.showModal({
            title: '确定删除该地址吗？',
            success: function (res) {
                if (res.confirm) {
                    app.getOpenId(function (openId) {
                        var parameters = {
                            openId: openId,
                            shippingId: shippingId
                        }
                        wx.showNavigationBarLoading();
                        config.httpGet(app.getUrl(app.globalData.delShippingAddress), parameters, that.getAddressResultData);
                    })
                }
            }
        })
    },
    bindEditAddressTap: function (e) {
        var addressData = e.currentTarget.dataset.addressdata,
            isupdate = e.currentTarget.dataset.isupdate;
        wx.navigateTo({
            url: '../editaddress/editaddress?extra=' + JSON.stringify(addressData) + '&title=编辑收货地址&Source=' + this.data.pageurl + '&shopBranchId=' + this.data.shopBranchId + (isupdate ? '&isupdate=1' : '')
        }); 
    },
    gotoAddAddress: function () {
        wx.navigateTo({
            url: '../editaddress/editaddress' + '?title=新增收货地址&Source=' + this.data.pageurl + '&shopBranchId=' + this.data.shopBranchId
        });
        
    },
    //重新设置订单提交页的收货地址
    setAddr: function (e) {
        if (!this.data.pageurl){
            return;
        }
        var addressData = e.currentTarget.dataset.addressdata;
        var Address = {
            FullAddress: addressData.RegionFullName + addressData.Address + (addressData.AddressDetail ? addressData.AddressDetail:''),
            ShippingId: addressData.Id,
            CellPhone: addressData.Phone,
            RegionId: addressData.RegionId,
            ShipTo: addressData.ShipTo
        };
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2];  //上一个页面
        //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
        prevPage.setData({
            ShippingAddressInfo: Address
        });
        prevPage.reGetOrderInfo();
        wx.navigateBack();
    }
})