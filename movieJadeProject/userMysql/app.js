const express = require('express');
const bodyParser = require('body-parser');
const util = require('util');
const path = require('path');
const mysql = require('mysql');
//密码的加密及比对
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const SALT_WORK_FOCTOR = 10;
const Store = require('express-mysql-session');
const logger = require('morgan');

const  port = process.env.PORT || 3000;
const app = express();
const db_config = {
	host: 'localhost',
	user: 'root',
	password: '19971012',
	database: 'imooc',
	port: 3306

};

app.set('views', './views/pages');
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded()); //表单数据格式化
app.use(express.static(path.join(__dirname, 'public'))); //静态文件的使用
//预处理
app.use(cookieParser());
app.use(session({
	secret: 'imooc',
	store: new Store(db_config)

}))
app.use(function(req, res, next) {
		const _user = req.session.user;
		if(_user){
			app.locals.user = _user;//传入当前变量到界面
		}

		next();
	})

//创建mysql连接
const connection = mysql.createConnection(db_config);

connection.connect((err) => {
	if(err){
		console.log(err);
	}

	console.log('mysql connect succeed~~~~');
	//创建users表
	const TABLE = 'CREATE TABLE IF NOT EXISTS users(id INT PRIMARY KEY AUTO_INCREMENT,username VARCHAR(255),password VARCHAR(255),createtime datetime DEFAULT CURRENT_TIMESTAMP);'
	connection.query(TABLE, (err, result) =>{
		if(err){
			throw err;
		}
		console.log('创建表单成功');
	})
});

//到跟目录访问页面
app.get('/',function(req, res) {

	console.log('user in session: ');
    console.log(req.session.user);
    const comment = `CREATE TABLE IF NOT EXISTS comments(id INT PRIMARY KEY AUTO_INCREMENT,username VARCHAR(255),content VARCHAR(255),createtime datetime DEFAULT CURRENT_TIMESTAMP,reply VARCHAR(255),who VARCHAR(255),toname VARCHAR(255));`;
	connection.query(comment, (err, result) => {
		if(err){
			throw err;
		}else {
			console.log('create comment table succeed~~~');
		}
	});

    const queryUser = `SELECT * FROM comments`;
		connection.query(queryUser, (err,comments) => {
			if(err) {
				console.log(err);
			}
			console.log(comments);
			res.render('root', {
				title: '用户登录界面',
				comments: comments
			});
		})
});

//注册设置
app.post('/user/signup', function(req, res) {
	const _user = req.body.user;
	let query = 'SELECT * FROM users WHERE FIND_IN_SET(' + connection.escape(_user.name) + ',username);';
	connection.query(query,(err,result) => {
		if(err){
			throw err;
		}
		if(result.length === 0){
			bcrypt.hash(_user.password,SALT_WORK_FOCTOR, (err, hash) => {
				if(err) {
					console.log(err)
				}
				_user.password = hash;//密码加密

				connection.query('INSERT INTO users SET ?',{
					username: _user.name,
					password: _user.password
				}, (err, result) => {
					if(err){
						throw err;
					}
					console.log('成功插入记录');
				})
			})
		}else{
			console.log('用户已存在，请登录....');
		}

	});  
	res.redirect('/signin');
});

//登录设置
app.post('/user/signin',(req, res) => {
	const _user = req.body.user;
	let query = 'SELECT * FROM users WHERE FIND_IN_SET(' + connection.escape(_user.name) + ',username);';
	connection.query(query, (err, result) => {
		if(err) {
			 console.log(err);
		}
		if(result.length !== 0){
			bcrypt.compare(_user.password, result[0].password, (err, isMatch) => {
				if(err){// 若用户名不对，会导致参数undefined
					console.log(err);
				}
				if(isMatch){
					req.session.user = result[0];
					if(result[0].id < 10){
						return res.redirect('/');
					}else{
						console.log('管理员登录！！！');
						return res.redirect('/userlist')
					}
				}else {
					console.log('密码或用户名不正确。');
					res.redirect('/signin');
				}
				
			})
		}else {
			console.log('用户不存在，请注册～～～');
			res.redirect('/signup');
		}
	})
})


//登录页面
app.get('/signin', (req, res) => {
	res.render('signin', {
		title: '用户登录界面'
	});
});
//注册界面
app.get('/signup', (req, res) => {
	res.render('signup', {
		title: '用户注册界面'
	});
})

app.get('/logout', (req, res) => {
	delete req.session.user;
	delete app.locals.user;
	res.redirect('/');
})

app.get('/userlist', (req, res) => {
	const user = req.session.user;
	if(user.id < 10){
		console.log('非管理员不能访问！！');
		res.redirect('/');
	}else {
		const userList = 'SELECT * FROM users';
		connection.query(userList, (err, results) => {
			res.render('userlist', {
				title: "用户列表",
				users: results
			 })
		})
	}
})

//comment
app.post('/user/comment', (req, res) => {
	const _comment = req.body.comment;
	console.log(_comment);
	const user = req.session.user;
	let submit = '';
	if(user) {
		if(_comment.toname){//缺陷：只能一个人回复
			 submit =  `UPDATE comments SET toname="${_comment.toname}",reply="${_comment.content}",who="${_comment.who}" WHERE id="${_comment.tid}";`;
		}else {
			 submit = `INSERT INTO comments SET username="${user.username}",content="${_comment.content}",who=NULL,reply=NULL,toname=NULL;`;
		}
		connection.query(submit, (err,result) => {
			if(err) {
				console.log(err);
			}
		})
		res.redirect('/');
	}else {
		console.log('please log in !!!!');
		res.redirect('/signin');
	}
})
if('development' === app.get('env')){
	app.set('showStackError',true); //打印错误信息
	app.use(logger(':method :url :status'));//控制台显示的信息
	app.locals.pretty = true;//代码不压缩
}
app.locals.moment = require('moment');

app.listen(port);
console.log('project start on port: ' + port);