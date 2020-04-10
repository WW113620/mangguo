var config = require('../../utils/config.js');
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: '',
        ShopCategories: [],
        secondCategories: [],
        thirdCategories: [],
        hasSecondCategories: false,
        hasThirdCategories: false,
        firstCategoryIndex: -1,
        secondCategoryIndex: -1,
        thirdCategoryIndex: -1,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            id: options.id
        });
        this.loadData();
    },

    loadData: function() {
        var that = this;
        wx.showLoading({
            title: '',
            mask: true,
        })
        config.httpGet(app.getUrl('VShop/GetVShopCategory'), {
            id: that.data.id
        }, function(res) {
            wx.hideLoading();
            if (res.success) {
                var categories = res.data.result.ShopCategories;
                that.setData({
                    ShopCategories: categories,
                    isNoData:categories.length == 0
                });
                that.defalutSelectFirstCategory();
            } else {
                app.showErrorModal(res.msg);
            }
        })
    },

    defalutSelectFirstCategory:function(){
        if (this.data.ShopCategories.length == 0) return;

        var firstCategoryItem = this.data.ShopCategories[0];
        var secondCategories = firstCategoryItem.SubCategories;
        
        if (secondCategories.length > 0) {
            this.setData({
                firstCategoryIndex: 0,
                secondCategoryIndex: -1,
                thirdCategoryIndex: -1
            });
            this.setData({
                secondCategories: secondCategories,
                hasSecondCategories: true
            });
        }
    },

    bindTapCagegoryItem: function(e) {
        var cid = e.currentTarget.dataset.id;
        var level = e.currentTarget.dataset.level;
        var index = e.currentTarget.dataset.index;

        if (level == 1) {
            var firstCategoryItem = this.data.ShopCategories[index];
            var secondCategories = firstCategoryItem.SubCategories;

            this.setData({
                firstCategoryIndex: index,
                secondCategoryIndex: -1,
                thirdCategoryIndex: -1
            });
            if (secondCategories.length > 0) {
                this.setData({
                    secondCategories: secondCategories,
                    hasSecondCategories: true
                });
                return;
            } else {
                this.setData({
                    secondCategories: [],
                    thirdCategories: [],
                    hasSecondCategories: false,
                    hasThirdCategories: false,
                })
            }
        } else if (level == 2) {
            var secondCategoryItem = this.data.secondCategories[index];
            var thirdCategories = secondCategoryItem.SubCategories;

            this.setData({
                secondCategoryIndex: index,
                thirdCategoryIndex: -1
            });
            if (thirdCategories.length > 0) {
                this.setData({
                    thirdCategories: thirdCategories,
                    hasThirdCategories: true
                });
                return;
            } else {
                this.setData({
                    thirdCategories: [],
                    hasThirdCategories: false,
                });
            }
        } else {
            this.setData({
                thirdCategoryIndex: index
            });
        }

        wx.navigateTo({
            url: '../vShopProductList/vShopProductList?cid=' + cid + '&id='+this.data.id
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})