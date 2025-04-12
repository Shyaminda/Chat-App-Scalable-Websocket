# 🧩 Scalable WebSocket Chat App with Redis Pub/Sub

## 📌 Overview
A high-performance, scalable chat application leveraging WebSocket communication and Redis Pub/Sub to enable real-time, room-based messaging across multiple server instances. This project demonstrates how to build a horizontally scalable WebSocket server where clients connected to different instances can communicate seamlessly through Redis as a central message broker.

## 🛠️ Tech Stack
- **Node.js** – JavaScript runtime
- **TypeScript** – Type safety and development tooling
- **WebSocket (ws)** – Real-time, bidirectional communication
- **Redis** – Pub/Sub broker for scalability
- **Docker** – Redis containerization (for development)

## 📦 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)

### 2. Start Redis Server
Launch Redis in a Docker container:
```bash
docker run --name redis -d -p 6379:6379 redis
```

### 3. Run Two WebSocket Server Instances
To simulate multiple servers:

#### Terminal 1 (Port 8080)
```bash
PORT=8080 npm run dev
```

#### Terminal 2 (Port 8081)
```bash
PORT=8081 npm run dev
```
> ⚠️ Ensure your server code reads the `PORT` environment variable or update the port manually in `index.ts`.

## 🔁 Message Flow Demo

### Step 1: Connect and Subscribe
Open three WebSocket clients (Postman, Hoppscotch, or browser-based tools).

#### Client A — Connect to `ws://localhost:8080`
```json
{
  "type": "SUBSCRIBE",
  "room": "room1"
}
```

#### Client B — Connect to `ws://localhost:8081`
```json
{
  "type": "SUBSCRIBE",
  "room": "room1"
}
```

### Step 2: Send a Message
#### Client C — Connect to `ws://localhost:8081` and send:
```json
{
  "type": "sendMessage",
  "roomId": "room1",
  "message": "hey cashing"
}
```

### Step 3: Unsubscribe from a Room

If a user wants to leave the chat room:
```json
{
  "type": "UNSUBSCRIBE",
  "room": "room1"
}
```

When subscribing or unsubscribing, the server logs:
```
subscribing on the pub sub to room: room1
unsubscribing from the pub sub from room: room1
```

### ✅ Expected Result
Clients A and B (subscribed to `room1`) will receive the message:
```json
{
  "type": "sendMessage",
  "roomId": "room1",
  "message": "hey cashing"
}
```

## 🧠 Architecture
- **User A** subscribes to a room via Server A (8080)
- **User B** subscribes via Server B (8081)
- A message published by any user is sent to Redis
- Redis distributes the message to all subscribed servers
- Each server forwards it to connected clients subscribed to the room

---

## 📂 Project Structure

All logic is contained in a single `index.ts` file for demonstration simplicity. Modularization is encouraged for production.

---

## 📜 Scripts
```json
"scripts": {
  "dev": "tsc -b && node dist/index.js"
}
```

## 📄 License
This project is licensed under the ISC License.

---



