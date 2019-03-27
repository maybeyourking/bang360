function ajax(obj,callback){
	var url = obj.url+"?";
	var arr = [];
	for(var i in obj.data){
		arr.push(i+"="+obj.data[i]);
	}
	url += arr.join("&");
	var xhr = new XMLHttpRequest();
	xhr.open("get",url);
	xhr.send();
	xhr.onload = function(){
		var object = JSON.parse(xhr.responseText);
		if(object.ok ===1){
			callback({
				ok:1,
				msg:"成功",
				object
			})
		}else{
			callback({
				ok:-1,
				msg:"请求错误"
			})
		}
	}
}
ajax({
	url:"/getadvByType",
	data:{
		advType:"2",
		limit:"4"
	}
},function(obj){
	if(obj.ok===1){
//		console.log(obj.object)
		document.querySelector("#underlist").innerHTML = baidu.template("mdunderlist",obj.object)
	}else{
		console.log(obj.msg)
	}
})
ajax({
	url:"/getgoodsByType",
	data:{
		goodsType:"1",
		limit:"5"
	}
},function(obj){
	if(obj.ok===1){
//		console.log(obj.object)
		document.querySelector("#hp-rec-row-right1").innerHTML = baidu.template("mdgoodslist",obj.object)
	}else{
		console.log(obj.msg)
	}
})
ajax({
	url:"/getgoodsByType",
	data:{
		goodsType:"2",
		limit:"5"
	}
},function(obj){
	if(obj.ok===1){
//		console.log(obj.object)
		document.querySelector("#hp-rec-row-right2").innerHTML = baidu.template("mdgoodslist",obj.object)
	}else{
		console.log(obj.msg)
	}
})