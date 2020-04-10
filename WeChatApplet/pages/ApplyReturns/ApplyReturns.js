// ApplyRetuns.js
var config = require("../../utils/config.js");
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        OrderId: '',
        SkuId: '',
        Name: '',
        AfterSaleType: 0,
        AfterSaleTypeText: '请选择售后类型',
        RefundType: 0,
        RefundTypeText: '请选择退款方式',
        RefundReasonText: '请选择退货原因',
        getRequestUrl: app.getRequestUrl,
        BankName: '',
        BankAccountName: '',
        BankAccountNo: '',
        Images: [],
        ReturnNum: 1,
        MostMoney: 0.00,
        ShowReason: true,
        ShowType: true,
        ShowAfterType: true,
        ApplyReturnNum: 1,
        TotalMoney: 0.00,
        UploadGredentials: [],
        FormId: '',
        ReturnMoney: 0.00,
        ImageIndex: 0,
        ShowReasonList: ['拍错/多拍/不想要', '缺货', '未按约定时间发货'],
        ShowReasonIndex: -1,
        RefundTextList: ['退到预存款', '原路返回', '到店退款'],
        ShowRefundIndex: -1,
        AfterSaleTypeList: ['仅退款', '退款退货'],
        AfterSaleTypeId: -1,
        OneReundAmount: 0,
        returnId: null,
        ReasonDetail: '',
        ContactPerson: '',
        ContactCellPhone: '',
        ReturnGoodsAddressSource: '',
        ReturnGoodsAddress: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this,
            orderId = options.orderid,
            skuId = options.skuId,
            proname = options.pro,
            num = options.num,
            moneys = options.m,
            returnId = options.returnId;
        that.setData({
            OrderId: orderId,
            SkuId: skuId,
            Name: proname,
            ReturnNum: num,
            MostMoney: moneys,
            TotalMoney: moneys,
            returnId: returnId
        });
        app.getOpenId(function (openId) {
            wx.request({
                url: app.getUrl(app.globalData.getAfterSalePreCheck),
                data: {
                    openId: openId,
                    IsReturn: true,
                    OrderId: orderId,
                    SkuId: skuId,
                },
                success: function (result) {
                    that.GetCheckData(result);
                }
            })
        })
    },
    GetCheckData: function (result) {
        var res = result.data,
            that = this;
        if (res.code == '502') {
            wx.navigateTo({
                url: '../login/login'
            })
        }
        if (res.success) {
            var resdata = res.data,
                tempRefundTextList = [];
            if (resdata.CanBackReturn) {
                tempRefundTextList.push("原路返回");
            }
            if (resdata.CanToBalance) {
                tempRefundTextList.push("退到预存款");
            }
            if (resdata.CanReturnOnStore) {
                tempRefundTextList.push("到店退款");
            }

            var reasonList = [];
            resdata.RefundReasons.forEach(function (item, idx) {
                if (idx > 5) {
                    return;
                }
                reasonList.push(item.AfterSalesText);
            });

            this.setData({
                MostMoney: resdata.MaxRefundAmount,
                RefundTextList: tempRefundTextList,
                TotalMoney: resdata.MaxRefundAmount,
                ReturnNum: resdata.MaxRefundQuantity,
                ApplyReturnNum: resdata.MaxRefundQuantity,
                OneReundAmount: resdata.oneReundAmount,
                ShowReasonList: reasonList,
                ContactPerson: resdata.ContactPerson,
                ContactCellPhone: resdata.ContactCellPhone,
                ReturnGoodsAddressSource: resdata.ReturnGoodsAddress
            });
        }
        else {
            app.showErrorModal(res.msg, function (res1) {
                if (res1.confirm) {
                    wx.navigateBack({ delta: 1 })
                }
            });
        }
    },
    ShowAfterType: function (e) {
        var that = this;
        wx.showActionSheet({
            itemList: that.data.AfterSaleTypeList,
            success: function (res) {
                if (!res.cancel) {
                    that.setData({
                        AfterSaleTypeId: res.tapIndex
                  });

                  if (res.tapIndex == 1) {
                    that.setData({
                      ReturnGoodsAddress: that.data.ReturnGoodsAddressSource
                    });
                  } else {
                    that.setData({
                      ReturnGoodsAddress: ''
                    });
                  }
                }
            },
            fail: function (res) {
            }
        })
    },
    ShowResaon: function (e) {
        var that = this;
        wx.showActionSheet({
            itemList: that.data.ShowReasonList,
            success: function (res) {
                that.setData({
                    ShowReasonIndex: res.tapIndex
                });
            },
            fail: function (res) {
            }
        })
    },
    ShowRefundType: function (e) {
        var that = this;
        wx.showActionSheet({
            itemList: that.data.RefundTextList,
            success: function (res) {
                if (!res.cancel) {
                    var text = that.data.RefundTextList[res.tapIndex];
                    var refundtype = that.GetRefundTypeId(text);
                    that.setData({
                        ShowRefundIndex: res.tapIndex,
                        RefundTypeText: text,
                        RefundType: refundtype,
                    });
                }
            },
            fail: function (res) {
            }
        })
    },
    ChooseReason: function (e) {
        var reasonname = e.currentTarget.dataset.name;
        this.setData({
            RefundReasonText: reasonname,
            ShowType: true,
            ShowReason: true,
            ShowAfterType: true
        });
    },
    GetRefundTypeId: function (typeName) {
        if (typeName == "退到预存款") {
            return 3;
        } else if (typeName == "退到银行卡") {
            return 2;
        } else if (typeName == "原路返回") {
            return 1;
        } else {
            return 4;
        }
    },
    GetAfterSaleTypeId: function (typeName) {
        if (typeName == "退货退款") {
            return 3;
        } else if (typeName == "仅退款") {
            return 2;
        } else {
            return 1;
        }
    },
    ChooseAfterType: function (e) {
        var refundtype = e.currentTarget.dataset.id,
            typename = this.ShowAfterTypeName[refundtype];
        this.setData({
            AfterSaleType: refundtype,
            AfterSaleTypeText: typename,
            ShowType: true,
            ShowReason: true,
            ShowAfterType: true
        });

    },

    changeNum: function (e) {
        var ApplyReturnNum = this.data.ApplyReturnNum,
            maxNum = parseInt(this.data.ReturnNum),
            num=parseInt(e.currentTarget.dataset.num);
        if (ApplyReturnNum <= 1 && num<0) {
            app.showErrorModal('最少退1件商品');
            return;
        }
        if (ApplyReturnNum >= maxNum && num > 0) {
            app.showErrorModal('最多退' + maxNum + '件商品');
            return;
        }
        ApplyReturnNum = ApplyReturnNum + num;
        var totalmoney = ApplyReturnNum * (this.data.OneReundAmount*100)/100;
        this.setData({
            ApplyReturnNum: ApplyReturnNum,
            TotalMoney: totalmoney.toFixed(2)
        });
    },
    formSubmit: function (e) {
        var that = this,
            reasonId = parseInt(that.data.ShowReasonIndex),
            aftertypeId = that.data.AfterSaleTypeId,
            formId = e.detail.formId,
            bankname = that.ToTrim(e.detail.value.txtBankName),
            bankaccountname = that.ToTrim(e.detail.value.txtBankAccountName),
            bankno = that.ToTrim(e.detail.value.txtBankAccountNo),
            returnmoney = parseFloat(e.detail.value.txtmoney.replace("￥", "")),
            returnnum = aftertypeId == 2 ? 0 : parseInt(that.data.ApplyReturnNum),
            reasonDetail = that.ToTrim(e.detail.value.txtReasonDetail),
            contactPerson = that.ToTrim(e.detail.value.txtContactPerson),
            contactCellPhone = that.ToTrim(e.detail.value.txtContactCellPhone);

        if ((aftertypeId == 1 && returnnum <= 0) || returnnum > that.data.ReturnNum) {
            app.showErrorModal("请输入正确的退货数量");
            return;
        }
        if (aftertypeId == 1 && returnmoney > parseFloat(that.data.TotalMoney)) {
            app.showErrorModal("请输入正确的退款金额,金额必须小于等于" + that.data.TotalMoney + "元");
            return;
        }

        var refundtype = that.data.RefundType;//获取退款方式
        if (refundtype == 2) {
            if (bankname.length <= 0 || bankaccountname.length <= 0 || bankno.length <= 0) {
                app.showErrorModal("银行卡信息不允许为空！");
                return;
            }
        }
        if (refundtype <= 0) {
            app.showErrorModal("请选择要退款的方式");
            return;
        }

        if (reasonId < 0) {
            app.showErrorModal("请选择要退款的原因");
            return;
        }

        if (aftertypeId < 0) {
            app.showErrorModal("请选择售后类型");
            return;
        }
        if (that.data.OrderId.length <= 0) {
            app.showErrorModal("请选择要退款的订单");
            return;
        }
        if (contactPerson.length <= 0) {
            app.showErrorModal("请输入联系人");
            return;
        }
        if (contactCellPhone.length <= 0) {
            app.showErrorModal("请输入联系方式");
            return;
        }
        var myreg = /^1\d{10}$/;
        if (contactCellPhone.length > 0 && !myreg.test(contactCellPhone)) {
            app.showErrorModal("请输入有效的手机号码");
            return;
        }

        app.getOpenId(function (openid) {
            var para = {
                openId: openid,
                skuId: that.data.SkuId,
                orderId: that.data.OrderId,
                afterSaleType: that.GetAfterSaleTypeId(that.data.AfterSaleTypeList[that.data.AfterSaleTypeId]),
                RefundType: that.data.RefundType,
                RefundReason: that.data.ShowReasonList[that.data.ShowReasonIndex],
                formId: formId,
                BankName: bankname,
                BankAccountName: bankaccountname,
                BankAccountNo: bankno,
                RefundAmount: returnmoney,
                ContactPerson: contactPerson,
                ContactCellPhone: contactCellPhone,
                ReasonDetail: reasonDetail,
                UserCredentials: that.data.Images.join(','),
                refundId: that.data.returnId
            };
            if (that.data.AfterSaleTypeId == 1) {
                para.Quantity = returnnum;
            }
            config.httpPost(app.getUrl("OrderRefund/PostApplyReturn"), para, function (result) {
                if (result.success) {
                    wx.showModal({
                        title: '提示',
                        confirmColor: '#fb1438',
                        content: result.msg,
                        showCancel: false,
                        success: function (res) {
                            wx.redirectTo({
                                url: '../applylist/applylist',
                            });
                        }
                    });
                } else {
                    if (result.msg == 'NOUser') {
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
            });
        });
        
    },
    uploadImg: function (e) {
        var that = this,
            index = e.currentTarget.dataset.index,
            Images = that.data.Images;
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

                            if (index != undefined) {
                                Images[parseInt(index)] = imgUrl;
                            } else {
                                Images.push(imgUrl);
                            }
                            that.setData({
                                Images: Images
                            });
                        }
                    }
                });
            }
        })
    },
    delImg: function (e) {
        var that = this,
            index = e.currentTarget.dataset.index,
            Images = that.data.Images;

        Images.splice(index, 1);
        that.setData({
            Images: Images
        });
    },
    ToTrim: function (str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})