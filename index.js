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
			version_up: false,
			imperative: false
		};
	}
}


/**
 * 版本下降
 * @param {Object} v 版本号
 * @return {String} 返回上一个版本号
 */
Update.prototype.version_down = function(v) {
	var arr = v.split('.');
	if (arr.length > 2) {
		if (arr[2] == 0) {
			arr[2] = 9;
			if (arr[1] == 0) {
				arr[1] == 9;
				arr[0] = Number(arr[0]) - 1;
			} else {
				arr[1] = Number(arr[1]) - 1;
			}
		} else {
			arr[2] = Number(arr[2]) - 1;
		};
	}
	return arr.join('.');
}

/**
 * 版本升级
 * @param {Object} v 版本号
 * @return {String} 返回新版本号
 */
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

/**
 * 运行更新 - 子函数
 * @param {Object} dir 需更新的目录
 */
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
				if (this.config.imperative || json.dependencies[name] !== module_version) {
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
 * 运行更新
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

/**
 * 运行版本下降
 */
Update.prototype.run_down = async function() {
	var dirs = $.dir.get('../');
	for (var i = 0; i < dirs.length; i++) {
		var o = dirs[i];
		if (!o.endsWith('mm_update\\') && !o.endsWith(this.config.name + '\\')) {
			var file = './package.json'.fullname(o);
			console.log(file, o);
			var json = file.loadJson();
			if (json) {
				// 版本下降
				json.version = this.version_down(json.version);
				file.saveJson(json);
				console.log(json.name + '版本下降为:' + json.version);
			}
		}
	}
};

/**
 * 发布
 */
Update.prototype.publish_sub = async function(dir) {
	var file = './package.json'.fullname(dir);
	var json = file.loadJson();
	if (!json) {
		return
	}
	var name = this.config.module_name;
	var up = this.config.version_up;
	var module_version = json.dependencies[name];
	if (module_version) {
		// 版本升级
		json.version = this.version_up(json.version);
		await file.saveJson(json);

		var cmd = "";
		if (dir.indexOf(':')) {
			cmd += 'cd ' + dir.split(':')[0] + ': && '
		}
		cmd += 'cd ' + dir + ' && ' + 'npm publish';
		// console.log(cmd);
		// console.log(json.name + ' 版本' + json.version + ' 发布');
		var free = exec(cmd, (error, stdout, stderr) => {
			console.log(error, stdout, stderr);
			console.log(json.name + ' 版本' + json.version + ' 发布成功！');
		});
	}
};

/**
 * 发布更新
 */
Update.prototype.publish = async function() {
	var dirs = $.dir.get('../');
	for (var i = 0; i < dirs.length; i++) {
		var o = dirs[i];
		if (!o.endsWith('mm_update\\') && !o.endsWith(this.config.name + '\\')) {
			this.publish_sub(o);
		}
	}
};

module.exports = Update;
