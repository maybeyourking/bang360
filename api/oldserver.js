const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const formidable = require("formidable");
const db = require("./module/db");
const common = require("./module/common")
app.use(express.static("../manage"));
app.post("/advadd",function(req,res){
	var form = new formidable.IncomingForm()//生成一个formidable对象，获取form值
	form.uploadDir = path.resolve(__dirname+"/upload");//指定上传文件的存放地址
	form.keepExtensions = true; //是否保留扩展名；
	form.encoding = "utf-8";//指定编码格式
	form.parse(req,function(err,params,file){
//		console.log(params,file);
		var pic = file["advPic"];
//		console.log(pic)
		if(pic.size <= 0){
			fs.unlink(pic.path,function(err){
				res.json({
					ok:-1,
					msg:"请选择你要上传的图片"
				})
			})
		}else{
			var imgNameArr = [".jpg",".png",".gif"];//设置可以上传的图片格式数组
			var index = pic.name.lastIndexOf(".");//获取文件名.的下标
			var keepName = pic.name.substr(index);//截取扩展名
			if( imgNameArr.includes(keepName) ){//判断添加图片的扩展名是否符合规则
//				console.log(params,file);
				var nowTime = new Date();
				var year = nowTime.getFullYear();
				var month = nowTime.getMonth()+1;
				var newPicName = Date.now() + keepName;
				var newPicPath = year+"/"+month+"/"+newPicName;
				fs.exists(path.resolve(__dirname+"/upload/"+year),function(exists){//判断目标路径是否包含year
					if(exists){
						fs.exists(path.resolve(__dirname+"/upload/"+year+"/"+month),function(exists){
							if(exists){
								fs.rename(pic.path,path.resolve(__dirname+"/upload")+"/"+newPicPath,function(err){
									if(err){
										res.json({
											ok:-1,
											msg:"网络连接错误"
										})
									}else{
										params.newPicPath = newPicPath;
										db.insertOne("advList",{
											advName:params.advName,
											addTime:common.getNowTime(),
											advPic:params.newPicPath,
											advHref:params.advHref,
											orderBy:params.orderBy/1,
											advType:params.advType/1
										},function(err,results){
											if(err){
												res.json({
													ok:-1,
													msg:"网络连接错误"
												})
											}else{
												res.json({
													ok:1,
													msg:"添加成功"
												})
											}
										})
									}
									
								})
							}else{
								fs.mkdir(path.resolve(__dirname+"/upload/"+year+"/"+month),function(err){
									if(err){
										res.json({
											ok:-1,
											msg:"网络连接错误"
										})
									}else{
											fs.rename(pic.path,path.resolve(__dirname+"/upload")+"/"+newPicPath,function(err){
											if(err){
												res.json({
													ok:-1,
													msg:"网络连接错误"
												})
											}else{
												params.newPicPath = newPicPath;
												db.insertOne("advList",{
													advName:params.advName,
													addTime:common.getNowTime(),
													advPic:params.newPicPath,
													advHref:params.advHref,
													orderBy:params.orderBy/1,
													advType:params.advType/1
												},function(err,results){
													if(err){
														res.json({
															ok:-1,
															msg:"网络连接错误"
														})
													}else{
														res.json({
															ok:1,
															msg:"添加成功"
														})
													}
												})
											}
											
										})
									}
								})
							}
						})
					}else{
						fs.mkdir(path.resolve(__dirname+"/upload/"+year),function(err){//先创建year
							fs.mkdir(path.resolve(__dirname+"/upload/"+year+"/"+month),function(err){//再创建month
								if(err){
										res.json({
											ok:-1,
											msg:"网络连接错误"
										})
									}else{
											fs.rename(pic.path,path.resolve(__dirname+"/upload/")+"/"+newPicPath,function(err){
											if(err){
												res.json({
													ok:-1,
													msg:"网络连接错误"
												})
											}else{
												params.newPicPath = newPicPath;
												db.insertOne("advList",{
													advName:params.advName,
													addTime:common.getNowTime(),
													advPic:params.newPicPath,
													advHref:params.advHref,
													orderBy:params.orderBy/1,
													advType:params.advType/1
												},function(err,results){
													if(err){
														res.json({
															ok:-1,
															msg:"网络连接错误"
														})
													}else{
														res.json({
															ok:1,
															msg:"添加成功"
														})
													}
												})
											}
											
										})
									}
							})
						})
					}
				})
			}else{
				fs.unlink(pic.path,function(err){
					res.json({
						ok:-1,
						msg:"上传文件格式错误，请上传jpg/gif/png格式的图片"
					})
				})
			}
		}
	})
	
	
	
})
app.listen(8000,function(){
	console.log("success")
})
