const express = require('express');
const { Server } = require("socket.io");
const http = require("http");
require('dotenv').config()
const database = require("./lib/database.js")
const router = require("./lib/router.js") 

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with your frontend URL for production
    methods: ["GET", "POST"]
  }
});

// Attach io instance to app for access in controllers
app.set("io", io);
const port = process.env.PORT || 5000;
app.use(router)

// basic event logging
io.on("connection", (socket) => {
    console.log("A user connected");

    // Suppose client sends their user ID/token after connecting
    socket.on("registerUser", (userID) => {
        socket.join(userID); // join user-specific room
        console.log(`Socket joined room: ${userID}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

database.connect(()=>{
    server.listen(port, ()=>{
        console.log(`Server is listening on port: ${port}`)
    })
})