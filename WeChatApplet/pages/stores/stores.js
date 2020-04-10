//index.js
//获取应用实例
var config = require("../../utils/config.js");
var app = getApp();
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({
    data: {
        scrolltoview: 'v0',
        pageIndex: 1,
        pageSize: 5,
        location: '正在定位',
        Menu: [], //快捷菜单,
        fromLatLng: '',
        showNoLocate: false,
        isDataEnd: false,
        loadDataing:false,
        storeList: [],
        setCss: {},
        isLoading: false,
        pageLoaded:false
    },
    imageError: function (e) {
        var parent = e.currentTarget.dataset.parent,
            index = e.currentTarget.dataset.index,
            cur = this.data.storeList[parent].ShowProducts[index];
        cur.DefaultImage = '../../images/noimage200.png';
        this.setData({
            storeList: this.data.storeList
        });
    },
    onShareAppMessage: function () {
        return {
            title: '首页',
            path: '',
            success: function (res) {
            },
            fail: function (res) {
                // 转发失败
            }
        }

    },
    onShow: function (options) {
        if (this.data.fromLatLng) {
            this.setData({
                isDataEnd: false,
                pageIndex: 1
            });
            this.getStoreList();
        }
    },
    onLoad: function () {
        var that = this;
        wx.showNavigationBarLoading();
        config.httpGet(app.getUrl('Home/GetShopsIndexData'), {}, that.getHomeData);
    },
    getHomeData: function (res) {
        var that = this;
        if (res.success) {
            res = res.data;
            that.setData({
                ADImg1: res.ADImg1,
                ADImg2: res.ADImg2,
                ADImg3: res.ADImg3,
                ADImg4: res.ADImg4,
                ADImg5: res.ADImg5,
                Menu: res.Menu,
                MiddleSlide: res.MiddleSlide,
                TopSlide: res.TopSlide,
                pageLoaded:true
            });
            app.globalData.QQMapKey = res.QQMapKey; //获取QQ地图密钥
            // 实例化API核心类
            qqmapsdk = new QQMapWX({
                key: res.QQMapKey
            });
            //初始化数据时显示快捷菜单最后一个后再还原
            if (that.data.Menu && that.data.Menu.length > 0) {
                that.setData({
                    scrolltoview: 'v' + (that.data.Menu.length - 1)
                });
                setTimeout(function () {
                    that.setData({
                        scrolltoview: 'v0'
                    });
                }, 1000);
            }
            //获取定位
            if (!wx.getStorageSync('o2oFromLatLng')) {
                that.getLocation();
            }else{
                that.setData({
                    fromLatLng: wx.getStorageSync('o2oFromLatLng')
                });
                that.getStoreList(1);
            }
            
        } else {
            wx.showToast({
                title: '系统数据异常'
            })
        }
        wx.hideNavigationBarLoading();
    },
    bindNavTap: function (e) {
        var that = this;
        var urlstr = e.currentTarget.dataset.url, toUrl;
        var strs = urlstr.split(','),
            ntype = strs[0],
            urlstr = strs[1],
            id = urlstr.substring(urlstr.lastIndexOf("\/") + 1, urlstr.length);
        if (ntype == 1) {
            if (!wx.getStorageSync('o2oFromLatLng')) {
                wx.showModal({
                    title: '提示',
                    content: '未能获取地理位置，请重新获取',
                    success: function (res) {
                        if (res.confirm) {
                            app.openSetting(function () {
                                that.getLocation();
                            });
                        }
                    }
                })
            } else {
                toUrl = '../tag/tag?tagid=' + id;
            }    
            
        }
        else if (ntype == 2) {
            toUrl = '../shophome/shophome?id=' + id;
        }
        else {
          var uu = e.currentTarget.dataset.url;
          var us = uu.split(",");
          if(us.length>1){
            uu= us[1];
          }
          toUrl = '../outurl/outurl?url=' + encodeURIComponent(uu);
        }
        if (toUrl) {
            wx.navigateTo({
                url: toUrl
            })
        }
    },
    toSearch: function () {
        var that = this;
        if (!wx.getStorageSync('o2oFromLatLng')){
            wx.showModal({
                title: '提示',
                content: '未能获取地理位置，请重新获取',
                success: function (res) {
                    if (res.confirm) {
                        app.openSetting(function () {
                            that.getLocation();
                        });
                    }
                }
            })
        }else{
            wx.navigateTo({
                url: "../searchstore/searchstore"
            })
        }        
    },
    toChooseAddr: function () {
        var that = this;
        wx.navigateTo({
            url: "../chooseaddr/chooseaddr?fromLatLng=" + that.data.fromLatLng + "&cityname=" + (that.data.cityinfo?that.data.cityinfo:'') + "&location=" + that.data.location
        })
    },
    getLocation: function () {
        var that = this;
        wx.getLocation({
            type: 'wgs84',
            success: function (res) {
                wx.setStorage({
                    key: "o2oFromLatLng",
                    data: res.latitude + "," + res.longitude
                });
                that.setData({
                    fromLatLng: res.latitude + "," + res.longitude,
                    showNoLocate: false,
                    isDataEnd: false,
                    pageIndex: 1,
                    storeList: []     
                });
                that.getStoreList(1);
            },
            fail: function () {
                that.setData({
                    location: '未获取定位',
                    showNoLocate: true,
                    storeList:[]
                });
            }
        })
    },
    reGetLocation: function(){
        var that = this;
        wx.getLocation({
            type: 'wgs84',
            success: function (res) {
                wx.setStorage({
                    key: "o2oFromLatLng",
                    data: res.latitude + "," + res.longitude
                });
                that.setData({
                    fromLatLng: res.latitude + "," + res.longitude
                });
                that.getStoreList(1);
            },
            fail: function (e) {
                app.openSetting(function () {
                    that.getLocation();
                });
            }
        })
    },
    
    getStoreList: function (pageIndex) {
        var that = this;
        if (that.data.loadDataing){
          return;
        }
        var latlng = that.data.fromLatLng.split(",");
        qqmapsdk.reverseGeocoder({
            coord_type:1,
            location: {
                latitude: latlng[0],
                longitude: latlng[1]
            },
            success: function (qqres) {
                that.setData({
                    cityinfo: qqres.result.address_component.city,
                    location: qqres.result.formatted_addresses.recommend
                });
            },
            fail: function (res) {
                wx.showToast({
                    title: '获取位置失败'
                })
            }
        });
       
        if (that.data.isDataEnd) {
            that.setData({
                loadDataing: false,
                isLoading: false
            });
            return;
        }
        app.getOpenId(function (openid) {
            that.setData({
              loadDataing:true,
            });
            var parameters = {
                pageNo: pageIndex,
                pageSize: that.data.pageSize,
                fromLatLng: that.data.fromLatLng,
                openId: openid
            }
            config.httpGet(app.getUrl('Home/GetStoreList'), parameters, that.getStoreListData);
        },"home")
        
    },
    getStoreListData: function (res) {
        var that = this;
        that.setData({
          loadDataing: false,
          isLoading: false
        });
        if (res.success) {
            res = res.data;

            var stores = that.dataActionOpera(res),
                oldList = that.data.pageIndex == 1 ? [] : that.data.storeList;

            if (!res.Stores || res.Stores.length < that.data.pageSize) {
                that.setData({
                    isDataEnd: true
                });
            } else {
                var pidx = that.data.pageIndex;
                that.setData({
                    pageIndex: pidx + 1
                });
            }
            
            that.setData({
                storeList: oldList.concat(stores),
                showNoLocate: false,
                ProductSaleCountOnOff: res.ProductSaleCountOnOff
            });
        }else{
            that.setData({
                location: '未获取定位',
                showNoLocate: true
            });
        }
    },
    dataActionOpera: function (data) {
        if (data.Stores.length > 0) {
            for (var i = 0, len = data.Stores.length; i < len; i++) {
                var count = 0, types1 = new Array(), types3 = '', types2 = {};
                var actives = data.Stores[i].ShopAllActives;
                if (actives.ShopActives && actives.ShopActives.length > 0) {
                    for (var j = 0; j < actives.ShopActives.length; j++) {
                        types1.push(actives.ShopActives[j].ActiveName);
                    }
                    count++;
                }
                if (actives.IsFreeMail) {
                    types3 = '满' + actives.FreeFreightAmount + '元免配送费';
                    count++;
                }
                if (actives.ShopCoupons && actives.ShopCoupons.length > 0) {
                    types2.MinCouponPrice = actives.MinCouponPrice;
                    types2.MaxCouponPrice = actives.MaxCouponPrice;
                    count++;
                }
                data.Stores[i].ShopBranch.types1 = types1.join(",");
                data.Stores[i].ShopBranch.count = count;
                data.Stores[i].ShopBranch.types3 = types3;
                data.Stores[i].ShopBranch.types2 = types2;
            }
        }
        return data.Stores;
    },
    onReachBottom: function () {
        // 页面上拉触底事件的处理函数
        var that = this;
        var pageIndex = that.data.pageIndex;
        that.setData({
            isLoading: true
        });
        that.getStoreList(pageIndex);
    },
    setActive: function (e) {
        //控制门店活动的展开与隐藏
        var idx = e.currentTarget.dataset.idx;
        var obj = {};
        obj[idx] = !this.data.setCss[idx];
        this.setData({
            setCss: obj
        })
    },
    showStoreDetail: function (e) {
        var data = e.currentTarget.dataset;
        if (data.proid) {
            wx.navigateTo({
                url: '../shophome/shophome?id=' + data.id + '&productid=' + data.proid + '&fromLatLng=' + this.data.fromLatLng
            })
        } else {
            wx.navigateTo({
                url: '../shophome/shophome?id=' + data.id + '&fromLatLng=' + this.data.fromLatLng
            })
        }
    }
})
