// pages/chooseAddress/chooseaddr.js
//获取应用实例
var config = require("../../utils/config.js");
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
var procitydata = null;
var cityRegionIds = new Array();//已加载的城市ID
var p = 0, c = 0;
var app = getApp();
Page({
    /**
   * 页面的初始数据
   */
    data: {
        fromLatLng: '',
        cityname: '',
        location: '',
        isLogin: true,
        showDistpicker: false,
        showSearch: false      
    },
    onLoad: function (options) {
        var that = this;
        // 实例化API核心类
        qqmapsdk = new QQMapWX({
            key: app.globalData.QQMapKey
        });
        // 页面初始化 options为页面跳转所带来的参数
        that.setData({
            fromLatLng: wx.getStorageSync('o2oFromLatLng'),
            cityname: options.cityname,
            location: options.location
        });
        //获取周边地址
        var latlng = that.data.fromLatLng ? that.data.fromLatLng.split(","):null;
        if (latlng){
            qqmapsdk.reverseGeocoder({
                coord_type: 1,
                location: {
                    latitude: latlng[0],
                    longitude: latlng[1]
                },
                get_poi: 1,
                poi_options: 'page_size=10',
                success: function (res) {
                    that.setData({
                        aroundAddrList: res.result.pois
                    });
                }
            });
        }
       
    },

    onShow:function(){
        var that = this;
        if (app.getIsLogin()) {
            app.getOpenId(function (openid) {
                config.httpGet(app.getUrl(app.globalData.getAddressList), { openId: openid, isCanDelive: true }, that.getAddressListData);
            });
            that.setData({
                isLogin: true
            });
        } else {
            that.setData({
                isLogin: false
            });
        }
    },

    getLocation: function () {
        var that = this;
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2];  //上一个页面
        wx.getLocation({
            type: 'wgs84',
            success: function (res) {
                that.setData({
                    fromLatLng: res.latitude + "," + res.longitude
                });
                wx.setStorage({
                    key: "o2oFromLatLng",
                    data: res.latitude + "," + res.longitude
                });
                qqmapsdk.reverseGeocoder({
                    coord_type: 1,
                    location: {
                        latitude: res.latitude,
                        longitude: res.longitude
                    },
                    get_poi:1,
                    poi_options: 'page_size=10',
                    success: function (res) {                    
                        that.setData({
                            cityname: res.result.address_component.city,
                            location: res.result.formatted_addresses.recommend,
                            aroundAddrList: res.result.pois
                        });
                    },
                    fail: function (res) {
                        wx.showToast({
                            title: '获取位置失败'
                        })
                    }
                });
                prevPage.setData({
                    fromLatLng: res.latitude + "," + res.longitude,
                    showNoLocate: false,
                    isDataEnd: false,
                    pageIndex: 1,
                    storeList: []
                });
                prevPage.getStoreList(1);    
            },
            fail: function(e){                
                that.setData({
                    location: '未能获取地理位置'
                });  
                wx.removeStorageSync('o2oFromLatLng');
            }
        })
    },
    reGetLocation: function(){
        var that = this;
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2];  //上一个页面
        wx.getLocation({
            type: 'wgs84',
            success: function (res) {
                that.setData({
                    fromLatLng: res.latitude + "," + res.longitude
                });
                wx.setStorage({
                    key: "o2oFromLatLng",
                    data: res.latitude + "," + res.longitude
                });
                qqmapsdk.reverseGeocoder({
                    coord_type: 1,
                    location: {
                        latitude: res.latitude,
                        longitude: res.longitude
                    },
                    get_poi: 1,
                    poi_options: 'page_size=10',
                    success: function (res) {
                        that.setData({
                            cityname: res.result.address_component.city,
                            location: res.result.formatted_addresses.recommend,
                            aroundAddrList: res.result.pois
                        });
                    },
                    fail: function (res) {
                        wx.showToast({
                            title: '获取位置失败'
                        })
                    }
                });
                prevPage.setData({
                    fromLatLng: res.latitude + "," + res.longitude,
                    showNoLocate: false,
                    isDataEnd: false,
                    pageIndex: 1,
                    storeList: []
                });
                prevPage.getStoreList(1);    
            },
            fail: function (e) {
                wx.removeStorageSync('o2oFromLatLng');
                app.openSetting(function () {
                    that.getLocation();
                });
            }
        })
    },
    getAddressListData: function(res){
        var that = this;
        if (res.success) {
            that.setData({
                deliverAddrList: res.data
            });
        }else{
            //app.showErrorModal(res.msg);
        }
    },
    goLogin: function(){
        wx.navigateTo({
            url: '../login/login'
        })
    },
    setShowAll: function(){
        this.setData({
            isShowAll: true
        })
    },
    bindAddressTap: function(){
        p = 0, c = 0;
        this.setAreaData();
        this.setData({
            showDistpicker: true
        });
    },
    setAreaData: function (p, c) {
        const that = this;
        var p = p || 0; // provinceSelIndex
        var c = c || 0; // citySelIndex
        // 设置省的数据
        if (procitydata == undefined || procitydata == null) {
            wx.request({
                url: app.getUrl('ShippingAddress/GetAll'),
                async: false,
                success: function (result) {
                    if (result.data.success) {
                        that.setProvinceCityData(result.data.data, p, c);
                    }
                }, error: function (e) {
                }
            });
        }
        else {
            that.setProvinceCityData(null, p, c);
        }
    },
    setProvinceCityData: function (data, p, c) {
        const that = this;
        if (data != null) {
            procitydata = data;
        }
        var province = procitydata;
        var provinceName = [];
        var provinceCode = [];
        for (var item in province) {
            var name = province[item]["name"];
            var code = province[item]["id"];
            provinceName.push(name)
            provinceCode.push(code)
        }
        that.setData({
            provinceName: provinceName,
            provinceCode: provinceCode
        })
        // 设置市的数据
        var city = procitydata[p]["city"];
        var cityName = [];
        var cityCode = [];
        var cIndex = 0;
        for (var item in city) {
            var name = city[item]["name"];
            var code = city[item]["id"];

            cIndex += 1;
            cityName.push(name)
            cityCode.push(code)
        }

        that.setData({
            cityName: cityName,
            cityCode: cityCode
        });
    },
    changeArea: function (e) {
        const that = this;
        p = e.detail.value[0];
        c = e.detail.value[1];
        that.setAreaData(p, c);
    },
    distpickerCancel: function () {
        this.setData({
            showDistpicker: false
        })
    },
    distpickerSure: function () {
        var cityname = this.data.cityName[c];
        var regionId;
        if (this.data.cityCode.length > 0) {
            regionId = this.data.cityCode[c];
        }
        this.setData({
            cityname: cityname,
            regionId: regionId
        })
        this.distpickerCancel();
    },
    onInputKeyword: function (e) {
        var that = this;
        const keyword = e.detail.value;
        if(keyword==""){
            that.setData({
                showSearch: false                
            })
        }
        if (keyword != that.data.KeyWord) {
            that.setData({
                KeyWord: keyword              
            })
        }

    },
    searchKeyword: function(){
        var that = this;
        var key = that.data.KeyWord;
        if(key==""){
            wx.showToast({
                title: '请输入关键字',       
            });
            return;
        }
        qqmapsdk.getSuggestion({
            keyword: key,
            region: that.data.cityname,
            region_fix: 1,
            success: function (res) {
                that.setData({
                    showSearch: true,
                    searchList: res.data
                })
            }
        });
    },
    setAddr: function(e){
        var fromLatLng = e.currentTarget.dataset.fromlatlng;
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2];  //上一个页面
        //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
        prevPage.setData({
            fromLatLng: fromLatLng,
            isDataEnd: false,
            pageIndex: 1,
            storeList: []            
        });
        wx.setStorage({
            key: "o2oFromLatLng",
            data: fromLatLng
        });
        prevPage.getStoreList(1);
        wx.navigateBack();
    },
    refreshData: function(){
        var that = this;
        app.getOpenId(function (openid) {
            config.httpGet(app.getUrl(app.globalData.getAddressList), { openId: openid }, that.getAddressListData);
        }); 
    },
    goAddAddr: function(){
        wx.navigateTo({
            url: "../editaddress/editaddress?Source=chooseaddr&title=新增收货地址"
        })
    },
    clearKeyword: function(){
        this.setData({
            KeyWord: ""
        })
    }
})