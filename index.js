var http = require('http'); // http модуль
var fs = require('fs'); // модуль для работы с файловой системой
var url = require('url'); // 
var ws = require('ws');

///// HTTP SERVER /////
var server = new http.Server();
server.on('request', (req, res) => {
    let urlObj = url.parse(req.url, true);
    fs.readFile('./public/index.html', (err, data) => {
        res.end(data);
    });
})
server.listen(5000);


///// WEB SOCKET SERVER /////
var clients = {};
var messages = require('./data/messages');
var counter = 0;

var wss = new ws.Server({port: 5555});

wss.on('connection', (wsc, request) => {
    let id = counter++;
    clients[id] = wsc;

    wsc.on('message', (message) => {
        messages.push(JSON.parse(message));
        for (let cid in clients) {
            let client = clients[cid];
            client.send(JSON.stringify({
                type: 'message',
                message
            }));
        }
    });

    wsc.on('close', () => {
        console.log('connect close');
        // clearInterval(timer);
        delete clients[id];

    })

    wsc.send(JSON.stringify({
        type: 'messages',
        messages
    }));
})

setInterval(() => {
    fs.writeFile('./data/messages.json', JSON.stringify(messages), (err) => {if (err) console.log('error',err)});
}, 1000);