var config = require("../../utils/config.js");
var app = getApp();
var openId;

Page({
  data: {
    ExpressCompanyName: '',
    ShipOrderNumber: '',
    ShipTo: '',
    CellPhone: '',
    Address: '',
    LogisticsData: null,
    frompage: ''
  },

  onLoad: function (options) {
    var that = this,
      orderid = options.orderid;
    this.data.frompage = options.frompage;
    app.getOpenId(function (openid) {
      openId = openid;
      that.getOrderExpressInfo(orderid);
    });

  },

  getOrderExpressInfo: function (orderid) {
    var that = this;
    var urlpath = this.data.frompage == 'gift' ? app.globalData.getGiftsExpressInfo : "UserOrder/GetExpressInfo";
    config.httpGet(app.getUrl(urlpath), {
      openId: openId,
      orderId: orderid
    }, function (result) {
      if (result.success) {
        var r = result.data;
        that.parseData(r);
      }
      else if (result.code == '502') {
        wx.navigateTo({
          url: '../login/login'
        })
      }
      else {
        wx.showModal({
          title: '提示',
          content: result.msg || '无法获取物流信息，请稍后重试',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.navigateBack({ delta: 1 })
            }
          }
        })
      }
    });
  },

  parseData: function (res) {
    var newList = res.LogisticsData;
    this.setData({
      ExpressCompanyName: res.ExpressCompanyName,
      ShipOrderNumber: res.ShipOrderNumber,
      ShipTo: res.ShipTo,
      CellPhone: res.CellPhone,
      Address: res.Address,
      LogisticsData: newList.traces
    });
  },
})