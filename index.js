
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var express  = require('express');
var expressHbs = require('express3-handlebars');
var bodyParser = require("body-parser");

var db = require('./database');

var hbs = expressHbs.create({
    helpers: {
        json: function(context) {
            return JSON.stringify(context);
        }
    },
    layoutsDir: 'views/layouts/',
    defaultLayout: 'main_layout.html',
});

app.engine('html', hbs.engine);
app.set('view engine', 'html');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
})); 

var connectionString = process.env.DATABASE_URL;
db.Init(connectionString);


app.get('/ready', function(req, res){
    res.render('ready');
});

app.get('/nulmeting', function(req, res){
    res.render('nulmeting');
});

app.get('/map', function(req, res){
    res.render('map');
});

app.get('/', function(req, res){
    res.render('splash', {layout: null});
});

app.get('/login', function(req, res){
    db.GetTrainers(function(trainers){
        res.render('login', { trainers: trainers, test: 1});
    });
});

app.post('/loginRequest', function(req, res){
    var trainerId = req.body.trainerId;
    var trainerPassword = req.body.password;
    
    db.ValidateLogin(trainerId, trainerPassword, function(valid){
        if(!valid){
            return res.send({valid: false, message: "Password incorrect!"});
        }else{
            return res.send({valid: true, message:"Correct!", redirect: "/rehabilitants"});
        }
    });
});

io.on('connection', function(socket){
	socket.on('requestID', function(){
		console.log("ID is requested");

		var id_num = 1; // ID van device
        var firstname = "Maikel";
		io.emit("receiveID", { device_id: id_num, user_id: firstname});
	})

    socket.on("pressedStart", function(data){
        io.emit("startGame");
    })

    socket.on("updateWaterpas", function(data){
        io.emit("waterpas", data);
        console.log(data);
    })

	socket.on("dataTransfer", function(data){
		//console.log(data);
		io.sockets.emit("dataClient",data);
	});
	
socket.on('disconnect',function(data){
		io.sockets.emit('disconnect','disconnected');
		console.log('disconnect');
	});

});

app.get('/rehabilitants', function(req, res){
    db.GetRehabilitants(function(rehabilitants){
        res.render('rehabilitants', { model: rehabilitants });
    });
});


var port = process.env.PORT || 5000;

http.listen(port, function(){
  console.log('Server is Online');
});

