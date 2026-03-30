// const socket = window.socket;

socket.on('gameStarted', (data)=>{
    preGameScreen.style.display='none';
    gameScreen.style.display='flex';
    
    console.log("displayCards function is being called");
    displayCards(data.players, data.cards, data.playerNames);
    // Display the last played card in the Cards Played flexbox
    const cardsPlayedDiv = document.querySelector('.cards-played');
    cardsPlayedDiv.innerHTML = `<img src="CardsFront/${data.lastPlayedCard}.png" alt="${data.lastPlayedCard}" style="width: 40%; height: 80%;">`;
    console.log("displayed the cards");
})

function displayCards(players, cards, playerNames) {
    // Get player containers
    const playerContainers = [
        document.querySelector('.player1'),
        document.querySelector('.player2'),
        document.querySelector('.player3'),
        document.querySelector('.player4')
    ];

    // Display cards for each player
    players.forEach((playerCards, index) => {
        const container = playerContainers[index];
        container.innerHTML = ''; // Clear existing content
        const playername = document.createElement('h2');
        const text = document.createTextNode(playerNames[index]);
        playername.appendChild(text);
        playername.style.textAlign = 'center';
        playername.style.width = '100%';
        playername.style.padding = '1%';
        playername.style.margin = '0';
        container.appendChild(playername);
        playerCards.forEach(card => {
            const img = document.createElement('img');
            img.src = `CardsFront/${card}.png`;
            img.alt = card;
            img.style.width = '20%';
            img.style.margin = '1px';
            container.appendChild(img);

            // Add click event listener to each card image
            img.addEventListener('click', () => {
                onCardClick(card, index);
            });
        });
    });

    // Display remaining cards in the card source
    const cardSourceContainer = document.querySelector('.center-container .center-card:nth-child(2)');
    cardSourceContainer.innerHTML = ''; // Clear existing content
    const img = document.createElement('img');
    img.src = `card-back.png`;
    img.alt = "card-back";
    img.style.width = '40%';
    img.style.margin = '2px';
    cardSourceContainer.appendChild(img);

    // Add click event listener to the card source
    img.addEventListener('click', () => {
        onDrawCardClick(currentPlayer);
    });
}