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

        if(parsedMessage.type === "SUBSCRIBE") {
            users[id].rooms.push(parsedMessage.room); //storing the room that the user want to subscribe to in users
        }

        if(parsedMessage.type === "sendMessage") {
            const message = parsedMessage.message;
            const roomId = parsedMessage.roomId;

            Object.keys(users).forEach((userId) => {  //iterating over all users who are interested in the room connected by a specific user
                const { ws,rooms } = users[userId];
                if (rooms.includes(roomId)) {
                    ws.send(message);
                }
            })
        }
    });
});

function randomId() {
    return Math.random().toString(36).substring(2, 15);
}