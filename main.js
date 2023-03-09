/*let jugador1 = prompt("Quiene son?");
let jugador2 = prompt("Contra quiene?")
*/
document.getElementById('jugador1')

// Select the input elements, add score buttons, reset button, and score list
const player1Score = document.querySelector('.player1 .score');
const player2Score = document.querySelector('.player2 .score');
const addButtons = document.querySelectorAll('.add');
const resetButton = document.querySelector('.reset');
const scoreList = document.querySelector('.score-list');
const player1Total = document.querySelector('.player1-total');
const player2Total = document.querySelector('.player2-total');

// Set initial scores and scores list to empty arrays
let scores1 = [];
let scores2 = [];

// Add event listeners to add score buttons
addButtons.forEach(button => {
    button.addEventListener('click', () => {
        const player = button.parentElement;
        const input = player.querySelector('.score');
        let score = parseInt(input.value);
        if (player.classList.contains('player1')) {
            scores1.push(score);
            updateScoreList(scoreList, scores1, scores2);
        } else {
            scores2.push(score);
            updateScoreList(scoreList, scores1, scores2);
        }
        input.value = 0;
    });
});





// Add event listener to reset button
resetButton.addEventListener('click', () => {
    scores1 = [];
    scores2 = [];
    updateScoreList(scoreList, scores1, scores2);
    player1Score.value = 0;
    player2Score.value = 0;
});

// Function to update the score list
function updateScoreList(list, scores1, scores2) {
    list.innerHTML = '';
    let player1Score = 0;
    let player2Score = 0;
    for (let i = 0; i < Math.max(scores1.length, scores2.length); i++) {
        const tr = document.createElement('tr');
        if (scores1[i] !== undefined) {
            const td1 = document.createElement('td');
            td1.textContent = scores1[i];
            tr.appendChild(td1);
            player1Score += scores1[i];
        } else {
            const td1 = document.createElement('td');
            tr.appendChild(td1);
        }
        if (scores2[i] !== undefined) {
            const td2 = document.createElement('td');
            td2.textContent = scores2[i];
            tr.appendChild(td2);
            player2Score += scores2[i];
        } else {
            const td2 = document.createElement('td');
            tr.appendChild(td2);
        }
        list.appendChild(tr);
    }
    player1Total.textContent = player1Score;
    player2Total.textContent = player2Score;
}

// Add event listeners to "Son 30" buttons
const son30Buttons = document.querySelectorAll('.son30');
son30Buttons.forEach(button => {
button.addEventListener('click', () => {
const player = button.parentElement;
const score = 30;
if (player.classList.contains('player1')) {
scores1.push(score);
updateScoreList(scoreList, scores1, scores2);
} else {
scores2.push(score);
updateScoreList(scoreList, scores1, scores2);
}
});
});