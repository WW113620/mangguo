// /pages/productsearch/productsearch.js

var app = getApp();
Page({
    data: {
        Css: { LHeight: 0, FirstIndex: 0, SecondIndex: 0, SortIndex: 1 },
        CategoryList: [],
        CurrentCategory: null,
        ProductList: null,
        CurrentProduct: null,
        CurrentSku: null,
        Cid: 0,
        SortBy: '',
        SortOrder: 'asc',
        KeyWord: '',
        PageIndex: 1,
        PageSize: 10,
        Num: 0,
        SortClass: '',
        isShow: true,
        isShowSkuSelectBox: false,
        selectedskuList: [],
        buyAmount: 1,
        selectedSku: '',
        SkuItemList: null,
        MarginTop: 0,
        TempMarginTop: 0,
        StartScrollTop: 0,
        IsDown: true,
        IsPagePost: false,

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var querycid = options.cid;
        if (parseInt(querycid) > 0) {
            this.setData({
                Cid: querycid,
                IsPagePost: true
            });
        }

        this.loadCategory(this);//获取商品分类
        /*this.loadData(this, false);*/
    },
    SwitchSubCategory: function () {
        this.setData({
            IsDown: true
        });
    },
    GetShopCart: function () {
        var totalnum = 0,
            that = this,
            tempshopcart = that.data.ProductList;

        wx.request({
            url: app.getUrl(app.globalData.getCartProduct),
            data: { openId: app.globalData.openId },
            success: function (result) {
                result = result.data;
                if (result.success) {
                    var shopcarttemp = result.data.Shop;
                    var changeshopcart = {};
                    shopcarttemp.forEach(function (cartitem, index, array) {
                        if (parseInt(cartitem[index].Count) > 0) {
                            if (changeshopcart[cartitem[index].Id] != undefined) {
                                changeshopcart[cartitem[index].Id] = parseInt(changeshopcart[cartitem[index].Id]) + parseInt(cartitem[index].Count);
                            } else {
                                changeshopcart[cartitem[index].Id] = cartitem[index].Count;
                            }
                            totalnum += parseInt(cartitem[index].Count);
                        }
                    });
                    if (tempshopcart != null) {
                        tempshopcart.forEach(function (item, index, array) {
                            if (changeshopcart[item.ProductId] != undefined) {
                                item.CartQuantity = parseInt(changeshopcart[item.ProductId]);
                            } else {
                                item.CartQuantity = 0;
                            }
                        });
                    }


                } else if (result.code == '502') {
                    wx.redirectTo({
                        url: '../login/login'
                    })
                } else {
                    app.showErrorModal(result.msg, function (res) {
                        if (res.confirm) {
                            wx.navigateBack({ delta: 1 })
                        }
                    });
                }
            },
            complete: function () {
                if (tempshopcart != null) {
                    that.setData({
                        ProductList: tempshopcart,
                        TotalNum: totalnum
                    });
                }
                wx.hideLoading();
            }
        })
    },
    loadCategory: function (that) {//加载商品分类
        wx.request({
            url: app.getUrl(app.globalData.getAllCategories),
            data: {},
            success: function (result) {
                result = result.data;
                if (result.success) {
                    var r = result.data;
                    that.setData({
                        CategoryList: r,
                        CurrentCategory: r[0],
                        Cid: r[0].cid
                    });
                    that.loadData(that, false);
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
            },
            complete: function () {
                that.SetSubCategoryHeight();

            }
        })

    },
    EndTouch: function (e) {
        var that = this;
        var scrolly = parseInt(e.changedTouches[0].clientY);
        var startscroll = parseInt(that.data.StartScrollTop);
        //往上

        if (scrolly != startscroll) {
            var tempmargin = that.data.TempMarginTop;
            if (scrolly - startscroll > 0) {
                that.setData({
                    IsDown: true,
                    MarginTop: tempmargin
                });
            } else {
                that.setData({
                    IsDown: false,
                    MarginTop: 0
                });
            }
        }


    },
    StartTouch: function (e) {
        var that = this;
        var scrolly = e.changedTouches[0].clientY;
        that.setData({
            StartScrollTop: scrolly
        });
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
                            if (result.msg) {
                                app.showErrorModal(result.msg);
                            } else {
                                app.showErrorModal('系统错误，请联系管理员')
                            }
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
    setSkuCartQuantity: function (skuId, num, operator, price, isOpenLadder) {
        //修改商品失规格购物车中存在数量,只能操作this.data.CurrentProduct中的规格
        var that = this;
        var hasEdit = false;
        var _curProduct = that.data.skuData;

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
    setProductCartQuantity: function (id, num, operator) {  //修改商品购物车中存在数量
        var that = this;
        var hasEdit = false;
        var _Products = that.data.ProductList;
        var _pro = _Products.find(function (d) {
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
    hideSkuDOM: function () {
        this.setData({
            isShowSkuSelectBox: false,
        });
    },
    catchAddCart: function (e) {
        var that = this,
            _domThis = e.currentTarget.dataset,
            curProId = _domThis.productid,
            curOP = _domThis.operator,
            activeid = _domThis.activeid,
            activetype = _domThis.activetype;
        if (activetype == 1) {
            wx.navigateTo({
                url: '../countdowndetail/countdowndetail?id=' + activeid
            });
            return;
        }
        var num = parseInt(curOP + "1"),
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
            app.getOpenId(function (openid) {
                wx.showLoading({ title: "商品信息加载中..." });
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
                            if (res.Stock == 0) {
                                wx.showToast({
                                    title: '此商品已售罄',
                                });
                                return;
                            }
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
    findProductById: function (id) {
        var _pro = this.data.ProductList.find(function (d) {
            return d.ProductId == id;
        });
        return _pro;
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
    BuyProduct: function (e) {
        var that = this,
            index = e.currentTarget.dataset.index,//商品索引
            hassku = e.currentTarget.dataset.sku,//是否存在规格
            productId = e.currentTarget.dataset.productid,//商品编号
            tempproduct = that.data.ProductList,
            tempcrrentsku = null;
        if (hassku == false) {
            tempproduct[index].CartQuantity = 1;
            that.ChangeQuantiy(that, tempproduct, productId + '_0', 1);
        } else {//存在规格弹出规格框
            wx.request({
                url: app.getUrl(app.globalData.getProductSkus),
                data: { ProductId: productId },
                success: function (result) {
                    result = result.data;
                    if (result.success) {
                        var productInfo = result.data;
                        tempcrrentsku = productInfo.DefaultSku;
                        that.setData({
                            isShow: false,
                            CurrentProduct: productInfo,
                            CurrentSku: tempcrrentsku,
                            selectedskuList: []
                        });
                    }
                },
                complete: function () {
                }
            });
        }
    },
    minusCount: function (e) {
        var that = this,
            index = e.currentTarget.dataset.index,
            tempproduct = that.data.ProductList,
            cartquantiy = tempproduct[index].CartQuantity;
        if (cartquantiy <= 1) {
            return;
        }
        cartquantiy = cartquantiy - 1;

        tempproduct[index].CartQuantity = cartquantiy;
        that.ChangeQuantiy(that, tempproduct, tempproduct[index].SkuId, -1);
    },
    addCount: function (e) {
        var that = this,
            index = e.currentTarget.dataset.index,
            tempproduct = that.data.ProductList,
            cartquantiy = tempproduct[index].CartQuantity;
        cartquantiy = cartquantiy + 1;
        tempproduct[index].CartQuantity = cartquantiy;
        that.ChangeQuantiy(that, tempproduct, tempproduct[index].SkuId, 1);
    },
    ChangeQuantiy1: function (that, skuId, quantity) {
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
                    if (!result.success) {
                        if (result.code == '502') {
                            wx.navigateTo({
                                url: '../login/login'
                            })
                        }
                        else {
                            if (result.msg) {
                                app.showErrorModal(result.msg);
                            } else {
                                app.showErrorModal('系统错误，请联系管理员')
                            }
                        }
                    }
                },
                complete: function () {
                    that.loadData(that);
                }
            });
        });
    },
    ChangeQuantiy: function (that, tempproduct, skuId, quantity) {
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
                        that.setData({
                            ProductList: tempproduct
                        });
                    } else {
                        if (result.code == '502') {
                            wx.navigateTo({
                                url: '../login/login'
                            })
                        }
                        else {
                            if (result.msg) {
                                app.showErrorModal(result.msg);
                            } else {
                                app.showErrorModal('系统错误，请联系管理员')
                            }
                        }
                    }
                },
                complete: function () {

                }
            });
        });
    },
    onSkuHide: function (e) {
        that.setData({
            isShow: true
        });
    },
    onSkuClick: function (e) {
        var that = this,
            index = e.target.dataset.indexcount,
            valueid = e.target.id,
            value = e.target.dataset.skuvalue,
            selSku = this.data.selectedskuList;

        selSku[index] = { ValueId: valueid, Value: value };

        var selContent = "",
            isAlSelected = false,
            tempcurrentproduct = this.data.CurrentProduct,
            itemList = this.data.CurrentProduct.SkuItems;
        if (tempcurrentproduct.SkuItems.length == selSku.length) isAlSelected = true;
        var skuId = tempcurrentproduct.ProductId;
        for (var i = 0; i < selSku.length; i++) {
            var info = selSku[i];
            if (info != undefined) {
                selContent += selContent == "" ? info.Value : "," + info.Value;
                skuId += "_" + info.ValueId;
            }
        }
        //var curentItem = itemList[index];
        for (var j = 0; j < tempcurrentproduct.SkuItems[index].AttributeValue.length; j++) {
            var item = tempcurrentproduct.SkuItems[index].AttributeValue[j];
            if (item.ValueId == valueid) {
                tempcurrentproduct.SkuItems[index].AttributeValue[j].UseAttributeImage = 'selected';
            }
            else {
                tempcurrentproduct.SkuItems[index].AttributeValue[j].UseAttributeImage = 'False';
            }
        }


        var currentProductSku = null;

        this.data.CurrentProduct.Skus.forEach(function (item, index, array) {
            var found = true;
            for (var i = 0; i < selSku.length; i++) {
                if (item.SkuId.indexOf('_' + selSku[i].ValueId) == -1)
                    found = false;
            }
            if (found && itemList.length == selSku.length) {
                currentProductSku = item;
                skuId = item.SkuId;
                that.data.buyAmount = item.CartQuantity > 0 ? item.CartQuantity : 1;
                return;
            }
        });
        this.setData({
            selectedskuList: selSku,
            selectedSku: skuId,
            selectedSkuContent: selContent,
            SkuItemList: itemList,
            CurrentProduct: tempcurrentproduct,
            CurrentSku: currentProductSku
        })
    },
    OpenCurrentSku: function () {
        var that = this,
            tempproduct = that.data.ProductList,
            currentsku = that.data.CurrentSku;
        if (currentsku == null || currentsku == undefined) {
            app.showErrorModal("请选择规格内容");
        }
        currentsku.CartQuantity = 1;
        that.setData({
            CurrentSku: currentsku
        });

        that.ChangeQuantiy1(that, currentsku.SkuId, 1);
    },
    bindSearchInput: function (e) {
        var keyword = e.detail.value;
        if (keyword.length > 0) {
            this.setData({
                keyword: keyword
            })
        }
    },

    bindConfirmSearchInput: function (e) {
        const keyword = e.detail.value;
        if (keyword.length > 0) {
            wx.setStorage({
                key: "keyword",
                data: keyword
            })
            wx.switchTab({
                url: "../searchresult/searchresult",
                success: function (res) {
                    wx.hideKeyboard()
                }
            })
        }
    },
    gotoKeyWordPage: function (e) {
        wx.navigateTo({
            url: '../search/search'
        })
    },
    bindBlurInput: function (e) {
        wx.hideKeyboard()
    },
    changeAmount: function (e) {
        var amount = parseInt(e.detail.value),
            stock = this.data.CurrentSkuStock;
        if (isNaN(amount) || amount > stock || amount <= 0) {
            app.showErrorModal("请输入正确的数量,不能大于库存或者小于等于0");
            return;
        } else {
            this.setData({
                buyAmount: amount
            })
        }
    },
    reduceAmount: function (e) {
        var amount = this.data.buyAmount;
        amount = amount - 1;
        if (amount <= 0)
            return;
        else {
            this.setData({
                buyAmount: amount
            })
        }
    },
    addAmount: function (e) {
        var amount = this.data.buyAmount,
            stock = this.data.CurrentSku.Stock;
        amount = amount + 1;
        if (amount > stock) {
            app.showErrorModal("请输入正确的数量,不能大于库存或者小于等于0");
            return;
        }
        else {
            this.setData({
                buyAmount: amount
            })
        }
    },
    loadData: function (that, isNextPage) {
        wx.showNavigationBarLoading();
        wx.request({
            url: app.getUrl(app.globalData.getProducts),
            data: {
                keyword: that.data.KeyWord,
                pageIndex: that.data.PageIndex,
                pageSize: that.data.PageSize,
                sortBy: that.data.SortBy,
                sortOrder: that.data.SortOrder,
                cId: that.data.Cid,
                openId: app.globalData.openId
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

                }
                else {
                    app.showErrorModal(result.msg);
                }
            },
            complete: function () {
                wx.getSystemInfo({
                    success: function (res) {
                        var l_height = res.windowHeight - 53;
                        var tempCss = that.data.Css;
                        tempCss.LHeight = l_height;
                        tempCss.TempHeight = l_height;
                        that.setData({
                            CSS: tempCss
                        });
                    }
                });
                wx.hideNavigationBarLoading();
            }
        })
    },
    SetSubCategoryHeight() {
        var subcategory = this.data.CurrentCategory.subs,
            num_count = parseInt(subcategory.length) + 1,
            line_num = num_count / 3;
        if (num_count % 3 > 0) {
            line_num = parseInt(line_num) + 1;
        }
        var temp_height = 0;
        if (line_num > 1) {
            temp_height = (line_num - 1) * 90;
        }

        this.setData({
            MarginTop: temp_height,
            TempMarginTop: temp_height,
            IsDown: true
        });
    },
    commitBuy: function (e) {
        var that = this,
            isselectsku = true;
        for (var x = 0; x < that.data.selectedskuList.length; x++) {
            if (this.data.selectedskuList[x] == undefined || that.data.selectedskuList[x] == '' || this.data.selectedskuList[x] == null) {
                isselectsku = false;
                break;
            }
        }
        if (this.data.SkuItemList == null || that.data.selectedskuList.length != this.data.SkuItemList.length || !isselectsku) {
            app.showErrorModal("请选择规格");
            return;
        }
        if (that.data.buyAmount <= 0) {
            app.showErrorModal("请输入要购买的数量");
            return;
        }
        var amount = this.data.buyAmount;
        var skuid = this.data.selectedSku;//选中的规格

        var stock = this.data.CurrentSku.Stock;
        if (amount > stock) {
            app.showErrorModal("请输入正确的数量,不能大于库存或者小于等于0");
            return;
        }
        var cartquantiy = this.data.CurrentSku.CartQuantity;

        var quantity = amount - cartquantiy;//实际购买的件数

        var tempproduct = this.data.ProductList;//获取商品列表
        tempproduct.find(function (item, index) {
            if (item.ProductId == that.data.CurrentProduct.ProductId) {
                item.CartQuantity += quantity;
                return;
            }
        });

        that.ChangeQuantiy(that, tempproduct, skuid, quantity);

        that.onSkuHide(e);
    },
    onSkuHide: function (e) {
        this.setData({
            isShow: true,
            CurrentSku: null,
            CurrentProduct: null,
            selectedSku: '',
            buyAmount: 1
        });
    },
    ChooseCategory: function (e) {
        var that = this,
            cid = e.currentTarget.dataset.cid,//获取分类Id
            grade = e.currentTarget.dataset.grade,
            currentIndex = e.currentTarget.dataset.index,
            tempCss = that.data.Css;
        if (grade == "1") {
            that.data.CategoryList.find(function (item, index) {
                tempCss.FirstIndex = currentIndex;
                tempCss.SecondIndex = 0;
                if (item.cid == cid) {
                    that.setData({
                        CurrentCategory: item,
                        Css: tempCss,
                        Cid: cid,
                        PageIndex: 1
                    });
                    that.SetSubCategoryHeight();
                    return;
                }
            });
        } else {
            tempCss.SecondIndex = currentIndex;
            that.setData({
                Css: tempCss,
                Cid: cid,
                PageIndex: 1
            });
        }
        that.loadData(that, false);
    },
    SortClick: function (e) {
        var sortby = e.currentTarget.dataset.sortby,
            currentIndex = e.currentTarget.dataset.index,
            tempCss = this.data.Css;
        tempCss.SortIndex = currentIndex;
        var sortorder = "asc";
        var classname = "shengxu";
        if (this.data.SortOrder == sortorder) {
            sortorder = "desc";
            classname = "jiangxu";
        }

        this.setData({
            PageIndex: 1,
            SortBy: sortby,
            SortOrder: sortorder,
            SortClass: classname,
            Css: tempCss
        })
        this.loadData(this, false);
    },
    ChooseProduct: function (e) {
        var productid = e.currentTarget.dataset.productid,
            activeid = e.currentTarget.dataset.activeid,
            activetype = e.currentTarget.dataset.activetype,
            toUrl = '../productdetail/productdetail?id=' + productid;
        if (activetype == 1){
            toUrl = '../countdowndetail/countdowndetail?id=' + activeid;
        }
        wx.navigateTo({
            url: toUrl
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.setData({
            PageIndex: 1
        });
        this.loadData(this, false);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var pageindex = this.data.PageIndex;
        pageindex = parseInt(pageindex) + 1;
        this.setData({
            PageIndex: pageindex
        });
        this.loadData(this, true);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})