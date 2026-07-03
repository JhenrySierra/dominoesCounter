window.onload = function() {
    // Hide the loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
    
    // Show the setup screen
    const setupScreen = document.getElementById('setup-screen');
    if (setupScreen) {
        setupScreen.style.display = 'flex';
    }
};

// State Variables
let scores1 = [];
let scores2 = [];
let pointLimit = 100;
let winnerDeclared = false;

// DOM Elements
const setupScreen = document.getElementById("setup-screen");
const counterScreen = document.getElementById("counter");
const startGameBtn = document.getElementById("start-game-btn");
const inputPlayer1 = document.getElementById("input-player1");
const inputPlayer2 = document.getElementById("input-player2");

const player1Name = document.getElementById("player1Name");
const player2Name = document.getElementById("player2Name");
const player1Nametable = document.getElementById("jugador1");
const player2Nametable = document.getElementById("jugador2");

const limitOptions = document.querySelectorAll(".btn-limit-option");
const customLimitContainer = document.getElementById("custom-limit-container");
const inputCustomLimit = document.getElementById("input-custom-limit");

// Limit Selector Logic
limitOptions.forEach(btn => {
    btn.addEventListener("click", () => {
        limitOptions.forEach(opt => opt.classList.remove("active"));
        btn.classList.add("active");
        
        const limitVal = btn.getAttribute("data-limit");
        if (limitVal === "custom") {
            customLimitContainer.style.display = "block";
            inputCustomLimit.focus();
        } else {
            customLimitContainer.style.display = "none";
            pointLimit = parseInt(limitVal);
        }
    });
});

const player1Card = document.querySelector(".player-card.player1");
const player2Card = document.querySelector(".player-card.player2");
const player1ScoreInput = document.querySelector(".player1 .score");
const player2ScoreInput = document.querySelector(".player2 .score");
const addButtons = document.querySelectorAll(".add");
const scoreList = document.querySelector(".score-list");
const player1Total = document.querySelector(".player1-total");
const player2Total = document.querySelector(".player2-total");

// Setup Game Screen transition
startGameBtn.addEventListener("click", () => {
    const name1 = inputPlayer1.value.trim() || "Nosotros";
    const name2 = inputPlayer2.value.trim() || "Ellos";
    
    // Check if custom limit is selected and active
    const activeLimitBtn = document.querySelector(".btn-limit-option.active");
    if (activeLimitBtn && activeLimitBtn.getAttribute("data-limit") === "custom") {
        const customLimitVal = parseInt(inputCustomLimit.value);
        if (!isNaN(customLimitVal) && customLimitVal > 0) {
            pointLimit = customLimitVal;
        } else {
            pointLimit = 100; // fallback default
        }
    }
    
    player1Name.textContent = name1;
    player2Name.textContent = name2;
    player1Nametable.textContent = name1;
    player2Nametable.textContent = name2;
    
    // Show point limit meta in the game title
    document.getElementById("app-meta-limit").textContent = `(A ${pointLimit} pts)`;
    
    // Transition screens
    setupScreen.style.display = "none";
    counterScreen.style.display = "flex";
    
    // Only reset if starting a fresh game (no scores registered yet)
    if (scores1.length === 0 && scores2.length === 0) {
        resetGameData();
    } else {
        updateScoreList();
    }
});

// Back to setup button logic
const backToSetupBtn = document.getElementById("back-to-setup-btn");
if (backToSetupBtn) {
    backToSetupBtn.addEventListener("click", () => {
        counterScreen.style.display = "none";
        setupScreen.style.display = "flex";
        
        // Fill in player name fields with active names
        inputPlayer1.value = player1Name.textContent;
        inputPlayer2.value = player2Name.textContent;
        
        // Pre-select point limit option in setup UI
        limitOptions.forEach(opt => opt.classList.remove("active"));
        let matched = false;
        limitOptions.forEach(opt => {
            if (parseInt(opt.getAttribute("data-limit")) === pointLimit) {
                opt.classList.add("active");
                matched = true;
            }
        });
        if (!matched) {
            const customBtn = Array.from(limitOptions).find(opt => opt.getAttribute("data-limit") === "custom");
            if (customBtn) {
                customBtn.classList.add("active");
                customLimitContainer.style.display = "block";
                inputCustomLimit.value = pointLimit;
            }
        } else {
            customLimitContainer.style.display = "none";
        }
    });
}

