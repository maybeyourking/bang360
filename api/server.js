const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const db = require("./module/db");
const common = require("./module/common");
const config = require("./module/config");
const {upPic} = require("./module/upPic")
app.use(express.static("../manage"));
app.use(express.static("./upload"));
app.use(express.static("../html"))
app.post("/advadd",function(req,res){//广告管理添加路由
	upPic(req,"advPic",function(obj){
		if(obj.ok === 1){
			db.insertOne("advList",{
				advName:obj.params.advName,
				addTime:common.getNowTime(),
				advPic:obj.params.newPicPath,
				advHref:obj.params.advHref,
				orderBy:obj.params.orderBy/1,
				advType:obj.params.advType/1
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
		}else{
			res.json({
				ok:-1,
				msg:obj.msg
			})
		}
	})
})
app.get("/adv",function(req,res){//广告管理获取路由
	var advType = req.query.advType/1;
	var keyword = req.query.keyword;
	var sort = req.query.sort/1;
	var pageIndex = req.query.pageIndex/1;
	var skip = 0;
	var limit = 0;
	var whereObj = {};
		if(advType != 0){//如果advType不为0，就按advType查找
			whereObj.advType = advType;
		}
		if(keyword.length >0){//如果search框长度大于0，就添加advName搜索条件
			whereObj.advName = new RegExp(keyword)
		}
	db.countByType("advList",whereObj,function(count){//先按照条件查询出数据总条数
			var pageSum = 1;
			var pageNum = 4;
			pageSum = Math.ceil(count/pageNum);
			if( pageIndex < 1 ){
				pageIndex = 1;
			}
			if(pageSum <= 0 ){
				pageSum = 1;
			}
			if(pageIndex > pageSum){
				pageIndex = pageSum;
			}
			skip=(pageIndex -1)*pageNum;
			limit=pageNum;
//			console.log(skip,pageIndex)
		
		
		var sortObj = {orderBy:-1,addTime:-1};
		if( sort === 1 ){
			sortObj = {advType:1}
		}
		if( sort === 2 ){
			sortObj = {advType:-1}
		}
		db.find("advList",
			{whereObj,
			sortObj,
			skip,
			limit},
			function(err,advList){
				if(err){
					res.json({
						ok:-1,
						msg:"网络连接错误"
					})
				}else{
					res.json({
						ok:1,
						msg:"成功",
						advList,
						advTypeEnum:config.advTypeEnum,
						pageIndex,
						pageSum,
						count
					})
				}
			})
		
	})
})
//app.get("/advByType/:advType",function(req,res){//广告管理分类路由
//	var advType = req.params.advType/1;
////	console.log(advType)
//	if(advType === 0){//如果advType为0，就全部查找
//		var allType = {};
//	}
//	db.find("advList",
//			{whereObj:allType || {advType:advType},
//			sortObj:{orderBy:-1,addTime:-1}},
//			function(err,advList){
//		if(err){
//			res.json({
//				ok:-1,
//				msg:"网络连接错误"
//			})
//		}else{
//			res.json({
//				ok:1,
//				msg:"成功",
//				advList,
//				advTypeEnum:config.advTypeEnum
//			})
//		}
//	})
//})
app.delete("/deladv/:id",function(req,res){//广告管理删除路由
//	console.log(req.params.id);
	db.findById("advList",req.params.id,function(err,result){
//		console.log(result);
		fs.unlink(__dirname+"/upload/"+result.advPic,function(err){
			if(err){
				res.json({
					ok:-1,
					msg:"网络连接错误"
				})
			}else{
				db.deleteOneById("advList",req.params.id,function(err,esults){
					if(err){
						res.json({
							ok:-1,
							msg:"网络连接错误"
						})
					}else{
						res.json({
							ok:1,
							msg:"删除成功"
						})
					}
				})
			}
		})
	})
})
app.get("/getadvByType",function(req,res){//根据类型获取广告图片路由
	var advType = req.query.advType/1;
	var limit = req.query.limit/1;
	db.find("advList",
			{whereObj:{advType:advType},
			sortObj:{orderBy:-1,addTime:-1},
			limit
		},
		function(err,advList){
			if(err){
				res.json({
					ok:-1,
					msg:"网络连接错误"
				})
			}else{
				res.json({
				ok:1,
				msg:"成功",
				advList
				})
			}
		}
	)
})
app.get("/advInfoById",function(req,res){//根据id获取广告信息路由--辅助修改功能
	db.findById("advList",req.query.id,function(err,advList){
		if(err){
			res.json({
				ok:-1,
				msg:"网络连接错误"
			})
		}else{
			res.json({
				ok:1,
				msg:"成功",
				advList
			})
		}
	})
})
function upAdv(ok,id,params,callback){
	var upObj = {
		advName:params.advName,
		advHref:params.advHref,
		orderBy:params.orderBy/1,
		advType:params.advType/1
	}
	if(ok===1){
		db.findById("advList",id,function(err,advInfo){
			fs.unlink(__dirname+"/upload/"+advInfo.advPic,function(err){
				upObj.advPic = params.newPicPath;
				callback(upObj)
			})
		})
	}else{
		callback(upObj)
	}
}
app.put("/adv/:id",function(req,res){//广告修改路由
	upPic(req,"advPic",function(obj){
		if(obj.ok===3){
			res.json({
				ok:-1,
				msg:obj.msg
			})
		}else{
//			console.log(obj.params)
			upAdv(obj.ok,req.params.id,obj.params,function(upObj){
//				console.log(upObj,req.params.id)
				db.updateOneById("advList",req.params.id,upObj,function(err){
					res.json({
						ok:1,
						msg:"修改成功"
					})
				})
			})
		}
	})
})

app.post("/goodsadd",function(req,res){//商品管理添加路由
	upPic(req,"goodsPic",function(obj){
		if(obj.ok === 1){
			db.insertOne("goodsList",{
				goodsName:obj.params.goodsName,
				addTime:common.getNowTime(),
				goodsPic:obj.params.newPicPath,
				goodsPrice:obj.params.goodsPrice,
				orderBy:obj.params.orderBy/1,
				goodsType:obj.params.goodsType/1
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
		}else{
			res.json({
				ok:-1,
				msg:obj.msg
			})
		}
	})
})
//app.get("/goods",function(req,res){//商品管理获取路由
//	var goodsType = req.query.goodsType/1;
//	var keyword = req.query.keyword;
//	var sort = req.query.sort/1;
//	var whereObj = {};
//	if(goodsType != 0){//如果goodsType不为0，就按goodsType查找
//		whereObj.goodsType = goodsType;
//	}
//	if(keyword.length >0){
//		whereObj.goodsName = new RegExp(keyword)
//	}
//	var sortObj = {orderBy:-1,addTime:-1};
//	if( sort === 1 ){
//		sortObj = {goodsType:1}
//	}
//	if( sort === 2 ){
//		sortObj = {goodsType:-1}
//	}
//	db.find("goodsList",
//		{whereObj,
//		sortObj},
//		function(err,goodsList){
//			if(err){
//				res.json({
//					ok:-1,
//					msg:"网络连接错误"
//				})
//			}else{
//				res.json({
//					ok:1,
//					msg:"成功",
//					goodsList,
//					goodsTypeEnum:config.goodsTypeEnum
//				})
//			}
//		})
//})
app.get("/goods",function(req,res){//商品管理获取路由
	var goodsType = req.query.goodsType/1;
	var keyword = req.query.keyword;
	var sort = req.query.sort/1;
	var pageIndex = req.query.pageIndex/1;
	var skip = 0;
	var limit = 0;
	var whereObj = {};
		if(goodsType != 0){//如果goodsType不为0，就按goodsType查找
			whereObj.goodsType = goodsType;
		}
		if(keyword.length >0){//如果search框长度大于0，就添加goodsName搜索条件
			whereObj.goodsName = new RegExp(keyword)
		}
	db.countByType("goodsList",whereObj,function(count){//先按照条件查询出数据总条数
			var pageSum = 1;
			var pageNum = 4;
			pageSum = Math.ceil(count/pageNum);
			if( pageIndex < 1 ){
				pageIndex = 1;
			}
			if(pageSum <= 0 ){
				pageSum = 1;
			}
			if(pageIndex > pageSum){
				pageIndex = pageSum;
			}
			skip=(pageIndex -1)*pageNum;
			limit=pageNum;
//			console.log(skip,pageIndex)
		
		
		var sortObj = {orderBy:-1,addTime:-1};
		if( sort === 1 ){
			sortObj = {goodsType:1}
		}
		if( sort === 2 ){
			sortObj = {goodsType:-1}
		}
		db.find("goodsList",
			{whereObj,
			sortObj,
			skip,
			limit},
			function(err,goodsList){
				if(err){
					res.json({
						ok:-1,
						msg:"网络连接错误"
					})
				}else{
					res.json({
						ok:1,
						msg:"成功",
						goodsList,
						goodsTypeEnum:config.goodsTypeEnum,
						pageIndex,
						pageSum,
						count
					})
				}
			})
		
	})
})
//app.get("/goodsByType/:goodsType",function(req,res){//商品管理分类路由
//	var goodsType = req.params.goodsType/1;
////	console.log(goodsType)
//	if(goodsType === 0){//如果goodsType为0，就全部查找
//		var allType = {};
//	}
//	db.find("goodsList",
//			{whereObj:allType || {goodsType:goodsType},
//			sortObj:{orderBy:-1,addTime:-1}},
//			function(err,goodsList){
//		if(err){
//			res.json({
//				ok:-1,
//				msg:"网络连接错误"
//			})
//		}else{
//			res.json({
//				ok:1,
//				msg:"成功",
//				goodsList,
//				goodsTypeEnum:config.goodsTypeEnum
//			})
//		}
//	})
//})
app.delete("/delgoods/:id",function(req,res){//商品管理删除路由
//	console.log(req.params.id);
	db.findById("goodsList",req.params.id,function(err,result){
//		console.log(result);
		fs.unlink(__dirname+"/upload/"+result.goodsPic,function(err){
			if(err){
				res.json({
					ok:-1,
					msg:"网络连接错误"
				})
			}else{
				db.deleteOneById("goodsList",req.params.id,function(err,esults){
					if(err){
						res.json({
							ok:-1,
							msg:"网络连接错误"
						})
					}else{
						res.json({
							ok:1,
							msg:"删除成功"
						})
					}
				})
			}
		})
	})
})
app.get("/getgoodsByType",function(req,res){//根据类型获取商品图片路由
	var goodsType = req.query.goodsType/1;
	var limit = req.query.limit/1;
	db.find("goodsList",
			{whereObj:{goodsType:goodsType},
			sortObj:{orderBy:-1,addTime:-1},
			limit
		},
		function(err,goodsList){
			if(err){
				res.json({
					ok:-1,
					msg:"网络连接错误"
				})
			}else{
				res.json({
				ok:1,
				msg:"成功",
				goodsList
				})
			}
		}
	)
})

app.get("/goodsInfoById",function(req,res){//根据id获取商品信息路由--辅助修改功能
	db.findById("goodsList",req.query.id,function(err,goodsList){
		if(err){
			res.json({
				ok:-1,
				msg:"网络连接错误"
			})
		}else{
			res.json({
				ok:1,
				msg:"成功",
				goodsList
			})
		}
	})
})
function upGoods(ok,id,params,callback){
	var upObj = {
		goodsName:params.goodsName,
		goodsPrice:params.goodsPrice,
		orderBy:params.orderBy/1,
		goodsType:params.goodsType/1
	}
	if(ok===1){
		db.findById("goodsList",id,function(err,goodsInfo){
			fs.unlink(__dirname+"/upload/"+goodsInfo.goodsPic,function(err){
				upObj.goodsPic = params.newPicPath;
				callback(upObj)
			})
		})
	}else{
		callback(upObj)
	}
}
app.put("/goods/:id",function(req,res){//商品修改路由
	upPic(req,"goodsPic",function(obj){
		if(obj.ok===3){
			res.json({
				ok:-1,
				msg:obj.msg
			})
		}else{
//			console.log(obj.params)
			upGoods(obj.ok,req.params.id,obj.params,function(upObj){
//				console.log(upObj,req.params.id)
				db.updateOneById("goodsList",req.params.id,upObj,function(err){
					res.json({
						ok:1,
						msg:"修改成功"
					})
				})
			})
		}
	})
})
app.listen(8000,function(){
	console.log("success")
})
