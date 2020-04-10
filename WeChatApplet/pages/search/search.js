// pages/search/search.js
Page({
    data: {
        KeyWord: '',
        KeyWordList: null,
        GoToUrl: "../searchresult/searchresult",//搜索结果页productlist,searchresult
    },
    onLoad: function (options) {
        var gotoUrl = "../searchresult/searchresult";
        // if (options.SourceUrl != null && options.SourceUrl != undefined){
        //   if (options.SourceUrl == "productlist"){
        //     gotoUrl = "../productlist/productlist";
        //    }
        // }

        var value = wx.getStorageSync('keyWordList');
        if (value) {
            value.reverse();
            this.setData({
                KeyWordList: value,
                GoToUrl: gotoUrl,
            })
        }
        else {
            this.setData({
                GoToUrl: gotoUrl,
            })
        }
    },
    gotoHome: function (e) {
        wx.navigateBack({
            delta: 1,
        })
    },
    onInputKeyword: function (e) {
        this.setData({
            KeyWord: e.detail.value
        })
    },
    onConfirmSearch: function (e) {
        const keyword = e.detail.value;
        this.gotoSearch(keyword);
        this.setData({
            KeyWord: keyword
        })
    },
    goSearch: function(){
        this.gotoSearch(this.data.KeyWord);      
    },
    onHistoryKeyWordClick: function (e) {
        this.gotoSearch(e.currentTarget.dataset.keyword);
    },

    removeKeyWord: function (e) {
        var keyword = e.currentTarget.dataset.keyword,
            value = wx.getStorageSync('keyWordList');
        if (value) {
            value.reverse();
            this.removeByValue(value, keyword);
            wx.setStorageSync('keyWordList', value);
            this.setData({
                KeyWordList: value
            })
        }
    },
    ClearKeyWord: function (e) {
        wx.showModal({
            title: '提示',
            content: '确认要清空所有历史记录吗！',
            success: function (res) {
                if (res.confirm) {
                    wx.removeStorageSync('keyWordList');
                    wx.redirectTo({
                        url: '../search/search',
                    })
                }
            }
        })

    },
    removeByValue(arr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == val) {
                arr.splice(i, 1);
                break;
            }
        }
    },
    btngotoSearch() {
        this.gotoSearch(this.data.KeyWord);
    },
    gotoSearch(keyword) {
        var that = this;
        // try {
        if (keyword.length > 0) {
            wx.setStorage({
                key: "keyword",
                data: keyword
            })
            var arry = [];
            var value = wx.getStorageSync('keyWordList');
            if (value) {
                arry = value;
            }
            if (arry.join(',').indexOf(keyword) == -1) {
                arry.push(keyword);
            }
            var toUrl = that.data.GoToUrl + "?keyword=" + keyword
            if (that.data.GoToUrl.indexOf("searchresult") > -1) {
                wx.setStorageSync('keyWordList', arry);
                wx.redirectTo({
                    url: toUrl,
                })
            }
            else {
                wx.switchTab({
                    url: toUrl,
                    success: function (res) {
                        wx.hideKeyboard()
                    }
                })
            }
        }
        // }
        //catch (e) {
        // }
    },
    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
        // 页面显示
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    }
})