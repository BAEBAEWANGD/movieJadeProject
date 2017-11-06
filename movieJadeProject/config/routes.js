var Index = require('../app/controllers/index.js');
var User = require('../app/controllers/user.js');
var Movie = require('../app/controllers/movie.js');
var Comment = require('../app/controllers/comment.js')

module.exports = function(app){
	//会话持久预处理
	//
	app.use(function(req, res, next) {
		var _user = req.session.user;
		app.locals.user = _user;
		next();
	})

	//Index page
	app.get('/',Index.index);

    //User
	//signup
	app.post('/user/signup', User.signup)
	//signin
	app.post('/user/signin', User.signin);
	app.get('/signin', User.showSignin);
	app.get('/signup', User.showSignup);
	//user list
	app.get('/admin/user/list', User.signinRequired, User.adminRequired, User.list);
	//logout
	app.get('/logout', User.logout);

     //Movie
	//detail page
	app.get('/movie/:id', Movie.detail);
	//admin page
	app.get('/admin/movie/new', User.signinRequired, User.adminRequired, Movie.new);
	//admin update movie
	app.get('/admin/movie/update/:id', User.signinRequired, User.adminRequired, Movie.update);
	//admin post movie
	app.post('/admin/movie', User.signinRequired, User.adminRequired, Movie.save);
	//list page
	app.get('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.list);
	app.delete('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.del);


	//Comment
	app.post('/user/comment', User.signinRequired, Comment.save)
}