// Clear input on focus if it is 0
[player1ScoreInput, player2ScoreInput].forEach(input => {
    input.addEventListener("focus", () => {
        if (parseInt(input.value) === 0) {
            input.value = "";
        }
        
        // Highlight active card
        const card = input.closest(".player-card");
        document.querySelectorAll(".player-card").forEach(c => c.classList.remove("active-turn"));
        card.classList.add("active-turn");
    });
    
    input.addEventListener("blur", () => {
        if (input.value.trim() === "") {
            input.value = "0";
        }
    });
});

// Anotame / Add score button logic
addButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const playerCard = button.closest(".player-card");
        const input = playerCard.querySelector(".score");
        let score = parseInt(input.value) || 0;
        
        if (score > 0) {
            if (playerCard.classList.contains("player1")) {
                scores1.push(score);
            } else {
                scores2.push(score);
            }
            updateScoreList();
        }
        
        input.value = 0;
        playerCard.classList.remove("active-turn");
    });
});

// "Son 30" button logic
const son30Buttons = document.querySelectorAll(".son30");
son30Buttons.forEach((button) => {
    button.addEventListener("click", () => {
        const playerCard = button.closest(".player-card");
        const input = playerCard.querySelector(".score");
        let score = parseInt(input.value) || 0;
        
        // Add 30 to current input, then add to scores
        score += 30;
        
        if (playerCard.classList.contains("player1")) {
            scores1.push(score);
        } else {
            scores2.push(score);
        }
        
        updateScoreList();
        input.value = 0;
        playerCard.classList.remove("active-turn");
    });
});

// Scoreboard Update Function
function updateScoreList() {
    scoreList.innerHTML = "";
    let player1Score = 0;
    let player2Score = 0;
    const maxRounds = Math.max(scores1.length, scores2.length);
    
    for (let i = 0; i < maxRounds; i++) {
        const tr = document.createElement("tr");
        tr.dataset.index = i;
        
        // Player 1 cell
        const td1 = document.createElement("td");
        if (scores1[i] !== undefined) {
            td1.textContent = scores1[i];
            player1Score += scores1[i];
        } else {
            td1.textContent = "-";
        }
        tr.appendChild(td1);
        
        // Player 2 cell
        const td2 = document.createElement("td");
        if (scores2[i] !== undefined) {
            td2.textContent = scores2[i];
            player2Score += scores2[i];
        } else {
            td2.textContent = "-";
        }
        tr.appendChild(td2);
        
        scoreList.appendChild(tr);
    }
    
    // Fallback if no scores yet
    if (maxRounds === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = "<td>0</td><td>0</td>";
        scoreList.appendChild(tr);
    }
    
    player1Total.textContent = player1Score;
    player2Total.textContent = player2Score;
    
    // Check for Winner
    checkWinner(player1Score, player2Score);
    
    // Scroll scoreboard to bottom
    const tableWrapper = document.querySelector(".table-wrapper");
    if (tableWrapper) {
        tableWrapper.scrollTop = tableWrapper.scrollHeight;
    }
}

// Reset Modal Controls
const resetModal = document.getElementById("reset-modal");
const resetTriggers = document.querySelectorAll(".reset-trigger");
const cancelResetBtn = document.getElementById("cancel-reset-btn");
const confirmResetBtn = document.getElementById("confirm-reset-btn");

