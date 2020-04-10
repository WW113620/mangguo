var config = require("../../utils/config.js");
var app = getApp();
var openId;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    count: 1,
    orderData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({
      id: options.id,
      count: options.count
    });
    app.getOpenId(function (openid) {
      openId = openid;
      that.getConfirmOrder();
    });
  },

  getConfirmOrder: function (regionId) {
    var that = this;
    var params = {
      openId: openId,
      id: this.data.id,
      count: this.data.count
    }
    if (regionId) {
      params.regionId = regionId;
    }
    config.httpGet(app.getUrl(app.globalData.getGiftsConfirmOrder), params, function (res) {
      if (res.success) {
        var shipAddress = res.data.ShipAddress;
        var ShippingAddressInfo;
        if(shipAddress){
            ShippingAddressInfo = {
                ShippingId: shipAddress.Id,
                ShipTo: shipAddress.ShipTo,
                CellPhone: shipAddress.Phone,
                FullAddress: shipAddress.RegionFullName + ' ' + shipAddress.Address
            };
        }
        
        that.setData({
          orderData: res.data,
          ShippingAddressInfo: ShippingAddressInfo
        });
      }
    })
  },

  reGetOrderInfo: function () {
    this.getConfirmOrder(this.data.ShippingAddressInfo.ShippingId);
  },

  gotoAddress: function () {
    wx.navigateTo({
      url: '../choiceaddress/choiceaddress'
    })
  },

  addAddresstap: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否使用微信收货地址',
      cancelText: '否',
      confirmText: '是',
      success: function (res) {
        if (res.confirm) {
          wx.chooseAddress({
            success: function (res) {
              if (res) {
                app.getOpenId(function (openId) {
                  //处理添加收货地址
                  var parameters = {
                    openId: openId,
                    shipTo: res.userName,
                    address: res.detailInfo,
                    cellphone: res.telNumber,
                    city: res.cityName,
                    county: res.countyName,
                    shippingId: 0,
                    regionId: 0,
                    isDefault: 1
                  }
                  config.httpPost(app.getUrl(app.globalData.AddWXChooseAddress), parameters, function (sd) {
                    if (sd.success) {
                      config.httpGet(app.getUrl("ShippingAddress/GetShippingAddress"), { openId: openId, shippingId: sd.data }, function (sdata) {
                        that.setData({
                          ShippingAddressInfo: sdata.data
                        });
                      });
                    } else {
                      wx.showToast({
                        title: sd.msg,
                        icon: 'success',
                      })
                    }
                  });
                });
              }
            }
          });
        } else if (res.cancel) {
          that.gotoAddress();
        }
      }
    })
  },

  submitOrder: function () {
    var that = this;
    if (!this.data.ShippingAddressInfo) {
      app.showErrorModal("请选择收货地址");
      return;
    }

    var params = {
      openId: openId,
      ID: that.data.id,
      Count: that.data.count,
      AddressId: that.data.ShippingAddressInfo.ShippingId
    };
    wx.showLoading({
      title: '',
      mask: true,
    });
    config.httpPost(app.getUrl(app.globalData.postGiftsSubmitOrder), params, function (res) {
      wx.hideLoading();
      if (res.success) {
          wx.showToast({
              title: '礼品兑换成功！',
              icon: 'success',
              duration: 1500,
              mask: true,
              success: function(res) {
              },
              fail: function(res) {},
              complete: function(res) {},
          });
          setTimeout(function(){
              wx.navigateTo({
                  url: '../giftsOrderList/giftsOrderList'
              })
          }, 1500);
      } else {
        app.showErrorModal(res.msg);
      }
    })
  }
})