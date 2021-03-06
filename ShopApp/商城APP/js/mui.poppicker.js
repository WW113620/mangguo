/**
 * 弹出选择列表插件
 * 此组件依赖 listpcker ，请在页面中先引入 mui.listpicker.css + mui.listpicker.js
 * varstion 1.0.1
 * by Houfeng
 * Houfeng@DCloud.io
 */

(function($, document) {

	var panelBuffer = '<div class="mui-poppicker">\
		<div class="mui-poppicker-header">\
			<button class="mui-btn mui-poppicker-btn-cancel">取消</button>\
			<button class="mui-btn mui-btn-blue mui-poppicker-btn-ok">确定</button>\
			<div class="mui-poppicker-clear"></div>\
		</div>\
		<div class="mui-poppicker-body">\
		</div>\
	</div>';

	var pickerBuffer = '<div class="mui-listpicker">\
		<div class="mui-listpicker-title"></div>\
		<div class="mui-listpicker-inner">\
			<ul>\
			</ul>\
		</div>\
	</div>';

	//定义弹出选择器类
	var PopPicker = $.PopPicker = $.Class.extend({
		//构造函数
		init: function(options) {
			var self = this;
			self.options = options || {};
			self.options.buttons = self.options.buttons || ['取消', '确定'];
			self.options.titles = self.options.titles || ['省','市','区/县','乡/镇','村'];
			self.panel = $.dom(panelBuffer)[0];
			document.body.appendChild(self.panel);
			self.ok = self.panel.querySelector('.mui-poppicker-btn-ok');
			self.cancel = self.panel.querySelector('.mui-poppicker-btn-cancel');
			self.body = self.panel.querySelector('.mui-poppicker-body');
			self.mask = $.createMask();
			self.cancel.innerText = self.options.buttons[0];
			self.ok.innerText = self.options.buttons[1];
			self.cancel.addEventListener('tap', function(event) {
				self.hide();
			}, false);
			self.ok.addEventListener('tap', function(event) {
				if (self.callback) {
					var rs = self.callback(self.getSelectedItems());
					if (rs !== false) {
						self.hide();
					}
				}
			}, false);
			self.mask[0].addEventListener('tap', function() {
				self.hide();
			}, false);
			self._createListPicker();
			self.panel.style.display = 'none';
			self.body.style.display = 'none';
		},
		_createListPicker: function() {
			var self = this;
			var layer = self.options.layer || 1;
			var width = (100 / layer) + '%';
			self.pickers = [];
			for (var i = 1; i <= layer; i++) {
				var picker = $.dom(pickerBuffer)[0];
				picker.querySelector(".mui-listpicker-title").innerText = self.options.titles[i-1];
				picker.style.width = width;
				self.body.appendChild(picker);
				$(picker).listpicker({ layer: layer });
				self.pickers.push(picker);
				picker.addEventListener('change', function(event) {
					var target = this;
					var nextPicker = this.nextSibling;
					if (nextPicker && nextPicker.listpickerId) {
						var eventData = event.detail || {};
						var preItem = eventData.item || {};
						if(!preItem.Sub && typeof self.options.getData == "function"){
							self.options.getData(preItem.Id, function(data){
								nextPicker.setItems(data);
								preItem.Sub=data; 
								target.getSelectedElement().setAttribute("data-item",JSON.stringify(preItem));
							});
						}else{
							nextPicker.setItems(preItem.Sub);
						}
					}
				}, false);
			}
		},
		//填充数据
		setData: function(data) {
			var self = this;
			data = data || [];
			self.pickers[0].setItems(data);
		},
		//获取选中的项（数组）
		getSelectedItems: function() {
			var self = this;
			var items = [];
			for(var i=0; i<self.pickers.length; i++){
				var picker = self.pickers[i];
				items.push(picker.getSelectedItem() || {});
			}
			return items;
		},
		//显示
		show: function(callback) {
			var self = this;
			self.panel.style.display = 'block';
			self.body.style.display = 'block';
			self.callback = callback;
			self.mask.show();
			document.body.classList.add($.className('poppicker-active-for-page'));
			self.panel.classList.add($.className('active'));
			for(index in self.pickers){
				self.pickers[index].isEye = true;
			}
		},
		//隐藏
		hide: function() {
			var self = this;
			if (self.disposed) return;
			self.panel.classList.remove($.className('active'));
			self.mask.close();
			document.body.classList.remove($.className('poppicker-active-for-page'));
			self.panel.style.display = 'none';
			self.body.style.display = 'none';
		},
		dispose: function() {
			var self = this;
			self.hide();
			setTimeout(function() {
				self.panel.parentNode.removeChild(self.panel);
				for (var name in self) {
					self[name] = null;
					delete self[name];
				};
				self.disposed = true;
			}, 300);
		}
	});

})(mui, document);