var config = require("../../utils/config.js");
var app = getApp();
var wxParse = require("../wxParse/wxParse.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    distributorPageContent: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    app.getOpenId(function (openid) {
      that.setData({ openid: openid });
      config.httpGet(app.getUrl(app.globalData.getOpenMyShopInfo),
        { openId: openid },
        function (res) {
          if (res.success){
            wx.setNavigationBarTitle({
              title: res.data.DistributorRenameOpenMyShop
            });

            if (res.data.DistributorPageContent){
                wxParse.wxParse('distributorPageContent', 'html', res.data.DistributorPageContent, that);
            }
          }
        });
    }, 'applyDistributor');
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

  },
  bindApplyForDistributor: function () {
    var that = this;
    config.httpGet(app.getUrl(app.globalData.getCanApplyMyShop),
      { openId: that.data.openid },
      function (res) {
        // res = { "success": false, "msg": "您己经被清退，不可以申请！" };
        if (res.success) {
          wx.navigateTo({
            url: '../applyForDistributor/applyForDistributor',
          });
        } else {
          wx.showModal({
            title: '申请失败',
            content: res.msg,
            showCancel: true,
            cancelText: '取消',
            cancelColor: '',
            confirmText: '确认',
            confirmColor: '#fb1438',
            success: function (res) {
              if (res.cancel) {
                wx.navigateBack({
                  delta: 1,
                });
              }
            },
            fail: function (res) { },
            complete: function (res) { },
          })
        }
      });

  }
})