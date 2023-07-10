const messageEl = document.getElementById("message-el")
const errEl = document.getElementById("err-el")
const betAmountEl = document.getElementById("bet-amount-el")
const cashAmountEl = document.getElementById("cash-amount-el")
const buttonsEl = document.getElementById("buttons")
const dealerDeckEl = document.getElementById("dealer-deck")
const playerDeckEl = document.getElementById("player-deck")
let inputEl = null

let dealerDeck = []
let playerDeck = []
let gameOngoing = true
let dealerSum = 0
let playerSum = 0
let playerAmount = 1000
let betAmount = 300

// Model
/**
 * Validates the bet amount.
 */
const checkBet = () => {
    let errMsg = null
    clearTimeout(errMsg)
    errEl.style.display = 'block'
    errEl.textContent = ""
    betAmount = Math.floor(inputEl.value)
    // bet amount must be between 5 and 500
    if (betAmount >= 5 && betAmount <= 500 && betAmount <= playerAmount) {
        playerAmount -= betAmount
        startGame()
    } else {
        // render error message
        if (betAmount < 5 && betAmount > 500) {
            errEl.textContent = "Bet amount must be between 5 and 500"
        } else {
            errEl.textContent = "Bet amount must not exceed your current amount"
        }
        errMsg = setTimeout(()=>{
            errEl.style.display = 'none'
        }, 5000)
    }
}

/**
 * Calculates the current sum of deck.
 * @param {Array<string>} deck - dealer or player's deck.
 * @returns {number} the sum of deck
 */
const matchValue = (deck) => {
    let sum = 0
    let hasAce = false
    deck.forEach((card)=>{
        // get the first character
        const cardNum = card.slice(0,1)
        // convert the card to its corresponding number except 'A'
        if (cardNum === 'A') {
            hasAce = true
        } else if (cardNum === 'J' || cardNum === 'Q' || cardNum === 'K') {
            sum += 10
        } else {
            sum += parseInt(card)
        }
    })
    // check if 'A' should be 1 or 11
    if (hasAce) {
        if (sum + 11 > 21) {
            sum += 1
        } else {
            sum += 11
        }
    }
    return sum
}

/**
 * Determines the message to be displayed during the end of game.
 * @returns {string} The message to be displayed.
 */
const checkWinning = () => {
    let message = null
    // when both player & dealer has the same sum OR exceed 21
    if (playerSum === dealerSum || dealerSum > 21 && playerSum > 21) {
        message = "It's a tie!"
        playerAmount += betAmount
    // when player gets 21 but dealer does not get 21
    } else if (playerSum === 21) {
        message = "Congratulations! You win!"
        playerAmount += Math.floor(betAmount*3/2) + betAmount
    // when dealer exceeds 21
    } else if (dealerSum > 21) {
        message = "Congratulations! You win!"
        playerAmount += betAmount*2
    } else {
        if (playerSum > dealerSum && playerSum < 21) {
            message = "Congratulations! You win!"
            playerAmount += betAmount*2
        } else {
            message = "You lost to the dealer!"
        }
    }
    return message
}

/**
 * Update the sum of dealer's deck and player's deck respectively.
 */
const checkValue = () => {
    const decks = [dealerDeck, playerDeck]
    // total the sum of dealer cards, sum of player cards
    for (let i=0; i<2; i+=1) {
        const total = matchValue(decks[i])
        if (i===0) {
            dealerSum = total
        } else {
            playerSum = total
        }
    }
    console.log(dealerSum)
    console.log(playerSum)
}

/**
 * Generates random card.
 * @param {Array<string>} deck - dealer or player's deck.
 */
const randomiseCard = (deck) => {
    const numbers = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    const symbols = ['C', 'D', 'H', 'S']
    // randomise card
    let cardNum = numbers[Math.floor(Math.random()*numbers.length)]
    let cardSymbol = symbols[Math.floor(Math.random()*symbols.length)]
    let card = `${cardNum}-${cardSymbol}`
    // check if the card has already been taken
    while (dealerDeck.includes(card) || playerDeck.includes(card)) {
        cardNum = numbers[Math.floor(Math.random()*numbers.length)]
        cardSymbol = symbols[Math.floor(Math.random()*symbols.length)]
        card = `${cardNum}-${cardSymbol}`
    }
    // add the card to the dealer or player's deck
    deck.push(card)
}

// View
/**
 * Renders home page.
 */
const renderHome = () => {
    buttonsEl.innerHTML = ""
    messageEl.textContent = "Want to play a round?"
    dealerDeckEl.innerHTML = ""
    playerDeckEl.innerHTML = ""
    // create home button
    const startGameBtn = document.createElement("button")
    startGameBtn.textContent = "START GAME"
    buttonsEl.appendChild(startGameBtn)
    
    startGameBtn.addEventListener('click', ()=>{
        checkBet()
    })

    // update player's cash amount
    cashAmountEl.textContent = "Your Amount: $" + playerAmount
    // ask for input on bet amount
    betAmountEl.innerHTML = `Bet: $<input id="input-el" class="input-el" type="number" value=${betAmount} min="5" max="500" step="5">`
    inputEl = document.getElementById("input-el")
}

