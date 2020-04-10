var config = require("../../utils/config.js");
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        withdrawMethod: '',
        withdrawInfo: {},
        navIndex: 0,
        openid: '',
        amount: '',
        pageNo: 1,
        showEmpty: false,
        records: [],
        focus: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onShow: function (options) {
        var that = this;
        app.getOpenId(function (openid) {
            that.setData({ openid: openid });
            config.httpGet(app.getUrl(app.globalData.getApplyWithdraw),
                { openId: openid },
                function (res) {
                    if (res.success) {
                        that.setData({ withdrawInfo: res.data });
                    }
                });
            that.loadWithdrawRecords();
        }, 'applyWithdrawCash');
    },
    loadWithdrawRecords: function () {
        var that = this;
        wx.showLoading({
            title: '',
            mask: true
        });
        config.httpGet(app.getUrl(app.globalData.getWithdraws),
            {
                openId: that.data.openid,
                pageSize: 20,
                pageNo: that.data.pageNo
            }, function (res) {
                wx.hideLoading();
                if (res.success) {
                    var temp = that.data.records.concat(res.data.rows);
                    that.setData({
                        records: res.data.rows,
                        total: res.data.total,
                        showEmpty: res.data.total == 0,
                        pageNO: that.data.pageNo
                    });
                }
            })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.navIndex != 0 && this.data.records.length != this.data.total) {
            this.data.pageNo++;
            this.loadWithdrawRecords();
        }
    },

    refreshWithdrawRecords: function () {
        this.data.pageNo = 1;
        this.data.total = 20;
        this.data.records = [];
        this.loadWithdrawRecords();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    bindNavitemChanged: function (e) {
        var index = e.currentTarget.dataset.index;
        this.changedNavitem(index);
    },
    changedNavitem: function (index) {
        this.setData({ 'navIndex': index });
    },
    bindChangePassword: function (e) {
        if (!this.data.withdrawInfo.IsSetPassword) {
            this.showPop(true);
        } else {
            var userInfo = wx.getStorageSync("userInfo");
            wx.navigateTo({
                url: '../bindMobilePhone/bindMobilePhone',
            });
        }
    },
    bindChooseWithdrawMethod: function () {
        var itemList = [];
        var that = this;
        var withdrawInfo = this.data.withdrawInfo;
        if (withdrawInfo.EnableCapital) {
            itemList.push('预存款');
        }
        if (withdrawInfo.EnableAlipay) {
            itemList.push('支付宝');
        }
        if (withdrawInfo.EnableWeChat) {
            itemList.push('微信');
        }
        wx.showActionSheet({
            itemList: itemList,
            itemColor: '#212121',
            success: function (res) {
                that.setData({ withdrawMethod: itemList[res.tapIndex] });
            }
        })
    },
    showPop: function (show) {
        this.setData({ showPop: show });
    },
    bindPasswordSubmitSuccess:function(e){
        this.data.withdrawInfo.IsSetPassword = true;
        this.setData({
            withdrawInfo: this.data.withdrawInfo
        })
    },
    bindPasswordFocus: function (e) {
        if (!this.data.withdrawInfo.IsSetPassword) {
            this.showPop(true);
            this.setData({ focus: true });
        }
    },
    bindSubmitApplyWithdraw: function (e) {
        var that = this;
        var MemberId = wx.getStorageSync('myStoreInfo').MemberId;
        var value = e.detail.value;
        var Amount = value.Amount;
        var Type = value.Type == '预存款' ? '1' : (value.Type == '微信' ? '2' : (value.Type == '支付宝' ? '3' : ''));
        var Password = value.Password;
        var WithdrawAccount = value.WithdrawAccount;
        var WithdrawName = value.WithdrawName;
        var msg = '';
        if (Amount.length == 0) {
            msg = '请输入提现金额';
        }
        else if (Type.length == 0) {
            msg = '请选择支付方式';
        }
        else if (Password.length == 0) {
            msg = '请输入交易密码';
        }
        else if (Type == '3' && WithdrawAccount.length == 0) {
            msg = '请输入支付宝账号';
        }
        else if (Type == '3' && WithdrawName.length == 0) {
            msg = '请输入您的真实姓名';
        }
        if (msg.length > 0) {
            wx.showToast({
                title: msg,
                icon: 'none',
                mask: true,
            })
            return;
        }

        config.httpPost(app.getUrl(app.globalData.postWithdraw),
            {
                openId: this.data.openid,
                MemberId: MemberId,
                Amount: Amount,
                Type: Type,
                Password: Password,
                WithdrawAccount: WithdrawAccount,
                WithdrawName: WithdrawName
            }, function (res) {
                if (res.success) {
                    wx.showToast({
                        title: '提交完成',
                        mask: true,
                    });
                    setTimeout(function () {
                        that.refreshWithdrawRecords();
                        that.changedNavitem(1);
                    }, 1500);

                } else {
                    wx.showToast({
                        title: res.msg,
                        icon: 'none',
                        mask: true,
                    })
                }
            })
    },
    bindSetAmout: function () {
        this.setData({ amount: this.data.withdrawInfo.Balance });
    }
})