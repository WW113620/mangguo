// pages/raiseaddress/raiseaddress.js
var config = require("../../utils/config.js");
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
var procitydata = null;
var cityRegionIds = new Array(); //已加载的城市ID
var areadata = new Array();
var areaRegionIds = new Array(); //已加载的地区ID
var streetdata = new Array();
var p = 0,
    c = 0,
    d = 0,
    s = 0
var app = getApp();
var currAreaData = [];
var currStreetData = [];
var regionArr = [];

Page({
    data: {
        currentPage: 'page1',
        navigateTitle: "",
        addressData: {},
        shipTo: "",
        cellPhone: "",
        fullAddress: "",
        address: "",
        regionId: "",
        isHidePage1: false,
        provinceName: [],
        provinceCode: [],
        provinceSelIndex: '',
        cityName: [],
        cityCode: [],
        citySelIndex: '',
        districtName: [],
        districtCode: [],
        districtSelIndex: '',
        streetName: [],
        streetCode: [],
        streetSelIndex: '',
        showMessage: false,
        messageContent: '',
        showDistpicker: false,
        Source: "",
        FromPage: '',
        FullRegionName: '',
        isCss: true,
        lat: '',
        lng: '',
        shopBranchId: ''
    },
    onLoad: function(options) {
        this.setAreaData();
        // 实例化API核心类
        qqmapsdk = new QQMapWX({
            key: app.globalData.QQMapKey
        });
        // 页面初始化 options为页面跳转所带来的参数
        var navigateTitle = options.title;
        this.data.navigateTitle = navigateTitle;

        wx.setNavigationBarTitle({
            title: this.data.navigateTitle
        })
        var regionId = 0;
        if (navigateTitle == '编辑收货地址') {
            var addressdata = JSON.parse(options.extra);
            var isupdate = options.isupdate;
            if (isupdate) addressdata.Address = "";
            regionId = addressdata.RegionId;
            var selcityname = "";
            var RegionFullName = addressdata.RegionFullName ? addressdata.RegionFullName : addressdata.FullRegionName;
            if (RegionFullName && RegionFullName.length > 0) {
                var regionNameArr = RegionFullName.split(' ');
                selcityname = regionNameArr.length > 2 ? regionNameArr[2] : regionNameArr[1];
            }
            this.setData({
                addressData: addressdata,
                shipTo: addressdata.ShipTo,
                cellPhone: addressdata.Phone ? addressdata.Phone : addressdata.CellPhone,
                fullAddress: addressdata.RegionFullName,
                FullRegionName: addressdata.RegionFullName ? addressdata.RegionFullName : addressdata.FullRegionName,
                selCityName: selcityname,
                detailAddress: addressdata.Address,
                building: addressdata.AddressDetail,
                lat: addressdata.Latitude,
                lng: addressdata.Longitude,
                isCss: false
            })
        }
        this.setData({
            regionId: regionId,
            FromPage: options.frompage,
            Source: options.Source,
            shopBranchId: options.shopBranchId
        });
    },

    bindShipToTap: function(e) {
        var shipTo = e.detail.value;
        var that = this;
        that.data.shipTo = shipTo;
    },

    bindCellPhoneTap: function(e) {
        var cellPhone = e.detail.value;
        var that = this;
        that.data.cellPhone = cellPhone;
    },

    bindFullAddressTap: function(e) {
        //p = 0, c = 0, d = 0,s=0;
        this.setAreaData(p, c, d, s);
        this.setData({
            showDistpicker: true
        });

    },

    bindAddressTap: function(e) {
        var address = e.detail.value;
        var that = this;
        that.data.address = address;
    },
    bindInputBuilding: function(e) {
        this.setData({
            building: e.detail.value
        })
    },
    bindSaveTap: function(e) {
        var that = this;
        if (!that.data.shipTo) {
            wx.showToast({
                title: '请输入收货人',
                icon: 'none',
                duration: 2000
            })
            return;
        }
        if (that.data.cellPhone.length != 11) {
            wx.showToast({
                title: '请输入正确的联系电话',
                icon: 'none',
                duration: 2000
            })
            return;
        }
        if (!that.data.FullRegionName) {
            wx.showToast({
                title: '请输入所在地区',
                icon: 'none',
                duration: 2000
            })
            return;
        }
        if (!that.data.detailAddress) {
            wx.showToast({
                title: '请输入详细地址',
                icon: 'none',
                duration: 2000
            })
            return;
        }
        app.getOpenId(function(openId) {
            //wx.showNavigationBarLoading();
            wx.showLoading({
                mask: true
            });
            if (that.data.navigateTitle == '新增收货地址') {
                var parameters = {
                    openId: openId,
                    address: that.data.detailAddress,
                    addressDetail: that.data.building ? that.data.building : '',
                    cellphone: that.data.cellPhone,
                    shipTo: that.data.shipTo,
                    isDefault: false,
                    regionId: that.data.regionId,
                    lat: that.data.lat,
                    lng: that.data.lng
                }
                config.httpPost(app.getUrl(app.globalData.addShippingAddress), parameters, that.getEditAddressData);
            } else {
                var parameters = {
                    openId: openId,
                    shippingId: that.data.addressData.Id,
                    shipTo: that.data.shipTo,
                    address: that.data.detailAddress,
                    addressDetail: that.data.building,
                    cellphone: that.data.cellPhone,
                    regionId: that.data.regionId,
                    lat: that.data.lat,
                    lng: that.data.lng
                }
                config.httpPost(app.getUrl(app.globalData.updateShippingAddress), parameters, that.getEditAddressData);
            }
        })
    },

    getEditAddressData: function(res) {
        wx.hideLoading();
        //wx.hideNavigationBarLoading();
        var that = this;
        if (res.success) {
            var pages = getCurrentPages();
            var prevPage = pages[pages.length - 2]; //上一个页面
            var source = this.data.Source;
            if (source == "undefined" || source == "" || that.data.shopBranchId) {
                //直接调用上一个页面方法
                wx.navigateBack();
            } else {
                if (source == "chooseaddr") {
                    //直接调用上一个页面方法
                    prevPage.refreshData();
                    wx.navigateBack();
                } else if (source == "submitorder") {
                    //如果是从提交订单页面过来的则返回提交订单页面
                    var ShippingAddressInfo = {
                        ShippingId: res.data,
                        Id: res.data,
                        ShipTo: that.data.shipTo,
                        CellPhone: that.data.cellPhone,
                        FullAddress: that.data.FullRegionName + that.data.detailAddress + (that.data.building ? that.data.building : '')
                    };

                    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
                    prevPage.setData({
                        ShippingAddressInfo: ShippingAddressInfo
                    });
                    prevPage.reGetOrderInfo();
                    wx.navigateBack();
                }
            }

        } else {
            wx.showToast({
                title: res.msg,
                icon: 'loading',
                duration: 10000
            })

            setTimeout(function() {
                wx.hideToast()
            }, 2000)

        }
    },

    changeArea: function(e) {
        const that = this;
        p = e.detail.value[0];
        c = e.detail.value[1];
        if (e.detail.value.length > 2)
            d = e.detail.value[2];
        else
            d = 0;
        if (e.detail.value.length > 3) {
            s = e.detail.value[3];
        } else {
            s = 0;
        }
        //  if (e.detail.value.length > 3)
        //   s = e.detail.value[3]
        //  else
        //     s = "";
        that.setAreaData(p, c, d, s)
    },
    showDistpicker: function() {
        this.setData({
            showDistpicker: true
        })
    },
    distpickerCancel: function() {
        this.setData({
            showDistpicker: false
        })
    },
    distpickerSure: function() {
        if (this.data.provinceName.length <= 0) {
            return;
        }
        var fullAddress = this.data.provinceName[p] + " " + this.data.cityName[c] + " " + (this.data.districtName[d] || "") + ' ' + (this.data.streetName[s] || "").replace("其它", "");
        var regionId;
        var selcityname;
        if (this.data.streetCode.length > 0 && this.data.streetCode[s] != 0) {
            regionId = this.data.streetCode[s];
            selcityname = this.data.districtName[d];
        } else if (this.data.districtCode.length > 0) {
            regionId = this.data.districtCode[d];
            selcityname = this.data.districtName[d];
        } else if (this.data.cityCode.length > 0) {
            regionId = this.data.cityCode[c];
            selcityname = this.data.cityName[c];
        } else {
            selcityname = this.data.provinceName[p];
        }
        var cssval = this.data.isCss;
        if (this.data.FullRegionName == '请填写所在地区') {
            cssval = false;
        }
        this.setData({
            fullAddress: fullAddress,
            FullRegionName: fullAddress,
            regionId: regionId,
            selCityName: selcityname,
            isCss: cssval,
            detailAddress: ''
        })
        this.distpickerCancel()
    },
    ArrayContains: function(arr, obj) {
        var i = arr.length;
        while (i--) {
            if (arr[i] === obj) {
                return true;
            }
        }
        return false;
    },
    getRegions: function(regionId, depth, a, s) {
        const that = this;
        var hasData = true;
        if (depth == 3) {
            //如果未包含则获取
            if (!that.ArrayContains(cityRegionIds, regionId)) {
                hasData = false;
            }
        } else if (hasData == 4) {
            //如果未包含则获取
            if (!that.ArrayContains(areaRegionIds, regionId)) {
                hasData = false;
            }
        }
        wx.request({
            url: app.getUrl("ShippingAddress/GetSub"),
            async: false,
            data: {
                parentId: regionId
            },
            success: function(result) {
                result = result.data;
                if (result.success) {
                    if (result.data.Depth == 3) {

                        that.setAreaDataShow(result.data.Regions, regionId, a, s);
                    } else if (result.Depth == 4) {
                        that.setStreetData(result.data.Regions, regionId, a, s);
                    }
                }
            }
        });
    },
    setProvinceCityData: function(data) {
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
            provinceName.push(name);
            provinceCode.push(code);
            if (regionArr.length > 0 && code == regionArr[0])
                p = item;
        }
        that.setData({
            provinceName: provinceName,
            provinceCode: provinceCode
        })
        // 设置市的数据
        var city = procitydata.length > p ? procitydata[p]["city"] : procitydata[0]["city"];
        var cityName = [];
        var cityCode = [];
        for (var item in city) {
            var name = city[item]["name"];
            var code = city[item]["id"];
            cityName.push(name);
            cityCode.push(code);
            if (regionArr.length > 1 && code == regionArr[1])
                c = item;
        }
        that.setData({
            cityName: cityName,
            cityCode: cityCode
        });
        //设置区的数据
        var district = city.length > c ? city[c]["area"] : city[0]["area"];
        var districtName = [];
        var districtCode = [];
        if (district != null && district.length > 0) {
            for (var item in district) {
                var name = district[item]["name"];
                var code = district[item]["id"];
                districtName.push(name);
                districtCode.push(code);
                if (regionArr.length > 2 && code == regionArr[2])
                    d = item;
            }
            that.setData({
                districtName: districtName,
                districtCode: districtCode
            })
            var street = district.length > d ? district[d]["country"] : district[0]["country"];
            var streetName = [];
            var streetCode = [];
            if (street != null && street.length > 0) {
                streetName.push("其它");
                streetCode.push(0);
                for (var item in street) {
                    var name = street[item]["name"];
                    var code = street[item]["id"];
                    streetName.push(name);
                    streetCode.push(code);
                    if (regionArr.length > 3 && code == regionArr[3])
                        s = item;
                }
                that.setData({
                    streetName: streetName,
                    streetCode: streetCode
                });
            } else {
                that.setData({
                    streetName: [],
                    streetCode: []
                });
            }
        } else {
            that.setData({
                districtName: [],
                districtCode: [],
                streetName: [],
                streetCode: []
            })
        }
        var selecteds = [];
        selecteds.push(p);
        selecteds.push(c);
        selecteds.push(d);
        selecteds.push(s);
        that.setData({
            value: selecteds
        });
        regionArr = [];
    },
    getItemIndex: function(arr, item) {
        var i = arr.length;
        var index = -1;
        while (i--) {
            if (arr[i] === item) {
                return i;
            }
        }
        return index;
    },
    setAreaDataShow: function(data, parentRegionId, a, s) {
        const that = this;
        if (data != null) {
            currAreaData = data;
            cityRegionIds.push(parentRegionId);
            areadata.push(data);
        } else {
            var itemIndex = that.getItemIndex(cityRegionIds, parentRegionId);
            if (itemIndex >= 0) {
                currAreaData = areadata[itemIndex];
            } else {
                currAreaData = [];
            }
        }
        var districtName = [];
        var districtCode = [];
        if (currAreaData && currAreaData.length > 0) {
            for (var item in currAreaData) {
                var name = item.id;
                var code = item.name;
                districtName.push(name)
                districtCode.push(code)
            }
            that.setData({
                districtName: districtName,
                districtCode: districtCode
            })
        } else {
            that.setData({
                districtName: [],
                districtCode: [],
                //   streetName: [],
                //    streetCode: []
            })
        }

        var hasdata = this.ArrayContains(areaRegionIds, a);
        if (!hasdata) {
            that.getRegions(c, 4, a, s);
        } else {
            that.setStreetData(null, c, a, s);
        }
    },
    setStreetData(data, parentRegionId, a, s) {
        const that = this;
        if (data != null) {
            areaRegionIds.push(regionId);
            streetdata.push(data);
            currStreetData = data;
        } else {
            var itemIndex = that.getItemIndex(areaRegionIds, parentRegionId);
            if (itemIndex >= 0) {
                currStreetData = streetdata[itemIndex];
            } else {
                currStreetData = [];
            }
        }
    },
    setAreaData: function(p, c, d, s) {
        const that = this;
        var p = p || 0 // provinceSelIndex
        var c = c || 0 // citySelIndex
        var d = d || 0 // districtSelIndex
        var s = s || 0 // streetSelIndex
        // 设置省的数据
        if (procitydata == undefined || procitydata == null) {
            wx.request({
                url: app.getUrl("ShippingAddress/GetAll"),
                async: false,
                success: function(result) {
                    if (result.data.success) {
                        that.setProvinceCityData(result.data.data);
                    }
                },
                error: function(e) {}
            });
        } else {
            that.setProvinceCityData(null);
        }
    },

    // 详细地址选择层控制逻辑
    bindDetailAddressTap: function() {
        var that = this;
        that.setData({
            currentPage: 'page2'
        });
        setTimeout(function() {
            that.setData({
                showPage2: true,
                isHidePage1: true
            })
        }, 500);
    },
    bindHidePage2: function() {
        var that = this;
        setTimeout(function() {
            if (that.data.isDelete) {
                return;
            }
            that.setData({
                currentPage: 'page1',
                isDelete: false,
                isHidePage1: false
            });
        }, 100);
    },
    searchKeyword: function(e) {
        var that = this;
        var key = e.detail.value;
        that.setData({
            detailAddress: key,
            isDelete: false
        });
        if (key == "") {
            return;
        }
        setTimeout(function() {
            qqmapsdk.getSuggestion({
                keyword: key,
                region: that.data.selCityName,
                region_fix: 1,
                success: function(res) {
                    that.setData({
                        searchList: res.data
                    })
                }
            }, 500);
        })
    },
    setAddr: function(e) {
        var fromLatLng = e.currentTarget.dataset.fromlatlng,
            name = e.currentTarget.dataset.name;
        var that = this;
        that.setData({
            lat: e.currentTarget.dataset.lat,
            lng: e.currentTarget.dataset.lng
        });
        app.getOpenId(function(openId) {
            var parameters = {
                openId: openId,
                fromLatLng: fromLatLng
            }
            config.httpGet(app.getUrl(app.globalData.getRegionByLatLng), parameters, function(res) {
                res = res.data;
                var arry = res.fullPath.split(","),
                    regionId = arry ? arry[arry.length - 1] : '';
                that.setData({
                    isDelete: false,
                    detailAddress: name,
                    FullRegionName: res.showCity ? res.showCity : "",
                    regionId: regionId
                });
                that.bindHidePage2();
            });
        })
    },
    delDetailAddr: function() {
        this.setData({
            detailAddress: '',
            isDelete: true
        })
    }
})