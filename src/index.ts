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
            console.log("subscribing on thr pub sub to room: ", parsedMessage.room);
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
            users[id].rooms = users[id].rooms.filter((room) => room !== parsedMessage.room); //removing the room from the user

            if (lastPersonLeftRoom(parsedMessage.roomId)) {
                console.log("unsubscribing from the pub sub from room: ", parsedMessage.room);
                subscribeClient.unsubscribe(parsedMessage.roomId); //if the user is the last person left in the room, then unsubscribe from redis channel
            }
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

function oneUserSubscribedToRoom(roomId: string) {   //checking if any user is subscribed to the room
    let totalInterestedUsers = 0;
    Object.keys(users).map((userId) => {
        if(users[userId].rooms.includes(roomId)) {
            totalInterestedUsers++;
        }
    })

    if (totalInterestedUsers == 1) {
        return true; //if no user is subscribed to the room, then return true
    }

    return false; //if already a user subscribed to the room then return false
}

function lastPersonLeftRoom(roomId: string) {
    let totalInterestedUsers = 0;
    Object.keys(users).map((userId) => {
        if(users[userId].rooms.includes(roomId)) {
            totalInterestedUsers++;
        }
    })

    if (totalInterestedUsers == 0) {
        return true;
    }

    return false;
}

function randomId() {
    return Math.random().toString(36).substring(2, 15);
}