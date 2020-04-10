﻿
var pagecnt = 1,
    isLast = false;
var isLoad = false
var ispv = getQueryString("ispv");
var tn = getQueryString("tn");


//$(window).scroll(function () {

//    var scrollTop = $(this).scrollTop();
//    var scrollHeight = $(document).height();
//    var windowHeight = $(this).height();

//    if (scrollTop + windowHeight >= scrollHeight - 50) {
//        if (!isLast && !isLoad) {
//            isLoad = true;
//            pagecnt += 1;
//            loadProducts(pagecnt);
//        }
//    }
//});


//function loadProducts(page) {
//    var url = getAreaPath() + '/home/LoadProductsFromCache';

//    $.ajax({
//        type: "post",
//        url: url,
//        data: { page: page },
//        async: false,
//        success: function (data) {
//            if (data.htmlTag != '') {
//                //console.log(data.htmlTag);
//                //console.log(page);
//                //$('.footerempty').before(data.htmlTag);
//                var _tmpdom = $(data.htmlTag);
//                $('.footerempty').before(_tmpdom);
//                isLoad = false;
//                $(".lazyload").scrollLoading();
//            } else {
//                isLast = true;
//            }
//        }
//    });

//}


// 微商城可视化：控制添加商品的图片显示高度，确保商品布局正常
// 2016-03-15 已改为CSS控制
// $('.b_mingoods,.mingoods').each(function (index, el) {
//   var me = $(this),
//       imgHeight = me.find('img').width();
//       me.find('img').closest('a').height(imgHeight);
// });

$('.board3').each(function (index, el) {
    var me = $(this);
    if (me.hasClass('small_board') || !me.hasClass('big_board')) {
        me.attr('style', 'height:' + me.width() * 0.54 + 'px !important;overflow:hidden;');
    }
    if (me.hasClass('big_board')) {
        me.attr('style', 'height:' + (me.width() * 1.1) + 'px !important;overflow:hidden;');
    }

});

//微商城可视化：轮播
$(function () {
    if (ispv == "1" && tn.length > 0) {
        $(".scrollLoading").each(function (index, el) {
            var _t = $(this);
            var _url = _t.attr("data-url");
            if (_url.indexOf("?") != -1) {
                _url += "&";
            } else {
                _url += "?";
            }
            _url += "tn=" + tn;
            _t.attr("data-url", _url);
        });
    }
    //延迟加载
    $(".scrollLoading").scrollLoading({
        callback: function () {
            var _t = $(this);
            $('.j-swipe', _t).each(function (index, el) {
                var me = $(this);
                me.attr('id', 'Swiper' + index);
                var id = me.attr('id');
                // alert(id)
                var elem = document.getElementById(id);
                window.mySwipe = Swipe(elem, {
                    startSlide: 0,
                    auto: 3000,
                    callback: function (m) {
                        $(elem).find('.members_flash_time').children('span').eq(m).addClass('cur').siblings().removeClass('cur')
                    },
                });
            });

            //处理商品移动
            var gdid = _t.attr("data-gdid");
            if (gdid && gdid.length > 0) {
                var gdbox = $("#" + gdid);
                gdbox.append(_t.html());
                _t.remove();
            }

            $(".lazyload").scrollLoading();
        }
    });
    $('.j-swipe').each(function (index, el) {
        var me = $(this);
        me.attr('id', 'Swiper' + index);
        var id = me.attr('id');
        // alert(id)
        var elem = document.getElementById(id);
        window.mySwipe = Swipe(elem, {
            startSlide: 0,
            auto: 3000,
            callback: function (m) {
                $(elem).find('.members_flash_time').children('span').eq(m).addClass('cur').siblings().removeClass('cur')
            },
        });
    });
    $(".lazyload").scrollLoading();

    $(".buyproduct").click(function () {
        var _t = $(this);
        var pid = _t.data("pid");
        var flag = getSellOut(pid);
        if (flag==0) {
            return;
        }
        var ishas = IsHasSKU(pid);
        var gidtxt = "<input type=\"hidden\" id=\"gid\" value=\"\" />";
        var hastxt = "<input type=\"hidden\" id=\"has\" value=\"\" />";
        var giddom = $("#gid");
        var hasdom = $("#has");
        if (giddom.length == 0) {
            giddom = $(gidtxt);
            $("body").append(giddom);
        }
        giddom.val(pid);
        if (hasdom.length == 0) {
            hasdom = $(hastxt);
            $("body").append(hasdom);
        }
        hasdom.val(ishas ? 1 : 0);
        //初始Sku
        skuId[0] = 0;
        skuId[1] = 0;
        skuId[2] = 0;

        if (ishas) {
            ShowSKUInfo(pid, function () {
                $('#J_shop_att .modul-popup').addClass('is-visible');
                $('#J_timeBuy_att .modul-popup').addClass('is-visible');

                $('.att-popup-footer button').css('display', 'none');
                $('#addToCart').removeAttr('style');

                $('#choose').himallSku({
                    data: { pId: pid },
                    resultClass: {
                        price: '#jd-price',
                        stock: '#stockNum',
                        minmath: '#minMath'
                    },
                    ajaxUrl: '/Product/GetSKUInfo',
                    skuPosition: 'skuArray',
                });

                // 点击关闭
                $('.modul-popup').on('click', function (event) {
                    if ($(event.target).is('.modul-popup-close') || $(event.target).is('.modul-popup')) {
                        $(this).removeClass('is-visible');
                    }
                });

                $('#colorSpec .enabled').click(function () {
                    if ($(this).data('img') != '') {
                        $('.thumb img')[0].src = $(this).data('img');
                    }
                });

                //购买数量加减
                $('.wrap-num .glyphicon-minus').click(function () {
                    if (parseInt($('#buy-num').val()) > 1) {
                        $('#buy-num').val(parseInt($('#buy-num').val()) - 1);
                        var maxnum = $("#stockNum").html();
                        checkSkuBuyNum($('#buy-num'), maxnum);
                        changeNum();
                    }
                });
                $('.wrap-num .glyphicon-plus').click(function () {
                    $('#buy-num').val(parseInt($('#buy-num').val()) + 1);
                    var maxnum = $("#stockNum").html();
                    checkSkuBuyNum($('#buy-num'), maxnum);
                    changeNum();
                });

                $("#buy-num").blur(function () {
                    var maxnum = $("#stockNum").html();
                    checkSkuBuyNum($('#buy-num'), maxnum);
                    changeNum();
                });

                $("#addToCart").click(function () {
                    addcart();
                });

                //InitSku();
            });
        } else {
            returnHref = "/" + areaName + "/Product/Detail/" + pid;
            checkLogin(returnHref, function () {
                addToCart(pid + '_0_0_0', 1,
                    function () {
                        $('.plus-one').text(1).css({
                            top: 0,
                            opacity: 0,
                            display: 'block'
                        }).animate({
                            'top': '-15px',
                            'opacity': '1'
                        }, 700).fadeOut();
                    });
            });
        }
    });
});

