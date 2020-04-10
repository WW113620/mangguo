var app = getApp();
var WxParse = require('../wxParse/wxParse.js');
var config = require("../../utils/config.js");

Page({
    data: {
        ProductId: 0,
        ProductName: '',
        MetaDescription: '',
        TempMetaDescription: '',
        ShortDescription: '',
        //SaleCounts:'',
        ShowSaleCounts: '',
        IsSaleCountOnOff: true,
        MarketPrice: '',
        IsfreeShipping: '',
        MaxSalePrice: '',
        MinSalePrice: '',
        ProductImgs: '',
        //DefaultSku:'',
        SkuItemList: '',
        Skus: '',
        Freight: '',
        Coupons: '',
        Promotes: null,
        ShowPromotesText: '',
        ActiveType: '',
        ActiveText: '',
        ShowPrice: '',
        backShow: 'none',
        SkuShow: 'none',
        couponShow: 'none',
        promoteShow: 'none',
        skuImg: '',
        skuPrice: 0,
        skuStock: 0,
        selectedSkuContent: '',
        buyAmount: 1,
        selectedskuList: [],
        isbuy: true,
        ReviewCount: 0,
        gotopVal: true,
        MinBath: 0,
        MeasureUnit: '',
        MaxBuyCount: 0,
        hasLoaded: false,
        SendTime: '', //几时内发货
        hasFightGroup: false,
        fightFroupPrice: 0,
        isStore: false,
        BonusCount: 0,
        pageLoaded: false,
        BonusGrantPrice: 0,
        shopBuyHide: false,
        isDistributore: false,
        IsFavorite: false,
    },
    onPullDownRefresh: function() {
        this.loadData(this);
    },
    onReady() {
        this.storeCart = this.selectComponent("#storeCart");
    },
    onShow() {
        if (this.data.isStore && !this.data.producttype && this.data.pageLoaded) {
            this.storeCart.getCartData();
        }
    },
    onLoad: function(options) {
        var distributorId = options.distributorId;
        wx.setStorageSync("distributorId", distributorId);
        wx.showLoading();
        const productid = options.id;
        this.setData({
            ProductId: productid,
            shopBranchId: parseInt(options.shopBranchId) || 0,
            isStore: options.shopBranchId ? true : '',
            isDistributor: wx.getStorageSync("userInfo").IsDistributor || false
        })
        this.loadData(this);
    },
    onShareAppMessage: function() {
        var that = this;
        var path = '/pages/productdetail/productdetail?id=' + that.data.ProductId + (that.data.shopBranchId ? '&shopBranchId=' + that.data.shopBranchId : '');
        var userInfo = wx.getStorageSync("userInfo");
        if (userInfo.IsDistributor) {
            path += ('&distributorId=' + userInfo.UserId);
        }
        return {
            title: that.data.ProductName,
            path: path,
            imageUrl: that.data.ProductImgs.length > 0 ? that.data.ProductImgs[0] : '',
            success: function(res) {},
            fail: function(res) {}
        }
    },
    //避免与<scroll-view>冲突，把微信提供的onReachBottom改为自定义方法
    reachBottom: function() {
        var that = this;
        if (this.data.metaDescription == null || this.data.metaDescription == '') {
            var metaDescription = this.data.TempMetaDescription;
            if (metaDescription != null && metaDescription != undefined) {
                WxParse.wxParse('metaDescription', 'html', metaDescription, that);
            }
        }
    },

    getStoreInfo: function() {
        var that = this;
        config.httpGet(app.getUrl('Product/GetStroreInfo'), {
            openId: app.globalData.openId,
            productId: that.data.ProductId,
            fromLatLng: that.data.fromLatLng,
            shopid: that.data.ShopId
        }, function(res) {
            if (res.success) {
                that.setData({
                    storeInfo: res.data.StoreInfo,
                    storeTotal: res.data.total
                });
            }
        })
    },
    getLocation: function() {
        var that = this;
        wx.getLocation({
            type: 'wgs84',
            success: function(res) {
                that.setData({
                    fromLatLng: res.latitude + "," + res.longitude
                });
                that.getStoreInfo();
            },
            fail: function(e) {
                wx.showModal({
                    title: '提示',
                    content: '未能获取地理位置，请重新获取',
                    success: function(res) {
                        if (res.confirm) {
                            app.openSetting(function() {
                                that.getLocation();
                            });
                        }
                    }
                })
            }
        })
    },
    goStoreHome(e) {
        wx.navigateTo({
            url: '../shophome/shophome?id=' + this.data.storeInfo.Id + '&productid=' + this.data.ProductId + '&fromLatLng=' + this.data.fromLatLng
        })
    },
    goStoreList(e) {
        wx.navigateTo({
            url: '../storeList/storeList?shopid=' + this.data.ShopId + '&productid=' + this.data.ProductId + '&fromLatLng=' + this.data.fromLatLng
        })
    },
    getDistributionInfo() {
        var that = this;
        app.getDistributionInfo(this.data.ProductId, function(data) {
            that.setData({
                distributionInfo: data
            });
        });
    },

    loadData: function() {
        var that = this;
        wx.showNavigationBarLoading(); //在标题栏中显示加载
        this.getDistributionInfo();

        wx.request({
            url: app.getUrl("product/GetProductDetail"),
            data: {
                openId: app.globalData.openId,
                productId: that.data.ProductId,
                shopBranchId: that.data.shopBranchId
            },
            success: function(result) {
                wx.hideLoading();
                result = result.data;
                if (result.success) {
                    const r = result.data;

                    if (r.SkuItemList.length == 0) {
                        that.setData({
                            curSkuData: r.Skus[0],
                            skuStock: r.Stock
                        })
                    } else {
                        var newSku = {};
                        r.Skus.forEach(function(item) {
                            newSku[item.SkuId] = item;
                        });
                        r.Skus = newSku;
                    }
                    var _showPromote = [];
                    if (r.Promotes.freeFreight && !r.ProductType && !that.data.isStore) {
                        _showPromote.push('满￥' + r.Promotes.freeFreight + '免运费');
                    }
                    if (r.Promotes.FullDiscount) {
                        _showPromote.push(r.Promotes.FullDiscount.ActiveName);
                    }
                    if (r.BonusCount > 0) {
                        _showPromote.push('满' + r.BonusGrantPrice + '送红包' + r.BonusCount + '个代金红包');
                    }
                    r.Shop.VShopLog = r.VShopLog;
                    r.Shop.ProductAndDescription = r.Shop.ProductAndDescription.toFixed(2);
                    r.Shop.SellerServiceAttitude = r.Shop.SellerServiceAttitude.toFixed(2);
                    r.Shop.SellerDeliverySpeed = r.Shop.SellerDeliverySpeed.toFixed(2);

                    that.setData({
                        Shop: r.Shop,
                        ShopId: r.Shop.Id,
                        ProductId: r.ProductId,
                        ProductName: r.ProductName,
                        ShortDescription: r.ShortDescription ? r.ShortDescription : '',
                        //SaleCounts: r.SaleCounts,
                        ShowSaleCounts: r.ShowSaleCounts,
                        IsSaleCountOnOff: r.IsSaleCountOnOff,
                        IsUnSale: r.IsUnSale,
                        MarketPrice: r.MarketPrice,
                        IsfreeShipping: r.IsfreeShipping,
                        MaxSalePrice: r.MaxSalePrice,
                        MinSalePrice: r.MinSalePrice,
                        ProductImgs: r.ProductImgs,
                        //DefaultSku:r.DefaultSku,
                        skuArr: [r.ProductId, 0, 0, 0],
                        SkuItemList: r.SkuItemList,
                        Skus: r.Skus,
                        Freight: r.Freight,
                        Coupons: r.Coupons,
                        Promotes: r.Promotes,
                        ShowPromotesText: _showPromote.join('，'),
                        ActiveType: r.ActiveType,
                        ActiveText: r.ActiveType >= 3 ? '暂时无法购买' : '已下架',
                        ShowPrice: r.MaxSalePrice == r.MinSalePrice ? r.MinSalePrice : r.MinSalePrice + '～' + r.MaxSalePrice,
                        skuImg: r.ThumbnailUrl60,
                        defaultImg: r.ThumbnailUrl60,
                        skuPrice: r.MinSalePrice,
                        allStock: r.Stock || 0,
                        selectTextArr: [],
                        selectedSkuContent: '',
                        ReviewCount: r.ReviewCount,
                        buyAmount: 1,
                        CartCount: r.CartCount,
                        TempMetaDescription: r.MetaDescription,
                        ShowStatus: r.ShowStatus,
                        // metaDescription: WxParse.wxParse('metaDescription', 'html', r.MetaDescription, that),
                        IsOpenLadder: r.IsOpenLadder, //是否开启阶梯价
                        LadderPrices: r.LadderPrices, //阶梯价列表
                        MinBath: r.MinBath, //最小批量
                        MeasureUnit: r.MeasureUnit,
                        MaxBuyCount: r.MaxBuyCount, //限购数
                        SendTime: r.SendTime, //几时内发货
                        hasFightGroup: r.hasFightGroup,
                        fightFroupPrice: r.fightFroupPrice,
                        ActiveId: r.ActiveId,
                        producttype: r.ProductType,
                        pageLoaded: true,
                        VirtualProductInfo: r.VirtualProductInfo,
                        BonusCount: r.BonusCount,
                        BonusGrantPrice: r.BonusGrantPrice,
                        BonusRandomAmountStart: r.BonusRandomAmountStart,
                        BonusRandomAmountEnd: r.BonusRandomAmountEnd,
                        IsFavorite: r.IsFavorite,
                        IsFavoriteShop: r.IsFavoriteShop
                    });

                    if (!that.data.isStore) {
                        that.getLocation();
                    }
                } else {
                    if (result.code == '502') {
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
                }
            },
            complete: function() {
                // complete
                wx.hideNavigationBarLoading(); //完成停止加载
                wx.stopPullDownRefresh(); //停止下拉刷新
                that.setData({
                    hasLoaded: true
                });
            }
        })
    },
    bindVshop: function(e) {
        var shopid = this.data.Shop.VShopId;
        wx.navigateTo({
            url: '../vShopHome/vShopHome?id=' + shopid,
        })
    },
    bindShopFavorite: function(e) {
        var that = this;
        app.addOrCancelFavoriteVshop(that, e, config);
    },
    bindFavorite: function(e) {
        var that = this;
        app.addOrCancelFavoriteProduct(that, e, config);
    },
    updateProduct() {
        config.httpGet(app.getUrl('product/GetProductDetail'), {
            shopBranchId: this.data.shopBranchId,
            productId: this.data.ProductId,
            openId: app.globalData.openId
        }, (res) => {
            this.setData({
                CartCount: res.data.CartCount
            });
        });
    },
    chooseSku: function(e) {
        this.storeCart.chooseSku();
    },
    productNumChange: function(e) {
        var that = this,
            type = e.currentTarget.dataset.type,
            CartCount = this.data.CartCount,
            that = this;
        if (type) {
            CartCount += 1;
        } else {
            CartCount -= 1;
        }
        if (CartCount < 0) {
            CartCount = 0;
        }
        this.setData({
            CartCount: CartCount
        });
        this.changeCart('', CartCount, this.data.ProductId, function() {
            CartCount -= 1;
            if (CartCount < 0) {
                CartCount = 0;
            }
            that.setData({
                CartCount: CartCount
            })
        });
    },
    changeCart(skuId, count, productId, callback) {
        var that = this;
        if (!skuId) {
            skuId = productId + '_0_0_0';
        }
        config.httpGet(app.getUrl('shopCart/GetUpdateCartItem'), {
            shopBranchId: this.data.shopBranchId,
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
                that.storeCart.getCartData();
            }
        });
    },
    getCoupon: function(e) {
        const that = this;
        const couponid = e.currentTarget.id;
        app.getOpenId(function(openid) {
            wx.request({
                url: app.getUrl("Coupon/GetUserCoupon"),
                data: {
                    openId: openid,
                    couponId: couponid
                },
                success: function(result) {
                    result = result.data;
                    if (result.success) {
                        wx.showToast({
                            title: '领取成功',
                            image: '../../images/succes.png'
                        });
                    } else {
                        if (result.code == '502') {
                            wx.navigateTo({
                                url: '../login/login'
                            })
                        } else {
                            wx.showToast({
                                title: result.msg,
                                icon: 'none'
                            });
                        }
                    }

                }
            })
        })
    },
    clickCouponList: function(e) {
        const that = this;
        if (that.data.Coupons && that.data.Coupons.length > 0) {
            this.setData({
                backShow: '',
                couponShow: '',
                promoteShow: 'none'
            })
        } else {
            wx.showToast({
                title: '暂时没有可以领取的优惠券',
                icon: 'loading'
            })
        }
    },
    clickPromoteList: function(e) {
        if (this.data.ShowPromotesText) {
            this.setData({
                backShow: '',
                promoteShow: '',
                couponShow: 'none'
            })
        } else {
            wx.showToast({
                title: '暂时没有进行中的满额优惠活动',
                icon: 'loading'
            })
        }
    },
    clickSku: function(e) {
        this.setData({
            backShow: '',
            SkuShow: '',
            isbuy: true
        })
    },
    setDisabledSku: function(index) {
        //选择某个sku自动组合下一组规格可能组合，判断库存为零的的不可选
        var that = this,
            SkuItems = that.data.SkuItemList,
            Skus = that.data.Skus,
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
            if (Skus[tempArr.join('_')]) {
                if (!Skus[tempArr.join('_')].Stock) {
                    item.disabled = true;
                } else {
                    item.disabled = false;
                }
            }
        });
        that.setData({
            SkuItemList: that.data.SkuItemList
        });
    },
    swithSku: function(e) {
        var index = e.target.dataset.index,
            parentindex = e.target.dataset.parentindex,
            value = e.target.dataset.skuvalue,
            imgurl = e.target.dataset.imgurl;
        if (index === 0 && imgurl != this.data.skuImg) {
            imgurl = imgurl || this.data.defaultImg;
            this.setData({
                skuImg: imgurl
            });
        }
        this.data.skuArr[index + 1] = e.target.dataset.id;
        this.data.selectTextArr[index] = value;
        var curSkuData = this.data.Skus[this.data.skuArr.join('_')],
            str = '';
        this.data.selectTextArr.forEach(function(item, i) {
            if (item) {
                if (i > 0 && str) {
                    str += '，'
                }
                str += item;
            }
        });
        this.setData({
            skuArr: this.data.skuArr,
            curSkuData: curSkuData,
            selectTextArr: this.data.selectTextArr,
            selectedSkuContent: str
        });
        if (curSkuData) {
            if (this.data.IsOpenLadder) {
                this.setData({
                    skuStock: curSkuData.Stock
                })
            } else {
                this.setData({
                    skuPrice: curSkuData.SalePrice,
                    skuStock: curSkuData.Stock,
                })
            }
        }
        this.setDisabledSku(parentindex);
    },
    addShopCart: function(e) {
        this.setData({
            backShow: '',
            SkuShow: '',
            isbuy: false,
        })
    },
    clickback: function(e) {
        this.setData({
            backShow: 'none',
            SkuShow: 'none',
            couponShow: 'none',
            promoteShow: 'none'
        })
    },
    onCouponHide: function(e) {
        this.setData({
            backShow: 'none',
            couponShow: 'none'
        })
    },
    onPromoteHide: function(e) {
        this.setData({
            backShow: 'none',
            promoteShow: 'none'
        })
    },
    onSkuHide: function(e) {
        this.setData({
            backShow: 'none',
            SkuShow: 'none'
        })
    },
    reduceAmount: function(e) {
        const that = this;
        var amount = this.data.buyAmount;
        amount = amount - 1;
        if (amount <= 0)
            return;
        else {
            if (that.data.IsOpenLadder) {
                app.getOpenId(function(openid) {
                    wx.request({
                        url: app.getUrl("product/GetChangeNum"),
                        data: {
                            openId: openid,
                            pid: that.data.ProductId,
                            buyNum: amount
                        },
                        success: function(result) {
                            result = result.data;
                            if (result.success) {
                                that.setData({
                                    skuPrice: result.data
                                })
                            }
                        }
                    });
                });
            }
            this.setData({
                buyAmount: amount
            })
        }
    },
    addAmount: function(e) {
        var that = this,
            amount = this.data.buyAmount,
            stock = this.data.skuStock;
        amount = amount + 1;
        if (amount > stock)
            return;
        else {
            if (that.data.IsOpenLadder) {
                app.getOpenId(function(openid) {
                    wx.request({
                        url: app.getUrl("product/GetChangeNum"),
                        data: {
                            openId: openid,
                            pid: that.data.ProductId,
                            buyNum: amount
                        },
                        success: function(result) {
                            result = result.data;
                            if (result.success) {

                                that.setData({
                                    skuPrice: result.data
                                })
                            }
                        }
                    });
                });
            }
            this.setData({
                buyAmount: amount
            })
        }
    },
    changeAmount: function(e) {
        var that = this,
            amount = parseInt(e.detail.value),
            stock = this.data.skuStock;
        if (isNaN(amount) || amount > stock || amount <= 0) {
            app.showErrorModal("请输入正确的数量,不能大于库存或者小于等于0");
            return;
        } else {
            this.setData({
                buyAmount: amount
            })
            if (that.data.IsOpenLadder) {
                app.getOpenId(function(openid) {
                    wx.request({
                        url: app.getUrl("product/GetChangeNum"),
                        data: {
                            openId: openid,
                            pid: that.data.ProductId,
                            buyNum: amount
                        },
                        success: function(result) {
                            result = result.data;
                            if (result.success) {

                                that.setData({
                                    skuPrice: result.data
                                })
                            }
                        }
                    });
                });
            }
        }
    },
    doCommit: function(e) {
        var option = e.currentTarget.dataset.option,
            that = this;
        if (!that.data.curSkuData) {
            app.showErrorModal("请选择规格");
            return;
        }
        if (that.data.buyAmount <= 0) {
            app.showErrorModal("请输入要购买的数量");
            return;
        }
        var amount = that.data.buyAmount;
        if (option == 'buy') {
            if (that.data.IsOpenLadder && amount < that.data.MinBath) {
                app.showErrorModal("必须满足最小批量" + that.data.MinBath + "才能购买");
                return;
            }
            if (!that.data.IsOpenLadder && that.data.MaxBuyCount > 0 && amount > that.data.MaxBuyCount) {
                app.showErrorModal("已超出商品最大购买数量" + that.data.MaxBuyCount);
                return;
            }
        }
        var skuid = that.data.skuArr.join('_');
        if (option == 'buy') {
            app.getOpenId(function(openid) {
                wx.redirectTo({
                    url: '../submitorder/submitorder?productsku=' + skuid + '&buyamount=' + amount + '&frompage=1' + '&isStore=' + that.data.isStore + '&producttype=' + that.data.producttype + '&shopBranchId=' + that.data.shopBranchId
                })
            });

        } else {
            app.getOpenId(function(openid) {
                wx.request({
                    url: app.getUrl("Cart/getaddToCart"),
                    data: {
                        openId: openid,
                        SkuID: skuid,
                        Quantity: amount
                    },
                    success: function(result) {
                        result = result.data;
                        if (result.success) {
                            wx.showModal({
                                title: '提示',
                                content: '加入购物车成功',
                                showCancel: false,
                                success: function(res) {
                                    if (res.confirm) {
                                        that.setData({
                                            backShow: 'none',
                                            SkuShow: 'none'
                                        });
                                    }
                                }
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
                    }

                });
            });
        }
    },
    goGroup: function(e) {
        wx.navigateTo({
            url: '../groupproduct/groupproduct?id=' + e.currentTarget.dataset.activeid
        })
    },
    goTop: function(e) {
        this.setData({
            scrollTop: 0
        })
    },
    scroll: function(e) {
        this.setData({
            gotopVal: e.detail.scrollTop < 350
        });
    },
    previewImage: function(e) {
        var current = e.target.dataset.src;
        wx.previewImage({
            current: current, // 当前显示图片的http链接  
            urls: this.data.ProductImgs // 需要预览的图片http链接列表  
        })
    }
})