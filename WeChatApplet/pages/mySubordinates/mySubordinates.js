var config = require("../../utils/config.js");
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navIndex: 0,
    showGotop: false,
    showEmpty: false,
    openid: '',
    mySubordinatesLevel: [],
  },

  initRecordsData:function(){
    this.setData({
      records: [],
      pageNo: 1,
      total: 20
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.initRecordsData();
    app.getOpenId(function (openid) {
      that.setData({ openid: openid });
      config.httpGet(app.getUrl(app.globalData.getMySubordinateLevel),
        { openId: openid },
        function (res) {
          if (res.success) {
            var temp = that.data.mySubordinatesLevel;
            for (var key in res.data.Levels) {
              temp.push(res.data.Levels[key]);
            }
            that.setData({ mySubordinatesLevel: temp });
            that.loadSubordinatesRecords(1);
          }
        });
    }, 'mySubordinates');
  },
  loadSubordinatesRecords: function (level) {
    var that = this;
    wx.showLoading({
      title: '',
      mask: true,
    })
    config.httpGet(app.getUrl(app.globalData.getMySubordinateRecords),
      {
        openId: that.data.openid,
        level: level,
        pageSize: 20,
        pageNo: that.data.pageNo
      }, function (res) {
        wx.hideLoading();
        if (res.success) {
          var records = that.data.records.length != 0 ? that.data.records.concat(res.data.rows) : res.data.rows;
          that.setData({
            showEmpty:res.data.total == 0,
            records: res.data.rows,
            total: res.data.total
          });
        }
      })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.records.length != this.data.total){
      this.data.pageNo++;
      this.loadSubordinatesRecords(this.data.navIndex+1);
    }
  },

  onPageScroll: function (e) {
    // Do something when page scroll
    var showGotop = e.scrollTop > 0;
    this.setData({ 'showGotop': showGotop });
  },
  bindGotop: function () {
    this.setData({ 'showGotop': false });
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300,
    })
  },
  bindNavitemChanged: function (e) {
    this.data.records = [];
    this.setData({ navIndex: e.currentTarget.dataset.index });
    this.initRecordsData();
    this.loadSubordinatesRecords(e.currentTarget.dataset.index + 1);
  }
})