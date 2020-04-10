// components/vshoptab/vshoptab.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        tabindex: {
            type: Number,
            value: 0
        },
        id: {
            type: String,
            value: ''
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        bindselecttab: function(e) {
            var currentIndex = this.data.tabindex;
            var index = e.currentTarget.dataset.index;

            if (currentIndex == index) return;

            var url;
            switch (index) {
                case 0:
                    url = '/pages/vShopHome/vShopHome';
                    break;
                case 1:
                    url = '/pages/vShopCategory/vShopCategory';
                    break;
                case 2:
                    url = '/pages/vShopProductList/vShopProductList';
                    break;
                case 3:
                    url = '/pages/vShopIntroduce/vShopIntroduce';
                    break;
            }

            url += '?id=' + this.id;
            wx.redirectTo({
                url: url,
            })
        }
    }
})