// pages/commentlist/commentlist.js
var config = require("../../utils/config.js");
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        ReviewInfo: null,
        positive: 0,
        commentList: null,
        pageIndex: 1,
        pageSize: 10,
        commentType: 0,
        ProductId: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this,
            ProductId = options.id,
            shopBranchId = options.shopBranchId;
        that.setData({
            ProductId: ProductId,
            shopBranchId: shopBranchId||0
        });
        wx.request({
            url: app.getUrl("product/GetStatisticsReview"),
            data: {
                ProductId: ProductId,
                shopBranchId: shopBranchId
            },
            success: function (result) {
                
                result = result.data;
                if (result.success) {
                    var r = result.data;
                    var positive = (r.reviewNum1 / r.reviewNum * 100).toFixed(2);
                    that.setData({
                        ReviewInfo: r,
                        positive: positive
                    });
                }else if (result.code == '502') {
                    wx.navigateTo({
                        url: '../login/login'
                    })
                }else {
                    wx.showModal({
                        title: '提示',
                        content: result.msg,
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                wx.navigateBack({ delta: 1 })
                            }
                        }
                    })
                }
            }
        });
        that.loadData(that, false);
    },
    prevImage: function (e) {
        var that = this,
            imgs = e.target.dataset.imgs,
            current = e.target.dataset.src;
        console.log(e.currentTarget)
        wx.previewImage({
            current: current,
            urls: imgs ? JSON.parse(imgs):[current]
        });
    },
    formatDuring(mss) {
        var days = parseInt(mss / (1000 * 60 * 60 * 24)),
            hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60)),
            seconds = (mss % (1000 * 60)) / 1000,
            t;
        if (days > 0) {
            t = days + "天";
            return t;
        }
        if (hours > 0) {
            t = hours + "小时";
            return t;
        }
        if (minutes > 0) {
            t = minutes + "分钟";
            return t;
        }
        if (seconds > 0) {
            t = seconds + "秒";
            return t;
        }
    },
    loadData: function (that, isNextpage) {
        app.getOpenId(function (openid) {
            wx.request({
                url: app.getUrl("product/GetLoadReview"),
                data: {
                    openId: openid,
                    PageIndex: that.data.pageIndex,
                    PageSize: that.data.pageSize,
                    type: that.data.commentType,
                    ProductId: that.data.ProductId,
                    shopBranchId: that.data.shopBranchId
                },
                success: function (result) {
                    result = result.data;
                    if (result.success) {
                        var r = result.data.Data;
                        r.forEach(function (item) {
                            if (item.AppendDate) {
                                item.AppendSpace = that.formatDuring(new Date(item.AppendDate.replace(/-/g, "/")) - new Date(item.ReviewDate.replace(/-/g, "/")));
                            }
                            item.Images=[];
                            if (item.ImageUrl1 != '') {
                                item.Images.push(item.ImageUrl1);
                            }
                            if (item.ImageUrl2 != '') {
                                item.Images.push(item.ImageUrl2);
                            }
                            if (item.ImageUrl3 != '') {
                                item.Images.push(item.ImageUrl3);
                            }
                            if (item.ImageUrl4 != '') {
                                item.Images.push(item.ImageUrl4);
                            }
                            if (item.ImageUrl5 != '') {
                                item.Images.push(item.ImageUrl5);
                            }
                        });
                        if (isNextpage) {
                            var old = that.data.commentList;
                            old.push.apply(old, r);
                            that.setData({
                                commentList: old
                            })
                        } else {
                            that.setData({
                                commentList: r
                            })
                        }

                    }
                    else if (result.code == '502') {
                        wx.navigateTo({
                            url: '../login/login'
                        })
                    }
                    else {
                        wx.showModal({
                            title: '提示',
                            content: result.msg,
                            showCancel: false,
                            success: function (res) {
                                if (res.confirm) {
                                    wx.navigateBack({ delta: 1 })
                                }
                            }
                        })
                    }
                }
            })
        },'commentlist');
    },
    bingComment: function (e) {
        var that = this,
            typeId = e.currentTarget.dataset.typeid;
        that.setData({
            pageIndex: 1,
            commentType: typeId
        })
        that.loadData(that, false);
    },
    onReachBottom: function () {
        var that = this,
            oldpageindex = that.data.pageIndex;
        oldpageindex = parseInt(oldpageindex) + 1;
        that.setData({
            pageIndex: oldpageindex
        });
        that.loadData(that, true);
    }
})