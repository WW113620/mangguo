/*底部购物车控制部分*/
var checkAll = document.querySelector('input[name="s-checkAll"]'),
	cartList = document.getElementById('cartList'),
	sbottom = $("#sbottom-btn"),
	modulpopup = $("#pop-cart"); //弹窗
//获取底部购物车信息
function getCartInfo(callback) {
	mui.ajax(URL + 'api/BranchCart/GetBranchCartProducts', {
		data: himall.md5Data({
			shopBranchId: shopBranchId,
			userkey: himall.isLogin() ? himall.getState().userkey : ''
		}),
		dataType: 'json',
		type: 'get',
		timeout: 10000,
		success: function(data) {
			LoadBottomHtml(data);
			var products = data.products,
				products1 = [],
				products2 = [],
				pro = {};
			$.each(products, function() {
				//普通商品
				if(this.status == 0) {
					products1.push(this);
				} else { //失效商品
					products2.push(this);
				}
			});
			pro.products1 = products1;
			pro.products2 = products2;
			callback && callback();
			cartList.innerHTML = template('initCartList', pro);
		}
	});
}
//初始化底部购物车信息
function LoadBottomHtml(data) {
	var amount = parseFloat(data.amount), //总金额
		totalCount = parseInt(data.totalCount), //总数量
		DeliveFee = parseFloat(data.DeliveFee), //配送费
		FreeMailFee = parseFloat(data.FreeMailFee), //配送费
		DeliveTotalFee = parseFloat(data.DeliveTotalFee), //起送费
		shopBranchStatus = data.shopBranchStatus, //门店状态
		sCart = sbottom.find(".s-cart"),
		sButton = sbottom.find("button");
	if(shopBranchStatus != "0") {
		sCart.addClass("disabled"); //门店冻结，无法选择购物车
		sButton.addClass("disabled");
	}
	//商品总数量
	if(totalCount > 0) {
		sCart.removeClass("disabled");
		sbottom.find(".s-cart i").show().html(totalCount);
	} else {
		sCart.addClass("disabled");
		sbottom.find(".s-cart i").hide();
	}
	//金额
	$(sbottom).find(".info span span").html(amount.toFixed(2));
	//配送费
	if(DeliveFee > 0) {
		if(FreeMailFee > 0)
			sbottom.find(".info p").html("配送费" + DeliveFee + "元,满" + FreeMailFee + "元包邮");
		else
			sbottom.find(".info p").html("配送费" + DeliveFee + "元");
	} else {
		sbottom.find(".info p").html("免配送费");
	}
	//结算
	sButton.attr("delivetotalfee", DeliveTotalFee);
	if(DeliveTotalFee > amount) {
		sButton.addClass("disabled").html("差¥" + (DeliveTotalFee - amount).toFixed(2) + "起送");
		//将按钮置失效
	} else {
		sButton.removeClass("disabled").html("结算");
	}
	if(amount == 0) {
		sButton.addClass("disabled").html("¥" + (DeliveTotalFee - amount).toFixed(2) + "起送");
	}
}
mui("#sbottom-btn").on('tap', '.s-cart', function() {
	if(modulpopup.hasClass('is-visible')) {
		modulpopup.removeClass('is-visible');
	} else {
		modulpopup.addClass('is-visible');
	}
});

$('.modul-popup').on('tap', '.mask', function() {
	$(this).parent().removeClass('is-visible')
})

