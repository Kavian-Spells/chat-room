var express = require('express');
var http = require('http');
var morgan = require('morgan');
var es6Renderer = require('express-es6-template-engine');

var app = express();
var server = http.createServer(app);

var { Server } = require("socket.io");
const exp = require('constants');
var io = new Server(server);

app.engine('html', es6Renderer);
app.set('views', 'templates');
app.set('view engine', 'html');

app.use(morgan('dev'));
app.use('/socket-io', express.static('node_modules/socket.io/client-dist'));
app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);  
    });
    socket.on('join-room', function(room){
        socket.join(room);
        console.log(socket.rooms);
        io.to(room).emit('chat message', '**new user joined**');
       
        socket.on('chat message', function(msg){
          io.to(msg.room).emit('chat message', msg.msg);
        });
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});