// app.mjs
import express from "express";
import path from 'path';
import url from 'url';
import {Kaomoji} from "./kaomoji.mjs";
import * as fs from "fs"
import session from "express-session";

const app = express();
const basepath = path.dirname(url.fileURLToPath(import.meta.url));
const publicpath = path.resolve(basepath,"public");
app.use(express.static(publicpath));
app.use(express.urlencoded({extended:false}));
app.use(function(req,res,next){
	console.log(req.method);
	console.log(req.path);
	console.log(req.query);
	next();
});
app.set('view engine', 'hbs');
const sessionOptions = {
	secret: 'session secret',
	resave: true,
	saveUninitialized: true
};
app.use(session(sessionOptions));
/*
app.use(function(req, res, next){
	console.log(req.session);
	next();
});
*/



const kaomojis = [];
app.get("/",function(req, res){
	res.redirect("/editor");
});

app.get("/editor",function(req, res){
	//console.log(req.query);
	if(req.query.input === ""|| req.query.input === undefined){
		res.render("editor");
		return;
	}

	const sentence = req.query.input.trim();
	const words = sentence.split(" ");
	//console.log(words);
	function replaceEach(word, kaomojis){
		kaomojis.forEach((kaomoji) =>{
			//console.log("kaomoji: "+ kaomoji.emotions);
			if(kaomoji.emotions.includes(word)){
				//console.log("True");
				word = kaomoji.value;
			}
		});
		return word;
	}
	const replacedWords = words.map((word)=>replaceEach(word,kaomojis));
	const outputString = replacedWords.join(" ");
	//console.log("Replaced Words: " + replacedWords);
	res.render("editor", {"input":sentence,"output": outputString});
});


app.get("/dictionary",function(req, res){
	//console.log(req.query);
	//console.log("query is" + req.query.emotion);
	if(req.query.queryString === "" || req.query.queryString === undefined /*||req.query.emotion === null */){
		res.render("list", {"kaomojis":kaomojis})
		return;
	}
	const queryString = req.query.queryString;
	//console.log(queryString)
	const filteredkaomojis = kaomojis.filter((kaomoji) => {
		//console.log(kaomoji.emotions);
		return kaomoji.emotions.includes(queryString);
	});
	//console.log(filteredkaomojis);
	res.render("list", {"kaomojis": filteredkaomojis});
	//console.log(kaomojis);
});

app.post("/dictionary",function(req, res){
	const emotions = req.body.emotions;
	const value = req.body.value;
	const newKaomoji = new Kaomoji(value,emotions);
	kaomojis.push(newKaomoji);
	if(Object.hasOwn(req.session, "count")){
		req.session.count +=1;
	}else{
		req.session["count"] = 1;
	}
	//console.log(req.session);
	//res.render("dictionary", {"kaomojis": filteredkaomojis});
	res.redirect("/dictionary");
});

app.get("/stats", function(req, res){
	let count = 0;
	if(Object.hasOwn(req.session, "count")){
		count = req.session.count;
	}
	res.render("count", {"count":count});
});

fs.readFile("code-samples/kaomojiData.json", (err, data) =>{
	if(err){
		console.log(err);
		return;
	}
	const jsonData = JSON.parse(data);
	function parseAdd(row){
		const {emotions, value} = row;
		const kaomoji = new Kaomoji(value,emotions);
		//console.log(kaomoji);
		kaomojis.push(kaomoji);
	}
	jsonData.forEach(parseAdd);
	//console.log(jsonData);
	console.log(kaomojis);
	app.listen(3000);
});




console.log("Server started; type CTRL+C to shut down ");