resetTriggers.forEach(trigger => {
    trigger.addEventListener("click", () => {
        resetModal.classList.add("show");
    });
});

cancelResetBtn.addEventListener("click", () => {
    resetModal.classList.remove("show");
});

confirmResetBtn.addEventListener("click", () => {
    resetModal.classList.remove("show");
    if (!winnerDeclared) {
        logCurrentGameToHistory("Reiniciado");
    }
    resetGameData();
});

// Reset logic
function resetGameData() {
    scores1 = [];
    scores2 = [];
    updateScoreList();
    player1ScoreInput.value = 0;
    player2ScoreInput.value = 0;
    document.querySelectorAll(".player-card").forEach(c => c.classList.remove("active-turn"));
}

// Edit Score Modal Controls
const editModal = document.getElementById("edit-modal");
const editModalSubtitle = document.getElementById("edit-modal-subtitle");
const labelEditPlayer1 = document.getElementById("label-edit-player1");
const labelEditPlayer2 = document.getElementById("label-edit-player2");
const inputEditPlayer1 = document.getElementById("input-edit-player1");
const inputEditPlayer2 = document.getElementById("input-edit-player2");
const saveEditBtn = document.getElementById("save-edit-btn");
const deleteEditBtn = document.getElementById("delete-edit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

let activeEditIndex = -1;

// Row Click Listener (using event delegation on scoreList)
scoreList.addEventListener("click", (e) => {
    const tr = e.target.closest("tr");
    if (!tr || tr.dataset.index === undefined) return;
    
    const index = parseInt(tr.dataset.index);
    activeEditIndex = index;
    
    // Set labels based on player names
    const p1Name = player1Name.textContent || "Jugador A";
    const p2Name = player2Name.textContent || "Jugador B";
    
    labelEditPlayer1.textContent = p1Name;
    labelEditPlayer2.textContent = p2Name;
    
    // Fill in current values
    inputEditPlayer1.value = scores1[index] !== undefined ? scores1[index] : 0;
    inputEditPlayer2.value = scores2[index] !== undefined ? scores2[index] : 0;
    
    editModalSubtitle.textContent = `Modificando Ronda ${index + 1}`;
    
    // Show Modal
    editModal.classList.add("show");
});

// Save Edits
saveEditBtn.addEventListener("click", () => {
    if (activeEditIndex === -1) return;
    
    const val1 = parseInt(inputEditPlayer1.value) || 0;
    const val2 = parseInt(inputEditPlayer2.value) || 0;
    
    scores1[activeEditIndex] = val1;
    scores2[activeEditIndex] = val2;
    
    updateScoreList();
    
    editModal.classList.remove("show");
    activeEditIndex = -1;
});

// Delete Round
deleteEditBtn.addEventListener("click", () => {
    if (activeEditIndex === -1) return;
    
    // Remove the row at activeEditIndex
    scores1.splice(activeEditIndex, 1);
    scores2.splice(activeEditIndex, 1);
    
    updateScoreList();
    
    editModal.classList.remove("show");
    activeEditIndex = -1;
});

// Cancel Edit
cancelEditBtn.addEventListener("click", () => {
    editModal.classList.remove("show");
    activeEditIndex = -1;
});

// Victory Checks and Modal Logic
function checkWinner(p1Total, p2Total) {
    // If scores are edited below the limit, reset the winnerDeclared state
    if (p1Total < pointLimit && p2Total < pointLimit) {
        winnerDeclared = false;
        return;
    }
    
    if (!winnerDeclared && (p1Total >= pointLimit || p2Total >= pointLimit)) {
        const p1Name = player1Name.textContent || "Jugador A";
        const p2Name = player2Name.textContent || "Jugador B";
        
        const winnerName = p1Total >= pointLimit ? p1Name : p2Name;
        const winnerScore = p1Total >= pointLimit ? p1Total : p2Total;
        
        winnerDeclared = true;
        logCurrentGameToHistory("Completado");
        showVictoryModal(winnerName, winnerScore);
    }
}

const victoryModal = document.getElementById("victory-modal");
const victoryWinnerName = document.getElementById("victory-winner-name");
const victoryScoreDetail = document.getElementById("victory-score-detail");
const victoryPlayAgainBtn = document.getElementById("victory-play-again-btn");
const victoryCloseBtn = document.getElementById("victory-close-btn");

function showVictoryModal(winnerName, score) {
    victoryWinnerName.textContent = winnerName;
    victoryScoreDetail.textContent = `Ganó la partida con ${score} puntos.`;
    victoryModal.classList.add("show");
    
    launchConfetti();
}

function launchConfetti() {
    const emojis = ['🎉', '🎊', '✨', '🀹', '🀸', '⭐', '🏆'];
    for (let i = 0; i < 35; i++) {
        const p = document.createElement("div");
        p.className = "confetti-particle";
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        
        p.style.left = Math.random() * 100 + "vw";
        p.style.animationDelay = Math.random() * 1.5 + "s";
        p.style.fontSize = (15 + Math.random() * 20) + "px";
        
        const duration = 2.5 + Math.random() * 1.5;
        p.style.animationDuration = duration + "s";
        
        document.body.appendChild(p);
        
        setTimeout(() => {
            p.remove();
        }, (duration + 1.5) * 1000);
    }
}

victoryPlayAgainBtn.addEventListener("click", () => {
    victoryModal.classList.remove("show");
    counterScreen.style.display = "none";
    setupScreen.style.display = "flex";
    
    // Reset inputs and limit selection UI
    limitOptions.forEach(opt => opt.classList.remove("active"));
    limitOptions[0].classList.add("active");
    customLimitContainer.style.display = "none";
    inputCustomLimit.value = "";
    inputPlayer1.value = "";
    inputPlayer2.value = "";
});

victoryCloseBtn.addEventListener("click", () => {
    victoryModal.classList.remove("show");
});

// History Modal controls and storage logic
const historyModal = document.getElementById("history-modal");
const historyListEmpty = document.getElementById("history-list-empty");
const historyListContainer = document.getElementById("history-list-container");
const closeHistoryBtn = document.getElementById("close-history-btn");
const clearHistoryBtn = document.getElementById("clear-history-btn");
const historicBtn = document.getElementById("historic-btn");

if (historicBtn) {
    historicBtn.addEventListener("click", () => {
        renderHistoryList();
        historyModal.classList.add("show");
    });
}

if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener("click", () => {
        historyModal.classList.remove("show");
    });
}