//设置底部购物车信息
function SetBottomData(isChecked) {
	var amount = 0, //总金额
		totalCount = 0, //总数量
		sButton = sbottom.find("button"),
		DeliveTotalFee = sButton.attr("delivetotalfee"); //起送价

	modulpopup.find(".settle-popup-body .active").each(function() {
		var price = parseFloat($(this).parents("li").find(".money em").html());
		var num = parseFloat($(this).parents("li").find(".store-btn-buy .buynum").val());
		amount += price * num;
		totalCount += num;
	})

	if(!isChecked) {
		//商品总数量
		if(totalCount > 0) {
			sbottom.find(".s-cart i").show().html(totalCount);
		} else {
			sbottom.find(".s-cart i").hide();
		}
	}

	//金额
	$(sbottom).find(".info span span").html(amount.toFixed(2));
	//结算
	if(DeliveTotalFee > amount) {
		sButton.addClass("disabled").html("差¥" + (DeliveTotalFee - amount).toFixed(2) + "起送");
	} else {
		sButton.removeClass("disabled").html("结算");
	}
	if(amount == 0) {
		sButton.addClass("disabled").html("¥" + (DeliveTotalFee - amount).toFixed(2) + "起送");
	}
	//空购物车不可展开
	if(modulpopup.find(".settle-popup-body .canbuy li").length == 0 && modulpopup.find(".settle-popup-body .disabled-pros li").length == 0) {
		$(sbottom).find(".s-cart").addClass("disabled");
		modulpopup.removeClass("is-visible");
		return;
	}
}
mui("#pop-cart").on('tap', '.settle-popup-header .check-custom', function() {
	if($(this).hasClass("active")) {
		$(this).removeClass("active");
		modulpopup.find(".settle-popup-body .check-custom").each(function() {
			if($(this).hasClass("active")) {
				$(this).removeClass("active");
			}
		})
	} else {
		$(this).addClass("active");
		modulpopup.find(".settle-popup-body .check-custom").each(function() {
			if(!$(this).hasClass("active")) {
				$(this).addClass("active");
			}
		})
	}
	SetBottomData(true);
});
mui("#pop-cart").on('tap', '.settle-popup-body .check-custom', function() {
	if($(this).hasClass("active")) {
		$(this).removeClass("active");
		modulpopup.find(".settle-popup-header .check-custom").removeClass("active");
	} else {
		$(this).addClass("active");
		if(modulpopup.find(".settle-popup-body .active").length == modulpopup.find(".settle-popup-body .check-custom").length) {
			modulpopup.find(".settle-popup-header .check-custom").addClass("active");
		}
	}
	SetBottomData(true);
});
//清空购物车
mui("#pop-cart").on('tap', '.settle-popup-header .c-dele', function() {
	plus.nativeUI.confirm('您确定清空购物车吗?', function(event) {
		if(0 == event.index) {
			mui.ajax(URL + 'api/BranchCart/GetClearBranchCartProducts', {
				data: himall.md5Data({
					shopBranchId: shopBranchId,
					userkey: himall.getState().userkey
				}),
				dataType: 'json',
				type: 'get',
				timeout: 10000,
				success: function(data) {
					if(data.success) {
						lodeEnd = false;
						curpageindex = 1;
						total = -1;
						loadData();
						modulpopup.find(".settle-popup-body .cart-pros").html("");
						SetBottomData();
					}
				}
			});
		}
	}, '', ["确定", "取 消"]);
});
//清空失效商品
mui("#pop-cart").on('tap', '.settle-popup-body .c-dele', function() {
	plus.nativeUI.confirm('您确定清空失效商品吗?', function(event) {
		if(0 == event.index) {
			mui.ajax(URL + 'api/BranchCart/GetClearBranchCartInvalidProducts', {
				data: himall.md5Data({
					shopBranchId: shopBranchId,
					userkey: himall.getState().userkey
				}),
				dataType: 'json',
				type: 'get',
				timeout: 10000,
				success: function(data) {
					if(data.success) {
						lodeEnd = false;
						curpageindex = 1;
						total = -1;
						loadData();
						modulpopup.find(".disabled-pros").hide();
						modulpopup.find(".disabled-pros .cart-pros").remove();
						SetBottomData();
					}
				}
			});
		}
	}, '', ["确定", "取 消"]);
});
//结算
mui("#sbottom-btn").on('tap', 'button', function() {
	var that = this;
	if(!$(that).hasClass('disabled')) {
		checkPhone(function() {
			var itemId = "";
			if(modulpopup.find(".settle-popup-body .active").length == 0) {
				mui.toast("请选择结算商品！");
				return false
			}
			modulpopup.find(".settle-popup-body .active").each(function() {
				itemId += $(this).attr("data-cartitem") + ",";
			})
			himall.openVW('order-submit.html', {
				cartItemId: itemId,
				isShopBranch: true
			});
		});
	}
});
/*底部购物车控制部分*/

function checkPhone(callback) {
	var w = plus.nativeUI.showWaiting('', {
		padlock: true
	});
	mui.ajax(URL + 'api/UserCenter/IsConBindSms', {
		data: himall.md5Data({
			userkey: himall.getState().userkey
		}),
		dataType: 'json',
		type: 'post',
		timeout: 10000,
		success: function(data) {
			w.close();
			if(data.success === false) {
				plus.nativeUI.toast('为了账号安全，购买时需要绑定手机号');
				himall.openVW('bind-phone.html');
			} else {
				callback();
			}
		},
		error: function(xhr) {
			w.close();
			plus.nativeUI.toast('请求失败，请检查网络');
		}
	});
}