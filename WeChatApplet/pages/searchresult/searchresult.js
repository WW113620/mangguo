var app = getApp();
Page({
    data: {
        ProductList: null,
        SortBy: '',
        SortOrder: 'asc',
        KeyWord: '',
        CategoryId: '',
        PageIndex: 1,
        PageSize: 10,
        Num: 0,
        SortClass: '',
        CurrentProduct: null,    //当前商品信息
        CurrentSku: null,
        selectedSkuContent: null,
        isShowSkuSelectBox: false,
        index: 0,
        TotalNum: 0,
        pageLoaded:false
    },
    onLoad: function (options) {
        //var keyword = options.keyword;
        var keyword = wx.getStorageSync('keyword')||'',
            categoryId = options.cid;
        if (categoryId == undefined) {
            categoryId = "";
        }
        else {
            keyword = "";
        }
        this.setData({
            KeyWord: keyword,
            CategoryId: categoryId
        })
        this.loadData(this, false);
    },
    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
        this.GetShopCart();
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    },
    onSearch: function (e) {
        this.setData({
            PageIndex: 1
        })
        this.loadData(this, false);
    },
    onReachBottom: function () {
        var that = this,
            pageIndex = that.data.PageIndex + 1;
        that.setData({
            PageIndex: pageIndex
        })
        that.loadData(that, true);
    },
    bindKeyWordInput: function (e) {
        this.setData({
            KeyWord: e.detail.value
        })
    },
    onConfirmSearch: function (e) {
        var that = this,
            keyword = e.detail.value;
        that.setData({
            KeyWord: keyword,
            PageIndex: 1
        })
        that.loadData(that, false);
    },
    bindBlurInput: function (e) {
        wx.hideKeyboard()
    },
    gotoKeyWordPage: function (e) {
        wx.navigateTo({
            url: '../search/search'
        })
    },
    onSortClick: function (e) {
        var that = this,
            sortby = e.target.dataset.sortby,
            suoyin = e.currentTarget.dataset.num,
            sortorder = "asc",
            classname = "shengxu";
        if (that.data.SortOrder == sortorder) {
            sortorder = "desc";
            classname = "jiangxu";
        }
        that.setData({
            PageIndex: 1,
            SortBy: sortby,
            SortOrder: sortorder,
            Num: suoyin,
            SortClass: classname
        })
        that.loadData(that, false);
    },
    goToProductDetail: function (e) {
        var productid = e.currentTarget.dataset.productid,
            activeid = e.currentTarget.dataset.activeid,
            activetype = e.currentTarget.dataset.activetype,
            toUrl = '../productdetail/productdetail?id=' + productid;
        if (activetype == 1)
            toUrl = '../countdowndetail/countdowndetail?id=' + activeid;

        wx.navigateTo({
            url: toUrl,
        })
    },
    loadData(that, isNextPage) {
        wx.showNavigationBarLoading();
        app.getOpenId(function (openid) {
            wx.request({
                url: app.getUrl(app.globalData.getProducts),
                data: {
                    openId: openid,
                    keyword: that.data.KeyWord,
                    cId: that.data.CategoryId = " " ? 0 : that.data.CategoryId,
                    pageIndex: that.data.PageIndex,
                    pageSize: that.data.PageSize,
                    sortBy: that.data.SortBy,
                    sortOrder: that.data.SortOrder
                },
                success: function (result) {
                    result = result.data;
                    if (result.success) {
                        var r = result.data;
                        if (isNextPage) {
                            var old = that.data.ProductList;
                            old.push.apply(old, r);
                            that.setData({
                                ProductList: old
                            })
                        }
                        else {
                            that.setData({
                                ProductList: r
                            })
                        }
                        that.setData({
                            pageLoaded:true
                        });
                    }
                    else if (result.code == '502') {
                        //wx.navigateTo({
                        //  url: '../login/login'
                        //})
                    }
                    else {
                        app.showErrorModal(result.msg, function (res) {
                            if (res.confirm) {
                                wx.navigateBack({ delta: 1 })
                            }
                        });
                    }
                }, complete: function () {
                    wx.hideNavigationBarLoading();
                }
            })
        },'searchresult')
    },
    GetShopCart: function () {
        var that = this,
            totalnum = 0;
        app.getOpenId(function (openid) {
            wx.request({
                url: app.getUrl(app.globalData.getCartProduct),
                data: { openId: openid },
                success: function (result) {
                    result = result.data;
                    if (result.success) {
                        result.data.Shop.forEach(function (cartitem, index, array) {
                            if (cartitem[index] != null) {
                                if (parseInt(cartitem[index].Count) > 0) {
                                    totalnum += parseInt(array[index].Count);
                                }
                            }
                        });

                    } else if (result.code == "502") {
                        
                    } else {
                        app.showErrorModal(result.msg, function (res) {
                            if (res.confirm) {
                                wx.navigateBack({ delta: 1 })
                            }
                        });
                    }
                },
                complete: function () {
                    wx.hideLoading();
                    that.setData({
                        TotalNum: totalnum
                    });
                }
            })

        },'searchresult');
    },
    findProductById: function (id) {
        var _pro = this.data.ProductList.find(function (d) {
            return d.ProductId == id;
        });
        return _pro;
    },
    setProductCartQuantity: function (id, num, operator) {  //修改商品购物车中存在数量
        var that = this,
            hasEdit = false,
            _Products = that.data.ProductList,
            _pro = _Products.find(function (d) {
                return d.ProductId == id;
            });
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
        if (hasEdit) {
            var newdata = {
                ProductList: _Products
            };
            that.setData(newdata);
        }
    },
    setSkuCartQuantity: function (skuId, num, operator, price, isOpenLadder) {
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
    catchAddCart: function (e) {
        var that = this,
            _domThis = e.currentTarget.dataset,
            curProId = _domThis.productid,
            activeid = _domThis.activeid,
            activetype = _domThis.activetype;
        if (activetype == 1) {
            wx.navigateTo({
                url: '../countdowndetail/countdowndetail?id=' + activeid
            });
            return;
        }

        var curOP = _domThis.operator,
            num = parseInt(curOP + "1"),
            opensku = _domThis.opensku,
            _pro = that.findProductById(curProId);
        if (!_pro.HasSKU || (_pro.HasSKU && opensku == "false")) {
            if (that.data.curSkuData && that.data.curSkuData.Stock == 0) {
                app.showErrorModal('当前所选规格库存为0');
                return;
            }
            if (!_pro.HasSKU && _pro.Stock == 0) {
                app.showErrorModal('该商品库存为0');
                return;
            }
            var curSku = _domThis.sku;
            that.addToCart(curProId, curSku, num);
        } else {
            wx.showLoading({ title: "商品信息加载中..." });
            app.getOpenId(function (openid) {
                wx.request({
                    url: app.getUrl(app.globalData.getProductSkus),
                    data: {
                        ProductId: curProId,
                        openId: openid,
                    },
                    success: function (res) {
                        wx.hideLoading();
                        res = res.data;
                        if (res.success) {
                            res = res.data;
                            var newSku = {},
                                enabledSku;
                            res.Skus.forEach(function (item) {
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

                            that.showSkuDOM();
                        }
                    },
                    complete: function () {
                    }
                });
            });
        }
    },
    setDisabledSku: function (index) {
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

        SkuItems[nextIndex].AttributeValue.forEach(function (item) {
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
    swithSku: function (e) {
        var index = e.target.dataset.index,
            parentindex = e.target.dataset.parentindex;
        this.data.skuArr[index + 1] = e.target.dataset.id;
        this.setData({
            skuArr: this.data.skuArr,
            curSkuData: this.data.skuData.Skus[this.data.skuArr.join('_')]
        });
        this.setDisabledSku(parentindex);
    },
    addToCart: function (id, skuId, quantity) {
        var that = this;
        
        app.getOpenId(function (openid) {
            wx.request({
                url: app.getUrl(app.globalData.getUpdateToCart),
                data: {
                    openId: openid,
                    SkuID: skuId,
                    Quantity: quantity
                },
                success: function (result) {
                    result = result.data;
                    if (result.success) {
                        that.setProductCartQuantity(id, quantity, "+");
                        that.setSkuCartQuantity(skuId, quantity, "+", result.data.Price, result.data.IsOpenLadder);
                    } else {
                        if (result.code == '502') {
                            wx.navigateTo({
                                url: '../login/login'
                            })
                        }
                        else {
                            app.showErrorModal(result.msg);
                        }
                    }
                },
                complete: function () {
                    var totalnum = parseInt(that.data.TotalNum);
                    that.setData({
                        TotalNum: totalnum + parseInt(quantity)
                    });
                }
            });
        });
    },
    hideSkuDOM: function () {
        this.setData({
            isShowSkuSelectBox: false,
        });
    },
    showSkuDOM: function () {
        this.setData({
            isShowSkuSelectBox: true,
        });
    },
})