/**
 * @fileOverview 结果输出类
 * @author <a href="http://qww.elins.cn">邱文武</a>
 * @version 1.0
 */
require('mm_expand');
const fs = require('fs');
const exec = require('child_process').exec;

/**
 * @description json-rpc2.0响应函数
 * @class 
 */
class Update {
	/**
	 * @description 构造函数
	 * @param {Object} config
	 * @constructor
	 */
	constructor(config) {
		this.config = {
			module_name: "mm_expand",
			version_up: true
		};
	}
}

Update.prototype.version_up = function(v) {
	var arr = v.split('.');
	if (arr.length > 2) {
		if (arr[2] == 9) {
			arr[2] = 0;
			if (arr[1] == 9) {
				arr[1] == 0;
				arr[0] = Number(arr[0]) + 1;
			} else {
				arr[1] = Number(arr[1]) + 1;
			}
		} else {
			arr[2] = Number(arr[2]) + 1;
		};
	}
	return arr.join('.');
}

Update.prototype.run_sub = async function(dir) {
	var file = './package.json'.fullname(dir);
	var json = file.loadJson();
	if (!json) {
		return
	}
	var name = this.config.module_name;
	var up = this.config.version_up;
	var module_version = json.dependencies[name];
	if (module_version) {
		console.log('进场', dir);
		var cmd = "";
		if (dir.indexOf(':')) {
			cmd += 'cd ' + dir.split(':')[0] + ': && '
		}
		cmd += 'cd ' + dir + ' && ' + 'npm i ' + name;
		var free = exec(cmd, (error, stdout, stderr) => {
			console.log(error, stdout, stderr);
			if (!error && up) {
				// 版本升级
				var v = json.version;
				json = file.loadJson();
				if (json.dependencies[name] !== module_version) {
					// 版本升级
					json.version = this.version_up(v);
					file.saveJson(json);
					console.log(json.name + '版本更新为:' + json.version);
				}
			}
		});
	}
}

/**
 * 开始更新
 */
Update.prototype.run = async function() {
	var dirs = $.dir.get('../');
	for (var i = 0; i < dirs.length; i++) {
		var o = dirs[i];
		if (!o.endsWith('mm_update\\')) {
			this.run_sub(o);
		}
	}
};

module.exports = Update;