if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
        const confirmClear = window.confirm("¿Borrar todo el historial de partidas?");
        if (confirmClear) {
            localStorage.removeItem("son30_history");
            renderHistoryList();
        }
    });
}

function logCurrentGameToHistory(status = "Completado") {
    // Don't log if there are no scores in the game at all
    if (scores1.length === 0 && scores2.length === 0) return;
    
    const p1Total = scores1.reduce((a, b) => a + b, 0);
    const p2Total = scores2.reduce((a, b) => a + b, 0);
    
    let winner = "Empate";
    let winnerClass = "draw";
    if (p1Total > p2Total) {
        winner = player1Name.textContent;
        winnerClass = "winner-p1";
    } else if (p2Total > p1Total) {
        winner = player2Name.textContent;
        winnerClass = "winner-p2";
    }
    
    const gameLog = {
        id: Date.now(),
        date: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}),
        player1: player1Name.textContent,
        player2: player2Name.textContent,
        score1: p1Total,
        score2: p2Total,
        limit: pointLimit,
        winner: winner,
        winnerClass: winnerClass,
        status: status,
        rounds1: [...scores1],
        rounds2: [...scores2]
    };
    
    const history = JSON.parse(localStorage.getItem("son30_history") || "[]");
    history.unshift(gameLog);
    localStorage.setItem("son30_history", JSON.stringify(history));
}

