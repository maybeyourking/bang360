const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const dbname = "bang";
                                                 
 function connect(cb){
 	mongoClient.connect("mongodb://127.0.0.1:27017",{ useNewUrlParser: true },(err,client)=>{
	if(err){
		console.log("连接数据库失败")
	}else{
		var db = client.db(dbname);
		cb(db);
		}
	})
 }
//添加一条数据
module.exports.insertOne=function(coll,insertObj,cb){
	connect(function(db){
		db.collection(coll).insertOne(insertObj,cb)
	})
}

//insertOne("contentList",{booksname:"安图恩童话",price:35,bookstype:"童话",pushNum:1,bookstitle:[1,2]},(err,results)=>{
//		if(err){
//			console.log("插入失败",err)
//		}else{
//			console.log("插入成功",results)
//		}
//})

//根据条件查找多条数据
module.exports.find=function(coll,info,cb) {
//function find(coll,info,cb){
    connect(function (db) {
        info.whereObj = info.whereObj || {};
        info.sortObj = info.sortObj || {};
        info.limit = info.limit || 0;
        info.skip = info.skip || 0;
        db.collection(coll).find(info.whereObj).sort(info.sortObj).skip(info.skip).limit(info.limit).toArray(cb)
    })
}

//find("contentList",{limit:1},(err,results)=>{
//	console.log(err,results)
//})

//根据集合计数
module.exports.count=function(coll,cb){
	connect(function(db){
		db.collection(coll).countDocuments().then(cb);
	})
}
//根据obj对象中的条件计数
module.exports.countByType=function(coll,obj,cb){
	connect(function(db){
		db.collection(coll).countDocuments(obj).then(cb);
	})
}
//根据id修改一条数据
module.exports.updateOneById = function (coll,id,upObj,cb){
    connect(function (db) {
        db.collection(coll).updateOne({_id:mongodb.ObjectId(id)},{$set:upObj},cb);
    })
}
//根据id删除一条数据
module.exports.deleteOneById = function(coll,id,cb){
	connect(function(db){
		db.collection(coll).deleteOne({_id:mongodb.ObjectId(id)},cb)
	})
}
//根据id查找一条数据
module.exports.findById = function(coll,id,cb){
	connect(function(db){
		db.collection(coll).findOne(
			{_id:mongodb.ObjectId(id)}
		,cb)
	})
}
