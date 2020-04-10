// pages/userIntegral/userIntegral.js
var config = require("../../utils/config.js");
var app = getApp();
Page({
    /**
      * 页面的初始数据
      */
    data: {
        rechargeHide: true,
        cashHide: true,
        pageno: 0,
        isEnd: false,
        list: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const that = this;
        app.getOpenId(function (openid) {
            that.setData({
                openId: openid,
                integral: options.integral
            });
            that.loadData();
        });
    },
    loadData: function () {
        if (this.data.isEnd) {
            return;
        }
        wx.showLoading({
            title: '加载中',
        });

        var that = this;
        this.data.pageno++;
        this.setData({
            pageno: this.data.pageno
        });
        config.httpGet(app.getUrl('UserCenter/GetIntegralRecordList'), {
            openId: this.data.openId,
            pagesize: 15,
            pageno: this.data.pageno
        }, function (res) {
            res.data.forEach(function(item,index,array){
                if (item.ReMark && item.ReMark.indexOf("订单") >= 0){
                    var tmp = item.ReMark.split("订单号")[1] ? item.ReMark.split("订单号")[1]:'';
                    item.ReMark = tmp.replace(/,/g, "，"); 
                } else if (item.TypeName == "其他"){
                  item.ReMark = item.ReMark; 
                } 
                else{
                  if (item.TypeName != "积分抵扣"){
                    item.ReMark = "";
                  }
                }
                if (item.TypeName == "积分抵扣") {
                  if (item.ReMark.indexOf("兑换") == -1) {
                    item.ReMark = "订单号" + item.ReMark;
                  } else {
                    item.ReMark = item.ReMark;
                  }
                }
            });
            that.data.list.push.apply(that.data.list, res.data);
            that.setData({
                list: that.data.list,
                isEnd: res.data.length < 15 ? true : false
            });
            wx.hideLoading();
        });
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.loadData();
    },

    bindGiftsOrder:function(){
      wx.navigateTo({
        url: '../giftsOrderList/giftsOrderList'
      });
    }
})