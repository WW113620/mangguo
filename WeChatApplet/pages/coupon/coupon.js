// pages/coupon/coupon.js
var config = require("../../utils/config.js");
var app = getApp();

Page({
    data: {
        couponType: 0,
        couponList:[],
        counpimg: [app.getRequestUrl + '/storage/applet/images/counp-background.jpg', app.getRequestUrl + '/storage/applet/images/use_counp.png', app.getRequestUrl + '/storage/applet/images/over_counp.png'],
        couponStyle: ['coupon', 'coupon-use','coupon-over'],
        showEmpty:false
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        wx.showLoading({
            title: '加载中',
        });
        var that = this;
        app.getOpenId(function (openId) {
            var parameters = {
                openId: openId
            }
            wx.showNavigationBarLoading();
            config.httpGet(app.getUrl(app.globalData.loadCoupon), parameters, that.getCouponsData);
        })
    },
    showEmpty:function(){
        var isEmpty = this.data.couponList[this.data.couponType].length == 0;
        this.setData({showEmpty:isEmpty});
    },
    getCouponsData: function (res) {
        wx.hideLoading();
        var that = this;
        if (res.code == '502') {
            wx.navigateTo({
                url: '../login/login'
            })
        } else if (res.success) {
            var noUseCouponList = [],
                usedCouponList = [],
                expiredCouponList = [],
                nowTime = new Date(),
                endTime;
            if (res.data.Coupon.length > 0) {
                for (var i = 0; i < res.data.Coupon.length; i++) {
                    var coupons = res.data.Coupon[i];
                    endTime = coupons.EndTime;
                    var canUseProducts = "";
                    if (coupons.UseArea == 1) {
                        canUseProducts = "部分商品可用"
                    } else {
                        canUseProducts = "全店通用"
                    }
                    var limitText = "";
                    if (coupons.OrderAmount > 0) {
                        limitText = "订单满" + coupons.OrderAmount.toFixed(2) + "元可用";
                    }
                    else {
                        limitText = "订单金额无限制";
                    }
                    var coupon = {
                        couponsDate: "使用期限至" + (coupons.EndTime).split(' ')[0].replace(/\//g, '-'),
                        couponsPrice: coupons.Price,
                        couponsCanUseProductse: canUseProducts,
                        LimitText: limitText,
                        Remark: coupons.Remark == null ? "" : coupons.Remark
                    }
                    if (coupons.UseStatus == 1) {
                        usedCouponList.push(coupon);
                    }
                    else if (nowTime > Date.parse(endTime)) {
                        expiredCouponList.push(coupon);
                    }
                    else {
                        noUseCouponList.push(coupon);
                    }
                }
            }
            if (res.data.Bonus.length > 0) {
                for (var i = 0; i < res.data.Bonus.length; i++) {
                    var item = res.data.Bonus[i];
                    var limitText = "";
                    if (item.ShowOrderAmount > 0) {
                        limitText = "订单满" + item.ShowOrderAmount.toFixed(2) + "元可用";
                    }
                    else {
                        limitText = "订单金额无限制";
                    }
                    var coupon = {
                        couponsDate: "使用期限至" + (item.BonusDateEnd).split(' ')[0].replace(/\//g, '-'),
                        couponsPrice: item.Price,
                        couponsCanUseProductse: "全店通用",
                        LimitText: limitText,
                        Remark: ""
                    }
                    if (item.State == 2) {
                        usedCouponList.push(coupon);
                    }
                    else if (item.State == 3) {
                        expiredCouponList.push(coupon);
                    }
                    else {
                        noUseCouponList.push(coupon);
                    }
                }
            }
            that.setData({
                couponList: [noUseCouponList, usedCouponList, expiredCouponList]
            });
            that.showEmpty();
            wx.hideNavigationBarLoading();
        } else {
            wx.hideNavigationBarLoading();
        }
    },
    couponTypeChange: function (e) {
        this.setData({
            couponType: e.currentTarget.dataset.type
        })
        this.showEmpty();
    }
})