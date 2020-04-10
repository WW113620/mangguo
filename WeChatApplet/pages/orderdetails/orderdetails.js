var app = getApp();
Page({
    data: {
        OrderInfo: null,
        LogisticsData: null,
        SendGifts: null,
        OrderId: 0,
        isSubmitting: false,
        codeHide: true,
        pageLoaded: false
    },
    onLoad: function (options) {
        this.setData({ OrderId: options.orderid });
    },
    goToProductDetail: function (e) {
        var that = this;
        var productid = e.currentTarget.dataset.productid,
            activeid = e.currentTarget.dataset.activeid,
            activetype = e.currentTarget.dataset.activetype,
            toUrl = '../productdetail/productdetail?id=' + productid + (this.data.shopBranchId ? '&shopBranchId=' + this.data.shopBranchId : '');
        if (activetype == 1)
            toUrl = '../countdowndetail/countdowndetail?id=' + activeid;

        wx.navigateTo({
            url: toUrl
        })

    },
    RefundOrder: function (e) {
        var EnabledRefundAmount = parseFloat(e.currentTarget.dataset.refundmoney);
        var m = e.currentTarget.dataset.m;
        if (EnabledRefundAmount <= 0) {
            app.showErrorModal("此为优惠券全额抵扣订单不支持退款");
            return;
        }
        var orderid = e.currentTarget.dataset.orderid;
        wx.navigateTo({
            url: '../ApplyRefund/ApplyRefund?orderid=' + orderid + "&&m=" + m
        })
    },
    orderPay: function (e) {
        var orderid = e.currentTarget.dataset.orderid;
        app.orderPay(orderid, 0, false);
    },
    orderFinish: function (e) {
        var that = this,
            orderid = e.currentTarget.dataset.orderid;
        wx.showModal({
            title: '',
            content: '您确认收货吗?',
            success: function (e) {
                if (e.confirm) {
                    that.setData({
                        isSubmitting: true
                    });
                    wx.request({
                        url: app.getUrl(app.globalData.finishOrder),
                        data: {
                            openId: app.globalData.openId,
                            orderId: orderid
                        },
                        success: function (result) {
                            result = result.data;
                            if (result.success) {
                                wx.showModal({
                                    title: '提示',
                                    content: "确认收货成功！",
                                    showCancel: false,
                                    success: function (res) {
                                        if (res.confirm) {
                                            wx.navigateTo({
                                                url: '../orderlist/orderlist?status=' + that.data.Status
                                            })
                                        }
                                    }
                                })
                            }
                            else if (result.code == '502') {
                                wx.navigateTo({
                                    url: '../login/login'
                                })
                            }
                            else {
                                app.showErrorModal(result.msg);
                            }
                        }
                    })
                }
            }
        });
    },
    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
        wx.showLoading();
        // 页面显示
        var that = this,
            orderid = that.data.OrderId;
        app.getOpenId(function (openid) {
            wx.request({
                url: app.getUrl(app.globalData.getOrderDetail),
                data: {
                    openId: openid,
                    orderId: orderid
                },
                success: function (result) {
                    wx.hideLoading();
                    result = result.data;
                    if (result.success) {
                        var r = result.data;
                        var newList = "";
                        if (r.LogisticsData.traces != null && r.LogisticsData.traces.length > 0) {
                            newList = r.LogisticsData;
                        }
                        var SendGifts = "";
                        for (var k in r.Gifts) {
                            if (SendGifts.length > 0) {
                                SendGifts += ",";
                            }
                            SendGifts += r.Gifts[k].GiftName + "×" + r.Gifts[k].Quantity;
                        }
                        that.setData({
                            OrderInfo: r,
                            shopBranchId: r.BranchInfo ? r.BranchInfo.Id : 0,
                            SendGifts: SendGifts,
                            LogisticsData: newList,
                            orderInvoice: r.OrderInvoice,
                            pageLoaded: true
                        })
                    }
                    else if (result.code == '502') {
                        wx.navigateTo({
                            url: '../login/login'
                        })
                    }
                    else {
                        app.showErrorModal(result.data.Message, function (res) {
                            if (res.confirm) {
                                wx.navigateBack({ delta: 1 })
                            }
                        });
                    }
                }
            })
        })
    },
    openMaps: function () {
        var that = this;
        wx.openLocation({
            latitude: parseFloat(that.data.OrderInfo.BranchInfo.Latitude),
            longitude: parseFloat(that.data.OrderInfo.BranchInfo.Longitude),
            scale: 28, // 缩放比例
        })
    },

    bindBonus: function () {
        var orderInfo = this.data.OrderInfo;
        var toUrl = orderInfo.ShareHref;
        var uu = app.getRequestUrl + '/m-wap/shopregisterjump/smallprogjump?' + 'toUrl=' + encodeURIComponent(toUrl);
        wx.navigateTo({
            url: '../outurl/outurl?url=' + encodeURIComponent(uu) + '&ShareTitle=' + orderInfo.ShareTitle + '&ShareImg=' + orderInfo.ShareImg
            + '&type=needLogin'
        });
    },

    showQrcode: function (e) {
        var dataset = e.currentTarget.dataset,
            status = dataset.status,
            qrcode = dataset.qrcode,
            num = dataset.num;
        if (status == 1 || status == 3) {
            this.setData({
                pickupcode: qrcode,
                codeHide: false,
                pickupcodeStr: num
            })
        }
    },

    hideCode: function () {
        this.setData({
            codeHide: true
        })
    }
})