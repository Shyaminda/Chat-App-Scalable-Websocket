import { WebSocket, WebSocketServer } from 'ws';
import { createClient } from 'redis';

const publishClient = createClient();
publishClient.connect();

const subscribeClient = createClient();
subscribeClient.connect();

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
            if (oneUserSubscribedToRoom(parsedMessage.room)) { //if the room is not already subscribed by any user, then subscribe to redis channel
                subscribeClient.subscribe(parsedMessage.room, (message) => {
                    const parsedMessage = JSON.parse(message);
                    Object.keys(users).forEach((userId) => {  //iterating over all users who are interested in the room connected by a specific user
                        const { ws,rooms } = users[userId];
                        if (rooms.includes(parsedMessage.roomId)) {
                            ws.send(message);
                        }
                    })
                })
            }
        }

        if (parsedMessage.type === "UNSUBSCRIBE") {
            const roomId = parsedMessage.roomId;
            users[id].rooms = users[id].rooms.filter((room) => room !== roomId); //removing the room from the user
        }

        if(parsedMessage.type === "sendMessage") {
            const message = parsedMessage.message;
            const roomId = parsedMessage.roomId;

        

            publishClient.publish(roomId, JSON.stringify({  //sending the message to redis channel
                type: "sendMessage",
                roomId: roomId,
                message,
            }))
        }
    });
});

function randomId() {
    return Math.random().toString(36).substring(2, 15);
}