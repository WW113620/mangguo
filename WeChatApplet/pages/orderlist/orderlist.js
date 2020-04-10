var app = getApp();
Page({
    data: {
        isEmpty: false,
        Status: 0,
        OrderList: null,
        PageIndex: 1,
        PageSize: 10,
        nullOrder: app.getRequestUrl + '/Templates/xcxshop/images/nullOrder.png',
        codeHide: true
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        var status = options.status;
        if (options.status == "" || options.status == undefined) status = 0;
        const that = this;
        that.setData({
            Status: status
        });
    },
    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
        // 页面显示
        var that = this;
        that.setData({
            PageIndex: 1,
            OrderList: [],
        });
        that.loadData(that.data.Status, that, false);
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    },
    onReachBottom: function () {
        var that = this;
        var pageIndex = that.data.PageIndex + 1;
        that.setData({
            PageIndex: pageIndex
        })
        that.loadData(that.data.Status, that, true);
    },
    closeOrder: function (e) {
        var that = this,
            orderid = e.target.dataset.orderid;
        wx.showModal({
            title: '提示',
            content: '确定要取消订单吗？',
            success: function (res) {
                if (res.confirm) {
                    app.getOpenId(function (openid) {
                        wx.request({
                            url: app.getUrl(app.globalData.closeOrder),
                            data: {
                                openId: openid,
                                orderId: orderid
                            },
                            success: function (result) {
                                result = result.data;
                                if (result.success) {
                                    wx.showModal({
                                        title: '提示',
                                        content: result.msg,
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
                    })
                }
            }
        })
    },
    orderPay: function (e) {
        app.orderPay(e.currentTarget.dataset.orderid, this.data.Status, true);
    },
    orderFinish: function (e) {
        var that = this,
            orderid = e.currentTarget.dataset.orderid;
        wx.showModal({
            title: '',
            content: '您确认收货吗?',
            success: function (e) {
                if (e.confirm) {
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
    toproduct: function (e) {
        wx.switchTab({
            url: '../productcategory/productcategory'
        })
    },
    onTabClick: function (e) {
        var that = this;
        that.setData({
            PageIndex: 1
        })
        that.loadData(e.currentTarget.dataset.status, that, false);
    },
    showLogistics: function (e) {
        var orderid = e.currentTarget.dataset.orderid,
            deliveryType = e.currentTarget.dataset.deliverytype;
        if (deliveryType == 3) {
            var tourl = app.getRequestUrl + '/m-Wap/order/expressInfo?orderId=' + orderid;
            wx.navigateTo({
                url: '../outurl/outurl?url=' + encodeURIComponent(tourl)
            })
        }
        else {
            wx.navigateTo({
                url: '../logistics/logistics?orderid=' + orderid
            })
        }
    },
    showReview: function (e) {
        var orderid = e.currentTarget.dataset.orderid,
            commentcount = e.currentTarget.dataset.commentcount;
        if (commentcount > 0) {
            wx.navigateTo({
                url: '../appendComment/appendComment?id=' + orderid
            })
        } else {
            wx.navigateTo({
                url: '../comment/comment?id=' + orderid
            })
        }
    },
    goToOrderDetail: function (e) {
        var orderid = e.currentTarget.dataset.orderid;
        wx.navigateTo({
            url: '../orderdetails/orderdetails?orderid=' + orderid
        })
    },
    RefundOrder: function (e) {
        var EnabledRefundAmount = parseFloat(e.currentTarget.dataset.refundmoney);
        if (EnabledRefundAmount <= 0) {
            app.showErrorModal("此为优惠券全额抵扣订单不支持退款");
            return;
        }
        var orderid = e.currentTarget.dataset.orderid;
        var moneys = e.currentTarget.dataset.money;
        wx.navigateTo({
            url: '../ApplyRefund/ApplyRefund?orderid=' + orderid + "&&m=" + moneys
        })
    },
    ReturnsOrder: function (e) {
        var orderid = e.currentTarget.dataset.orderid,
            skuId = e.currentTarget.dataset.skuId,
            proname = e.currentTarget.dataset.skuname,
            num = e.currentTarget.dataset.num,
            moneys = e.currentTarget.dataset.money;

        wx.navigateTo({
            url: '../ApplyReturns/ApplyReturns?orderid=' + orderid + '&&skuId=' + skuId + '&&pro=' + proname + '&&num=' + num + '&&m=' + moneys
        })
    },
    loadData: function (status, that, isNextPage) {
        wx.showLoading({
            title: '加载中',
        });
        app.getOpenId(function (openid) {
            wx.request({
                url: app.getUrl(app.globalData.orderList),
                data: {
                    openId: openid,
                    status: status,
                    pageIndex: that.data.PageIndex,
                    pageSize: that.data.PageSize
                },
                success: function (result) {
                    result = result.data;
                    if (result.success) {
                        var r = result.data.Data;

                        if (isNextPage) {
                            var old = that.data.OrderList;
                            old.push.apply(old, r);
                            that.setData({
                                OrderList: old
                            })
                        } else {
                            var isempty = r.length <= 0;
                            that.setData({
                                Status: status,
                                OrderList: r,
                                isEmpty: isempty
                            })
                        }
                    }
                    else if (result.code == '502') {
                        wx.navigateTo({
                            url: '../login/login'
                        })
                    }
                    else {
                        app.showErrorModal(result.msg, function (res) {
                            if (res.confirm) {
                                wx.navigateBack({ delta: 1 })
                            }
                        });
                    }
                }, complete: function () {
                    wx.hideLoading()
                }
            })
        })
    },
    hideCode: function () {
        this.setData({
            codeHide: true
        })
    },
    showPickCode: function (e) {
        var code = e.currentTarget.dataset.pickupcodestr,
            that = this;
        app.getOpenId(function (openid) {
            wx.request({
                url: app.getUrl(app.globalData.getPickupCodeQRCode),
                data: {
                    openId: openid,
                    pickupCode: code
                },
                success: function (result) {
                    if (result.data.success) {
                        that.setData({
                            pickupcode: result.data.data,
                            codeHide: false,
                            pickupcodeStr: code
                        })
                    }
                    else {
                        if (result.data.code = 502) {
                            wx.navigateTo({
                                url: '../login/login'
                            })
                        } else {
                            app.showErrorModal(result.data.msg);
                        }
                    }
                }
            })
        })

    },
    goVirtualCode:function(e){
        wx.navigateTo({
            url: '../orderqrcode/orderqrcode?orderid=' + e.currentTarget.dataset.orderid
        })
    }
})