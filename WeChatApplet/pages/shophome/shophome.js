// pages/shophome/shophome.js
var config = require("../../utils/config.js");
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageLoaded: false,
        couponHide: true,
        shopBuyHide: false,
        shopDetailShow: false,
        commentHide: true,
        isFirstCate: true,
        pageno: 1,
        hasData: true,
        commentList: [],
        Products:[],
        CommentType: 0,
        proPageno:1,
        isEndProduct:false,
        cateType:[]
    },
    onShareAppMessage: function () {
        return {
            title: '门店首页',
            path: '',
            success: function (res) {
            },
            fail: function (res) {
                // 转发失败
            }
        }

    },
    onReady(){
        this.storeCart = this.selectComponent("#storeCart");
    },
    onShow: function () {
        if (this.data.pageLoaded){
            this.getProductData(true);
            this.storeCart.getCartData();
        }
    },
    onLoad: function (options) {
        this.setData({
            Id: options.id,
            fromLatLng: options.fromLatLng ? options.fromLatLng:wx.getStorageSync('o2oFromLatLng'),
            productid: options.productid||''
        });
        config.httpGet(app.getUrl('Home/GetStoreInfo'), {
            Id: options.id,
            fromLatLng: options.fromLatLng ? options.fromLatLng : wx.getStorageSync('o2oFromLatLng'),
            openId: app.globalData.openId
        }, this.getShopData);

        wx.showNavigationBarLoading();

    },
    getShopData: function (res) {
        if (res.success) {
            res = res.data;
            if (res.Store.Status==1){
                wx.showToast({
                    title: '店铺已' + res.Store.ShowStatus,
                    icon: 'none'
                });
                setTimeout(function () {
                    wx.navigateBack();
                }, 3000);
            }
            res.ShopAllActives.ShopCoupons.forEach(function (item) {
                item.strStartTime = item.strStartTime.replace(/-/g, '.');
                item.strEndTime = item.strEndTime.replace(/-/g, '.');
            });
            var desc = [];
            res.ShopAllActives.ShopCoupons.forEach(function (item) {
                if (item.OrderAmount < item.Price) {
                    desc.push('满' + item.Price + '减' + item.Price);
                } else {
                    desc.push('满' + item.OrderAmount.replace('.00', '') + '减' + item.Price);
                }
            });

            res.ShopAllActives.desc = desc.join(',');
            var HaveActiveText = '查看全部';
            if (res.ShopAllActives.ShopCoupons.length == 0 && res.ShopAllActives.ShopActives.length == 0 && res.ShopAllActives.FreeFreightAmount == 0) {
                HaveActiveText = "查看详情";
            }
            this.setData({
                CommentScore: res.CommentScore,
                Store: res.Store,
                ShopAllActives: res.ShopAllActives,
                shopId: res.Store.ShopId,
                HaveActiveText: HaveActiveText
            });
            config.httpGet(app.getUrl('Home/GetShopCategory'), {
                shopId: this.data.shopId,
                shopBranchId: this.data.Id
            }, this.getShopCategoryData);
        } else {
            wx.showToast({
                title: res.msg,
                icon: 'none'
            });
            setTimeout(function(){
                wx.navigateBack();
            },3000);
            
        }
        wx.hideNavigationBarLoading();
    },
    getShopCategoryData: function (res) {
        if (res.success) {
            this.setData({
                Categories: res.data,
                shopCategoryId: res.data[0] && (res.data[0].Id),
                pageLoaded: true
            });
            this.getProductData();
        } else {
            wx.showToast({
                title: '系统数据异常',
                icon: 'none'
            })
        }
    },
    getProductData: function (isreload) {
        if (isreload){
            this.setData({
                proPageno:1,
                isEndProduct: false,
                cateType: []
            });
        }
        var that = this;
        config.httpGet(app.getUrl('Product/GetProductList'), {
            shopId: this.data.shopId,
            shopBranchId: this.data.Id,
            shopCategoryId: this.data.shopCategoryId,
            openId: app.globalData.openId,
            productid: this.data.productid,
            pageno: this.data.proPageno,
            pagesize:10
        }, function (res) {
            if (res.data.Products.length==0){
                that.setData({
                    isEndProduct: true
                });
            }
            if (res.success) {
                var old = that.data.proPageno == 1?[]:that.data.Products,
                    newProducts = old,
                    cateType = that.data.cateType;
                res.data.Products.forEach(function (item, index) {
                    var pos = cateType.indexOf(item.CategoryName);
                    if (pos==-1) {
                        newProducts.push({
                            typeName: item.CategoryName,
                            Product: [item]
                        });
                        cateType.push(item.CategoryName);
                    } else {
                        newProducts[pos].Product.push(item);
                    }
                });
                that.setData({
                    Products: old,
                    cateType: that.data.cateType
                });
            } else {
                wx.showToast({
                    title: '系统数据异常',
                    icon: 'none'
                })
            }
        });
    },
    updateProduct(){
        this.getProductData(true);
    },
    loadMoreProduct:function(){
        if (!this.data.isEndProduct){
            this.setData({
                proPageno: this.data.proPageno + 1
            });
            this.getProductData();
        }
    },

    chooseSku: function (e) {
        this.setData({
            skuProductid: e.currentTarget.dataset.id
        });
        this.storeCart.chooseSku();
    },
    
    getCommentTotalData: function () {
        var that = this;
        config.httpGet(app.getUrl('Home/GetCommentCountAggregate'), {
            id: this.data.Id
        }, function (res) {
            if (res.success) {
                if (res.data.AllComment > 0) {
                    that.getCommentData();
                }
                that.setData({
                    CommentTotal: res.data
                });
            }
        });
    },
    formatDuring(mss) {
        var days = parseInt(mss / (1000 * 60 * 60 * 24)),
            hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60)),
            seconds = (mss % (1000 * 60)) / 1000,
            t;
        if (days > 0) {
            t = days + "天";
            return t;
        }
        if (hours > 0) {
            t = hours + "小时";
            return t;
        }
        if (minutes > 0) {
            t = minutes + "分钟";
            return t;
        }
        if (seconds > 0) {
            t = seconds + "秒";
            return t;
        }
    },
    getCommentData: function (e) {
        var that = this,
            CommentType = that.data.CommentType;
        if(e){
            var curType = e.currentTarget.dataset.type;
            if (curType == CommentType){
                return;
            }else{
                that.setData({
                    pageno: 1,
                    commentList: []
                });
                CommentType=curType;
            }
        }
        config.httpGet(app.getUrl('Home/GetComments'), {
            shopBranchId: this.data.Id,
            CommentType: CommentType,
            PageNo: that.data.pageno,
            PageSize:10
        }, function (res) {
            if (res.success) {
                res.data.rows.forEach(function (item) {
                    item.ReviewDate = item.ReviewDate.replace('T', ' ');
                    if (item.AppendDate) {
                        item.AppendDate = item.AppendDate.replace('T', ' ');
                        item.AppendSpace = that.formatDuring(new Date(item.AppendDate.replace(/-/g, "/")) - new Date(item.ReviewDate.replace(/-/g, "/")));
                    }
                });
                var old = that.data.commentList;
                old.push.apply(old, res.data.rows);
                that.setData({
                    commentList: old,
                    CommentType: CommentType,
                    hasData: res.data.rows.length > 0 ? true : false
                });
            }
        });
    },
    callShopTel: function (e) {
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.tel,
        })
    },
    
    changeCoupon: function (e) {
        this.setData({
            couponHide: e.currentTarget.dataset.flag ? true : false
        });
    },
    
    showShopDetail: function () {
        this.setData({
            shopDetailShow: true,
            shopBuyHide: true,
            commentHide: true
        });
    },
    handletouchmove: function (event) {
        var currentX = event.touches[0].pageX
        var currentY = event.touches[0].pageY
        var tx = currentX - this.data.lastX
        var ty = currentY - this.data.lastY
        if (ty < -20) {
            this.setData({
                shopDetailShow: false,
                shopBuyHide: false
            });
        }
        this.data.lastX = currentX
        this.data.lastY = currentY
    },
    handletouchtart: function (event) {
        this.data.lastX = event.touches[0].pageX
        this.data.lastY = event.touches[0].pageY
    },

    hideShopDetail: function () {
        this.setData({
            shopDetailShow: false,
            shopBuyHide: false
        });
    },
    showComment: function () {
        if (!this.data.CommentTotal) {
            this.getCommentTotalData();
        }

        this.setData({
            commentHide: false,
            shopBuyHide: true
        });
    },
    showShopBuy: function () {
        this.setData({
            commentHide: true,
            shopBuyHide: false
        });
    },
    changeProduct: function (e) {
        this.setData({
            shopCategoryId: e.currentTarget.dataset.id,
            isFirstCate: e.currentTarget.dataset.index == 0 ? true : false
        });
        this.getProductData(true);
    },
    imageError: function(e){
        var parent = e.currentTarget.dataset.parent,
            index = e.currentTarget.dataset.index,
            cur = this.data.Products[parent].Product[index];
        cur.DefaultImage = '../../images/noimage200.png';
        this.setData({
            Products: this.data.Products
        });
    },
    productNumChange: function (e) {
        var productId = e.currentTarget.dataset.id,
            parent = e.currentTarget.dataset.parent,
            index = e.currentTarget.dataset.index,
            type = e.currentTarget.dataset.type,
            cur = this.data.Products[parent].Product[index],
            that = this;
        if (type) {
            cur.Quantity += 1;
        } else {
            cur.Quantity -= 1;
        }
        if (cur.Quantity < 0) {
            cur.Quantity = 0;
        }

        this.setData({
            Products: this.data.Products
        });
        this.changeCart('', cur.Quantity, productId, function () {
            var _cur = that.data.Products[parent].Product[index];
            _cur.Quantity -= 1;
            if (_cur.Quantity < 0) {
                _cur.Quantity = 0;
            }
            that.setData({
                Products: that.data.Products
            });
        });
    },
    changeCart(skuId, count, productId, callback) {
        var that = this;
        if (!skuId) {
            skuId = productId + '_0_0_0';
        }
        config.httpGet(app.getUrl('shopCart/GetUpdateCartItem'), {
            shopBranchId: this.data.Id,
            skuId: skuId,
            count: count,
            openId: app.globalData.openId
        }, function (res) {
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
    goProduct:function(e){
    	wx.navigateTo({
            url: '../productdetail/productdetail?shopBranchId=' + this.data.Id +'&id='+e.currentTarget.dataset.id
        });
    },
    getCoupon: function (e) {
        var that = this,
            index = e.currentTarget.dataset.index;
        config.httpGet(app.getUrl('Coupon/GetUserCoupon'), {
            couponId: e.currentTarget.dataset.id,
            openId: app.globalData.openId
        }, function (res) {
            if (res.success) {
                wx.showToast({
                    title: "优惠券领取成功",
                    icon: 'none'
                });
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
                    if (res.code == 2)
                        wx.showToast({
                            title: '优惠券已经过期',
                            icon: 'none'
                        })
                    if (res.code == 3) {
                        that.data.ShopAllActives.ShopCoupons[index].IsUse=1;
                        wx.showToast({
                            title: '达到每人领取最大张数',
                            icon:'none'
                        })
                    }
                    if (res.code == 4) {
                        that.data.ShopAllActives.ShopCoupons[index].IsUse = 2;
                        wx.showToast({
                            title: '优惠券已领完',
                            icon: 'none'
                        })
                    }
                }
                that.setData({
                    ShopAllActives: that.data.ShopAllActives
                });
            }
        });

    },
    openMaps: function () {
        var that = this;
        wx.openLocation({
            latitude: that.data.Store.Latitude,
            longitude: that.data.Store.Longitude,
            scale: 28, // 缩放比例
        })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var that = this;
        if (!that.data.commentHide && that.data.hasData) {
            that.setData({
                pageno: that.data.pageno + 1
            })
            that.getCommentData();
        }
    },
    previewImage: function (e) {
        var current = e.target.dataset.src;
        wx.previewImage({
            current: current,
            urls: [current]
        })
    }
})