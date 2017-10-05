var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var _ = require('underscore');
var process = require('process');
var Movie = require('./models/movie.js');
var port = process.env.PORT || 2017;
var app = express();

mongoose.connect('mongodb://localhost:27017/imooc',{useMongoClient: true});

app.set('views','./views/pages');
app.set('view engine','jade');
app.use(bodyParser.urlencoded());  //表单数据格式化
app.use(express.static(path.join(__dirname, 'public')));  //静态文件的使用
app.locals.moment = require('moment');
app.listen(port);

//index page
app.get('/',(req, res) => {
	Movie.fetch(function(err,movies){
		if(err){
			console.log(err);
		}
		res.render('index',{
		title:'imooc 首页',
		movies: movies
	    })
	})
});

//detail page
app.get('/movie/:id',(req, res) =>{
	var id = req.params.id;
	Movie.findById(id,function(err,movie){
		if(err){
			console.log(err);
		}
		res.render('detail',{
			title:'imooc ' + movie.title,
			movie: movie
		})
	})
});

//admin page
app.get('/admin/movie',(req, res) =>{
	res.render('admin',{
		title:'imooc 后台录入页',
		movie:{
			title:'',
			doctor:'',
			country:'',
			year:'',
			poster:'',
			flash:'',
			summary:'',
			language:''
		}
	})
});

//admin update movie
app.get('/admin/update/:id',function(req,res){
	var id = req.params.id;
	if(id){
		Movie.findById(id,function(err,movie){
			if(err){
				console.log(err);
			}
			res.render('admin',{
				title:'imooc 后台更新页',
				movie:movie
			})
		})
	}
});

//admin post movie
app.post('/admin/movie/new',function(req,res){
	var id = req.body.movie._id;
	var movieObj = req.body.movie;
	var _movie;
	if(id !== 'undefined'){
		Movie.findById(id,function(err,movie){
			if(err){
				console.log(err);
			}
			_movie = _.extend(movie,movieObj);
			_movie.save(function(err,movie){
				if(err){
					console.log(err);
				}
				res.redirect('/movie/' + movie._id);
			})
		})
	}
	else{
		_movie = new Movie({
			doctor: movieObj.doctor,
			title: movieObj.title,
			country: movieObj.country,
			language: movieObj.language,
			year: movieObj.year,
			poster: movieObj.poster,
			summary: movieObj.summary,
			flash: movieObj.flash
		});
		_movie.save(function(err,movie){
				if(err){
					console.log(err);
				}
				res.redirect('/movie/' + movie._id);
			})
	}
});

//list page
app.get('/admin/list',(req, res) =>{
	Movie.fetch(function(err,movies){
		if(err){
			console.log(err);
		}
		res.render('list',{
			title:'imooc 列表页',
			movies:movies
		})
	})
});
console.log('project started on port ' + port);

 app.delete('/admin/list',function(req,res){
 	var id = req.query.id;
	 if(id){
	 	Movie.remove({_id: id},(err, movie) => {
	 		if(err){
	 			console.log(err);
			}else{
				res.json({success: 1});
			}
		})
	 }
 });