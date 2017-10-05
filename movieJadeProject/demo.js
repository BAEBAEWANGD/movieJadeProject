const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/imooc');
const Cat = mongoose.model('Cat',{
	name: String,
	friends: [String],
	age: Number
});
const demo = new Cat({name:'wangjuan',friends:['Tom','Jack']});
demo.age = 19;
demo.save((err) => {
	if(err){
		console.log(err);
	}
});