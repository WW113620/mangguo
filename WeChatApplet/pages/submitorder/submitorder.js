// pages/SubmmitOrder/SubmmitOrder.js
var config = require("../../utils/config.js");
var app = getApp();
var procitydata = null;
var cityRegionIds = new Array();//已加载的城市ID
var areadata = new Array();
var areaRegionIds = new Array();//已加载的地区ID
var streetdata = new Array();
var p = 0, c = 0, d = 0, s = 0
var currAreaData = [];
var currStreetData = [];
var regionArr = [];
Page({
    data: {
        isSubmitting: false,
        couponHide: true,
        BaseCoupons: [],
        isUseIntegral: false,
        userIntegralMaxRate: 1,
        integralPerMoneyRate: 0,
        userIntegrals: 0,   //用户拥有积分数
        DeductionPoints: 0, //用户使用的积分
        PointsDeductionMoney: 0, //积分抵扣钱数
        MaxDeductionPoints: 0,//最大可抵积分数
        MaxPointsDeductionMoney: 0,//最大可抵钱数
        isUseCapitalAmount: false,
        passwordHide: true,
        usedCapitalAmount: '0.00',
        pwd: '', //支付密码
        againPwd: '', //确认支付密码
        confirmedPwd: false, //密码验证通过
        deliveryType: '2', //配送方式:2-快递配送，1-到店自提
        curShopIndex: 0,//当前所选商家索引
        billHide: true,
        CompanyListHide: true,
        //当前所选商家的发票信息
        curShopInvoiceTypes: [],
        invoiceType: '',
        getRequestUrl: app.getRequestUrl,
        isStore: false,
        isGroup: false,
        isVirtual: false,
        pageLoaded: false
    },
    onLoad: function (options) {
        var that = this,
            productsku = options.productsku,
            buyamount = options.buyamount,
            frompage = options.frompage,
            countdownid = options.countdownid,
            shipaddressid = options.shipaddressid,
            cartItemIds = options.cartItemIds,
            isStore = options.isStore ? true : false,
            GroupActionId = options.GroupActionId,
            groupid = options.groupid,
            skuid = options.skuid,
            count = options.count,
            producttype = options.producttype,
            shopBranchId = options.shopBranchId,
            isVirtual = (options.producttype == '1') ? true : false,
            isGroup = options.GroupActionId ? true : false,
            orderGetUrl = 'Order/GetSubmitModel';
        if (isGroup) {
            orderGetUrl = 'Order/GetGroupOrderModel';
        }

        wx.request({
            url: app.getUrl(orderGetUrl),
            data: {
                openId: app.globalData.openId,
                productSku: productsku || '',
                cartItemIds: cartItemIds || '',
                fromPage: frompage,
                countDownId: countdownid || 0,
                buyAmount: buyamount || 0,
                shipAddressId: shipaddressid || 0,
                isStore: isStore,
                GroupActionId: GroupActionId,
                groupid: groupid,
                skuid: skuid,
                count: count,
                shopBranchId: shopBranchId,
                producttype: producttype
            },
            success: function (result) {
                result = result.data;
                if (result.success) {
                    const r = result.data;
                    var shops = r.products;
                    shops.forEach(function (objs, idx, arr) {
                        objs.ShopTotal = objs.ShopTotal ? objs.ShopTotal : 0;
                        if (objs.OneCoupons != null) {
                            objs.OneCoupons.BasePrice = objs.OneCoupons.BasePrice || 0;
                            objs.totalPrice = objs.Freight;
                            if (objs.ShopTotalWithoutFreight > objs.OneCoupons.BasePrice) {
                                objs.totalPrice = app.MoneyRound(objs.ShopTotal - objs.OneCoupons.BasePrice, 2);
                            }
                        }
                        else {
                            objs.totalPrice = app.MoneyRound(objs.ShopTotal, 2);
                        }

                        objs.totalPrice = app.MoneyRound(objs.totalPrice, 2);
                        objs.ShopTotal = app.MoneyRound(objs.ShopTotal, 2);
                        objs.invoiceInfo = {
                            InvoiceType: '0', //默认不需要发票
                            invoiceMsg: '不需要发票',
                            InvoiceTitle: '个人', //发票抬头
                            rate: 0
                        }
                    });

                    if (r.Address){
                        r.Address.FullAddress = r.Address.FullAddress || r.Address.RegionFullName + r.Address.Address + (r.Address.AddressDetail||'');
                        r.Address.ShippingId = r.Address.ShippingId || r.Address.Id;
                    }


                    that.setData({
                        ProductInfo: shops,
                        orderAmount: r.orderAmount,
                        OrderFreight: r.Freight,
                        Freight: r.Freight,
                        TotalAmount: r.TotalAmount,
                        integralPerMoney: r.integralPerMoney,
                        orderTotal: r.orderAmount,
                        ShippingAddressInfo: r.Address,
                        ProductSku: productsku || '',
                        cartItemIds: cartItemIds || '',
                        BuyAmount: buyamount || '',
                        FromPage: frompage,
                        CountdownId: countdownid || '',
                        ShipAddressId: shipaddressid || '',
                        deliveryType: isStore ? (r.shopBranchInfo.IsStoreDelive ? '2' : '1') : '0',
                        userIntegrals: r.TotalMemberIntegral,
                        userIntegralMaxRate: r.userIntegralMaxRate / 100, //积分最高可抵比率
                        integralPerMoneyRate: r.integralPerMoneyRate, //积分兑换比例
                        MaxDeductionPoints: r.userIntegrals,
                        MaxPointsDeductionMoney: r.userIntegralMaxDeductible,
                        DeductionPoints: r.userIntegrals,
                        PointsDeductionMoney: r.userIntegralMaxDeductible,
                        capitalAmount: r.capitalAmount, //预存款
                        usedCapitalAmount: r.usedCapitalAmount ? r.usedCapitalAmount.toFixed(2) : '0.00',
                        InvoiceContextList: r.InvoiceContext,
                        invoiceContext: r.InvoiceContext[0].Name,
                        InvoiceTitleList: r.InvoiceTitle,
                        vatInvoice: r.vatInvoice,
                        invoiceCompany: r.invoiceName || '',
                        invoiceCode: r.invoiceCode || '',
                        FullRegionName: r.vatInvoice.RegionFullName,
                        regionId: r.vatInvoice.RegionID,
                        cellphone: r.cellPhone, //电子发票内容
                        email: r.email,//电子发票内容
                        shopBranchInfo: r.shopBranchInfo || [],
                        shopBranchId: isStore ? r.shopBranchInfo.Id : 0,
                        ShipperAddress: r.shipperAddress,
                        ShipperTelPhone: r.shipperTelPhone,
                        producttype: producttype,
                        isStore: isStore,
                        isGroup: isGroup,
                        isVirtual: isVirtual,
                        GroupActionId: GroupActionId || '',
                        groupid: groupid || '',
                        skuid: skuid || '',
                        count: count || '',
                        VirtualProductItemInfos: r.VirtualProductItemInfos || [],
                        pageLoaded: true

                    });
                    // that.calcPointMaxCanUse();
                    that.getHasSetPayPwd();
                }
                else {
                    if (result.code == "502") {
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
                }
            }
        });
    },
    //改变地址或优惠券后重新获取订单信息
    reGetOrderInfo: function () {
        var that = this,
            tmp = this.data,
            shoplist = tmp.ProductInfo, couponIds = [];
        shoplist.forEach(function (objs, idx, arr) {
            if (objs.OneCoupons != null) {
                couponIds.push(objs.OneCoupons.BaseId + '_' + objs.OneCoupons.BaseType);
            }
        });

        var orderGetUrl = 'Order/GetSubmitModel';
        if (that.data.isGroup) {
            orderGetUrl = 'Order/GetGroupOrderModel';
        }

        wx.request({
            url: app.getUrl(orderGetUrl),
            data: {
                openId: app.globalData.openId,
                productSku: tmp.ProductSku || '',
                cartItemIds: tmp.cartItemIds || '',
                fromPage: tmp.FromPage,
                countDownId: tmp.CountdownId || 0,
                buyAmount: tmp.BuyAmount || 0,
                shippingAddressId: tmp.ShipAddressId || 0,
                couponIds: couponIds.join(","),
                isStore: tmp.isStore,
                GroupActionId: tmp.GroupActionId,
                groupid: tmp.groupid,
                skuid: tmp.skuid,
                count: tmp.count,
                shopBranchId: tmp.shopBranchId,
                producttype: tmp.producttype
            },
            success: function (result) {
                result = result.data;
                if (result.success) {
                    const r = result.data;
                    var shops = r.products;
                    shops.forEach(function (objs, idx, arr) {
                        objs.ShopTotal = objs.ShopTotal || 0;
                        if (objs.OneCoupons != null) {
                            objs.OneCoupons.BasePrice = objs.OneCoupons.BasePrice || 0;
                            objs.totalPrice = objs.Freight;
                            if (objs.ShopTotalWithoutFreight > objs.OneCoupons.BasePrice) {
                                objs.totalPrice = app.MoneyRound(objs.ShopTotal - objs.OneCoupons.BasePrice, 2);
                            }
                        }
                        else {
                            objs.totalPrice = app.MoneyRound(objs.ShopTotal, 2);
                        }
                        objs.invoiceInfo = shoplist[idx].invoiceInfo;
                    });
                    that.setData({
                        ProductInfo: shops,
                        orderAmount: r.orderAmount,
                        OrderFreight: r.Freight,
                        Freight: r.Freight,
                        MaxDeductionPoints: r.userIntegrals,
                        MaxPointsDeductionMoney: r.userIntegralMaxDeductible,
                        DeductionPoints: r.userIntegrals,
                        PointsDeductionMoney: r.userIntegralMaxDeductible
                    });
                    // that.calcPointMaxCanUse();
                    that.caleOrderAmount();
                }
                else {
                    app.showErrorModal(result.msg, function (res) {
                        if (res.confirm) {
                            wx.navigateBack({ delta: 1 })
                        }
                    });
                }
            }
        });
    },
    changeInfo: function (e) {
        var index = e.currentTarget.dataset.index,
            VirtualProductItemInfos = this.data.VirtualProductItemInfos;
        VirtualProductItemInfos[index].value = e.detail.value;

        this.setData({
            VirtualProductItemInfos: VirtualProductItemInfos
        });

    },
    uploadImg: function (e) {
        var that = this,
            index = e.currentTarget.dataset.index,
            VirtualProductItemInfos = that.data.VirtualProductItemInfos,
            curInfo = VirtualProductItemInfos[index],
            imgindex = e.currentTarget.dataset.imgindex;
        //uploadImgArr = that.data.uploadImgArr;
        wx.chooseImage({
            count: 1,
            success: function (res) {
                var tempFilePaths = res.tempFilePaths
                wx.uploadFile({
                    url: app.getUrl("OrderRefund/PostUploadAppletImage"),
                    filePath: tempFilePaths[0],
                    name: 'file',
                    formData: {
                        openId: app.globalData.openId
                    },
                    success: function (r) {
                        var r = JSON.parse(r.data);
                        if (r.success) {
                            var imgUrl = r.data.Data[0].ImageUrl;
                            /*if (!uploadImgArr['Img' + index]){  //多组图片上传存储
                                uploadImgArr['Img' + index]=[];
                            }
                            uploadImgArr['Img' + index].push(imgUrl);
                            that.setData({
                                uploadImgArr: uploadImgArr
                            });*/

                            if (imgindex != undefined) {
                                curInfo.imgs[parseInt(imgindex)] = imgUrl;
                            } else {
                                if (!curInfo.imgs) {
                                    curInfo.imgs = [];
                                }
                                curInfo.imgs.push(imgUrl);
                            }
                            curInfo.value = curInfo.imgs.join(',');
                            that.setData({
                                VirtualProductItemInfos: VirtualProductItemInfos
                            });

                        }

                    }
                })
            }
        })
    },
    delImg: function (e) {
        var that = this,
            index = e.currentTarget.dataset.index,
            VirtualProductItemInfos = that.data.VirtualProductItemInfos,
            curInfo = VirtualProductItemInfos[index],
            imgindex = e.currentTarget.dataset.imgindex;

        curInfo.imgs.splice(imgindex, 1);
        that.setData({
            VirtualProductItemInfos: VirtualProductItemInfos
        });
    },
    changeDeliverType: function (e) {
        this.setData({
            deliveryType: e.currentTarget.dataset.type
        });
        this.caleOrderAmount();
    },
    hideCoupon: function (e) {
        this.setData({
            couponHide: true
        });
    },
    openChooseCoupon: function (e) {
        var index = e.currentTarget.dataset.index;
        this.setData({
            BaseCoupons: this.data.ProductInfo[index].BaseCoupons,
            couponHide: false,
            usedCoupon: {
                shopindex: index,
                Id: this.data.ProductInfo[index].OneCoupons ? this.data.ProductInfo[index].OneCoupons.BaseId : 0
            }
        });
    },
    selectCoupon: function (e) {
        var shopindex = this.data.usedCoupon.shopindex,
            index = e.currentTarget.dataset.idx,
            id = e.currentTarget.dataset.id;
        if (id == '0') {
            this.data.usedCoupon.Id = 0;
            this.data.ProductInfo[shopindex].OneCoupons = {
                BaseId: 0,
                BaseType: 99,
                BaseName: '不使用优惠券',
                BasePrice: 0
            };
        } else {
            this.data.usedCoupon.Id = id;
            this.data.ProductInfo[shopindex].OneCoupons = this.data.ProductInfo[shopindex].BaseCoupons[index];
        }
        this.setData({
            usedCoupon: this.data.usedCoupon,
            ProductInfo: this.data.ProductInfo,
            couponHide: true
        });
        this.reGetOrderInfo();
    },
    gotoAddress: function () {
        wx.navigateTo({
            url: '../choiceaddress/choiceaddress?frompage=' + this.data.FromPage
        })
    },
    goAddress: function () {
        wx.navigateTo({
            url: "../address/address?pageurl=submitorder&shopBranchId=" + this.data.shopBranchInfo.Id || ''
        })
    },
    addAddresstap: function () {
        var that = this;
        wx.showModal({
            title: '提示',
            content: '是否使用微信收货地址',
            cancelText: '否',
            confirmText: '是',
            success: function (res) {
                if (res.confirm) {
                    wx.chooseAddress({
                        success: function (res) {
                            if (res) {
                                app.getOpenId(function (openId) {
                                    //处理添加收货地址
                                    var parameters = {
                                        openId: openId,
                                        shipTo: res.userName,
                                        address: res.detailInfo,
                                        cellphone: res.telNumber,
                                        city: res.cityName,
                                        county: res.countyName,
                                        shippingId: 0,
                                        regionId: 0,
                                        isDefault: 1
                                    }
                                    config.httpPost(app.getUrl(app.globalData.AddWXChooseAddress), parameters, function (sd) {
                                        if (sd.success) {
                                            config.httpGet(app.getUrl("ShippingAddress/GetShippingAddress"), { openId: openId, shippingId: sd.data }, function (sdata) {
                                                that.setData({
                                                    ShippingAddressInfo: sdata.data
                                                });
                                            });
                                        } else {
                                            wx.showToast({
                                                title: sd.msg,
                                                icon: 'success',
                                            })
                                        }
                                    });
                                });
                            }
                        }
                    });
                } else if (res.cancel) {
                    that.gotoAddress();
                }
            }
        })
    },

    bindRemarkInput: function (e) {
        var idx = e.currentTarget.dataset.idx;
        this.data.ProductInfo[idx].remark = e.detail.value;
        this.setData({
            ProductInfo: this.data.ProductInfo
        })
    },
    //计算总价
    caleOrderAmount: function () {
        var total = 0,
            totalWithoutFreight = 0,
            that = this;
        this.data.ProductInfo.forEach(function (item) {
            var temp, tempWithout;
            if (item.OneCoupons) {
                if (item.ShopTotalWithoutFreight < item.OneCoupons.BasePrice) {
                    temp = item.Freight;
                } else {
                    temp = item.ShopTotal - item.OneCoupons.BasePrice;
                }
                tempWithout = item.ShopTotalWithoutFreight - item.OneCoupons.BasePrice;
            } else {
                temp = item.ShopTotal;
                tempWithout = item.ShopTotalWithoutFreight;
            }
            if (that.data.deliveryType == '1') {
                temp -= item.Freight;
            }
            total += temp;
            totalWithoutFreight += tempWithout;

        });

        var invoice = this.CalInvoiceRate(totalWithoutFreight, this.data.PointsDeductionMoney);
        if (this.data.DeductionPoints > 0 && this.data.isUseIntegral) {
            total -= this.data.PointsDeductionMoney;
        }

        total = total + invoice;

        var usedCapital = this.data.usedCapitalAmount ? parseFloat(this.data.usedCapitalAmount).toFixed(2) : 0.00;
        usedCapital = parseFloat(usedCapital);
        //判断预存款是否大于实付金额
        if (parseFloat(usedCapital) > total) {
            usedCapital = total;
            this.setData({
                usedCapitalAmount: total ? total.toFixed(2) : '0.00',
            })
        }
        if (usedCapital) {
            this.setData({
                orderAmount: (total - usedCapital).toFixed(2)
            })
        } else {
            this.setData({
                orderAmount: (total < 0 ? 0 : total).toFixed(2)
            })
        }
    },
    //计算税费
    CalInvoiceRate: function (ordertotal, orderTotalIntegral) {
        var invoiceRate = 0.00,
            shops = this.data.ProductInfo,
            that = this,
            couponPrice = 0;
        shops.forEach(function (objs, idx, arr) {
            var _rate = objs.invoiceInfo.rate;
            if (_rate > 0) {
                var shopid = objs.shopId;
                couponPrice = objs.OneCoupons ? objs.OneCoupons.BasePrice : 0;
                var total = parseFloat(objs.ShopTotalWithoutFreight - couponPrice);//商家商品价格
                var enabledIntegral = that.data.isUseIntegral;
                if (enabledIntegral) {
                    if (orderTotalIntegral > 0) {

                        var integralAmount = parseFloat(orderTotalIntegral * (total / ordertotal)).toFixed(2);
                        total = total - integralAmount;
                    }
                }
                invoiceRate = parseFloat(invoiceRate) + parseFloat((total * (_rate / 100)));
            }
        });
        that.setData({
            invoiceRateNum: invoiceRate.toFixed(2)
        });
        return parseFloat(invoiceRate.toFixed(2));
    },
    ChkUsePoint: function (e) {
        if (e.detail.value) {
            this.setData({
                isUseIntegral: true,
                DeductionPoints: this.data.MaxDeductionPoints,
                PointsDeductionMoney: this.data.MaxPointsDeductionMoney
            });
        } else {
            this.setData({
                isUseIntegral: false,
                DeductionPoints: 0,
                PointsDeductionMoney: 0
            });
        }
        this.caleOrderAmount();
    },
    calcPointMaxCanUse: function () {  //计算最大积分可用
        var total = 0;
        this.data.ProductInfo.forEach(function (item) {
            var temp;
            total += item.ShopTotalWithoutFreight;
            if (item.OneCoupons) {
                total -= item.OneCoupons.BasePrice;
            }
        });
        total = app.MoneyRound(total, 2);
        var maxIM = app.MoneyRound(total * this.data.userIntegralMaxRate, 2);
        if (maxIM > total) {
            maxIM = total;
        }
        var maxIntegral = Math.ceil(maxIM * this.data.integralPerMoneyRate); //根据积分兑换比例算出最多可用积分
        if (maxIntegral > this.data.userIntegrals) {
            maxIntegral = this.data.userIntegrals;
            maxIM = app.MoneyRound(maxIntegral / this.data.integralPerMoneyRate, 2);
            if (maxIM > total) {
                maxIM = total;
            }
        }


        this.setData({
            MaxDeductionPoints: maxIntegral,
            MaxPointsDeductionMoney: maxIM,
            DeductionPoints: maxIntegral,
            PointsDeductionMoney: maxIM
        });
    },
    onInputIntegral: function (e) {
        var integral = e.detail.value;
        if (/[^\d|.]/.test(integral)) { //替换非数字字符
            integral = integral.replace(/[^\d|.]/g, '');
        }

        //判断是否大于自身拥有积分
        if (this.data.MaxDeductionPoints < integral) {
            integral = this.data.MaxDeductionPoints;
        }
        var _pdm = app.MoneyFix2(integral / this.data.integralPerMoneyRate);
        if (_pdm > this.data.MaxPointsDeductionMoney) {
            _pdm = this.data.MaxPointsDeductionMoney
        }
        this.setData({
            DeductionPoints: integral,
            PointsDeductionMoney: _pdm
        });
        this.caleOrderAmount();
    },
    changeIsUseCapitalAmount: function () {
        var that = this;
        this.setData({
            isUseCapitalAmount: !this.data.isUseCapitalAmount
        })
        if (this.data.isUseCapitalAmount && !this.data.confirmedPwd) {
            this.setData({
                passwordHide: false,
                pwd: '',
                againPwd: ''
            })
        }
        if (!that.data.isUseCapitalAmount) {
            that.setData({
                usedCapitalAmount: '0.00'
            });
        }
        that.caleOrderAmount();
        if (this.data.isUseCapitalAmount) {
            that.countCapital();
        }
    },
    formatCapitalAmount: function (e) {
        var capitalAmount = e.detail.value;
        this.setData({
            usedCapitalAmount: capitalAmount ? capitalAmount : '0.00'
        });
    },
    onInputCapitalAmount: function (e) {
        var capitalAmount = e.detail.value;
        if (/[^\d|.]/.test(capitalAmount)) { //替换非数字字符
            capitalAmount = capitalAmount.replace(/[^\d|.]/g, '');
        }
        capitalAmount = capitalAmount.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
        this.setData({
            usedCapitalAmount: capitalAmount
        })
        this.caleOrderAmount();
    },
    //计算预存款
    countCapital: function () {
        var capitalAmount = this.data.capitalAmount ? parseFloat(this.data.capitalAmount) : 0.00,
            orderAmount = this.data.orderAmount ? parseFloat(this.data.orderAmount) : 0.00;
        if (capitalAmount < orderAmount) {
            this.setData({
                usedCapitalAmount: capitalAmount.toFixed(2)
            })
        } else {
            this.setData({
                usedCapitalAmount: orderAmount.toFixed(2)
            })
        }
        this.setData({
            orderAmount: (orderAmount - parseFloat(this.data.usedCapitalAmount)).toFixed(2)
        })
    },
    submitOrder: function (e) {
        var that = this,
            isVirtual = that.data.isVirtual;
        if (that.data.isSubmitting) {
            return;
        }
        if (that.data.deliveryType != "1" && !that.data.ShippingAddressInfo && !isVirtual) {
            app.showErrorModal("请选择收货地址");
            return false;
        }

        var VirtualProductItems = [],
            flag = true;
        if (isVirtual) {
            that.data.VirtualProductItemInfos.forEach(function (item) {
                if (item.Type == 4 && item.value) {
                    if (item.value.length != 18) {
                        wx.showToast({
                            title: '请输入正确的身份证号',
                            icon: 'none'
                        })
                        flag = false;
                    }
                }
                if (item.Required && !item.value) {
                    if (flag) {
                        wx.showToast({
                            title: '请填写' + item.Name,
                            icon: 'none'
                        })
                    }
                    flag = false;
                }
                VirtualProductItems.push({
                    VirtualProductItemName: item.Name,
                    Content: item.value,
                    VirtualProductItemType: item.Type
                });
            });
            that.setData({
                deliveryType: '0'
            })
        }

        if (!flag) {
            return;
        }


        that.setData({
            isSubmitting: true
        });
        var shops = that.data.ProductInfo, couponIds = [], orderShops = [];
        shops.forEach(function (objs, idx, arr) {
            if (objs.OneCoupons != null) {
                couponIds.push(objs.OneCoupons.BaseId + '_' + objs.OneCoupons.BaseType);
            }
            var orderShop = {};
            orderShop.deliveryType = that.data.deliveryType;
            orderShop.ShopId = objs.shopId;
            orderShop.shopBrandId = that.data.shopBranchId;
            orderShop.Remark = objs.remark;
            orderShop.PostOrderInvoice = objs.invoiceInfo;
            orderShop.PostOrderInvoice.InvoiceTitle = objs.invoiceInfo.Name;
            orderShop.PostOrderInvoice.InvoiceCode = objs.invoiceInfo.Code;
            orderShops.push(orderShop);
        });



        app.getOpenId(function (openid) {
            var ShippingId = that.data.ShippingAddressInfo ? that.data.ShippingAddressInfo.ShippingId : '';
            var parameters = {
                openId: openid,
                fromPage: that.data.FromPage,
                shippingId: ShippingId,
                recieveAddressId: ShippingId,
                couponCode: couponIds.join(','),
                countDownId: that.data.CountdownId || 0,
                buyAmount: that.data.BuyAmount || 0,
                productSku: that.data.ProductSku || '',
                cartItemIds: that.data.cartItemIds || '',
                jsonOrderShops: JSON.stringify(orderShops),
                deductionPoints: that.data.isUseIntegral ? that.data.DeductionPoints : 0,
                formId: e.detail.formId,
                GroupActionId: that.data.GroupActionId,
                groupid: that.data.groupid,
                skuid: that.data.skuid,
                count: that.data.count,
                isStore: that.data.isStore,
                producttype: that.data.producttype,
                VirtualProductItems: JSON.stringify(VirtualProductItems),
                CapitalAmount: that.data.usedCapitalAmount,
                PayPwd: that.data.pwd

            };
            var orderSubmitUrl = 'Order/SubmitOrder';
            if (that.data.isGroup) {
                orderSubmitUrl = 'Order/PostSubmitFightGroupOrder';
            }
            //console.log(JSON.stringify(parameters))
            config.httpPost(app.getUrl(orderSubmitUrl), parameters, function (sd) {
                if (sd.success) {
                    if (that.data.isGroup) {
                        var orderId = sd.data.OrderIds.join(',');
                        if (sd.data.RealTotalIsZero) {
                            if (sd.data.OrderIds.length > 1) {
                                wx.redirectTo({
                                    url: '../grouporder/grouporder'
                                })
                            } else {
                                wx.redirectTo({
                                    url: '../groupcall/groupcall?id=' + orderId
                                })
                            }

                        } else {
                            app.orderPay(orderId, 0, false);
                        }
                    } else {
                        //如果订单金额大于0则去支付否则跳转订单中心
                        if (!sd.data.RealTotalIsZero) {
                            var orderId = sd.data.OrderId;
                            //支付
                            app.orderPay(orderId, 0, false);

                        } else {
                            var status = that.data.deliveryType == "1" ? 3 : 2;
                            if (that.data.isVirtual) {
                                status = 3;
                            }
                            wx.redirectTo({
                                url: '../orderlist/orderlist?status=' + status
                            })
                        }
                    }
                }
                else {
                    app.showErrorModal(sd.msg);
                    that.setData({
                        isSubmitting: false
                    });
                }
            });

        })
    },
    //发票
    closeBill: function () {
        this.setData({
            billHide: true
        });
    },
    changeBill: function (e) {
        var index = e.currentTarget.dataset.index,
            invoiceInfo = this.data.ProductInfo[index].invoiceInfo;
        var dataset = this.data.ProductInfo[index].invoiceTpyes[0];
        this.setData({
            curShopIndex: index,
            billHide: false,
            curShopInvoiceTypes: this.data.ProductInfo[index].invoiceTpyes,
            invoiceType: invoiceInfo.InvoiceType ? invoiceInfo.InvoiceType : this.data.invoiceType,
            invoiceTitle: invoiceInfo.Name ? invoiceInfo.Name : this.data.invoiceTitle,
            invoiceCompany: invoiceInfo.InvoiceType != 3 ? (invoiceInfo.Name ? invoiceInfo.Name : this.data.invoiceCompany) : this.data.invoiceCompany,
            invoiceCode: invoiceInfo.InvoiceType != 3 ? (invoiceInfo.Code ? invoiceInfo.Code : this.data.invoiceCode) : this.data.invoiceCode,
            invoiceContext: invoiceInfo.InvoiceContext ? invoiceInfo.InvoiceContext : this.data.invoiceContext,
            cellphone: invoiceInfo.CellPhone ? invoiceInfo.CellPhone : this.data.cellphone,
            email: invoiceInfo.Email ? invoiceInfo.Email : this.data.email,
            curInvoiceDay: this.data.ProductInfo[index].InvoiceDay,
            vatInvoice: {
                Name: invoiceInfo.InvoiceType == 3 ? (invoiceInfo.Name ? invoiceInfo.Name : this.data.vatInvoice.Name) : this.data.vatInvoice.Name,
                Code: invoiceInfo.InvoiceType == 3 ? (invoiceInfo.Code ? invoiceInfo.Code : this.data.vatInvoice.Code) : this.data.vatInvoice.Code,
                RegisterAddress: invoiceInfo.RegisterAddress ? invoiceInfo.RegisterAddress : this.data.vatInvoice.RegisterAddress,
                RegisterPhone: invoiceInfo.RegisterPhone ? invoiceInfo.RegisterPhone : this.data.vatInvoice.RegisterPhone,
                BankName: invoiceInfo.BankName ? invoiceInfo.BankName : this.data.vatInvoice.BankName,
                BankNo: invoiceInfo.BankNo ? invoiceInfo.BankNo : this.data.vatInvoice.BankNo,
                RealName: invoiceInfo.RealName ? invoiceInfo.RealName : this.data.vatInvoice.RealName,
                CellPhone: invoiceInfo.CellPhone ? invoiceInfo.CellPhone : this.data.vatInvoice.CellPhone,
                FullRegionName: invoiceInfo.FullRegionName ? invoiceInfo.FullRegionName : this.data.vatInvoice.FullRegionName,
                Address: invoiceInfo.Address ? invoiceInfo.Address : this.data.vatInvoice.Address
            }
        });
        if (this.data.invoiceType == '0') {
            this.setData({
                invoiceType: dataset.Id,
                rate: dataset.Rate,
                invoiceTypeName: dataset.Name
            });
        }
    },
    changeInvoiceType: function (e) {
        var dataset = e.currentTarget.dataset;
        this.setData({
            invoiceType: dataset.type,
            rate: dataset.rate,
            invoiceTypeName: dataset.name
        });
        if (dataset.type == '0') {
            this.setInvoice();
        }
    },
    changeInvoiceTitle: function (e) {
        this.setData({
            invoiceTitle: e.currentTarget.dataset.type
        });
    },
    showCompanyList: function () {
        if (this.data.InvoiceTitleList.length > 0) {
            this.setData({
                CompanyListHide: false
            })
        }
    },
    hideCompanyList: function () {
        this.setData({
            CompanyListHide: true
        })
    },
    chooseCompany: function (e) {
        this.setData({
            invoiceCompany: e.currentTarget.dataset.name,
            invoiceCode: e.currentTarget.dataset.code
        });
        this.hideCompanyList();
    },
    onInputCompany: function (e) {
        if (e.detail.value != this.data.invoiceCompany) {
            this.setData({
                invoiceCompany: e.detail.value,
                invoiceCode: ''
            })
        }
        if (e.detail.value != '') {
            this.hideCompanyList();
        } else {
            this.showCompanyList();
        }

    },
    delCompany: function (e) {
        var that = this;
        var id = e.currentTarget.dataset.id;
        app.getOpenId(function (openid) {
            config.httpPost(app.getUrl(app.globalData.delteInvoiceTitle), { openId: openid, id: id }, function (res) {
                if (res.success) {
                    var arr = that.data.InvoiceTitleList;
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i].Id == id) {
                            arr.splice(i, 1);
                            break;
                        }
                    }
                    that.setData({
                        InvoiceTitleList: arr,
                        CompanyListHide: arr.length > 0 ? false : true
                    });
                }
            });
        });
    },
    onInputCode: function (e) {
        this.setData({
            invoiceCode: e.detail.value
        })
    },
    changeInvoiceContext: function (e) {
        this.setData({
            invoiceContext: e.currentTarget.dataset.name
        })
    },
    setInvoice: function (e) {
        var that = this, canSubmit = false, para = {}, tmp = '';
        var formdata = e ? e.detail.value : null,
            shops = that.data.ProductInfo,
            sidx = that.data.curShopIndex;
        switch (parseInt(that.data.invoiceType)) {
            case 0:
                shops[sidx].invoiceInfo.InvoiceType = that.data.invoiceType + '';
                shops[sidx].invoiceInfo.rate = parseFloat(that.data.rate);
                shops[sidx].invoiceInfo.invoiceMsg = '不需要发票';
                that.setData({
                    ProductInfo: shops,
                    invoiceMsg: '不需要发票',
                    billHide: true
                });
                that.caleOrderAmount();
                break;
            case 1:
                if (that.data.invoiceTitle != '个人' && (that.data.invoiceCompany == '' || that.data.invoiceCode == '')) {
                    app.showErrorModal("公司名称和税号请填写完整");
                    return;
                }
                tmp = that.data.invoiceTitle == '个人' ? that.data.invoiceTitle : that.data.invoiceCompany;
                that.setData({
                    invoiceMsg: that.data.invoiceTypeName + '(' + tmp + ')'
                });
                para.Name = tmp;
                para.Code = tmp == '个人' ? '' : that.data.invoiceCode;
                para.InvoiceContext = that.data.invoiceContext;
                canSubmit = true;
                break;
            case 2:
                if (that.data.invoiceTitle != '个人' && (that.data.invoiceCompany == '' || that.data.invoiceCode == '')) {
                    app.showErrorModal("公司名称和税号请填写完整");
                    return;
                }
                if (!formdata.email) {
                    app.showErrorModal("收票人信息请填写完整");
                    return;
                }
                if (formdata.cellphone.length != 11) {
                    app.showErrorModal("请填写正确的手机号");
                    return;
                }

                tmp = that.data.invoiceTitle == '个人' ? that.data.invoiceTitle : that.data.invoiceCompany;
                that.setData({
                    invoiceMsg: that.data.invoiceTypeName + '(' + tmp + ')'
                });
                para.Name = tmp;
                para.Code = tmp == '个人' ? '' : that.data.invoiceCode;
                para.InvoiceContext = that.data.invoiceContext;
                para.CellPhone = formdata.cellphone;
                para.Email = formdata.email;
                canSubmit = true;
                break;
            case 3:
                if (!formdata.vatname || !formdata.vatcode || !formdata.vatregisteraddr || !formdata.vatregphone || !formdata.vatbankname || !formdata.vatbankno) {
                    app.showErrorModal("增票资质请填写完整");
                    return;
                }
                if (!formdata.vatrealname || !formdata.vatcellphone || !formdata.vataddress || !formdata.vatregion) {
                    app.showErrorModal("收票人信息请填写完整");
                    return;
                }
                var myreg = /^1\d{10}$/;
                if (!myreg.test(formdata.vatcellphone)) {
                    app.showErrorModal("请输入有效的手机号码");
                    return;
                }
                that.setData({
                    invoiceMsg: that.data.invoiceTypeName + '(' + formdata.vatname + ')'
                });
                para.Name = formdata.vatname;
                para.Code = formdata.vatcode;
                para.InvoiceContext = that.data.invoiceContext;
                para.RegisterAddress = formdata.vatregisteraddr;
                para.RegisterPhone = formdata.vatregphone;
                para.BankName = formdata.vatbankname;
                para.BankNo = formdata.vatbankno;
                para.RealName = formdata.vatrealname;
                para.CellPhone = formdata.vatcellphone;
                para.RegionID = that.data.regionId;
                para.Address = formdata.vataddress;
                canSubmit = true;
                break;

        }
        if (canSubmit) {
            para.InvoiceType = that.data.invoiceType + '';
            shops[sidx].invoiceInfo = para;
            shops[sidx].invoiceInfo.rate = parseFloat(that.data.rate);
            shops[sidx].invoiceInfo.invoiceMsg = that.data.invoiceMsg;
            shops[sidx].invoiceInfo.FullRegionName = that.data.FullRegionName;
            app.getOpenId(function (openid) {
                para.openId = openid;
                config.httpPost(app.getUrl(app.globalData.postSaveInvoiceTitleNew), para, function (res) {
                    if (res.success) {
                        that.setData({
                            ProductInfo: shops,
                            billHide: true
                        });
                        that.caleOrderAmount();
                    } else {
                        wx.showToast({
                            title: res.msg,
                            icon: 'none'
                        });
                    }
                });
            });
        }

    },
    hidePassword: function () {
        this.setData({
            isUseCapitalAmount: false,
            passwordHide: true,
            usedCapitalAmount: '0.00'
        });
        this.caleOrderAmount();
    },
    getHasSetPayPwd: function () {
        var that = this;
        app.getOpenId(function (openid) {
            config.httpGet(app.getUrl('Payment/GetHasSetPayPwd'), { openId: openid }, function (res) {
                if (res.success) {
                    that.setData({
                        hasSetPayPwd: true
                    })
                }
            });
        });
    },
    onInputPwd: function (e) {
        this.setData({
            pwd: e.detail.value
        })
    },
    confirmPwd: function () {
        var pwd = this.data.pwd, againPwd = this.data.againPwd, that = this;
        if (that.data.hasSetPayPwd) {
            if (pwd == "") {
                app.showErrorModal("请输入密码");
                return;
            }
            app.getOpenId(function (openid) {
                config.httpPost(app.getUrl('Payment/CheckPayPwd'), { openId: openid, pwd: pwd }, function (res) {
                    if (res.success) {
                        that.setData({
                            isUseCapitalAmount: true,
                            passwordHide: true,
                            confirmedPwd: true
                        });
                    } else {
                        that.setData({
                            isUseCapitalAmount: false
                        });
                        app.showErrorModal("支付密码错误");
                    }
                });
            });
        } else {
            if (pwd == "") {
                app.showErrorModal("请输入密码");
                return;
            }
            if (againPwd == "") {
                app.showErrorModal("请确认密码");
                return;
            }
            if (pwd != againPwd) {
                app.showErrorModal("两次密码输入不一致");
                return;
            }
            app.getOpenId(function (openid) {
                config.httpPost(app.getUrl('Payment/PostSetPayPwd'), { openId: openid, pwd: pwd }, function (res) {
                    if (res.success) {
                        that.setData({
                            isUseCapitalAmount: true,
                            passwordHide: true,
                            confirmedPwd: true,
                            hasSetPayPwd: true
                        });
                    } else {
                        that.setData({
                            isUseCapitalAmount: false
                        });
                        app.showErrorModal("设置密码失败");
                    }
                });
            });
        }
    },
    onInputAgainPwd: function (e) {
        this.setData({
            againPwd: e.detail.value
        })
    },
    bindFullAddressTap: function (e) {
        //p = 0, c = 0, d = 0,s=0;
        this.setAreaData(p, c, d, s);
        this.setData({
            showDistpicker: true
        });

    },
    changeArea: function (e) {
        const that = this;
        p = e.detail.value[0];
        c = e.detail.value[1];
        if (e.detail.value.length > 2)
            d = e.detail.value[2];
        else
            d = 0;
        if (e.detail.value.length > 3) {
            s = e.detail.value[3];
        } else {
            s = 0;
        }
        //  if (e.detail.value.length > 3)
        //   s = e.detail.value[3]
        //  else
        //     s = "";
        that.setAreaData(p, c, d, s)
    },
    setAreaData: function (p, c, d, s) {
        const that = this;
        var p = p || 0 // provinceSelIndex
        var c = c || 0 // citySelIndex
        var d = d || 0 // districtSelIndex
        var s = s || 0 // streetSelIndex
        // 设置省的数据
        if (procitydata == undefined || procitydata == null) {
            wx.request({
                url: app.getUrl("ShippingAddress/GetAll"),
                async: false,
                success: function (result) {
                    if (result.data.success) {
                        that.setProvinceCityData(result.data.data);
                    }
                }, error: function (e) {
                }
            });
        }
        else {
            that.setProvinceCityData(null);
        }
    },
    setProvinceCityData: function (data) {
        const that = this;
        if (data != null) {
            procitydata = data;
        }
        var province = procitydata;
        var provinceName = [];
        var provinceCode = [];
        for (var item in province) {
            var name = province[item]["name"];
            var code = province[item]["id"];
            provinceName.push(name);
            provinceCode.push(code);
            if (regionArr.length > 0 && code == regionArr[0])
                p = item;
        }
        that.setData({
            provinceName: provinceName,
            provinceCode: provinceCode
        })
        // 设置市的数据
        var city = procitydata.length > p ? procitydata[p]["city"] : procitydata[0]["city"];
        var cityName = [];
        var cityCode = [];
        for (var item in city) {
            var name = city[item]["name"];
            var code = city[item]["id"];
            cityName.push(name);
            cityCode.push(code);
            if (regionArr.length > 1 && code == regionArr[1])
                c = item;
        }
        that.setData({
            cityName: cityName,
            cityCode: cityCode
        });
        //设置区的数据
        var district = city.length > c ? city[c]["area"] : city[0]["area"];
        var districtName = [];
        var districtCode = [];
        if (district != null && district.length > 0) {
            for (var item in district) {
                var name = district[item]["name"];
                var code = district[item]["id"];
                districtName.push(name);
                districtCode.push(code);
                if (regionArr.length > 2 && code == regionArr[2])
                    d = item;
            }
            that.setData({
                districtName: districtName,
                districtCode: districtCode
            })
            var street = district.length > d ? district[d]["country"] : district[0]["country"];
            var streetName = [];
            var streetCode = [];
            if (street != null && street.length > 0) {
                streetName.push("其它");
                streetCode.push(0);
                for (var item in street) {
                    var name = street[item]["name"];
                    var code = street[item]["id"];
                    streetName.push(name);
                    streetCode.push(code);
                    if (regionArr.length > 3 && code == regionArr[3])
                        s = item;
                }
                that.setData({
                    streetName: streetName,
                    streetCode: streetCode
                });
            } else {
                that.setData({
                    streetName: [],
                    streetCode: []
                });
            }
        }
        else {
            that.setData({
                districtName: [],
                districtCode: [],
                streetName: [],
                streetCode: []
            })
        }
        var selecteds = [];
        selecteds.push(p);
        selecteds.push(c);
        selecteds.push(d);
        selecteds.push(s);
        that.setData({
            value: selecteds
        });
        regionArr = [];
    },
    distpickerCancel: function () {
        this.setData({
            showDistpicker: false
        })
    },
    distpickerSure: function () {
        if (this.data.provinceName.length <= 0) {
            return;
        }
        var fullAddress = this.data.provinceName[p] + " " + this.data.cityName[c] + " " + (this.data.districtName[d] || "") + ' ' + (this.data.streetName[s] || "").replace("其它", "");
        var regionId;
        var selcityname;
        if (this.data.streetCode.length > 0 && this.data.streetCode[s] != 0) {
            regionId = this.data.streetCode[s];
            selcityname = this.data.districtName[d];
        } else if (this.data.districtCode.length > 0) {
            regionId = this.data.districtCode[d];
            selcityname = this.data.districtName[d];
        } else if (this.data.cityCode.length > 0) {
            regionId = this.data.cityCode[c];
            selcityname = this.data.cityName[c];
        } else {
            selcityname = this.data.provinceName[p];
        }
        var cssval = this.data.isCss;
        if (this.data.FullRegionName == '请填写所在地区') {
            cssval = false;
        }
        this.setData({
            fullAddress: fullAddress,
            FullRegionName: fullAddress,
            regionId: regionId,
            selCityName: selcityname,
            isCss: cssval,
            detailAddress: ''
        })
        this.distpickerCancel()
    },

    bindChangePassword: function (e) {
        var userInfo = wx.getStorageSync("userInfo");
        wx.navigateTo({
            url: '../bindMobilePhone/bindMobilePhone',
        });
    },
})