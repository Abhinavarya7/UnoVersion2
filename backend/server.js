const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = 3000;

// Create an HTTP server and attach socket io
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Default route to serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

let rooms = {};

function roomCodeGenerator(){
    let randomCode;
    while(!randomCode || randomCode in rooms){
        randomCode = String(Math.floor(Math.random()*100));
    }
    return randomCode;
}

io.on('connection', client => {
    client.emit('connected', { data: 'New Player Connected'});

    client.on('createRoom', (data) => {
        let roomCode = roomCodeGenerator();
        client.join(roomCode);

        // Update the rooms object
        if (!rooms[roomCode]) {
            rooms[roomCode] = {};
        }
        rooms[roomCode][data.host] = client.id;
        rooms[roomCode]['host'] = client.id; 

        // Broadcast to the room
        // io.to(roomCode).emit('player_list_update', client.id);

        // Emit the room details to the client
        client.emit('createRoom', { roomPlayers: Object.keys(rooms[roomCode]), roomCode: roomCode });
    });

    client.on('joinRoom', (data)=>{
        if(!rooms[data.code]){
            return;
        }

        client.join(data.code);
        rooms[data.code][data.player] = client.id;
        io.to(data.code).emit('player_list_update', { players: Object.keys(rooms[data.code]), roomCode: data.code });
    })

    client.on('leaveRoom', (data) => {
        for (const roomCode in rooms) {
            if (rooms[roomCode][data.player] === client.id) {
                client.emit('redirect_to_index');
                delete rooms[roomCode][data.player];
                client.leave(roomCode);
                io.to(roomCode).emit('player_list_update', { players: Object.keys(rooms[roomCode]), roomCode: roomCode });
                break;
            }
        }
    });

    client.on('disconnect', () => {
    console.log("User disconnected:", client.id);

    for (const roomCode in rooms) {
        for (const player in rooms[roomCode]) {

            if (rooms[roomCode][player] === client.id) {

                delete rooms[roomCode][player];

                // 🔥 notify remaining players
                io.to(roomCode).emit('player_list_update', {
                    players: Object.keys(rooms[roomCode]),
                    roomCode: roomCode
                });

                // 🔥 optional: delete empty room
                const remainingPlayers = Object.keys(rooms[roomCode]).filter(p => p !== 'host');

                if (remainingPlayers.length === 0) {
                    delete rooms[roomCode];
                    console.log("Room deleted:", roomCode);
                }

                break;
            }
        }
    }
});

});

const isGameStarted = false;

