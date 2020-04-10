var config = require("../../utils/config.js");
var app = getApp();
Page({
    data: {
        FromPage: '',
        AddressList: null,
        AddressCount: 0,
        DelshipId: 0,
        IsCheck: 0,
        jumpUrl: "",
        CheckedValue: ""
    },
    onLoad: function(options) {
        var frompage = options.frompage,
            jumpUrl = '../editaddress/editaddress?Source=submitorder&frompage=' + frompage;
        this.setData({
            jumpUrl: jumpUrl,
            FromPage: frompage
        })
        this.initData();

    },
    initData: function() {
        var that = this;
        app.getOpenId(function(openid) {
            wx.request({
                url: app.getUrl("ShippingAddress/GetList"),
                data: {
                    openId: openid
                },
                success: function(result) {
                    result = result.data;
                    if (result.success) {
                        var r = result.data;
                        that.setData({
                            AddressCount: r == "[]" ? 0 : r.length,
                            AddressList: r
                        })
                    } else {
                        wx.redirectTo({
                            url: jumpUrl
                        })
                    }
                }
            })
        })
    },
    bindDeleteAddressTap: function(e) {
        var that = this,
            shippingId = e.currentTarget.dataset.shippingid;
        wx.showModal({
            title: '确定删除该地址吗？',
            success: function(res) {
                if (res.confirm) {
                    app.getOpenId(function(openId) {
                        var parameters = {
                            openId: openId,
                            shippingId: shippingId
                        }
                        that.setData({
                            DelshipId: shippingId
                        });
                        wx.showNavigationBarLoading();
                        config.httpGet(app.getUrl(app.globalData.delShippingAddress), parameters, that.getAddressResultData);
                    })
                }
            }
        })
    },
    getAddressResultData: function(res) {
        var that = this;
        if (res.code == "502") {
            wx.redirectTo({
                url: '../login/login'
            })
        } else if (res.success) {
            app.getOpenId(function(openId) {
                var parameters = {
                    openId: openId
                }
                wx.hideNavigationBarLoading();
                var oldaddress = that.data.AddressList;
                var newaddress = oldaddress.filter(function(item, index, array) {
                    return item.ShippingId != that.data.DelshipId;
                });
                that.setData({
                    AddressList: newaddress
                });
            });
        } else {
            wx.hideNavigationBarLoading();
        }
    },
    bindEditAddressTap: function(e) {
        var tempAddress = e.currentTarget.dataset.addressdata;
        tempAddress.Id = tempAddress.ShippingId;
        var addressData = tempAddress,
            isupdate = e.currentTarget.dataset.isupdate,
            that = this;
        if (that.data.IsCheck == 0) {
            wx.redirectTo({
                url: '../editaddress/editaddress?extra=' + JSON.stringify(addressData) + '&title=' + '编辑收货地址' + '&Source=submitorder&frompage=' + that.data.FromPage + (isupdate?'&isupdate=1':'')
            })
        }
    },
    //点击添加收货地址
    onAddShippingAddress: function(e) {
        var that = this;
        wx.showModal({
            title: '提示',
            content: '是否使用微信收货地址',
            cancelText: '否',
            confirmText: '是',
            success: function(res) {
                if (res.confirm) {
                    wx.chooseAddress({
                        success: function(res) {
                            if (res) {
                                app.getOpenId(function(openId) {
                                    //处理添加收货地址
                                    var parameters = {
                                        openId: openId,
                                        shipTo: res.userName,
                                        address: res.detailInfo,
                                        cellphone: res.telNumber,
                                        city: res.cityName,
                                        county: res.countyName,
                                    }
                                    config.httpPost(app.getUrl(app.globalData.AddWXChooseAddress), parameters, function() {
                                        that.initData();
                                    });
                                });
                            }
                        }
                    });
                } else if (res.cancel) {
                    that.gotoAddAddress();
                }
            }
        })
    },
    gotoAddAddress: function() {
        wx.redirectTo({
            url: '../editaddress/editaddress?Source=submitorder&frompage=' + this.data.FromPage + '&title=' + '新增收货地址'
        })
    },
    onAddressCheck: function(e) {
        var that = this,
            addressData = e.detail.value.split(",");
        that.data.IsCheck = 1;
        app.getOpenId(function(openid) {
            wx.request({
                url: app.getUrl("ShippingAddress/GetSetDefault"),
                data: {
                    openId: openid,
                    shippingId: addressData[0]
                },
                success: function(result) {
                    result = result.data;
                    if (result.success) {
                        var ShippingAddressInfo = {
                            ShippingId: addressData[0],
                            ShipTo: addressData[1],
                            CellPhone: addressData[2],
                            FullAddress: addressData[3]
                        };
                        var pages = getCurrentPages(),
                            prevPage = pages[pages.length - 2]; //上一个页面
                        //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
                        prevPage.setData({
                            ShippingAddressInfo: ShippingAddressInfo
                        });
                        prevPage.reGetOrderInfo();
                        wx.navigateBack();
                    }
                }
            })
        })
    },
    onReady: function() {
        // 页面渲染完成
    },
    onShow: function() {
        // 页面显示
    },
    onHide: function() {
        // 页面隐藏
    },
    onUnload: function() {
        // 页面关闭
    }
})