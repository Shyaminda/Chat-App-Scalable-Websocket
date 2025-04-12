import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(userSocket) {
    userSocket.on('error', console.error);

    userSocket.on('message', function message(data) {
        console.log('received: %s', data);
        userSocket.send('you sent me' + data);
    });
});