/**
 * Renders game state.
 */
const renderGame = () => {
    buttonsEl.innerHTML = ''
    messageEl.innerHTML = ''
    // create NEW CARD button
    const newCardBtn = document.createElement('button')
    newCardBtn.textContent = "NEW CARD"
    buttonsEl.appendChild(newCardBtn)
    // create STAND button
    const standBtn = document.createElement('button')
    standBtn.textContent = "STAND"
    buttonsEl.appendChild(standBtn)
    // display player's current amount
    cashAmountEl.textContent = `Your Amount: $${playerAmount}`
    // display bet amount
    betAmountEl.textContent = `Bet: $${betAmount}`

    newCardBtn.addEventListener('click', ()=>{
        addNewCard()
    })

    standBtn.addEventListener('click', ()=>{
        endGame()
    })
}

/**
 * Renders cards view.
 */
const renderCards = () => {
    dealerDeckEl.innerHTML = ''
    playerDeckEl.innerHTML = ''
    // render dealer deck
    const dealer = document.createElement("p")
    dealer.textContent = "Dealer:"
    dealerDeckEl.appendChild(dealer)

    if (gameOngoing) {
        for (let i=0; i<dealerDeck.length; i+=1) {
            const finalCard = document.createElement("img")
            finalCard.className = "card-el"
            // show the second card
            if (i===1) {
                finalCard.src = `cards/${dealerDeck[i]}.png`
            } else {
                finalCard.src = "cards/BACK.png"
            }
            dealerDeckEl.appendChild(finalCard);
        }
    } else {
        // show all the cards
        dealerDeck.forEach((card)=>{
            const finalCard = document.createElement("img")
            finalCard.className = "card-el"
            finalCard.src = `cards/${card}.png`;
            dealerDeckEl.appendChild(finalCard);
        })
    }
    const player = document.createElement("p")
    // render player deck
    player.textContent = "Player:"
    playerDeckEl.appendChild(player)
    playerDeck.forEach((card)=>{
        const finalCard = document.createElement("img")
        finalCard.className = "card-el"
        finalCard.src = `cards/${card}.png`;
        playerDeckEl.appendChild(finalCard);
    })

    checkValue(playerSum, playerDeck)
}

/**
 * Renders the state when game has ended.
 * @param {String} message - Message to be displayed.
 */
const renderEndGame = (message) => {
    // display the message according to final deck
    messageEl.textContent = message
    buttonsEl.innerHTML = ""
    // create home button
    const homeBtn = document.createElement("button")
    homeBtn.textContent = "HOME"
    buttonsEl.appendChild(homeBtn)

    homeBtn.addEventListener('click', ()=>{
        renderHome()
    })
}

// Controller
/**
 * Initialises the game.
 */
const startGame = () => {
    gameOngoing = true
    dealerDeck = []
    playerDeck = []
    // initialise the game UI
    renderGame()
    // distribute cards to the dealer and player
    for (let i=0; i<2; i+=1) {
        randomiseCard(dealerDeck)
        randomiseCard(playerDeck)
    }
    renderCards()
}

/**
 * Adds new card to the player's deck.
 */
const addNewCard = () => {
    randomiseCard(playerDeck)
    renderCards()
    // end the game when player has a sum of 21 or above
    if (playerSum > 21) {
        endGame()
    }
}

/**
 * Handles dealer's moves after player has concluded their deck.
 */
const endGame = () => {
    gameOngoing = false
    // reveal the dealer's cards
    messageEl.textContent = "Revealing the cards..."
    // remove NEW CARD and STAND buttons
    buttonsEl.innerHTML = ""
    let count = 3
    let countdownInterval= null

    // create countdown from 3 to 1
    const countdown = (resolve) => {
        if (count === 0) {
            clearInterval(countdownInterval);
            resolve(); // Resolve the promise when the countdown is complete
        } else {
            messageEl.textContent = `${count}...`;
            count -= 1;
        }
    }

    const countdownPromise = new Promise((resolve) => {
        countdownInterval = setInterval(() => {
            countdown(resolve); // Pass the resolve function to the countdown function
        }, 1000);
    })

    countdownPromise.then(() => {
        renderCards()
        dealerMove()
    })
}

/**
 * Handles the logic of dealer drawing the cards.
 */
const dealerMove = () => {
    // sum of dealer cards must be 17 or above
    if (dealerSum < 17) {
        messageEl.textContent = "Dealer is drawing a card..."
        randomiseCard(dealerDeck)
        // set a timeout for 5 seconds for when dealer is taking a card
        setTimeout(()=>{
                renderCards()
                // checkValue()
                dealerMove()
            }, 4000)
    } else {
        renderEndGame(checkWinning());
    }
}

renderHome()