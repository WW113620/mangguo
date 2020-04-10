var config = require("../../utils/config.js");
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    logoPath: '',
    openid: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var userInfo = wx.getStorageSync('userInfo');
    var logoPath = (userInfo.Photo && userInfo.Photo.length > 0) ? userInfo.Photo : '../../images/user.png';
    app.getOpenId(function (openid) {
      that.setData({ 
          openid: openid ,
          logoPath: logoPath
      });
    })
  },

  bindChooseLogo: function () {
    var that = this;
    wx.showActionSheet({
      itemList: ['拍照上传', '本地上传'],
      success: function (res) {
        that.chooseLogoImage(res.tapIndex, function (imgUrl) {
          that.setData({ logoPath: imgUrl });
        });
      }
    })
  },
  /*
  选择小店图片，sourceType图片源，０从相机选择，１从相册选择。
  */
  chooseLogoImage: function (sourceType, callback) {
    var type = sourceType == 0 ? 'camera' : 'album';
    var that = this;
    wx.chooseImage({
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        wx.uploadFile({
          url: app.getUrl(app.globalData.uploadImage), //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            openId: that.data.openid
          },
          success: function (res) {
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
  bindCommitApply: function (e) {
    var that = this;
    var params = {
        openId: that.data.openid,
        logoUrl: that.data.logoPath,
        shopName: e.detail.value.shopName
    };
    config.httpPost(app.getUrl(app.globalData.postApplyDistributor),params,
      function (res) {
        if (res.success) {
          wx.navigateTo({
            url: '../waitingForReview/waitingForReview?status=1',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          });
        } else {
          wx.showToast({
            title: res.msg,
            icon:'none',
            duration: 2000,
            mask: true,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          })
        }
      });

  }

})