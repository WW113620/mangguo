// shopcart.js
var config = require("../../utils/config.js");
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        ShopCarts: null,
        isEdite: false,
        TotalPrice: 0.00,
        EditeText: '编辑',
        selectAllStatus: false,
        SelectskuId: [],
        SettlementText: '结算',
        isEmpty: false,
        shopSelectAll: [],
        pageLoaded: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        //this.loadData();
    },
    loadData: function() {
        wx.showLoading({
            title: '正在加载',
        });
        var that = this;
        var totalprice = parseFloat(0.00);
        app.getOpenId(function(openid) {
            if (openid) {
                that.setData({
                    islogin: true
                });
                wx.request({
                    url: app.getUrl("Cart/GetCartProduct"),
                    data: {
                        openId: openid
                    },
                    success: function(result) {
                        result = result.data;
                        if (result.success) {
                            var shopcarttemp = result.data.Shop;
                            var shops = [];
                            shopcarttemp.forEach(function(val, index, array) {
                                var tmp = {};
                                tmp.shopSelect = false;
                                shops.push(tmp);
                            });
                            var isempty = (!shopcarttemp || shopcarttemp.length == 0) && (result.data.ShopBranch.length == 0);
                            var ShopBranchs = [];
                            result.data.ShopBranch.forEach(function(item) {
                                var cartSum = 0;
                                item.forEach(function(pro) {
                                    if (pro.Status === 0) {
                                        cartSum += parseInt(pro.Count);
                                    }
                                });
                                ShopBranchs.push({
                                    cartSum: cartSum,
                                    ShopBranch: item
                                })
                            });
                            that.setData({
                                isEmpty: isempty,
                                ShopCarts: shopcarttemp,
                                ShopBranchs: ShopBranchs,
                                TotalPrice: 0.00,
                                shopSelectAll: shops,
                                pageLoaded: true
                            });

                        } else if (result.code == '502') {
                            wx.navigateTo({
                                url: '../login/login'
                            })
                        } else {
                            app.showErrorModal(result.msg, function(res) {
                                if (res.confirm) {
                                    wx.navigateBack({
                                        delta: 1
                                    })
                                }
                            });
                        }
                    },
                    complete: function() {
                        wx.hideLoading();
                    }
                })
            } else {
                wx.hideLoading();
                that.setData({
                    islogin: false,
                    pageLoaded: true
                })
            }
        }, 'shopcart');
    },
    selectList: function(e) {
        var that = this;

        var dataset = e.currentTarget.dataset,
            tempselectskuId = that.data.SelectskuId;
        var checkstatue = false;
        checkstatue = !that.data.ShopCarts[dataset.sidx][dataset.idx].selected;
        that.data.ShopCarts[dataset.sidx][dataset.idx].selected = checkstatue;

        var index = tempselectskuId.indexOf(dataset.skuid);
        if (checkstatue && index < 0) {
            tempselectskuId.push(dataset.skuid);
        } else if (!checkstatue && index >= 0) {
            tempselectskuId.splice(index, 1);
        }
        //判断该门店下的商品是否全选
        var everyShopSelect = that.data.ShopCarts[dataset.sidx].every(function(value, index, fulArr) {
            return value.selected;
        });
        if (everyShopSelect) {
            that.data.shopSelectAll[dataset.sidx].shopSelect = true;
        } else {
            that.data.shopSelectAll[dataset.sidx].shopSelect = false;
        }
        //判断是否全选了
        var everySelect = that.data.shopSelectAll.every(function(value, index, fulArr) {
            return value.shopSelect;
        });

        that.setData({
            ShopCarts: that.data.ShopCarts,
            SelectskuId: tempselectskuId,
            selectAllStatus: everySelect,
            shopSelectAll: that.data.shopSelectAll
        });
        that.GetTotal();
    },

    //选择店铺
    selectShop: function(e) {
        var that = this,
            strskuId = [],
            totalmoney = 0,
            idx = e.currentTarget.dataset.idx,
            shopstatus = !that.data.shopSelectAll[idx].shopSelect,
            tempshopcart = that.data.ShopCarts[idx],
            ids = that.data.SelectskuId,
            allstatus = false;
        tempshopcart.forEach(function(val, index, array) {
            if (val.IsValid == 0) {
                val.selected = shopstatus;
                if (shopstatus) {
                    strskuId.push(val.SkuId);
                } else {
                    ids && (ids = app.removeByValue(ids, val.SkuId));
                }
            }
        });
        that.data.ShopCarts[idx] = tempshopcart;
        that.data.shopSelectAll[idx].shopSelect = shopstatus;
        if (shopstatus) {
            ids = app.mergeArray(that.data.SelectskuId, strskuId);
            var everySelect = that.data.shopSelectAll.every(function(value, index, fulArr) {
                return value.shopSelect;
            });
            allstatus = everySelect;
        }
        that.setData({
            ShopCarts: that.data.ShopCarts,
            selectAllStatus: allstatus,
            SelectskuId: ids ? ids : [],
            shopSelectAll: that.data.shopSelectAll
        });
        that.GetTotal();
    },
    GetTotal: function() {
        var totalmoney = parseFloat(0),
            tempshopcart = this.data.ShopCarts;
        tempshopcart.forEach(function(objs, idx, arr) {
            objs.forEach(function(item, index, array) {
                if (item.selected) {
                    totalmoney = parseFloat(item.Price * item.Count) + parseFloat(totalmoney);
                }
            });

        });
        this.setData({
            TotalPrice: totalmoney.toFixed(2)
        });
    },
    selectAll: function() {
        var that = this,
            strskuId = [],
            totalmoney = 0,
            allstatus = !that.data.selectAllStatus,
            tempshopcart = that.data.ShopCarts,
            shops = [];
        tempshopcart.forEach(function(objs, idx, arr) {
            var tmp = {};
            tmp.shopSelect = allstatus;
            shops.push(tmp);
            objs.forEach(function(val, index, array) {
                if (val.IsValid == 0) {
                    val.selected = allstatus;
                    if (allstatus) {
                        strskuId.push(val.SkuId);
                    }
                }
            });

        });
        that.setData({
            ShopCarts: tempshopcart,
            selectAllStatus: allstatus,
            SelectskuId: strskuId,
            shopSelectAll: shops
        });
        that.GetTotal();
    },
    SwitchEdite: function() {
        var edittxt = this.data.EditeText;
        if (edittxt == "编辑") {
            this.setData({
                isEdite: true,
                EditeText: "完成",
                SettlementText: '删除',
                DelskuId: ""
            });
        } else {
            this.loadData();
            this.setData({
                isEdite: false,
                EditeText: "编辑",
                DelskuId: "",
                SettlementText: '结算',
                SelectskuId: [],
                selectAllStatus: false
            });
        }
    },
    countNum: function(e) {
        var that = this,
            dataset = e.currentTarget.dataset,
            item = that.data.ShopCarts[dataset.sidx][dataset.idx],
            oldquantity = parseInt(item.Count);

        if (dataset.dotype == 'minus') {
            if (oldquantity <= 1) {
                return;
            }
            that.ChangeQuantiy(that, -1, item.SkuId);
        } else {

            that.ChangeQuantiy(that, 1, item.SkuId);
        }
    },
    bindblurNum: function(e) {
        var that = this,
            dataset = e.currentTarget.dataset,
            item = that.data.ShopCarts[dataset.sidx][dataset.idx],
            oldquantity = parseInt(item.Count),
            num = parseInt(e.detail.value);
        // var oldstock = tempshopcart.CartItemInfo[idx].Stock;
        if (isNaN(num) || num < 1) {
            num = 1;
        }
        if (num == oldquantity) {
            return;
        }

        that.ChangeQuantiy(that, num - oldquantity, item.SkuId);
    },
    DelCarts: function(e) {
        var that = this,
            delSkuid = e.currentTarget.dataset.skuid,
            delSkuidStr = that.data.SelectskuId, //获取要删除的skuId；
            totalmoney = 0.00;
        if (delSkuid != "") {
            wx.showModal({
                title: '',
                content: '确认要删除该商品吗？',
                success: function(res) {
                    if (res.confirm) {
                        app.getOpenId(function(openid) { //删除
                            wx.request({
                                url: app.getUrl("Cart/GetdelCartItem"),
                                data: {
                                    openId: openid,
                                    SkuIds: delSkuid
                                },
                                success: function(result) {
                                    result = result.data;
                                    if (result.success) {
                                        var index = delSkuidStr.indexOf(delSkuid);
                                        if (index >= 0) {
                                            delSkuidStr.splice(index, 1);
                                        }
                                        that.setData({
                                            SelectskuId: delSkuidStr,
                                            selectAllStatus: false
                                        });
                                        that.loadData();
                                    } else {
                                        if (result.code == '502') {
                                            wx.navigateTo({
                                                url: '../login/login'
                                            })
                                        } else {
                                            app.showErrorModal(result.msg);
                                        }
                                    }
                                }
                            });
                        });
                    }
                }
            })

        }
    },
    delStoreProduct: function(e) {
        var that = this,
            shopBranchId = e.currentTarget.dataset.shopid,
            index = e.currentTarget.dataset.index;
        wx.showModal({
            title: '',
            content: '确认要删除该门店所有商品吗？?',
            success: function(e) {
                if (e.confirm) {
                    config.httpGet(app.getUrl('shopCart/GetClearBranchCartProducts'), {
                        shopBranchId: shopBranchId,
                        openId: app.globalData.openId
                    }, function(res) {

                        if (res.success) {
                            /*that.data.ShopBranch.splice(index,1);
                            that.setData({
                                ShopBranch: that.data.ShopBranch
                            });*/

                            wx.showToast({
                                title: '删除成功',
                                icon: 'none'
                            })
                            that.loadData();

                        }
                    });
                }
            }
        });
    },
    SettlementShopCart: function() {
        var that = this,
            skuid = that.data.SelectskuId.join(','),
            tempshopcart = that.data.ShopCarts,
            delSkuidStr = that.data.SelectskuId; //获取要删除的skuId；
        if (that.data.isEdite) {
            if (skuid <= 0) {
                app.showErrorModal('请选择要删除的商品');
                return;
            }
            wx.showModal({
                title: '',
                content: '确认要删除这些商品吗？',
                success: function(res) {
                    if (res.confirm) {
                        app.getOpenId(function(openid) { //删除
                            wx.request({
                                url: app.getUrl("Cart/getdelCartItem"),
                                data: {
                                    openId: openid,
                                    SkuIds: skuid
                                },
                                success: function(result) {
                                    result = result.data;
                                    if (result.success) {

                                        that.setData({
                                            SelectskuId: [],
                                            selectAllStatus: false
                                        });

                                    } else {
                                        if (result.code == '502') {
                                            wx.navigateTo({
                                                url: '../login/login'
                                            })
                                        } else {
                                            app.showErrorModal(result.msg);
                                        }
                                    }
                                },
                                complete: function() {
                                    that.loadData();
                                }
                            });
                        });
                    }
                }
            });


        } else {
            if (skuid <= 0) {
                app.showErrorModal('请选择要结算的商品');
                return;
            }
            //获取所选商品的CartItemId
            var cartidArr = [],
                selectSkus = that.data.SelectskuId;
            selectSkus.forEach(function(value, ix, fullarr) {
                tempshopcart.forEach(function(objs, idx, arr) {
                    objs.forEach(function(val, index, array) {
                        if (val.SkuId == value) {
                            cartidArr.push(val.CartItemId);
                            var count = parseInt(val.Count);
                            if (!val.IsOpenLadder && val.MaxBuyCount > 0 && count > val.MaxBuyCount) {
                                app.showErrorModal('已超出商品[' + val.Name + ']的最大购买数');
                                return;
                            }
                        }
                    });

                });
            })

            //检查商品失效
            app.getOpenId(function(openid) {
                wx.request({
                    url: app.getUrl("Cart/GetCanSubmitOrder"),
                    data: {
                        openId: openid,
                        skus: skuid
                    },
                    success: function(result) {
                        result = result.data;
                        if (result.success) {
                            var cartItemIds = cartidArr.join(',')
                            wx.request({
                                url: app.getUrl("Cart/GetLadderMintMath"),
                                data: {
                                    openId: openid,
                                    cartItemIds: cartItemIds
                                },
                                success: function(r) {
                                    if (r.data.data) {
                                        wx.navigateTo({
                                            url: '../submitorder/submitorder?frompage=0&cartItemIds=' + cartItemIds
                                        });
                                    } else {
                                        app.showErrorModal(r.data.msg);
                                    }
                                }
                            });
                        } else {
                            if (result.code == '502') {
                                wx.navigateTo({
                                    url: '../login/login'
                                })
                            } else { //失效，重新加载数据
                                that.setData({
                                    SelectskuId: [],
                                    selectAllStatus: false
                                });
                                that.loadData();
                            }
                        }
                    }
                });
            });
        }
    },
    ChangeQuantiy: function(that, quantity, skuId) {
        app.getOpenId(function(openid) {
            wx.request({
                url: app.getUrl("Cart/GetUpdateToCart"),
                data: {
                    openId: openid,
                    SkuID: skuId,
                    Quantity: quantity
                },
                success: function(result) {
                    result = result.data;
                    if (result.success) {
                        that.loadData();
                    } else {
                        if (result.code == '502') {
                            wx.navigateTo({
                                url: '../login/login'
                            })
                        } else {
                            app.showErrorModal(result.msg, function() {
                                if (result.msg == '库存不足') {
                                    that.loadData();
                                }
                            });
                        }
                    }
                },
                complete: function() {

                }
            });
        });
    },
    goToProductDetail: function(e) {
        var dataset = e.currentTarget.dataset,
            productid = dataset.productid,
            valid = dataset.isvalid,
            countdownId = dataset.activeid;
        if (valid == 1 && countdownId > 0) {
            wx.navigateTo({
                url: '../countdowndetail/countdowndetail?id=' + countdownId
            })
        } else {
            if (!this.data.isEdite) {
                wx.navigateTo({
                    url: '../productdetail/productdetail?id=' + productid
                });
            }
        }
    },
    goToShop: function(e) {
        if (!this.data.isEdite) {
            wx.navigateTo({
                url: '../shophome/shophome?id=' + e.currentTarget.dataset.id
            })
        }

    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.setData({
            isEdite: false,
            TotalPrice: 0.00,
            EditeText: '编辑',
            selectAllStatus: false,
            SelectskuId: [],
            SettlementText: '结算',
            isEmpty: false
        });
        this.loadData();
    },



    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})