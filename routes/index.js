var express = require('express');
var router = express.Router();
var score_addr = "http://kan.msxiaobing.com/Api/ImageAnalyze/Process?service=yanzhi";
var upload_addr = "http://kan.msxiaobing.com/Api/Image/UploadBase64";
var base_addr = "https://mediaplatform.msxiaobing.com";
var uuid = require("uuid");

var http = require('superagent');
var async = require('async');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
    faceScoreMain(req, res);
});

router.post('uploadFile', function(req, res, next){
	getPic(req, res);
});

function faceScoreMain(req, res){
	var imageData;
	var imageUrl;
	var retVal;

	async.series([
			function(cb){
				imageData = base64_encode("./pic.jpg");
				cb();
			},

			function(cb){
				uploadPic(imageData, function(data){
					var json = JSON.parse(data);

					imageUrl = json.Url;

					cb();

				});

			},

			function(cb){
				getFaceScore(imageUrl, function(data){
					retVal = data;
					cb();
				});
				
			},
		], function(){
			res.send(retVal);
		});
}

function uploadPic(imageData, callback) {
    http.post(upload_addr)
        .set("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:33.0) Gecko/20100101 Firefox/33.0")
        .set("Accept-Encoding", "gzip, deflate")
        .set("Accept-Language", "zh-CN,zh;q=0.8,en;q=0.6")
        .set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
        .send(imageData)
        .end(function(err, data){
        	callback(data.text);
        });
}

function getFaceScore(imageUrl, callback){
	var time = new Date().getTime();

	var url = score_addr + "&tid=" + uuid.v4().replace(/-/g, '');
	console.log(url);
	http.post(url)
		.send('MsgId=' + time + '123')
		.send('CreateTime=' + time)
		.send('Content[imageUrl]=' + base_addr + imageUrl)
		.end(function(err, data){
			
			callback(data.text);
		})
}

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

function uploadPic(req, res){
	console.log(res);
}

module.exports = router;
