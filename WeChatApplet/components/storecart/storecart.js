// components/storecart/storecart.js
var config = require("../../utils/config.js");
var app = getApp();
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        shopbranchid: {
            type: Number
        },
        shopBuyHide: {
            type: Boolean,
            value: false
        },
        productid: {
            type: Number
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        cartHide: true,
        chooseSkuHide: true,
        setTime: ''
    },
    /**
     * 组件的生命周期函数
     */
    ready() {
        this.getCartData();
    },

    /**
     * 组件的方法列表
     */
    methods: {
        getCartData() {
            var that = this;
            config.httpGet(app.getUrl('shopCart/GetCart'), {
                shopBranchId: this.data.shopbranchid,
                openId: app.globalData.openId
            }, function(res) {
                const cartData = res.data;
                if (cartData.TotalCount) {
                    cartData.normalProducts = [];
                    cartData.loseProducts = [];
                    cartData.Products.forEach(function(item) {
                        item.selected = true;
                        if (!item.Status) {
                            cartData.normalProducts.push(item);
                        } else {
                            cartData.loseProducts.push(item);
                        }
                    });
                    cartData.Products = null;
                    cartData.selectedAll = true;
                } else {
                    that.setData({
                        cartHide: true
                    });
                }
                that.setData({
                    cartData: cartData,
                    pricegap: cartData.TotalCount ? (cartData.DeliveTotalFee - cartData.Amount).toFixed(2) : 0
                });
            });
        },
        cartNumChange(e) {
            var that = this;
            clearTimeout(this.data.setTime);
            var index = e.currentTarget.dataset.index,
                type = e.currentTarget.dataset.type,
                cur = this.data.cartData.normalProducts[index];
            if (type) {
                cur.Count += 1;
            } else {
                cur.Count -= 1;
            }

            this.setData({
                cartData: this.data.cartData
            });

            this.changeCart(cur.SkuId, cur.Count);
            this.data.setTime = setTimeout(function() { //防止快速点击加减,延迟请求
                //that.getProductData(true);
                that.triggerEvent("updateproduct");//自定义事件执行父页面更新商品列表
            }, 500);
        },
        changeCart(skuId, count, productId, callback) {
            var that = this;
            if (!skuId) {
                skuId = productId + '_0_0_0';
            }
            config.httpGet(app.getUrl('shopCart/GetUpdateCartItem'), {
                shopBranchId: this.data.shopbranchid,
                skuId: skuId,
                count: count,
                openId: app.globalData.openId
            }, function(res) {
                if (!res.success) {
                    callback();
                    if (res.code == 502) {
                        wx.showToast({
                            title: '请先登录账号',
                            icon: 'none'
                        })
                        wx.navigateTo({
                            url: '../login/login'
                        })
                    } else {
                        app.showErrorModal(res.msg);
                    }
                } else {
                    that.getCartData();
                }
            });
        },
        cartShowHide() {
            if (this.data.cartData.TotalCount) {
                this.setData({
                    cartHide: !this.data.cartHide
                });
            }
        },
        hideChooseSku() {
            this.setData({
                chooseSkuHide: true
            });
        },
        selectAllChange() {
            var that = this;
            this.data.cartData.selectedAll = !this.data.cartData.selectedAll;
            this.data.cartData.normalProducts.forEach(function(item) {
                item.selected = that.data.cartData.selectedAll;
            });
            this.setData({
                cartData: this.data.cartData
            });
            this.caleCartTotal();
        },
        selectList(e) {
            var checkedAll = true,
                index = e.currentTarget.dataset.index;
            this.data.cartData.normalProducts[index].selected = !this.data.cartData.normalProducts[index].selected;

            this.data.cartData.normalProducts.forEach(function(item) {
                if (!item.selected) {
                    checkedAll = false;
                }
            });
            this.data.cartData.selectedAll = checkedAll;
            this.setData({
                cartData: this.data.cartData
            });
            this.caleCartTotal();
        },
        caleCartTotal() {
            var total = 0;
            this.data.cartData.normalProducts.forEach(function(item) {
                if (item.selected) {
                    total += item.Price * item.Count;
                }
            });
            this.data.cartData.Amount = total.toFixed(2);
            this.setData({
                cartData: this.data.cartData,
                pricegap: (this.data.cartData.DeliveTotalFee - total).toFixed(2)
            });
        },
        clearCartProduct() {
            var that = this;
            wx.showModal({
                title: '',
                content: '您确定清空购物车吗?',
                success: function(e) {
                    if (e.confirm) {
                        config.httpGet(app.getUrl('shopCart/GetClearBranchCartProducts'), {
                            shopBranchId: that.data.shopbranchid,
                            openId: app.globalData.openId
                        }, function(res) {
                            if (res.success) {
                                that.setData({
                                    cartData: false,
                                    cartHide: true
                                });
                                that.getProductData(true);
                            }
                        });
                    }
                }
            });
        },
        clearLoseProduct() {
            var that = this;
            wx.showModal({
                title: '',
                content: '您确定清空失效商品吗?',
                success: function(e) {
                    if (e.confirm) {
                        config.httpGet(app.getUrl('shopCart/GetClearBranchCartInvalidProducts'), {
                            shopBranchId: that.data.shopbranchid,
                            openId: app.globalData.openId
                        }, function(res) {
                            if (res.success) {
                                that.data.cartData.loseProducts = [];
                                that.setData({
                                    cartData: that.data.cartData
                                });
                            }
                        });
                    }
                }
            });
        },
        chooseSku() {
            var that = this;
            config.httpGet(app.getUrl('Product/GetProductSkuInfo'), {
                shopBranchId: this.data.shopbranchid,
                id: this.data.productid,
                openId: app.globalData.openId
            }, function(res) {
                if (res.success) {
                    res = res.data;
                    var newSku = {},
                        enabledSku;
                    res.Skus.forEach(function(item) {
                        newSku[item.SkuId] = item;
                        if (!enabledSku && item.Stock) {
                            enabledSku = item;
                        }
                    });
                    res.Skus = newSku;
                    if (!res.DefaultSku.Stock) {
                        //设置默认选择为有库存sku组合
                        res.DefaultSku = enabledSku;
                    }
                    if (!res.DefaultSku) {
                        wx.showToast({
                            title: '暂无库存',
                            icon: 'none'
                        });
                        return;
                    }
                    that.setData({
                        chooseSkuHide: false,
                        skuData: res,
                        skuArr: res.DefaultSku.SkuId.split('_'),
                        curSkuData: res.DefaultSku
                    });

                    that.setDisabledSku(0);

                } else {
                    if (res.code == 502) {
                        wx.showToast({
                            title: '请先登录账号',
                            icon: 'none'
                        })
                        wx.navigateTo({
                            url: '../login/login'
                        })
                    } else {
                        app.showErrorModal(res.msg);
                    }
                }
            });
        },
        setDisabledSku(index) {
            //选择某个sku自动组合下一组规格可能组合，判断库存为零的的不可选
            var that = this,
                SkuItems = that.data.skuData.SkuItems,
                Skus = that.data.skuData.Skus,
                len = SkuItems.length,
                skuArr = that.data.skuArr,
                nextIndex;
            if (len > 1) {
                nextIndex = index == len - 1 ? 0 : index + 1;
            } else {
                nextIndex = 0;
            }

            SkuItems[nextIndex].AttributeValue.forEach(function(item) {
                var tempArr = JSON.parse(JSON.stringify(skuArr));
                tempArr[SkuItems[nextIndex].AttributeIndex + 1] = item.ValueId;
                if (!Skus[tempArr.join('_')].Stock) {
                    item.disabled = true;
                } else {
                    item.disabled = false;
                }
            });
            that.setData({
                skuData: that.data.skuData
            });
        },
        swithSku(e) {
            var index = e.currentTarget.dataset.index,
                parentindex = e.currentTarget.dataset.parentindex;
            this.data.skuArr[index + 1] = e.currentTarget.dataset.id;
            this.setData({
                skuArr: this.data.skuArr,
                curSkuData: this.data.skuData.Skus[this.data.skuArr.join('_')]
            });
            this.setDisabledSku(parentindex);
        },
        cartSkuCountChange(e) {
            clearTimeout(this.data.setTime);

            var type = e.currentTarget.dataset.type,
                that = this;
            if (type) {
                this.data.curSkuData.CartQuantity += 1;
            } else {
                this.data.curSkuData.CartQuantity -= 1;
            }
            if (this.data.curSkuData.CartQuantity < 0) {
                this.data.curSkuData.CartQuantity = 0;
            }
            this.data.skuData.Skus[this.data.curSkuData.SkuId] = this.data.curSkuData;
            this.setData({
                curSkuData: this.data.curSkuData,
                skuData: this.data.skuData
            });

            this.changeCart(this.data.curSkuData.SkuId, this.data.curSkuData.CartQuantity, '', function() {
                that.data.curSkuData.CartQuantity -= 1;
                if (that.data.curSkuData.CartQuantity < 0) {
                    that.data.curSkuData.CartQuantity = 0;
                }
                that.data.skuData.Skus[that.data.curSkuData.SkuId] = that.data.curSkuData;
                that.setData({
                    curSkuData: that.data.curSkuData,
                    skuData: that.data.skuData
                });
            });

            this.data.setTime = setTimeout(function() { //防止快速点击加减,延迟请求
                //that.getProductData(true);
                that.triggerEvent("updateproduct");//自定义事件执行父页面更新商品列表
            }, 300);

        },
        submitCart(e) {
            if (e.currentTarget.dataset.disabled) {
                return;
            }
            var cartItemIds = [];
            this.data.cartData.normalProducts.forEach(function(item) {
                if (item.selected) {
                    cartItemIds.push(item.CartItemId);
                }
            });
            wx.navigateTo({
                url: '../submitorder/submitorder?cartItemIds=' + cartItemIds.join(',') + '&isStore=true&frompage=0'
            });
        },
    }

})