function renderHistoryList() {
    const history = JSON.parse(localStorage.getItem("son30_history") || "[]");
    historyListContainer.innerHTML = "";
    
    if (history.length === 0) {
        historyListEmpty.style.display = "block";
        return;
    }
    
    historyListEmpty.style.display = "none";
    
    history.forEach(game => {
        const div = document.createElement("div");
        div.className = `history-item ${game.winnerClass}`;
        div.dataset.id = game.id;
        
        const statusText = game.status === "Reiniciado" ? " (Reiniciado)" : "";
        
        div.innerHTML = `
            <div class="history-item-header">
                <span>${game.date}${statusText}</span>
                <span>Meta: ${game.limit} pts</span>
            </div>
            <div class="history-item-body">
                <div class="history-team-score p1">
                    <span class="history-score-name">${game.player1}</span>
                    <span class="history-score-val">${game.score1}</span>
                </div>
                <span class="history-score-vs">VS</span>
                <div class="history-team-score p2 align-right">
                    <span class="history-score-name">${game.player2}</span>
                    <span class="history-score-val">${game.score2}</span>
                </div>
            </div>
        `;
        
        historyListContainer.appendChild(div);
    });
}

// History Details Modal Controls
const historyDetailModal = document.getElementById("history-detail-modal");
const historyDetailTitle = document.getElementById("history-detail-title");
const detailJugador1 = document.getElementById("detail-jugador1");
const detailJugador2 = document.getElementById("detail-jugador2");
const detailScoreList = document.getElementById("detail-score-list");
const detailPlayer1Total = document.getElementById("detail-player1-total");
const detailPlayer2Total = document.getElementById("detail-player2-total");
const closeHistoryDetailBtn = document.getElementById("close-history-detail-btn");

// Listen for clicks on history cards (using delegation)
historyListContainer.addEventListener("click", (e) => {
    const card = e.target.closest(".history-item");
    if (!card || !card.dataset.id) return;
    
    const gameId = parseInt(card.dataset.id);
    const history = JSON.parse(localStorage.getItem("son30_history") || "[]");
    const game = history.find(g => g.id === gameId);
    
    if (game) {
        showHistoryDetail(game);
    }
});

if (closeHistoryDetailBtn) {
    closeHistoryDetailBtn.addEventListener("click", () => {
        historyDetailModal.classList.remove("show");
    });
}

