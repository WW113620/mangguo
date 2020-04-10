// pages/search/search.js
//获取应用实例
var config = require("../../utils/config.js");
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageIndex: 1,
        pageSize: 5,
        KeyWord: '',
        currentPage: 'page1',
        fromLatLng: '',
        historyList: [],
        isDataEnd: false,
        storeList: [],
        setCss: {},
        setProCss: {},
        showNoSearch: false,
        isHidePage1: false
    },
    onShareAppMessage: function () {
        return {
            title: '搜索',
            path: '',
            success: function (res) {
            },
            fail: function (res) {
                // 转发失败
            }
        }

    },
    onLoad: function (options) {
        var that = this;
        // 页面初始化 options为页面跳转所带来的参数
        that.setData({
            fromLatLng: wx.getStorageSync('o2oFromLatLng')
        });
        // if (!that.data.fromLatLng) {
        //     that.getLocation();
        // }
        wx.getStorage({
            key: 'storeSearchHistory',
            success: function (res) {
                if (res.data) {
                    var list = res.data.split(",").reverse();
                    that.setData({
                        historyList: list
                    });
                }

            }
        })
    },
    deleHistory: function () {
        this.setData({
            historyList: []
        });
        wx.removeStorage({
            key: 'storeSearchHistory'
        })
    },
    getLocation: function () {
        var that = this;
        wx.getLocation({
            type: 'wgs84',
            success: function (res) {
                that.setData({
                    fromLatLng: res.latitude + "," + res.longitude
                });
            },
            fail: function (e) {
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
            }
        })
    },
    goSearch: function (e) {
        var that = this;
        var keyword = e.currentTarget.dataset.keyword;
        that.setData({
            KeyWord: keyword
        });
        that.onConfirmSearch();
    },
    onConfirmSearch: function (e) {
        var that = this;
        if (that.data.KeyWord == "") {
            wx.showToast({
                title: '请输入关键词'
            });
            return;
        }
        if (that.data.currentPage != "page2") {
            that.setData({
                currentPage: "page2"
            });
            setTimeout(function () {
                that.setData({
                    isHidePage1: true
                });
            }, 1000);
        }
        that.getStoreList(1);
        //存储搜索记录
        that.data.historyList.unshift(that.data.KeyWord);
        var arry = app.uniqueArry(that.data.historyList);
        that.setData({
            historyList: arry.slice(0, 10)
        });
        wx.setStorageSync('storeSearchHistory', that.data.historyList.join(","));
    },
    onInputKeyword: function (e) {
        var that = this;
        const keyword = e.detail.value;
        if (keyword == '' && that.data.currentPage != "page1") {
            that.setData({
                currentPage: "page1"
            });
            setTimeout(function () {
                that.setData({
                    isHidePage1: false
                });               
            }, 1000);
        }
        if (keyword != that.data.KeyWord) {
            that.setData({
                KeyWord: keyword,
                showNoSearch: false,
                isDataEnd: false
            })
        }

    },
    getStoreList: function (pageIndex) {
        var that = this, parameters;
        if (!that.data.KeyWord){
            return;
        }
        if (that.data.isDataEnd) {
            return;
        }
        if (!that.data.fromLatLng) {
            app.showErrorModal('未能获取定位');
            return;
        }
        if (that.data.showNoSearch) {
            //   没有所搜结果时就查询附近门店
            parameters = {
                pageNo: pageIndex,
                pageSize: that.data.pageSize,
                fromLatLng: that.data.fromLatLng
            }
        } else {
            parameters = {
                pageNo: pageIndex,
                pageSize: that.data.pageSize,
                fromLatLng: that.data.fromLatLng,
                keyWords: that.data.KeyWord
            }
        }
        if (pageIndex == 1) {
            that.setData({
                storeList: []
            })
        }       

        parameters.openId = app.globalData.openId;    
        wx.showLoading();        
        config.httpGet(app.getUrl('Home/GetStoreList'), parameters, that.getStoreListData);       
    },
    getStoreListData: function (res) {
        wx.hideLoading();
        var that = this;
        if (res.success) {
            res = res.data;
            if (res.Total == 0) {
                that.setData({
                    showNoSearch: true,
                    pageIndex: 1,
                    storeList: []
                });
                that.getStoreList(1);
                return;
            }
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
            var stores = that.dataActionOpera(res);
            that.setData({
                location: res.CurrentAddress,
                storeList: that.data.storeList.concat(stores),
                ProductSaleCountOnOff: res.ProductSaleCountOnOff
            });
        } else {
            wx.showToast({
                title: '系统数据异常'
            })
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
                if (actives.FreeFreightAmount > 0) {
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
    setProActive: function (e) {
        //控制商品的展开与隐藏
        var idx = e.currentTarget.dataset.idx;
        var obj = {};
        obj[idx] = !this.data.setProCss[idx];
        this.setData({
            setProCss: obj
        })
    },
    showStoreDetail: function (e) {
        var data = e.currentTarget.dataset,that = this;
        var that=this;
        if (data.proid) {
            wx.navigateTo({
              url: '../shophome/shophome?id=' + data.id + '&productid=' + data.proid + '&fromLatLng=' + that.data.fromLatLng
            })
        } else {
            wx.navigateTo({
              url: '../shophome/shophome?id=' + data.id + '&fromLatLng=' + that.data.fromLatLng
            })
        }
    }
})