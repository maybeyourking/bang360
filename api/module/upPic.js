const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const pushUrl = path.resolve(__dirname,"../upload/")+"/";//添加图片目标存放路径根目录

function getNewPicPath(keepName,callback){
	var nowTime = new Date();
	var year = nowTime.getFullYear();
	var month = nowTime.getMonth()+1;
	var newPicName = Date.now() + keepName;//新路径文件名
	var newPicPath = year+"/"+month+"/"+newPicName;//新路径
	fs.exists(pushUrl+year,function(exists){//判断目标路径是否包含year
		if(exists){//如果包含year
			fs.exists(pushUrl+year+"/"+month,function(exists){//判断目标路径是否包含month
				if(exists){//如果包含month
					callback(newPicPath);//把新路径通过回调传回
				}else{
					fs.mkdir(pushUrl+year+"/"+month,function(err){
							callback(newPicPath);//把新路径通过回调传回
					})
				}
			})
		}else{//若不包含year
			fs.mkdir(pushUrl+year,function(err){//先创建year
				fs.mkdir(pushUrl+year+"/"+month,function(err){//再创建month
							callback(newPicPath);//把新路径通过回调传回	
				})
			})
		}
	})
}
module.exports.upPic = function(req,picName,callback){
	var form = new formidable.IncomingForm()//生成一个formidable对象，获取form值
	form.uploadDir = pushUrl;//指定上传文件的存放地址
	form.keepExtensions = true; //是否保留扩展名；
	form.encoding = "utf-8";//指定编码格式
	form.parse(req,function(err,params,file){
//		console.log(params,file);
		var pic = file[picName];
//		console.log(pic)
		if(pic.size <= 0){
			fs.unlink(pic.path,function(err){
				callback({
					ok:2,
					msg:"请选择你要上传的图片",
					params
				})
			})
		}else{
			var imgNameArr = [".jpg",".png",".gif"];//设置可以上传的图片格式数组
			var index = pic.name.lastIndexOf(".");//获取文件名.的下标
			var keepName = pic.name.substr(index);//截取扩展名
			if( imgNameArr.includes(keepName) ){//判断添加图片的扩展名是否符合规则
//				console.log(params,file);
				getNewPicPath(keepName,function(newPicPath){//将新路径通过封装好的获取新路径的函数回调接收
					fs.rename(pic.path,pushUrl+newPicPath,function(err){
						if(err){
							callback({
								ok:-1,
								msg:"网络连接错误"
							})
						}else{
							params.newPicPath = newPicPath;
							callback({
								ok:1,
								mag:"上传成功",
								params
							})
						}
					
					})
				})
			}else{
				fs.unlink(pic.path,function(err){
					callback({
						ok:3,
						msg:"上传文件格式错误，请上传jpg/gif/png格式的图片"
					})
				})
			}
		}
	})	
}
