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
        client.emit('createRoom', { roomPlayers: Object.keys(rooms[roomCode]), roomCode: roomCode, host: rooms[roomCode]['host'] });
    });

    client.on('joinRoom', (data)=>{
        if(!rooms[data.code]){
            return;
        }

        client.join(data.code);
        rooms[data.code][data.player] = client.id;
        io.to(data.code).emit('player_list_update', { players: Object.keys(rooms[data.code]), roomCode: data.code, host: rooms[data.code]['host'] });
    })

    client.on('leaveRoom', (data) => {
        for (const roomCode in rooms) {
            if (rooms[roomCode][data.player] === client.id) {
                client.emit('redirect_to_index');
                delete rooms[roomCode][data.player];
                client.leave(roomCode);
                io.to(roomCode).emit('player_list_update', { players: Object.keys(rooms[roomCode]), roomCode: roomCode, host: rooms[roomCode]['host'] });
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
                    roomCode: roomCode,
                    host: rooms[roomCode]['host']
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

    client.on('startGame', ()=>{
        const roomsOfClient = Array.from(client.rooms);

        console.log("roomsOfClient:", roomsOfClient); // 🔥 ADD THIS

        const roomID = roomsOfClient.find(room => room !== client.id);

        let players = distributeCards(cards, 4);
        let lastPlayedCard = drawRandomCard();

        if(roomID){
            console.log("Emitting to:", roomID); // 🔥 ADD THIS
            io.to(roomID).emit('gameStarted', {players:players, cards:cards, playerNames: Object.keys(rooms[roomID]).filter(p => p !== 'host'), lastPlayedCard:lastPlayedCard});
        }
        else {
            console.log("not found");
        }
    });

});













// gameplay part

// Array to hold all card names
const cards = [];

// Define card properties
const colors = ["R", "Y", "G", "B"];
const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const actionCards = ["skip", "_", "D2"];
const wildCards = ["W", "D4W"];

// Generate number cards
colors.forEach(color => {
    numbers.forEach((number, index) => {
        cards.push(`${number}${color}`); // Add one card for each number
        if (index !== 0) { // Add a second card for numbers 1-9
            cards.push(`${number}${color}`);
        }
    });

    // Generate action cards
    actionCards.forEach(action => {
        cards.push(`${action}${color}`);
        cards.push(`${action}${color}`); // Add two of each action card
    });
});

// Add wild cards
wildCards.forEach(wild => {
    for (let i = 0; i < 4; i++) {
        cards.push(wild);
    }
});

// Function to distribute cards to players
function distributeCards(cards, numPlayers) {
    const players = Array.from({ length: numPlayers }, () => []);

    for (let i = 0; i < numPlayers; i++) {
        for (let j = 0; j < 7; j++) {
            const randomIndex = Math.floor(Math.random() * cards.length);
            players[i].push(cards[randomIndex]);
            cards.splice(randomIndex, 1); // Remove the card from the deck
        }
    }

    return players;
}


function drawRandomCard() {
    if (cards.length === 0) {
        console.log('No more cards to draw.');
        return;
    }
    let randomIndex=Math.floor(Math.random() * cards.length);
    // Get a random index from the cards array
    while(cards[randomIndex][0]==='_' || cards[randomIndex][0]==='D' || cards[randomIndex][0]==='W' || cards[randomIndex][0]==='s'){
        randomIndex = Math.floor(Math.random() * cards.length);
    }
    console.log(`Random index: ${randomIndex}, Card at index: ${cards[randomIndex]}`);
    // Remove the card from the array and store it in lastPlayedCard
    lastPlayedCard = cards.splice(randomIndex, 1)[0];
    console.log(`Card drawn: ${lastPlayedCard}`);

    return lastPlayedCard;

    // Display the last played card in the Cards Played flexbox
    const cardsPlayedDiv = document.querySelector('.cards-played');
    cardsPlayedDiv.innerHTML = `<img src="CardsFront/${lastPlayedCard}.png" alt="${lastPlayedCard}" style="width: 40%; height: 80%;">`;

}