function showHistoryDetail(game) {
    detailJugador1.textContent = game.player1;
    detailJugador2.textContent = game.player2;
    detailPlayer1Total.textContent = game.score1;
    detailPlayer2Total.textContent = game.score2;
    
    detailScoreList.innerHTML = "";
    
    const r1 = game.rounds1 || [];
    const r2 = game.rounds2 || [];
    const maxRounds = Math.max(r1.length, r2.length);
    
    for (let i = 0; i < maxRounds; i++) {
        const tr = document.createElement("tr");
        
        // Player 1 round score
        const td1 = document.createElement("td");
        td1.textContent = r1[i] !== undefined ? r1[i] : "-";
        tr.appendChild(td1);
        
        // Player 2 round score
        const td2 = document.createElement("td");
        td2.textContent = r2[i] !== undefined ? r2[i] : "-";
        tr.appendChild(td2);
        
        detailScoreList.appendChild(tr);
    }
    
    // Fallback if no rounds recorded (e.g. legacy logs)
    if (maxRounds === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${game.score1}</td><td>${game.score2}</td>`;
        detailScoreList.appendChild(tr);
    }
    
    historyDetailTitle.textContent = `Partida del ${game.date.split(' ')[0]}`;
    historyDetailModal.classList.add("show");
}

// Camera Scanner DOM Elements
const cameraModal = document.getElementById("camera-modal");
const cameraFeed = document.getElementById("camera-feed");
const cameraCanvas = document.getElementById("camera-canvas");
const scannerResultsText = document.getElementById("scanner-results-text");
const scannerThreshold = document.getElementById("scanner-threshold");
const scannerInvert = document.getElementById("scanner-invert");

const triggerScanBtn = document.getElementById("trigger-scan-btn");
const retryScanBtn = document.getElementById("retry-scan-btn");
const acceptScanBtn = document.getElementById("accept-scan-btn");
const closeCameraBtn = document.getElementById("close-camera-btn");

const scannerInitialActions = document.getElementById("scanner-initial-actions");
const scannerConfirmActions = document.getElementById("scanner-confirm-actions");

let scannerStream = null;
let scannerActive = false;
let activeCameraTargetInput = null;
let detectedDotCount = 0;
let scanAnimationFrameId = null;

// Attach scan click handlers to score input camera icons
document.querySelectorAll(".btn-scan").forEach(btn => {
    btn.addEventListener("click", () => {
        const playerCard = btn.closest(".player-card");
        activeCameraTargetInput = playerCard.querySelector(".score");
        
        cameraModal.classList.add("show");
        startCameraScanner();
        
        document.querySelectorAll(".player-card").forEach(c => c.classList.remove("active-turn"));
        playerCard.classList.add("active-turn");
    });
});

function stopCameraScanner() {
    if (scannerStream) {
        scannerStream.getTracks().forEach(track => track.stop());
        scannerStream = null;
    }
    if (scanAnimationFrameId) {
        cancelAnimationFrame(scanAnimationFrameId);
        scanAnimationFrameId = null;
    }
    scannerActive = false;
    cameraModal.classList.remove("show");
    
    scannerInitialActions.style.display = "flex";
    scannerConfirmActions.style.display = "none";
    scannerResultsText.textContent = "Coloque la ficha y pulse Escanear";
    scannerResultsText.style.color = "var(--color-gold)";
    
    const ctx = cameraCanvas.getContext("2d");
    ctx.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
}

if (closeCameraBtn) closeCameraBtn.addEventListener("click", stopCameraScanner);

function startCameraScanner() {
    scannerActive = true;
    
    scannerInitialActions.style.display = "flex";
    scannerConfirmActions.style.display = "none";
    scannerResultsText.textContent = "Coloque la ficha y pulse Escanear";
    scannerResultsText.style.color = "var(--color-gold)";
    
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            scannerStream = stream;
            cameraFeed.srcObject = stream;
            
            cameraFeed.onloadedmetadata = () => {
                cameraCanvas.width = cameraFeed.videoWidth;
                cameraCanvas.height = cameraFeed.videoHeight;
                tickScanner();
            };
        })
        .catch(err => {
            console.error("No se pudo acceder a la cámara: ", err);
            scannerResultsText.textContent = "Error: No hay acceso a la cámara";
            scannerResultsText.style.color = "var(--color-danger)";
        });
}

function tickScanner() {
    if (!scannerActive) return;
    
    const ctx = cameraCanvas.getContext("2d");
    ctx.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
    
    scanAnimationFrameId = requestAnimationFrame(tickScanner);
}

if (triggerScanBtn) {
    triggerScanBtn.addEventListener("click", () => {
        if (!scannerStream) return;
        
        cameraFeed.pause();
        scannerActive = false;
        if (scanAnimationFrameId) {
            cancelAnimationFrame(scanAnimationFrameId);
        }
        
        processScanFrame();
    });
}

if (retryScanBtn) {
    retryScanBtn.addEventListener("click", () => {
        const ctx = cameraCanvas.getContext("2d");
        ctx.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
        
        cameraFeed.play();
        startCameraScanner();
    });
}

if (acceptScanBtn) {
    acceptScanBtn.addEventListener("click", () => {
        if (activeCameraTargetInput) {
            activeCameraTargetInput.value = detectedDotCount;
            
            const card = activeCameraTargetInput.closest(".player-card");
            if (card) {
                document.querySelectorAll(".player-card").forEach(c => c.classList.remove("active-turn"));
                card.classList.add("active-turn");
            }
        }
        stopCameraScanner();
    });
}

// Live parameter updates on binarized frozen frame
[scannerThreshold, scannerInvert].forEach(input => {
    input.addEventListener("input", () => {
        if (!scannerActive && scannerStream) {
            processScanFrame();
        }
    });
});

function processScanFrame() {
    const ctx = cameraCanvas.getContext("2d");
    ctx.drawImage(cameraFeed, 0, 0, cameraCanvas.width, cameraCanvas.height);
    
    const cropW = cameraCanvas.width * 0.7;
    const cropH = cameraCanvas.height * 0.7;
    const cropX = (cameraCanvas.width - cropW) / 2;
    const cropY = (cameraCanvas.height - cropH) / 2;
    
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = cropW;
    tempCanvas.height = cropH;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(cameraCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    
    const thresholdVal = parseInt(scannerThreshold.value);
    const invertVal = scannerInvert.checked;
    
    const blobs = detectDominoDots(tempCtx, cropW, cropH, thresholdVal, invertVal);
    detectedDotCount = blobs.length;
    
    ctx.lineWidth = Math.max(3, cameraCanvas.width * 0.005);
    ctx.strokeStyle = "#f59e0b"; // Gold stroke
    
    blobs.forEach(blob => {
        const absX = cropX + blob.x;
        const absY = cropY + blob.y;
        
        ctx.beginPath();
        const radius = Math.max(6, Math.sqrt(blob.area / Math.PI) + 4);
        ctx.arc(absX, absY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        
        ctx.fillStyle = "#ef4444"; // Red dot center
        ctx.beginPath();
        ctx.arc(absX, absY, 3, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    scannerResultsText.textContent = `Ficha detectada: ${detectedDotCount} puntos`;
    scannerResultsText.style.color = "var(--color-gold)";
    
    scannerInitialActions.style.display = "none";
    scannerConfirmActions.style.display = "flex";
}

function detectDominoDots(ctx, width, height, threshold, invert) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    
    const binary = new Uint8Array(width * height);
    const visited = new Uint8Array(width * height);
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        const idx = i / 4;
        if (invert) {
            binary[idx] = gray > threshold ? 1 : 0;
        } else {
            binary[idx] = gray < threshold ? 1 : 0;
        }
    }
    
    const blobs = [];
    const cropArea = width * height;
    const minArea = Math.max(8, cropArea * 0.0001);
    const maxArea = Math.max(350, cropArea * 0.012);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            
            if (binary[idx] === 1 && visited[idx] === 0) {
                const blobPixels = [];
                const queue = [[x, y]];
                visited[idx] = 1;
                
                while (queue.length > 0) {
                    const [cx, cy] = queue.shift();
                    blobPixels.push([cx, cy]);
                    
                    const neighbors = [
                        [cx + 1, cy],
                        [cx - 1, cy],
                        [cx, cy + 1],
                        [cx, cy - 1]
                    ];
                    
                    for (const [nx, ny] of neighbors) {
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const nIdx = ny * width + nx;
                            if (binary[nIdx] === 1 && visited[nIdx] === 0) {
                                visited[nIdx] = 1;
                                queue.push([nx, ny]);
                            }
                        }
                    }
                }
                
                const area = blobPixels.length;
                if (area >= minArea && area <= maxArea) {
                    let sumX = 0;
                    let sumY = 0;
                    blobPixels.forEach(([px, py]) => {
                        sumX += px;
                        sumY += py;
                    });
                    const centerX = sumX / area;
                    const centerY = sumY / area;
                    
                    blobs.push({
                        x: centerX,
                        y: centerY,
                        area: area
                    });
                }
            }
        }
    }
    
    return blobs;
}
