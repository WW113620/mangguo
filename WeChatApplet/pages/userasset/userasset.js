// pages/userasset/userasset.js
var config = require("../../utils/config.js");
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        rechargeHide: true,
        cashHide: true,
        pageno: 0,
        isEnd: false,
        showCashChange: false,
        list: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const that = this;
        app.getOpenId(function (openid) {
            that.setData({
                openId: openid
            });
            config.httpGet(app.getUrl('MemberCapital/GetCapital'), {
                openId: that.data.openId
            }, that.getCapital);
        });

        wx.showNavigationBarLoading();
    },

    getCapital: function (res) {
        if (!res.success) {
            if (res.code == 502) {
                wx.showToast({
                    title: '请先登录账号'
                });
                wx.navigateTo({
                    url: '../login/login'
                });
            } else {
                app.showErrorModal(res.msg);
            }
        } else {
            this.setData({
                total: res.data,
                isOpen: res.data.isOpen,
                rule: JSON.stringify(res.data.rule)
            });
            this.loadData();
        }
        wx.hideNavigationBarLoading();
    },
    loadData: function () {
        if (this.data.isEnd) {
            return;
        }
        wx.showLoading({
            title: '加载中',
        });

        var that = this;
        this.data.pageno++;
        this.setData({
            pageno: this.data.pageno
        });
        config.httpGet(app.getUrl('MemberCapital/GetList'), {
            openId: this.data.openId,
            pagesize: 15,
            pageno: this.data.pageno
        }, function (res) {
            that.data.list.push.apply(that.data.list, res.data.rows);
            that.setData({
                list: that.data.list,
                isEnd: res.data.rows.length < 15 ? true : false
            });
            wx.hideLoading();
        });
    },

    confirmCash: function () {
        var that = this;
        if (!this.data.outAmount || (this.data.outAmount < this.data.total.WithDrawMinimum) || (this.data.outAmount > this.data.total.WithDrawMaximum)) {
            app.showErrorModal("提现金额必须在可提现区间内");
            return;
        }
        if (!this.data.pwd) {
            app.showErrorModal("请输入交易密码");
            return;
        }
        config.httpPost(app.getUrl('MemberCapital/PostApplyWithDraw'), {
            openId: that.data.openId,
            applyType: 1,
            amount: that.data.outAmount,
            pwd: that.data.pwd
        }, function (res) {
            if (res.success) {
                that.setData({
                    cashHide: true
                });
                wx.showToast({
                    title: '提现申请成功'
                });
            } else {
                app.showErrorModal(res.msg);
            }

        });
    },
    confirmCharge: function () {
        var that = this;
        if (!this.data.inAmount) {
            app.showErrorModal("充值金额必须大于零");
            return;
        }
        config.httpPost(app.getUrl('MemberCapital/PostCharge'), {
            openId: that.data.openId,
            typeId: 'Himall.Plugin.Payment.WeiXinPay_SmallProg',
            amount: that.data.inAmount
        }, function (res) {
            if (res.success) {
                var r = res.data;
                wx.requestPayment({
                    timeStamp: r.timeStamp,
                    nonceStr: r.nonceStr,
                    package: 'prepay_id=' + r.prepayId,
                    signType: 'MD5',
                    paySign: r.sign,
                    success: function (res) {

                        that.setData({
                            rechargeHide: true
                        });
                        wx.showToast({
                            title: '充值成功'
                        });
                    },
                    fail: function (res) {

                    }
                });

            } else {
                app.showErrorModal(res.msg);
            }
        });
    },
    showCashChange: function (e) {
        this.setData({
            cashHide: e.currentTarget.dataset.type ? false : true
        });
    },
    showrechargeChange: function (e) {
        if (this.data.isOpen){
            wx.navigateTo({
                url: '../userrecharge/userrecharge?rule=' + this.data.rule
            });
        }else{
            this.setData({
                rechargeHide: e.currentTarget.dataset.type ? false : true
            });
        }
    },
    onInputOutAmount: function (e) {
        this.setData({
            outAmount: e.detail.value
        });
    },
    onInputPwd: function (e) {
        this.setData({
            pwd: e.detail.value
        });
    },
    onInputInAmount: function (e) {
        this.setData({
            inAmount: e.detail.value
        });
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
        this.loadData();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})