function changeNum() {
    var minBath = parseInt($('#minMath').text());
    var pid = $("#gid").val();
    if (minBath > 0) {
        $.ajax({
            type: 'get',
            url: '/m-wap/Product/GetChangeNum',
            dataType: 'json',
            data: { pid: pid, buyNum: $("#buy-num").val() },
            success: function (result) {
                if (result.success) {
                    $('#jd-price').text(result.data.price);
                }
            }
        });
    }
}
function getSellOut(pid) {
    var flag=1;
    $.ajax({
        type: 'post',
        url: '/m-wap/Product/GetSellOut',
        dataType: 'json',
        async: false,
        data: { pid: pid },
        success: function (result) {
            if (result.success && result.data.issellout <= 0) {
                $.dialog.errorTips('此商品已售罄');
                flag = 0;
                return false;
            }
        }
    });
    return flag;
}

function addcart() {
    var has = $("#has").val();
    var pid = $("#gid").val();
    var numdom = $('#buy-num');
    if (has != 1) return;
    var len = $('#choose .spec .selected').length;
    if (len === $(".spec").length) {
        returnHref = "/" + areaName + "/Product/Detail/" + pid;
        returnHref = encodeURIComponent(returnHref);
        var sku = getskuidbypid(pid);
        if (checkSkuBuyNum(numdom)) {
            var num = numdom.val();
            if (num.length == 0) {
                $.dialog.errorTips("请输入购买数量！");
                return false;
            }
            checkLogin(returnHref, function () {
                addToCart(sku, num, function () {
                    $('.modul-popup').removeClass('is-visible');
                    $('.plus-one').text($('#buy-num').val()).css({
                        top: 0,
                        opacity: 0,
                        display: 'block'
                    }).animate({
                        'top': '-15px',
                        'opacity': '1'
                    }, 700).fadeOut();
                });
            });
        }

    } else {
        $.dialog.errorTips('请选择商品规格');

    }
}
//获取URL中值
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

/*function loadProducts(page) {
    var areaname = areaName;
    var url = getAreaPath() + '/home/LoadProducts';
    $.post(url, { page: page, pageSize: 8 }, function (result) {
        var html = '';
        if (result.length > 0) {
            $.each(result, function (i, product) {
                html += ' <li>\
                <a class="p-img" href="/' + areaname + '/product/detail/' + product.id + '"><img src="' + product.image + '" alt=""></a>\
                <i>' + (((product.price / product.marketPrice) * 10).toFixed("1")) + '折</i>\
                <h3><a>' + product.name + '</a></h3>\
                <p><span>￥' + product.price.toFixed("2") + '</span><s>￥' + product.marketPrice.toFixed("2") + '</s></p>\
            </li>';
            });
            $('#productList').append(html);
            square($('.goods-list .p-img'));
        }
        else {
            $('#autoLoad').html('没有更多商品了');
        }
    });
}*/
$(function () {
    $.ajax({
        type: 'get',
        url: '/m-wap/Product/GetProductSaleCountOnOff',
        dataType: 'json',
        success: function (result) {
            if (!result.data) {
                $(".original_price").each(function () {
                    $(this).parent().next("span").hide();
                });
            }
        }
    });
    $(".j_productType").each(function () {
        var productType = $(this).attr("producttype");
        if (productType == 1) {
            $(this).find("a").hide();
        }
    });

    LoadShopHead();//销售员页头
});

//头部是否加载是否有销售员页头
function LoadShopHead() {
    $.ajax({
        type: 'get',
        url: '/m-wap/home/GetIsShowDistributionHead',
        dataType: 'json',
        success: function (result) {
            if (result.isShowDistributionHead) {
                $.ajax({
                    type: 'get',
                    url: '/m-wap/home/DistributionHeader',
                    dataType: 'text',
                    success: function (redata) {
                        $("#shop-head").html(redata);
                    }
                });
            }
        }
    });
}