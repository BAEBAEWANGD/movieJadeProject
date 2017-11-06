var User = require('../models/user.js');
//showSignup
exports.showSignup = function(req, res) {
	res.render('signup',{
			title:'注册页面'
		})
}
//showSignin
exports.showSignin = function(req, res) {
	res.render('signin',{
			title:'登录页面'
		})
}


//signup
exports.signup = function(req,res) {
	//req.param('user');
	var _user = req.body.user;
	console.log(_user);
	User.findOne({name:_user.name}, function(err, user) {
		if(err) {
			console.log(err);
		}
		if(user){   
			return res.redirect("/signin");
		}else {
			var user = new User(_user);
			console.log('success')
			user.save(function(err, user) {
				if(err){
					console.log(err);
				}
				res.redirect("/");
		  })
		}
	})
}

//user list
exports.list = function(req, res){
	User.fetch(function(err,users){
		if(err){
			console.log(err);
		}
		res.render('userlist',{
			title:'imooc 用户列表页',
			users:users
		})
	})
};


//user signin
//
exports.signin = function(req, res) {
	var _user = req.body.user;
	var name = _user.name;
	var password = _user.password;

	User.findOne({name: name}, function(err, user) {
		if(err){
			console.log(err);
		}

		if(!user){
			return res.redirect("/signup");
		}

		user.comparePassword(password,function(err, isMatch) {
			if(err) {
				console.log(err);
			}

			if(isMatch) {
				req.session.user = user; //user work status
				return res.redirect('/')
			}else {
				return res.redirect("/signin");
			}
		})
	})
};

//logout
//
exports.logout = function(req, res) {
	delete req.session.user;
	//delete app.locals.user;在routes中有改动，
	//如果为空值，则将空值赋给本地user，就不用额外的本地删除。

	res.redirect('/');
};

//midware for user
exports.signinRequired = function(req, res,next){
	var user = req.session.user;
	if (!user) {
		return res.redirect('/signin');
	}

	next();
};

exports.adminRequired = function(req, res,next){
	var user = req.session.user;
	if (user.role <= 10) {
		return res.redirect('/signin');
	}

	next();
};