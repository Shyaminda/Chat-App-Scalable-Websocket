import { WebSocket, WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const users: {[key: string]: {
    ws: WebSocket,
    rooms: string[]
}} = {};

wss.on('connection', function connection(userSocket) {
    const id = randomId();
    users[id] = {
        ws: userSocket,
        rooms: []
    };

    userSocket.on('message', function message(data) {
        const parsedMessage = JSON.parse(data.toString());
    });
});

function randomId() {
    return Math.random().toString(36).substring(2, 15);
}