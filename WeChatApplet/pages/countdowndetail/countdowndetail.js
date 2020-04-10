var app = getApp();
var WxParse = require('../wxParse/wxParse.js');
Page({
    data: {
        CountDownId: 0,
        MaxCount: 0,
        CountDownStatus: '',
        StartDate: '',
        EndDate: '',
        NowTime: '',
        ProductId: 0,
        ProductName: '',
        TempMetaDescription: '',
        MetaDescription: '',
        ShortDescription: '',
        //SaleCounts:'',
        ShowSaleCounts: '',
        IsSaleCountOnOff: true,
        //Weight:'',
        MarketPrice: '',
        IsfreeShipping: '',
        MaxSalePrice: '',
        MinSalePrice: '',
        ReviewCount: 0,
        ProductImgs: '',
        //DefaultSku:'',
        SkuItemList: '',
        Skus: '',
        Freight: '',
        Coupons: '',
        //IsUnSale:'',
        ShowPrice: '',
        backShow: 'none',
        SkuShow: 'none',
        couponShow: 'none',
        skuImg: '',
        skuPrice: 0,
        skuStock: 1,
        selectedSkuContent: '',
        buyAmount: 1,
        activeDateMsg: '',
        StartClock: '',
        EndClock: '',
        gotopVal: true,
        MeasureUnit:'',//单位
        SendTime: '', //几时内发货
        pageLoaded:false
    },
    onReachBottom: function () {
        
    },
    onLoad: function (options) {
        var distributorId = options.distributorId;
        wx.setStorageSync("distributorId", distributorId);
        var that = this,
            countdownid = options.id;
        app.getOpenId(function (openid) {
            wx.request({
                url: app.getUrl(app.globalData.getLimitBuyProduct),
                data: {
                    openId: openid,
                    countDownId: countdownid
                },
                success: function (result) {
                    result = result.data;
                    if (result.success) {
                        const r = result.data;
                        if (r.NowTime < r.StartDate) {
                            var st = new Date(r.NowTime);
                            var nt = new Date(r.StartDate);
                            var mi_se = nt.getTime() - st.getTime();
                            var totalseconds = mi_se / 1000;
                            startcountdown(that, totalseconds);
                        }
                        if (r.NowTime > r.StartDate && r.NowTime < r.EndDate) {
                            var st = new Date(r.NowTime);
                            var nt = new Date(r.EndDate);
                            var mi_se = nt.getTime() - st.getTime();
                            var totalseconds = mi_se / 1000;
                            endcountdown(that, totalseconds);
                        }
                        if (r.SkuItemList.length == 0) {
                            that.setData({
                                curSkuData: r.Skus[0]
                            })
                        } else {
                            var newSku = {};
                            r.Skus.forEach(function (item) {
                                newSku[item.SkuId] = item;
                            });
                            r.Skus = newSku;
                        }
                        var shopScore = r.Shop;
                        shopScore.VShopLog = r.VShopLog;
                        shopScore.ProductAndDescription = r.Shop.ProductAndDescription.toFixed(2);
                        shopScore.SellerDeliverySpeed = r.Shop.SellerDeliverySpeed.toFixed(2);
                        shopScore.SellerServiceAttitude = r.Shop.SellerServiceAttitude.toFixed(2);
                        that.setData({
                            ShopScore:shopScore,
                            CountDownId: r.CountDownId,
                            MaxCount: r.MaxCount,
                            CountDownStatus: r.CountDownStatus,
                            StartDate: r.StartDate,
                            EndDate: r.EndDate,
                            NowTime: r.NowTime,
                            ProductId: r.ProductId,
                            ProductName: r.ProductName,
                            ShortDescription: r.ShortDescription ? r.ShortDescription : '',
                            //SaleCounts: r.SaleCounts,
                            ShowSaleCounts: r.ShowSaleCounts,
                            IsSaleCountOnOff: r.IsSaleCountOnOff,
                            //Weight: r.Weight,
                            MarketPrice: r.MarketPrice,
                            IsfreeShipping: r.IsfreeShipping,
                            MaxSalePrice: r.MaxSalePrice,
                            MinSalePrice: r.MinSalePrice,
                            ReviewCount: r.CommentsNumber,
                            ProductImgs: r.ProductImgs,
                            //DefaultSku:r.DefaultSku,
                            skuArr: [r.ProductId, 0, 0, 0],
                            SkuItemList: r.SkuItemList,
                            Skus: r.Skus,
                            Freight: r.Freight,
                            Coupons: r.Coupons,
                            ShowPrice: r.MaxSalePrice == r.MinSalePrice ? r.MinSalePrice : r.MinSalePrice + '～' + r.MaxSalePrice,
                            skuImg: r.ThumbnailUrl60,
                            skuPrice: r.MinSalePrice,
                            skuStock: r.Stock,
                            selectTextArr: [],
                            selectedSkuContent: '',
                            TempMetaDescription: r.MetaDescription,
                            buyAmount: 1,
                            MeasureUnit: r.MeasureUnit,  //单位
                            SendTime: r.SendTime,  //几时内发货
                            pageLoaded:true
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
                }
            })
        },'countdowndetail');
    },
    onShareAppMessage: function () {
        var userInfo = wx.getStorageSync("userInfo");
        var that = this;
        var imageUrl = this.data.ProductImgs.length > 0 ? this.data.ProductImgs[0] : "";
        var path = "/pages/countdowndetail/countdowndetail?id=" + this.data.CountDownId;
        if (userInfo.IsDistributor){
            path += ('&distributorId=' + userInfo.UserId);
        }
        return {
            title: '限时抢购' + that.data.ProductName,
            path: path,
            imageUrl:imageUrl,
            success: function (res) {
            },
            fail: function (res) {
                // 转发失败
            }
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
        var that = this,
            couponid = e.currentTarget.id;
        app.getOpenId(function (openid) {
            wx.request({
                url: app.getUrl(app.globalData.userGetCoupon),
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
                                icon:'none'
                            })
                        }
                    }
                }
            })
        })
    },
    clickCouponList: function (e) {
        const that = this;
        if (that.data.Coupons != undefined && that.data.Coupons != null && that.data.Coupons != "" && that.data.Coupons.length > 0) {
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
    onCouponHide: function (e) {
        this.setData({
            backShow: 'none',
            couponShow: 'none'
        })
    },
    clickSku: function (e) {
        this.setData({
            backShow: '',
            SkuShow: ''
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
        this.data.selectTextArr[parentindex] = value;
        var curSkuData = this.data.Skus[this.data.skuArr.join('_')];
        this.setData({
            skuArr: this.data.skuArr,
            curSkuData: curSkuData,
            selectTextArr: this.data.selectTextArr,
            selectedSkuContent: this.data.selectTextArr.join('，')
        });
        if (curSkuData) {
            this.setData({
                skuPrice: curSkuData.ActivityPrice,
                skuStock: curSkuData.Stock,
            })
            if (curSkuData.ThumbnailUrl40) {
                this.setData({
                    skuImg: curSkuData.ThumbnailUrl40
                })
            }
        }
        this.setDisabledSku(parentindex);
    },
    clickback: function (e) {
        this.setData({
            backShow: 'none',
            SkuShow: 'none',
            couponShow: 'none'
        })
    },
    onSkuHide: function (e) {
        this.setData({
            backShow: 'none',
            SkuShow: 'none'
        })
    },
    changeAmount: function (e) {
        const that = this;
        var amount = parseInt(e.detail.value);
        var stock = this.data.MaxCount > this.data.skuStock ? this.data.skuStock : this.data.MaxCount;

        if (isNaN(amount) || amount > stock || amount <= 0) {
            that.setData({
                buyAmount: stock
            })
            app.showErrorModal("请输入正确的数量,不能大于最大抢购数量和商品库存或者小于等于0");
            return;
        }
        else {
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
        var amount = this.data.buyAmount;
        var stock = this.data.MaxCount > this.data.skuStock ? this.data.skuStock : this.data.MaxCount;
        amount = amount + 1;
        if (amount > stock)
            return;
        else {
            this.setData({
                buyAmount: amount
            });
        }
    },
    commitBuy: function (e) {
        if (!this.data.curSkuData) {
            app.showErrorModal("请选择规格");
            return;
        }
        if (this.data.buyAmount <= 0) {
            app.showErrorModal("请输入要购买的数量");
            return;
        }
        if (this.data.buyAmount > this.data.skuStock){
          app.showErrorModal("库存不足");
          return;
        }
        var amount = this.data.buyAmount;
        var skuid = this.data.skuArr.join('_');
        var countdownid = this.data.CountDownId;
        app.getOpenId(function (openid) {
            wx.navigateTo({
                url: '../submitorder/submitorder?productsku=' + skuid + '&buyamount=' + amount + '&frompage=1&countdownid=' + countdownid
            })
        });
        
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
    reachBottom: function () {
        if (this.data.metaDescription == null || this.metaDescription == '') {
            var metaDescription = this.data.TempMetaDescription;
            if (metaDescription != null && metaDescription != undefined) {
                WxParse.wxParse('metaDescription', 'html', metaDescription, this);
            }
        }
    }

})

function showTime(totalseconds) {
    var day = parseInt(totalseconds / 86400),
        hour = parseInt(totalseconds % 86400 / 3600),
        min = parseInt((totalseconds % 3600) / 60),
        sec = parseInt((totalseconds % 3600) % 60),
        result = "";
    if (day > 0) {
        result += day + "天";
    }
    if (hour < 10) {
        hour = "0" + hour;
    }
    if (min < 10) {
        min = "0" + min;
    }
    if (sec < 10) {
        sec = "0" + sec;
    }
    result += hour + ":" + min + ":" + sec + "";
    return result;
}

function startcountdown(that, total_second) {
    that.setData({
        StartClock: showTime(total_second)
    });
    if (total_second <= 0) {
        that.setData({
            StartClock: "",
            CountDownStatus: "Normal"
        });
        return;
    }
    setTimeout(function () {
        total_second -= 1;
        startcountdown(that, total_second);
    }, 1000);
}
function endcountdown(that, total_second) {
    that.setData({
        EndClock: showTime(total_second)
    });
    if (total_second <= 0) {
        that.setData({
            EndClock: "",
            CountDownStatus: "ActivityEnd"
        });
        return;
    }
    setTimeout(function () {
        total_second -= 1;
        endcountdown(that, total_second);
    }, 1000);
}