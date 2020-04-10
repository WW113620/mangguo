// pages/waitingForReview/waitingForReview.js
Page({

	/**
	 * 页面的初始数据，status分销员状态，0=普通会员，1=待审核，2=已审核，3=已拒绝，4=已清退, 5=分销已关闭
	 */
	data: {
		'status': '1',
		'statusMsg': ''
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData(options);
		var status = options.status;
		var statusMsg = '';
		if(status == '5') {
			statusMsg = '分销已关闭';
		} else if(status == '4') {
			statusMsg = '您已被系统清退';
		} else if(status == '3') {
			statusMsg = '审核未通过';
		}
		this.setData({
			'statusMsg': statusMsg
		});
	},

	bindReturnUserhome: function() {
		wx.switchTab({
			url: '/pages/usehome/usehome',
			success: function(res) {},
			fail: function(res) {},
			complete: function(res) {},
		})
	},
    
	bindReapplyDistribution: function() {
		wx.navigateTo({
			url: '../applyForDistributor/applyForDistributor',
			success: function(res) {},
			fail: function(res) {},
			complete: function(res) {},
		})
	}
})