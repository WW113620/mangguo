var config = require("../../utils/config.js");
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        logoPath: '',
        shopName: '',
        openid: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;
        this.setData({
            logoPath: options.imgUrl,
            shopName: options.shopName,
            isShowLogo: (options.isShowLogo === "true")
        });
        app.getOpenId(function(openid) {
            that.setData({
                openid: openid
            });
        })
    },

    bindChooseLogo: function() {
        var that = this;
        wx.showActionSheet({
            itemList: ['拍照上传', '本地上传'],
            success: function(res) {
                that.chooseLogoImage(res.tapIndex, function(imgUrl) {
                    that.setData({
                        logoPath: imgUrl
                    });
                });
            }
        })
    },
    /*
    选择小店图片，sourceType图片源，０从相机选择，１从相册选择。
    */
    chooseLogoImage: function(sourceType, callback) {
        var type = sourceType == 0 ? 'camera' : 'album';
        var that = this;
        wx.chooseImage({
            success: function(res) {
                var tempFilePaths = res.tempFilePaths;
                wx.uploadFile({
                    url: app.getUrl(app.globalData.uploadImage), //仅为示例，非真实的接口地址
                    filePath: tempFilePaths[0],
                    name: 'file',
                    formData: {
                        openId: that.data.openid
                    },
                    success: function(res) {
                        var res = JSON.parse(res.data);
                        if (res.success) {
                            var imgUrl = res.data.Data[0].ImageUrl;
                            imgUrl = (imgUrl.indexOf('http:') != -1) ? imgUrl : (app.getRequestUrl + imgUrl);
                            if (callback instanceof Function) {
                                callback(imgUrl);
                            }
                        }
                    }
                })
            },
            sourceType: [type],
            count: 1
        })
    },
    bindSaveInformation: function(e) {
        var that = this;
        config.httpPost(app.getUrl(app.globalData.postSaveShopConfig), {
                openId: that.data.openid,
                logoUrl: that.data.logoPath,
                shopName: e.detail.value.shopName,
                isShowLogo: that.data.isShowLogo
            },
            function(res) {
                var msg = res.msg;
                if (res.success) {
                    msg = '保存成功';
                    setTimeout(function () {
                        wx.navigateBack({
                            delta: 1,
                        });
                    }, 1500);
                }
                wx.showToast({
                    title: msg,
                    icon: 'none',
                    mask: true,
                });
                
            });
    },

    bindSwitchChange: function(e) {
        var checked = e.detail.value;
        var that = this;
        if (!checked) {
            wx.showModal({
                title: '提示',
                content: '选择不展示首页logo，其他会员进入您分享的连接后，商城首页顶部不在展示个性化小店logo,确认要继续吗？',
                showCancel: true,
                cancelText: '取消',
                cancelColor: '#212121',
                confirmText: '确定',
                confirmColor: '#fb1438',
                success: function(res) {
                    that.setData({
                        isShowLogo: !res.confirm
                    });
                },
                fail: function(res) {},
                complete: function(res) {},
            })
        } else {
            that.setData({
                isShowLogo: true
            });
        }
    }
})