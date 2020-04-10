var config = require('../../utils/config.js');
var WxParse = require('../wxParse/wxParse.js');
var template = require('../common/templeates.js');
var app = getApp();

Page({
    /**
     * 页面的初始数据
     */
    data: {
        id: '',
        TopicData: null,
        RequestUrl: app.getRequestUrl,
        pageLoaded: false,
        fulltextData: [],
        isShowSkuSelectBox: false,
        curPro:{}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            id: options.id
        });
        this.checkVshopExsit();
    },

    checkVshopExsit: function() {
        var that = this;
        config.httpGet(app.getUrl('VShop/GetCheckVshopIfExist'), {
            vshopid: that.data.id
        }, function(res) {
            if (res.success) {
                that.loadData();
            } else {
                app.showErrorModal(res.msg, function() {
                    wx.navigateBack({
                        delta: 1,
                    })
                });
            }
        });
    },

    loadData: function() {
        var that = this;
        config.httpGet(app.getUrl('VShop/GetIndexData'), {
            vshopid: that.data.id
        }, function(res) {
            if (res.success) {
                var HomeTopicPath = res.data.HomeTopicPath;
                if (HomeTopicPath) {
                    config.httpGet(HomeTopicPath, {}, function(result) {
                        var modules = result.LModules;

                        if (modules) {
                            modules.forEach(function(item, index) {
                                if (item.type == 1) {
                                    var fulltext = item.content.fulltext;
                                    WxParse.wxParse('fulltext' + index, 'html', fulltext, that);
                                    var simArr = that.data['fulltext' + index].nodes;
                                    modules[index] = simArr;
                                }
                            })

                            that.setData({
                                TopicData: modules,
                                pageLoaded: true
                            });
                        } else {
                            app.showErrorModal('暂未编辑保存首页模板');
                        }
                    });
                }

            } else {
                app.showErrorModal(res.msg);
            }
        })
    },

    ClickSwiper: function(e) {
        var urllink = e.currentTarget.dataset.link,
            showtype = e.currentTarget.dataset.showtype;

        if (showtype == 10) showtype = 15;
        template.JumpUrlByType(app, config, showtype, urllink);
    },

    gotoKeyWordPage: function(e) {
        wx.navigateTo({
            url: '../vShopProductList/vShopProductList?id=' + this.data.id + '&focus=' + true
        })
    },

    swithSku: function(e) {
        var index = e.target.dataset.index,
            parentindex = e.target.dataset.parentindex;
        this.data.skuArr[index + 1] = e.target.dataset.id;
        this.setData({
            skuArr: this.data.skuArr,
            curSkuData: this.data.skuData.Skus[this.data.skuArr.join('_')]
        });
        this.setDisabledSku(parentindex);
    },

    catchAddCart: function(e) {
        var that = this,
            _domThis = e.currentTarget.dataset,
            curProId = _domThis.productid,
            url = '';

        that.getProductInfo(curProId, function(_pro) {
            that.setData({curPro:_pro});
            var activetype = _pro.ActiveType,
                activeid = _pro.ActiveId;
            if (activetype == 1) {
                wx.navigateTo({
                    url: '../countdowndetail/countdowndetail?id=' + activeid
                });
                return;
            }

            var curOP = _domThis.operator;
            var num = parseInt(curOP + "1");
            var opensku = _domThis.opensku + '';
            if (!_pro.HasSKU || (_pro.HasSKU && opensku == "false")) {
                if (that.data.curSkuData && that.data.curSkuData.Stock == 0) {
                    app.showErrorModal('当前所选规格库存为0');
                    return;
                }
                if (_pro.Stock == 0) {
                    app.showErrorModal('该商品库存为0');
                    return;
                }
                var curSku = _domThis.sku;
                if(!curSku){
                    curSku = _pro.SkuId;
                }
                that.addToCart(curProId, curSku, num, _pro.HasSKU);
            } else {
                wx.showLoading();
                app.getOpenId(function(openid) {
                    wx.request({
                        url: app.getUrl("product/GetProductSkus"),
                        data: {
                            ProductId: curProId,
                            openId: openid,
                        },
                        success: function(res) {
                            wx.hideLoading();
                            res = res.data;
                            if (res.success) {
                                res = res.data;
                                if (res.Stock == 0) {
                                    wx.showToast({
                                        title: '此商品已售罄',
                                    });
                                    return;
                                }
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
                                that.setData({
                                    chooseSkuHide: false,
                                    skuData: res,
                                    skuArr: res.DefaultSku.SkuId.split('_'),
                                    curSkuData: res.DefaultSku
                                });

                                that.setDisabledSku(0);

                                that.setData({
                                    isShowSkuSelectBox: true,
                                });
                            }
                        },
                        complete: function() {}
                    });
                });
            }
        });
    },

    setDisabledSku: function(index) {
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

    addToCart: function(id, skuId, quantity, hassku) {
        var that = this;
        app.getOpenId(function(openid) {
            wx.request({
                url: app.getUrl(app.globalData.getUpdateToCart),
                data: {
                    openId: openid,
                    SkuID: skuId,
                    Quantity: quantity,
                    GiftID: 0
                },
                success: function(result) {
                    result = result.data;
                    if (result.success) {
                        if (hassku) {
                            that.setProductCartQuantity(id, quantity, "+");
                            that.setSkuCartQuantity(skuId, quantity, "+", result.data.Price, result.data.IsOpenLadder);
                        } else {
                            wx.showToast({
                                title: '已添加至购物车',
                                icon: 'success',
                                image: '',
                                duration: 1500,
                                mask: true,
                            })
                        }


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
                complete: function() {}
            });
        });
    },

    setProductCartQuantity: function(id, num, operator) { //修改商品购物车中存在数量
        var that = this,
            hasEdit = false,
            _pro = that.data.curPro;
        if (_pro) {
            num = parseInt(num);
            switch (operator) {
                case "=":
                    _pro.CartQuantity = num;
                    break;
                case "+":
                    _pro.CartQuantity += num;
                    break;
            }
            if (_pro.CartQuantity < 0) {
                _pro.CartQuantity = 0;
            }
            hasEdit = true;
        }
        // if (hasEdit) {
        //     var newdata = {
        //         choiceProducts: _Products
        //     };
        //     that.setData(newdata);
        // }
    },
    setSkuCartQuantity: function(skuId, num, operator, price, isOpenLadder) {
        //修改商品失规格购物车中存在数量,只能操作this.data.CurrentProduct中的规格
        var that = this,
            hasEdit = false,
            _curProduct = that.data.skuData;

        if (_curProduct) {
            var _cursku = that.data.curSkuData;
            if (_cursku) {
                num = parseInt(num);
                switch (operator) {
                    case "=":
                        _cursku.CartQuantity = num;
                        break;
                    case "+":
                        _cursku.CartQuantity += num;
                        break;
                }
                if (_cursku.CartQuantity < 0) {
                    _cursku.CartQuantity = 0;
                }
                if (isOpenLadder) {
                    _cursku.SalePrice = price;
                }
                hasEdit = true;
            }
        }
        if (hasEdit) {
            that.data.skuData.Skus[that.data.curSkuData.SkuId] = that.data.curSkuData;
            that.setData({
                curSkuData: that.data.curSkuData,
                skuData: that.data.skuData
            });
        }
    },

    hideSkuDOM: function(e) {
        var hidden = e.currentTarget.dataset.hidden;
        this.setData({
            isShowSkuSelectBox: !hidden
        });
    },

    getProductInfo: function(pid, callback) {
        config.httpGet(app.getUrl('VShop/GetVshopIndexProduct'), {
            pid: pid
        }, function(res) {
            if (res.success) {
                if (callback instanceof Function) {
                    callback(res.data);
                }
            } else {
                app.showErrorModal(res.msg);
            }

        });
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