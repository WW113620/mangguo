// pages/appendComment/appendComment.js
var app = getApp();
var config = require("../../utils/config.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        OrderId: '',
        ProductList: [],
        TxtareaName: [],
        isSubmit: false,
        getRequestUrl: app.getRequestUrl
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        const that = this;
        // 页面初始化 options为页面跳转所带来的参数
        const orderId = options.id;
        app.getOpenId(function (openId) {
            var parameters = {
                openId: openId,
                orderId: orderId
            }
            config.httpGet(app.getUrl(app.globalData.getAppendComment), parameters, that.getProductData);
        })

        that.setData({
            OrderId: orderId
        });
    },
    getProductData: function (res) {
        var that = this;
        if (res.success) {
            var tempscoregrade = [];
            var temusercredentials = [];
            var tempareaname = [];
            res.data.forEach(function (val, index, array) {
                var scoregrade = {
                    Id: val.CommentId,
                    AppendContent: '',
                    Images: [],
                    WXmediaId: []
                }
                
                tempscoregrade.push(scoregrade);
                tempareaname.push('txt_' + val.CommentId);
            });
            that.setData({
                ProductList: res.data,
                ScoreGrade: tempscoregrade,
                TxtareaName: tempareaname
            });
        }
        else {
            app.showErrorModal(res.msg, function (r) {
                if (r.confirm) {
                    wx.navigateBack({ delta: 1 })
                }
            });
        }
    },
    ScoreGrade: function (e) {
        var grade = e.currentTarget.dataset.grade;
        var idx = e.currentTarget.dataset.index;
        var tempscoregrade = this.data.ScoreGrade;
        tempscoregrade[idx].grade = parseInt(grade);

        this.setData({
            ScoreGrade: tempscoregrade
        });
    },
    uploadImg: function (e) {
        var that = this,
            index = e.currentTarget.dataset.index,
            ScoreGrade = that.data.ScoreGrade,
            curItem = ScoreGrade[index],
            imgindex = e.currentTarget.dataset.imgindex;
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

                            if (imgindex != undefined) {
                                curItem.Images[parseInt(imgindex)] = imgUrl;
                            } else {
                                curItem.Images.push(imgUrl);
                            }
                            that.setData({
                                ScoreGrade: ScoreGrade
                            });
                        }
                    }
                });
            }
        })
    },
    delImg: function (e) {
        var index = e.currentTarget.dataset.index,
            imgindex = e.currentTarget.dataset.imgindex;

        this.data.ScoreGrade[index].Images.splice(imgindex, 1);
        this.setData({
            ScoreGrade: this.data.ScoreGrade
        });
    },
    formSubmit: function (e) {
        var that = this;
        if (that.data.isSubmit) {
            return false;
        }
        var formId = e.detail.formId;
        var scorestr = that.data.ScoreGrade;//获取等级评分
        var areanamestr = that.data.TxtareaName;//获取控件id

        if (areanamestr.length <= 0) {
            app.showErrorModal('文本框不存在');
            return false;
        }
        var isnull = false;
        areanamestr.forEach(function (val, index, array) {
            if (that.ToTrim(e.detail.value[val]).length <= 0) {
                isnull = true;
                return;
            }
            scorestr[index].AppendContent = that.ToTrim(e.detail.value[val]);
        });
        if (isnull) {
            app.showErrorModal('请输入评价内容');
            return false;
        }

        that.setData({
            isSubmit: true
        });

        app.getOpenId(function (openid) {
            config.httpPost(app.getUrl(app.globalData.submitAppendComment), {
                openId: openid,
                productCommentsJSON: JSON.stringify(scorestr)
            }, function (result) {
                if (result.success) {
                    app.showErrorModal("评论已提交", function (res) {
                        if (res.confirm) {
                            wx.redirectTo({
                                url: '../orderlist/orderlist'
                            });
                        }
                    });
                } else {
                    app.showErrorModal("评论提交失败", function (res) {
                        if (res.confirm) {
                            wx.navigateBack({ delta: 1 })
                        }
                    });
                }
            });
        });
        
    },
    ToTrim: function (str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }
})