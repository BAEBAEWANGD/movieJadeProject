var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');

var process = require('process');
var port = process.env.PORT || 2017;
var app = express();
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var connect = require('connect');
var cookieParser = require('cookie-parser');
var dbUrl = 'mongodb://localhost:27017/imooc';
var logger = require('morgan');

mongoose.connect(dbUrl,{useMongoClient: true});

app.set('views','./app/views/pages');
app.set('view engine','jade');
app.use(bodyParser.urlencoded());  //表单数据格式化
app.use(express.static(path.join(__dirname, 'public')));  //静态文件的使用
app.use(cookieParser());
app.use(session({
    secret: 'imooc',
    store: new MongoStore({
    	url: dbUrl,
    	collection: 'sessions'
    })
}));

if('development' === app.get('env')){
	app.set('showStackError',true); //打印错误信息
	app.use(logger(':method :url :status'))
	app.locals.pretty = true;
	mongoose.set('debug', true);
}
app.locals.moment = require('moment');

require('./config/routes.js')(app);
app.listen(port);
console.log('project started on port ' + port);
