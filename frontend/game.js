// const socket = window.socket;

socket.on('gameStarted', (data) => {
    preGameScreen.style.display = 'none';
    gameScreen.style.display = 'flex';

    console.log("displayCards function is being called");

    displayCards(
        data.yourCards,
        data.players,
        data.yourIndex
    );

    // Last played card
    const cardsPlayedDiv = document.querySelector('.cards-played');
    cardsPlayedDiv.innerHTML = `
        <img src="CardsFront/${data.lastPlayedCard}.png" 
        style="width: 40%; height: 80%;">
    `;

    console.log("displayed the cards");
});

function displayCards(yourCards, playersInfo, yourIndex) {

    const playerContainers = [
        document.querySelector('.player1'),
        document.querySelector('.player2'),
        document.querySelector('.player3'),
        document.querySelector('.player4')
    ];

    playersInfo.forEach((player, index) => {

        const container = playerContainers[index];
        container.innerHTML = '';

        // Player name
        const playername = document.createElement('h2');
        playername.textContent = player.name;
        playername.style.textAlign = 'center';
        container.appendChild(playername);

        if (index === yourIndex) {
            // 🔥 SHOW REAL CARDS (ONLY YOURS)

            yourCards.forEach(card => {
                const img = document.createElement('img');
                img.src = `CardsFront/${card}.png`;
                img.style.width = '20%';

                img.addEventListener('click', () => {
                    onCardClick(card, index);
                });

                container.appendChild(img);
            });

        } else {
            // 🔥 SHOW BACKSIDE FOR OTHERS

            for (let i = 0; i < player.count; i++) {
                const img = document.createElement('img');
                img.src = `card-back.png`;
                img.style.width = '20%';
                container.appendChild(img);
            }
        }
    });

    // Center deck
    const cardSourceContainer = document.querySelector('.center-container .center-card:nth-child(2)');
    cardSourceContainer.innerHTML = '';

    const img = document.createElement('img');
    img.src = `card-back.png`;
    img.style.width = '40%';

    img.addEventListener('click', () => {
        onDrawCardClick();
    });

    cardSourceContainer.appendChild(img);
}