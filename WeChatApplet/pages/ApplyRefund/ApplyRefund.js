// ApplyRefund.js
var config = require("../../utils/config.js")
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        OrderId: '',
        SkuId: '',
        getRequestUrl: app.getRequestUrl,
        Images:[],
        RefundType: 0,
        RefundTypeText: '请选择退款方式',
        RefundMoney: 0.00,
        RefundReason: 0,
        RefundReasonText: '请选择退款原因',
        Remark: '',
        BankName: '',
        BankAccountName: '',
        BankAccountNo: '',
        ShowReason: true,
        ShowType: true,
        ShowReasonList: ['拍错/多拍/不想要', '缺货', '未按约定时间发货'],
        ShowReasonIndex: -1,
        RefundTextList: ['原路返回', '', '退到预存款'],
        ShowRefundIndex: -1,
        ReasonDetail:'',
        ContactPerson:'',
        ContactCellPhone:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this,
            orderId = options.orderid,
            moneys = options.m;
        that.setData({
            OrderId: orderId
        });
        app.getOpenId(function (openId) {
            wx.request({
                url: app.getUrl(app.globalData.getAfterSalePreCheck),
                data: {
                    openId: openId,
                    IsReturn: false,
                    OrderId: orderId,
                    SkuId: "",
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
        } else if (res.success) {
            res = res.data;
            var tempRefundTextList = [];
            if (res.CanBackReturn) {
                tempRefundTextList.push("原路返回");
            }
            if (res.CanToBalance) {
                tempRefundTextList.push("退到预存款");
            }
            var reasonList = [];
            res.RefundReasons.forEach(function (item, idx) {
                if (idx < 6) {
                    reasonList.push(item.AfterSalesText);
                }
            });

            if (res.IsVirtual){
                var tempArr=[];
                res.OrderVerificationCode.forEach(function (item) {
                    tempArr.push({
                        value:item,
                        checked:true
                    })
                });
                res.OrderVerificationCode = tempArr;
            }

            //tempRefundTextList.push("退到银行卡");
            this.setData({
                RefundMoney: res.MaxRefundAmount,
                Total: res.MaxRefundAmount,
                RefundTextList: tempRefundTextList,
                ShowReasonList: reasonList,
                ContactPerson: res.ContactPerson,
                ContactCellPhone: res.ContactCellPhone,
                IsVirtual: res.IsVirtual,
                OrderVerificationCode: res.OrderVerificationCode,
                ValidityType: res.ValidityType,
                StartDate: res.StartDate,
                EndDate: res.EndDate,
                count:0,
                OrderItemId: res.OrderItemId
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
    changeSelect:function(e){
        var index=e.currentTarget.dataset.index,
            OrderVerificationCode = this.data.OrderVerificationCode,
            cur=OrderVerificationCode[index],
            Total = this.data.Total,
            count=0;

        cur.checked = !cur.checked;

        OrderVerificationCode.forEach(function(item){
            if (item.checked){
                count+=1;
            }
        });
        this.setData({
            OrderVerificationCode: OrderVerificationCode,
            RefundMoney: (Total * count / OrderVerificationCode.length).toFixed(2),
            count: count
        });
    },
    InputText: function (e) {
        var that = this,
            inputyname = e.currentTarget.dataset.names,
            val = e.detail.value;

        switch (inputyname) {
            case "BankName":
                that.setData({
                    BankName: val
                });
                break;
            case "BankAccountName":
                that.setData({
                    BankAccountName: val
                });
                break;
            case "BankAccountNo":
                that.setData({
                    BankAccountNo: val
                });
                break;
            default:
                that.setData({
                    Remark: val
                });
                break;
        };
    },
    ShowReason: function (e) {
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
    ShowType: function (e) {
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
            ShowReason: true
        });
    },
    ChooseType: function (e) {
        var typename = this.RefundTextList[e.currentTarget.dataset.id],
            refundtype = GetRefundTypeId(typename);
        this.setData({
            RefundType: refundtype,
            RefundTypeText: typename,
            ShowType: true,
            ShowReason: true
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
    formSubmit: function (e) {
        var that = this,
            reasonId = parseInt(that.data.ShowReasonIndex),
            formId = e.detail.formId,
            bankname = that.ToTrim(e.detail.value.txtBankName),
            bankaccountname = that.ToTrim(e.detail.value.txtBankAccountName),
            bankno = that.ToTrim(e.detail.value.txtBankAccountNo),
            reasonDetail = that.ToTrim(e.detail.value.txtReasonDetail),
            contactPerson = that.ToTrim(e.detail.value.txtContactPerson),
            contactCellPhone = that.ToTrim(e.detail.value.txtContactCellPhone),
            refundtype = that.data.RefundType,
            VerificationCodeIds = [],
            count=0;
        if (that.data.IsVirtual){
            
            that.data.OrderVerificationCode.forEach(function (item) {
                if (item.checked) {
                    VerificationCodeIds.push(item.value);
                    count+=1;
                }
            });
            if (!count) {
                app.showErrorModal('请至少选择一个核销码');
                return;
            }
        }

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
                RefundType: refundtype,
                RefundReason: that.data.ShowReasonList[reasonId],
                Remark: that.data.Remark,
                BankName: bankname,
                BankAccountName: bankaccountname,
                BankAccountNo: bankno,
                formId: formId,
                ContactPerson: contactPerson,
                ContactCellPhone: contactCellPhone,
                ReasonDetail: reasonDetail,
                VerificationCodeIds: VerificationCodeIds.join(','),
                UserCredentials:that.data.Images.join(','),
                OrderItemId: that.data.OrderItemId,
                Amount: that.data.RefundMoney
            }
            config.httpPost(app.getUrl(app.globalData.applyRefund), para, function (result) {
                if (result.success) {
                    app.showErrorModal(result.msg, function (res1) {
                        wx.redirectTo({
                            url: '../applylist/applylist',
                        });
                    });
                } else {
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
            });
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