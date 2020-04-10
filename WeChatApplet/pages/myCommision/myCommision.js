var config = require("../../utils/config.js");
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    myBrokerage: {},
    records: [],
    openid: '',
    pageNo: 1,
    total: 20,
    showEmpty: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    app.getOpenId(function (openid) {
      that.data.openid = openid;
      config.httpGet(app.getUrl(app.globalData.getMyBrokerage),
        { openId: openid },
        function (res) {
          if (res.success) {
            that.setData({ myBrokerage: res.data });
            wx.setNavigationBarTitle({
              title: res.data.DistributorRenameMyBrokerage
            })
          }else{
            app.showErrorModal(res.msg);
          }
        });
      that.loadCommisionRecords();
    }, "myCommision")
  },

  loadCommisionRecords: function () {
    var that = this;
    wx.showLoading({
      title: '',
      mask:true
    });
    config.httpGet(app.getUrl(app.globalData.getRecords),
      {
        openId: that.data.openid,
        pageSize: 20,
        pageNo: that.data.pageNo
      },
      function (res) {
        wx.hideLoading();
        if (res.success) {
          var records = that.data.records.concat(res.data.rows);
          that.setData({
            records: records,
            showEmpty: records.length == 0,
            total: res.data.total,
          });
        }
      });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.records.length == this.data.total){
      return;
    }

    this.data.pageNo++;
    this.loadCommisionRecords();
  },

  bindWithdrawCash: function () {
    wx.navigateTo({
      url: '../applyWithdrawCash/applyWithdrawCash',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})