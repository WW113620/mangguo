// pages/ProductDetails/ProductDetails.js
var config = require("../../utils/config.js");
var app = getApp();
var WxParse = require('../wxParse/wxParse.js');
Page({
    data: {
        status: 10,
        Promotes: null,
        ShowPromotesText: '',
        backShow: 'none',
        SkuShow: 'none',
        couponShow: 'none',
        promoteShow: 'none',
        skuPrice: 0,
        skuStock: 0,
        selectedSkuContent: '',
        buyAmount: 1,
        selectedskuList: [],
        isbuy: true,
        ReviewCount: 0,
        gotopVal: true,
        hasLoaded: false,
        pageLoaded: false,
        setInter: '',
        saleOUt: false
    },
    onPullDownRefresh: function () {
        this.loadData();
    },
    onLoad: function (options) {
        var distributorId = options.distributorId;
        wx.setStorageSync("distributorId", distributorId);
        var grouId = options.grouId,
            activeid = options.id;
        this.setData({
            grouId: grouId||0,
            activeid: activeid
        })
        this.loadData();
    },

    //避免与<scroll-view>冲突，把微信提供的onReachBottom改为自定义方法
    reachBottom: function () {
        var that = this;
        if (!this.data.metaDescription) {
            var metaDescription = this.data.TempMetaDescription;
            if (metaDescription) {
                WxParse.wxParse('metaDescription', 'html', metaDescription, that);
            }
        }
    },
    loadData: function () {
        wx.showNavigationBarLoading(); //在标题栏中显示加载
        var that = this;

        app.getOpenId(function (openid) {
            wx.request({
                url: app.getUrl("FightGroup/GetActiveDetail"),
                data: {
                    openId: openid,
                    grouId: that.data.grouId,
                    id: that.data.activeid
                },
                success: function (result) {
                    result = result.data;
                    if (result.success) {
                        const r = result.data;
                        var SkuItemList = [];
                        if (r.ShowSkuInfo.Color.length > 0) {
                            var tempArr = [];
                            r.ShowSkuInfo.Color.forEach(function (item) {
                                tempArr.push({
                                    ValueId: item.SkuId,
                                    Value: item.Value,
                                    ImageUrl: item.Img
                                })
                            })
                            SkuItemList.push({
                                AttributeName: r.ShowSkuInfo.ColorAlias,
                                AttributeIndex: 0,
                                AttributeValue: tempArr
                            });
                        }
                        if (r.ShowSkuInfo.Size.length > 0) {
                            var tempArr = [];
                            r.ShowSkuInfo.Size.forEach(function (item) {
                                tempArr.push({
                                    ValueId: item.SkuId,
                                    Value: item.Value
                                })
                            })
                            SkuItemList.push({
                                AttributeName: r.ShowSkuInfo.SizeAlias,
                                AttributeIndex: 1,
                                AttributeValue: tempArr
                            });
                        }
                        if (r.ShowSkuInfo.Version.length > 0) {
                            var tempArr = [];
                            r.ShowSkuInfo.Version.forEach(function (item) {
                                tempArr.push({
                                    ValueId: item.SkuId,
                                    Value: item.Value
                                })
                            })
                            SkuItemList.push({
                                AttributeName: r.ShowSkuInfo.VersionAlias,
                                AttributeIndex: 2,
                                AttributeValue: tempArr
                            });
                        }

                        r.SkuItemList = SkuItemList;

                        if (r.SkuData.length > 0) {
                            if (r.SkuItemList.length == 0) {
                                that.setData({
                                    curSkuData: r.SkuData[0],
                                    skuStock: r.SkuData[0].Stock
                                })
                            } else {
                                var newSku = {};
                                r.SkuData.forEach(function (item) {
                                    newSku[item.SkuId] = item;
                                });
                                r.SkuData = newSku;
                            }
                        } else {
                            that.setData({
                                saleOUt: true
                            })
                        }

                        var _showPromote = [];
                        if (r.ShowPromotion.FreeFreight) {
                            _showPromote.push('满￥' + r.ShowPromotion.FreeFreight + '免运费');
                        }
                        if (r.fullDiscount) {
                            _showPromote.push(r.fullDiscount.ActiveName);
                        }
                        r.FightGroupData.EndTime = r.FightGroupData.EndTime.substring(2, 10).replace(/-/g, '. ');
                        r.ShopScore.ProductAndDescription = r.ShopScore.ProductAndDescription.toFixed(2);
                        r.ShopScore.SellerServiceAttitude = r.ShopScore.SellerServiceAttitude.toFixed(2);
                        r.ShopScore.SellerDeliverySpeed = r.ShopScore.SellerDeliverySpeed.toFixed(2);

                        if (r.userList.length > 0) {
                            var GroupId = r.userList[0].GroupId;

                            r.ShowNewCanJoinGroup.forEach(function (item) {
                                if (item.Id == GroupId) {
                                    that.setData({
                                        status: item.BuildStatus,
                                        differ: item.LimitedNumber - item.JoinedNumber,
                                        time: item.Seconds
                                    })
                                }
                            });
                        }
                        that.setTimePlay();

                        that.setData({
                            FightGroupData: r.FightGroupData,
                            ShopScore: r.ShopScore,
                            ProductId: r.FightGroupData.ProductId,
                            ProductName: r.FightGroupData.ProductName,
                            ShortDescription: r.FightGroupData.ProductShortDescription || '',
                            SaleCounts: r.SaleCounts,
                            ProductImgs: [r.FightGroupData.ProductDefaultImage].concat(r.FightGroupData.ProductImages),
                            //DefaultSku:r.DefaultSku,
                            skuArr: [r.FightGroupData.ProductId, 0, 0, 0],
                            SkuItemList: r.SkuItemList,
                            Skus: r.SkuData,
                            Freight: r.FreightStr,
                            Coupons: r.Coupons||[],
                            FullDiscount: r.fullDiscount,
                            Promotes: r.ShowPromotion,
                            ShowPromotesText: _showPromote.join('，'),
                            ShowPrice: r.LoadShowPrice,
                            skuImg: r.ShowSkuInfo.ProductImagePath,
                            skuPrice: r.FightGroupData.MiniGroupPrice,
                            selectTextArr: [],
                            selectedSkuContent: '',
                            ReviewCount: r.ProductCommentShow.CommentCount,
                            buyAmount: 1,
                            TempMetaDescription: r.ProductDescription,
                            MaxBuyCount: r.FightGroupData.LimitQuantity, //限购数
                            SendTime: r.SendTime,
                            isEnd: r.FightGroupData.IsEnd,
                            pageLoaded: true,
                            IsUserEnter: r.IsUserEnter,
                            ShowNewCanJoinGroup: r.ShowNewCanJoinGroup,
                            userList: r.userList
                        })
                        app.getDistributionInfo(that.data.ProductId, function (data) {
                            that.setData({
                                distributionInfo: data
                            });
                        });
                    }
                    else {
                        if (result.code == '502') {
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
                },
                complete: function () {
                    // complete
                    wx.hideNavigationBarLoading(); //完成停止加载
                    wx.stopPullDownRefresh(); //停止下拉刷新
                    that.setData({
                        hasLoaded: true
                    });
                }
            })
        }, 'productdetail')
    },

    updateData: function () {
        wx.showLoading();
        const that = this;
        config.httpGet(app.getUrl('FightGroup/GetActiveDetail'), {
            grouId: that.data.grouId,
            id: that.data.activeid,
            openId: app.globalData.openId
        }, function (result) {
            wx.hideLoading();
            result = result.data;
            if (result.success) {
                if (result.userList.length > 0) {
                    var GroupId = result.userList[0].GroupId;

                    result.ShowNewCanJoinGroup.forEach(function (item) {
                        if (item.Id == GroupId) {
                            that.setData({
                                status: item.BuildStatus,
                                differ: item.LimitedNumber - item.JoinedNumber,
                                time: item.Seconds
                            })
                        }
                    });
                }
                that.setTimePlay();
                that.setData({
                    isEnd: result.FightGroupData.IsEnd,
                    IsUserEnter: result.IsUserEnter,
                    ShowNewCanJoinGroup: result.ShowNewCanJoinGroup,
                    userList: result.userList,
                })
            }
        });
    },

    setTimePlay() {
        var that = this;
        if (that.data.status == 0 && that.data.time > 0) {
            clearInterval(that.data.setInter);
            var timeFn = function () {
                app.countDown(that.data.time, function (day, hour, minute) {
                    that.setData({
                        countDown: day + '天' + hour + '小时' + minute + '分'
                    })
                });
            };
            timeFn();
            that.data.setInter = setInterval(function () {
                timeFn();
                that.setData({
                    time: that.data.time - 60
                })
                if (that.data.time <= 0) {
                    that.updateData();
                }
            }, 60000);
        }
    },

    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
        // 页面显示
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    },
    getCoupon: function (e) {
        const that = this;
        const couponid = e.currentTarget.id;
        app.getOpenId(function (openid) {
            wx.request({
                url: app.getUrl("Coupon/GetUserCoupon"),
                data: {
                    openId: openid,
                    couponId: couponid
                },
                success: function (result) {
                    result = result.data;
                    if (result.success) {
                        wx.showToast({
                            title: '领取成功',
                            image: '../../images/succes.png'
                        });
                    }
                    else {
                        if (result.code == '502') {
                            wx.navigateTo({
                                url: '../login/login'
                            })
                        }
                        else {
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
    clickCouponList: function (e) {
        const that = this;
        if (that.data.Coupons && that.data.Coupons.length > 0) {
            this.setData({
                backShow: '',
                couponShow: ''
            })
        }
        else {
            wx.showToast({
                title: '暂时没有可以领取的优惠券',
                icon: 'loading'
            })
        }
    },
    clickPromoteList: function (e) {
        if (this.data.ShowPromotesText) {
            this.setData({
                backShow: '',
                promoteShow: ''
            })
        } else {
            wx.showToast({
                title: '暂时没有进行中的满额优惠活动',
                icon: 'loading'
            })
        }
    },
    clickSku: function (e) {
        this.setData({
            backShow: '',
            SkuShow: '',
            isbuy: true
        })
    },
    setDisabledSku: function (index) {
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

        SkuItems[nextIndex].AttributeValue.forEach(function (item) {
            var tempArr = JSON.parse(JSON.stringify(skuArr));
            tempArr[SkuItems[nextIndex].AttributeIndex + 1] = item.ValueId;
            if (!Skus[tempArr.join('_')]) {
                item.disabled = true;
            } else {
                item.disabled = false;
            }
        });
        that.setData({
            SkuItemList: that.data.SkuItemList
        });
    },
    swithSku: function (e) {
        var index = e.target.dataset.index,
            parentindex = e.target.dataset.parentindex,
            value = e.target.dataset.skuvalue,
            imgurl = e.target.dataset.imgurl;
        if (imgurl) {
            this.setData({
                skuImg: imgurl
            });
        }
        this.data.skuArr[index + 1] = e.target.dataset.id;
        this.data.selectTextArr[index] = value;
        var curSkuData = this.data.Skus[this.data.skuArr.join('_')],
            str = '';
        this.data.selectTextArr.forEach(function (item, i) {
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
                    skuPrice: curSkuData.Price,
                    skuStock: curSkuData.Stock,
                })
            }
        }
        this.setDisabledSku(parentindex);
    },
    addShopCart: function (e) {
        this.setData({
            backShow: '',
            SkuShow: '',
            isbuy: false,
        })
    },
    clickback: function (e) {
        this.setData({
            backShow: 'none',
            SkuShow: 'none',
            couponShow: 'none',
            promoteShow: 'none'
        })
    },
    onCouponHide: function (e) {
        this.setData({
            backShow: 'none',
            couponShow: 'none'
        })
    },
    onPromoteHide: function (e) {
        this.setData({
            backShow: 'none',
            promoteShow: 'none'
        })
    },
    onSkuHide: function (e) {
        this.setData({
            backShow: 'none',
            SkuShow: 'none'
        })
    },
    reduceAmount: function (e) {
        const that = this;
        var amount = this.data.buyAmount;
        amount = amount - 1;
        if (amount <= 0)
            return;
        else {
            if (that.data.IsOpenLadder) {
                app.getOpenId(function (openid) {
                    wx.request({
                        url: app.getUrl("product/GetChangeNum"),
                        data: {
                            openId: openid,
                            pid: that.data.ProductId,
                            buyNum: amount
                        },
                        success: function (result) {
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
    addAmount: function (e) {
        var that = this,
            amount = this.data.buyAmount,
            stock = this.data.skuStock;
        amount = amount + 1;
        if (amount > stock)
            return;
        else {
            if (that.data.IsOpenLadder) {
                app.getOpenId(function (openid) {
                    wx.request({
                        url: app.getUrl("product/GetChangeNum"),
                        data: {
                            openId: openid,
                            pid: that.data.ProductId,
                            buyNum: amount
                        },
                        success: function (result) {
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
    changeAmount: function (e) {
        var that = this,
            amount = parseInt(e.detail.value),
            stock = this.data.skuStock;
        if (isNaN(amount) || amount > stock || amount <= 0) {
            app.showErrorModal("请输入正确的数量,不能大于库存或者小于等于0");
            return;
        }
        else {
            this.setData({
                buyAmount: amount
            })
            if (that.data.IsOpenLadder) {
                app.getOpenId(function (openid) {
                    wx.request({
                        url: app.getUrl("product/GetChangeNum"),
                        data: {
                            openId: openid,
                            pid: that.data.ProductId,
                            buyNum: amount
                        },
                        success: function (result) {
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
    doCommit: function (e) {
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
            if (that.data.MaxBuyCount > 0 && amount > that.data.MaxBuyCount) {
                app.showErrorModal("已超出商品最大购买数量" + that.data.MaxBuyCount);
                return;
            }
        }
        var skuid = that.data.skuArr.join('_'),
            grouId = that.data.grouId;
        if (that.data.status != 0) {
            grouId = 0;
        }
        app.getOpenId(function (openid) {
            wx.redirectTo({
                url: '../submitorder/submitorder?skuid=' + skuid + '&count=' + amount + '&GroupActionId=' + that.data.activeid + '&groupid=' + grouId + '&frompage=1'
            })
        });
    },
    changeGroup: function (e) {
        var that = this,
            dataset = e.currentTarget.dataset;

        this.setData({
            grouId: parseInt(dataset.grouid)
        });

        this.updateData();

    },

    goGroupList: function (e) {
        wx.redirectTo({
            url: '../grouplist/grouplist'
        })
    },
    goProduct: function (e) {
        wx.redirectTo({
            url: '../productdetail/productdetail?id=' + this.data.ProductId
        })
    },
    goTop: function (e) {
        this.setData({
            scrollTop: 0
        })
    },
    scroll: function (e) {
        this.setData({
            gotopVal: e.detail.scrollTop < 350
        });
    },
    previewImage: function (e) {
        var current = e.target.dataset.src;
        wx.previewImage({
            current: current, // 当前显示图片的http链接  
            urls: this.data.ProductImgs // 需要预览的图片http链接列表  
        })
    },
    onShareAppMessage: function () {
        var that = this;
        var path = '/pages/groupproduct/groupproduct?id=' + that.data.FightGroupData.Id + '&grouId=' + that.data.grouId;
        var userInfo = wx.getStorageSync("userInfo");
        if (userInfo.IsDistributor) {
            path += ('&distributorId=' + userInfo.UserId);
        }
        return {
            title: that.data.FightGroupData.LimitedNumber + '人团火拼团：' + that.data.FightGroupData.ProductName,
            path: path,
            imageUrl: that.data.FightGroupData.ProductDefaultImage,
            success: function (res) {
                // 转发成功
                wx.showToast({
                    title: "邀请好友成功",
                    icon: 'success',
                    duration: 2000
                })
            }
        }
    }
})