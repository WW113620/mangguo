App({
    //合并两个数组并去重 
    mergeArray: function(arr1, arr2) {
        for (var i = 0; i < arr1.length; i++) {
            for (var j = 0; j < arr2.length; j++) {
                if (arr1[i] === arr2[j]) {
                    arr1.splice(i, 1); //利用splice函数删除元素，从第i个位置，截取长度为1的元素
                }
            }
        }
        //alert(arr1.length)
        for (var i = 0; i < arr2.length; i++) {
            arr1.push(arr2[i]);
        }
        return arr1;
    },
    //从数组中删除指定值元素
    removeByValue: function(arr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == val) {
                arr.splice(i, 1);
                break;
            }
        }
        return arr;
    },
    //数组去重
    uniqueArry: function(arry) {
        var res = [];
        var json = {};
        for (var i = 0; i < arry.length; i++) {
            if (!json[arry[i]]) {
                res.push(arry[i]);
                json[arry[i]] = 1;
            }
        }
        return res;
    },
    onLaunch: function() {},
    //错误提示框
    showErrorModal: function(content, callback) {
        wx.showModal({
            title: '提示',
            content: content,
            showCancel: false,
            confirmColor: '#fb1438',
            success: function(res) {
                callback && (callback(res));
            }
        })
    },
    //跳转至授权页面
    openSetting: function(callback) {
        wx.openSetting({
            success: function(res) {
                callback();
            }
        })
    },
    getIsLogin: function() {
        var value = wx.getStorageSync('mallAppletOpenId');
        if (value) {
            return true;
        }
        return false;
    },
    getOpenId: function(cb, frompage) {
        var that = this;
        if (that.getIsLogin() && that.globalData.openId) {
            typeof cb == "function" && cb(that.globalData.openId)
        } else if (that.getIsLogin()) {
            //调用登录接口
            wx.login({
                success: function(res) {
                    if (res.code) {
                        const code = res.code;
                        wx.getUserInfo({
                            success: function(wxuser) {
                                //发起网络请求
                                wx.request({
                                    url: that.getUrl('login/GetOpenId'),
                                    data: {
                                        appid: that.globalData.appId,
                                        secret: that.globalData.secret,
                                        js_code: code,
                                    },
                                    success: function(result) {
                                        result = result.data;
                                        if (result.success) {
                                            const user = {
                                                openId: result.data.openid,
                                                nikeName: wxuser.userInfo.nickName,
                                                unionId: '',
                                                headImage: wxuser.userInfo.avatarUrl,
                                                encryptedData: wxuser.encryptedData,
                                                session_key: result.data.session_key,
                                                iv: wxuser.iv
                                            };
                                            wx.setStorage({
                                                key: "mallAppletOpenId",
                                                data: user.openId
                                            });
                                            that.globalData.wxUserInfo = user;
                                            that.globalData.openId = user.openId;
                                            typeof cb == "function" && cb(that.globalData.openId)
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            })
        } else {
            if (frompage != "userhome" && frompage != "home" && frompage != "shopcart" && frompage != "productcategory" && frompage != "productdetail" && frompage != "searchresult" && frompage != "countdowndetail" && frompage != "shopcart" && frompage != "pointsShoppingCenter" && frompage != 'commentlist') {
                wx.navigateTo({
                    url: '../login/login'
                })
            } else {
                typeof cb == "function" && cb("")
            }
        }
    },
    getUserCenterInfo: function(cb) {
        var that = this;
        wx.request({
            url: this.getUrl('UserCenter/GetUser'),
            data: {
                openId: that.globalData.openId,
                userkey: ""
            },
            method: 'GET',
            dataType: 'json',
            responseType: 'text',
            success: function(res) {
                if (res.data.success) {
                    wx.setStorageSync('userInfo', res.data.data);
                    if (cb instanceof Function) {
                        cb(res.data.data);
                    }
                }
            },
            fail: function(res) {},
            complete: function(res) {},
        })
    },
    getWxUserInfo: function(cb) {
        var that = this;
        if (that.getIsLogin() && that.globalData.wxUserInfo) {
            typeof cb == "function" && cb(that.globalData.wxUserInfo)
        } else {
            //调用登录接口
            wx.login({
                success: function(res) {
                    if (res.code) {
                        const code = res.code;
                        wx.getUserInfo({
                            success: function(wxuser) {
                                //发起网络请求
                                wx.request({
                                    url: that.getUrl('login/GetOpenId'),
                                    data: {
                                        appid: that.globalData.appId,
                                        secret: that.globalData.secret,
                                        js_code: code,
                                    },
                                    success: function(result) {
                                        result = result.data;
                                        if (result.success) {
                                            const user = {
                                                openId: result.data.openid,
                                                nikeName: wxuser.userInfo.nickName,
                                                unionId: '',
                                                headImage: wxuser.userInfo.avatarUrl,
                                                encryptedData: wxuser.encryptedData,
                                                session_key: result.data.session_key,
                                                iv: wxuser.iv
                                            };
                                            typeof cb == "function" && cb(user);
                                        }
                                    }
                                })
                            },
                            fail: function(e) {
                                wx.hideLoading();
                            }
                        })
                    }
                }
            })
        }
    },
    setUserInfo(user) {
        wx.setStorage({
            key: "mallAppletOpenId",
            data: user.openId
        });
        this.globalData.wxUserInfo = user;
        this.globalData.openId = user.openId;
    },
    orderPay(orderid, orderstatus, islistpage) {
        var that = this;
        that.getOpenId(function(openid) {
            wx.request({
                url: that.getUrl(that.globalData.getPayParam),
                data: {
                    openId: openid,
                    orderId: orderid
                },
                success: function(result) {
                    result = result.data;
                    if (result.success) {
                        var r = result.data;
                        wx.requestPayment({
                            'timeStamp': r.timeStamp,
                            'nonceStr': r.nonceStr,
                            'package': 'prepay_id=' + r.prepayId,
                            'signType': 'MD5',
                            'paySign': r.sign,
                            'success': function(res) {
                                wx.showModal({
                                    title: '提示',
                                    content: "支付成功！",
                                    showCancel: false,
                                    success: function(res) {
                                        if (res.confirm) {
                                            wx.redirectTo({
                                                url: '../orderlist/orderlist?status=' + orderstatus
                                            })
                                        }
                                    }
                                })
                            },
                            'fail': function(res) {
                                wx.showModal({
                                    title: '提示',
                                    content: "支付失败！",
                                    showCancel: false,
                                    success: function(res) {
                                        if (!islistpage) {
                                            if (res.confirm) {
                                                wx.redirectTo({
                                                    url: '../orderlist/orderlist?status=' + orderstatus
                                                })
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: result.msg,
                            showCancel: false,
                            success: function(res) {
                                if (!islistpage) {
                                    if (res.confirm) {
                                        wx.redirectTo({
                                            url: '../orderlist/orderlist?status=' + orderstatus
                                        })
                                    }
                                }
                            }
                        })
                    }
                }
            })
        })
    },
    MoneyRound: function(price, num) {
        num = num || 2;
        return Math.round(price * Math.pow(10, num)) / Math.pow(10, num)
    },
    MoneyFix2: function(num) {
        var num2 = num.toFixed(3);
        return num2.substring(0, num2.lastIndexOf('.') + 3);
    },
    countDown: function(time, callback) {
        var day = 0,
            hour = 0,
            minute = 0,
            second = 0;
        if (time > 0) {
            day = '' + Math.floor(time / (24 * 60 * 60));
            hour = '' + Math.floor(time / (60 * 60) - (day * 24));
            minute = '' + Math.floor(time / 60 - (day * 24 * 60) - (hour * 60));
            second = '' + Math.floor(time - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60));
        }
        if (minute < 10) {
            minute = '0' + minute;
        }
        if (second < 10) {
            second = '0' + second;
        }
        callback(day, hour, minute, second);
    },
    // getRequestUrl: 'https://demo.himall.kuaidiantong.cn/',
    // getUrl(route) {
    //     return `https://demo.himall.kuaidiantong.cn/smallprogapi/${route}`;
    // },
    // getRequestUrl: 'https://himall33.himall.kuaidiantong.cn/',
    // getUrl(route) {
    //     return `https://himall33.himall.kuaidiantong.cn/smallprogapi/${route}`;
    // },
  getRequestUrl: 'http://localhost:32223/',
    getUrl(route) {
      return `http://localhost:32223/smallprogapi/${route}`;
    },
    getUserCoupon: function(couponId, callback) {
        var that = this;
        if (that.getIsLogin()) {
            wx.showLoading({
                mask: true,
            });
            that.getOpenId(function(openid) {
                wx.request({
                    url: that.getUrl(that.globalData.userGetCoupon),
                    data: {
                        openId: openid,
                        couponId: couponId
                    },
                    header: {},
                    method: 'GET',
                    dataType: 'json',
                    responseType: 'text',
                    success: function(res) {
                        wx.hideLoading();
                        setTimeout(function() {
                            wx.showToast({
                                title: res.data.msg,
                                icon: res.data.success ? 'success' : 'none',
                                duration: 2000,
                                mask: true
                            })
                        }, 500);

                        if (callback instanceof Function) {
                            callback(res.data);
                        }
                    },
                    fail: function(res) {},
                    complete: function(res) {},
                })
            })

        } else {
            wx.navigateTo({
                url: '../login/login',
            })
        }
    },
    getDistributionInfo: function(productId, successCB) {
        wx.request({
            url: this.getUrl(this.globalData.getDistributionInfo),
            data: {
                openId: this.globalData.openId,
                id: productId
            },
            header: {},
            method: 'GET',
            dataType: 'json',
            responseType: 'text',
            success: function(res) {
                if (res.data.success) {
                    if (successCB instanceof Function) {
                        successCB(res.data.data);
                    }
                }
            }
        });
    },
    addOrCancelFavoriteVshop: function(that, e, config) {
        var shopId = e.currentTarget.dataset.id;
        var app = this;
        app.getOpenId(function(openId) {
            config.httpPost(app.getUrl('VShop/PostAddFavoriteShop'), {
                openId: openId,
                shopId: shopId
            }, function(res) {
                if (res.success) {
                    wx.showToast({
                        title: res.data,
                        icon: 'none',
                        duration: 2000,
                        mask: true,
                    });
                    that.loadData(false, true);
                } else {
                    app.showErrorModal(res.msg);
                }
            });
        });

    },
    addOrCancelFavoriteProduct: function(that, e, config) {
        var id = e.currentTarget.dataset.id;
        var app = this;
        app.getOpenId(function(openId) {

            config.httpPost(app.getUrl('product/PostAddFavoriteProduct'), {
                productId: id,
                openId: app.globalData.openId
            }, function(res) {
                if (res) {
                    wx.showToast({
                        title: res.data,
                        icon: 'none',
                        duration: 2000,
                        mask: true,
                    });
                    that.loadData(false, true);
                } else {
                    app.showErrorModal(res.msg);
                }
            });
        });
    },
    globalData: {
      appId: 'wx692a16778d2529e2',
      secret: '2d986e7cfe66aaf308206f58ef8ee2ed',
        userInfo: null,
        openId: '',
        wxUserInfo: null,
        QQMapKey: '',

        loginByOpenId: "Login/GetLoginByOpenId", //根据OpenId判断是否有账号，根据OpenId进行登录
        loginByUserName: "Login/GetLoginByUserName", //账号密码登录
        quickLogin: "Login/GetQuickLogin", //一键登录
        prcesslogout: "Login/GetProcessLogout",

        getIndexData: "Home/GetIndexData", //获取首页数据 
        GetIndexProductData: "Home/GetIndexProductData", //获取首页商品数据
        getProducts: "Product/GetProducts", //商品搜索
        getProductSkus: "Product/GetProductSkus",
        getProductDetail: "product/GetProductDetail", //获取商品详情
        getLimitBuyList: "LimitTimeBuy/GetLimitBuyList",
        getLimitBuyProduct: "LimitTimeBuy/GetLimitBuyProduct", //获取限时抢购商品详情
        userGetCoupon: "Coupon/GetUserCoupon", //领取优惠券
        loadCoupon: "Coupon/GetLoadCoupon", //获取优惠券列表数据
        LoadSiteCoupon: "Coupon/GetLoadSiteCoupon", //获商城可领取优惠券列表

        getCartProduct: "Cart/GetCartProduct", //获取购物车列表
        getAddToCart: "Cart/GetAddToCart",
        getUpdateToCart: "Cart/GetUpdateToCart", //更新购物车    
        getUserShippingAddress: "ShippingAddress/GetShippingAddressList", //获取用户收货地址
        addShippingAddress: "ShippingAddress/PostAddAddress", //添加收货地址
        updateShippingAddress: "ShippingAddress/PostUpdateAddress", //修改收货地址
        setDefaultShippingAddress: "ShippingAddress/GetSetDefault", //设置默认地址
        delShippingAddress: "ShippingAddress/GetDeleteAddress", //删除地址
        AddWXChooseAddress: "ShippingAddress/PostAddWXAddress", //添加微信收货地址
        getRegionByLatLng: "ShippingAddress/GetRegion", //根据经纬度反解析地址
        orderList: "UserOrder/GetOrders", //获取订单列表
        closeOrder: "UserOrder/GetCloseOrder", //取消订单
        finishOrder: "UserOrder/GetConfirmOrder", //确认收货
        getLogistic: "UserOrder/GetExpressInfo", //获取物流信息

        getPayParam: "Payment/GetPaymentList", //支付前检查并获取支付参数信息
        getAllCategories: "Home/GetAllCategories", //获取商品分类
        loadCouponDetails: "Coupon/GetCouponDetail",
        getOrderDetail: "UserOrder/GetOrderDetail",
        applyRefund: "OrderRefund/PostApplyRefund",
        getAfterSalePreCheck: "OrderRefund/GetOrderRefundModel", //退款退货申请前状态检测
        getAllAfterSaleList: "OrderRefund/GetList",
        getRefundDetail: "OrderRefund/GetRefundDetail",
        getReturnDetail: "OrderRefund/GetReturnDetail",
        getExpressList: "OrderRefund/GetExpressList",
        returnSendGoods: "OrderRefund/PostReturnSendGoods",
        getAppendComment: "Comment/GetAppendComment", //获取追加评论信息
        submitAppendComment: "Comment/PostAppendComment", //提交追加评价
        uploadImage: "OrderRefund/PostUploadAppletImage", //上传图片
        getPickupCodeQRCode: "UserOrder/GetPickupCodeQRCode", //获取订单提货码
        delteInvoiceTitle: "Order/PostDeleteInvoiceTitle", //删除发票抬头
        postSaveInvoiceTitleNew: "Order/PostSaveInvoiceTitle", //保存发票信息
        getDistributor: "Distribution/GetDistributor", //获取用户分销信息
        getOpenMyShopInfo: "Distribution/GetOpenMyShopInfo", //获取我要开店页面信息
        getCanApplyMyShop: "Distribution/GetCanApplyMyShop", //是否可以申请销售员
        postApplyDistributor: "Distribution/PostApplyDistributor", //提交申请销售员
        getMyShop: "Distribution/GetMyShop", //我的小店首页
        getMyBrokerage: "Distribution/GetMyBrokerage", //获取我的佣金数据
        getRecords: "Distribution/GetRecords", //获取我的佣金流水记录
        getApplyWithdraw: "Distribution/GetApplyWithdraw", //获取申请提现页面信息,
        postWithdraw: "Distribution/PostWithdraw", //提交申请提现
        getWithdraws: "Distribution/GetWithdraws", //获取提现记录
        postInitPayPassowrd: "Distribution/PostInitPayPassowrd", //设置支付密码
        getShopOrder: "Distribution/GetShopOrder", //获取小店订单
        getMySubordinateLevel: "Distribution/GetMySubordinateLevel", //获取我的下级数据
        getMySubordinateRecords: "Distribution/GetMySubordinateRecords", //获取我的下级人员数据
        getProductList: "Distribution/GetProductList", //获取分销商品
        postSaveShopConfig: "Distribution/PostSaveShopConfig", //保存小店设置
        getMarketCategory: "Distribution/GetMarketCategory", //获取分销市场分类
        getImageCheckCode: "Login/GetImageCheckCode", //获取图形验证码
        bindGetPhoneOrEmailCheckCode: "Login/GetPhoneOrEmailCheckCode", //发送验证码（绑定手机）
        bindGetCheckPhoneOrEmailCheckCode: "Login/GetCheckPhoneOrEmailCheckCode", //验证手机验证码（绑定手机）
        postChangePayPwd: "UserCenter/PostChangePayPwd", //重置交易密码
        getPhoneOrEmailCheckCode: "UserCenter/GetPhoneOrEmailCheckCode", //发送验证码（重置密码）
        getCheckPhoneOrEmailCheckCode: "UserCenter/GetCheckPhoneOrEmailCheckCode", //验证手机验证码(重置密码)
        getGiftsIndexData: "Gifts/GetIndexData", //获取积分商城首页数据
        getGiftsList: "Gifts/GetList", //获取礼品列表
        getGiftsDetail: "Gifts/GetGiftDetail", //获取礼品详情
        getGiftsCanBuy: "Gifts/GetCanBuy", //下单前判断是否可购买
        getGiftsConfirmOrder: "Gifts/GetConfirmOrder", //确认订单信息
        postGiftsSubmitOrder: "Gifts/PostSubmitOrder", //提交礼品订单
        getGiftsMyOrderList: "Gifts/GetMyOrderList", //获取礼品订单列表
        getGiftsOrderCount: "Gifts/GetOrderCount", //获取礼品订单综合数据
        getGiftsOrderDetail: "Gifts/GetGiftOrderDetail", //获取礼品订单详情
        postGiftsConfirmOrderOver: "Gifts/PostConfirmOrderOver", //礼品订单确认收货
        getGiftsExpressInfo: "Gifts/GetGiftExpressInfo", //礼品订单物流查询
        getIntegralCoupon: "Coupon/GetIntegralCoupon", //获取积分优惠券
        getDistributionInfo: "product/GetDistributionInfo", //获取商品详情分销信息
        getShopHeader: "Distribution/GetShopHeader", //根据分销员获取小店信息
        getAddressList: "ShippingAddress/GetList", //获取用户收货地址
        getOrderBonus: "SmallProgAPI/UserOrder/GetOrderBonus", //获取订单红包
    }
})