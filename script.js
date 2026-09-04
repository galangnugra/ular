const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const leaderboardScreen = document.getElementById("leaderboardScreen");

const usernameInput = document.getElementById("username");
const whatsappInput = document.getElementById("whatsapp");

const startBtn = document.getElementById("startBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const restartBtn = document.getElementById("restartBtn");
const backBtn = document.getElementById("backBtn");
const backLeaderboardBtn = document.getElementById("backLeaderboardBtn");
const clearDataBtn = document.getElementById("clearDataBtn");

const playerName = document.getElementById("playerName");
const scoreText = document.getElementById("score");
const leaderboardList = document.getElementById("leaderboardList");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20;
const canvasSize = 360;

let snake;
let food;
let direction;
let nextDirection;
let score;
let gameLoop;

let player = {
    username: "",
    whatsapp: ""
};

/* =========================
   MULAI GAME
========================= */

startBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    const whatsapp = whatsappInput.value.trim();

    if (username === "") {
        alert("Masukkan username terlebih dahulu!");
        return;
    }

    if (whatsapp === "") {
        alert("Masukkan nomor WhatsApp terlebih dahulu!");
        return;
    }

    player.username = username;
    player.whatsapp = whatsapp;

    playerName.textContent = username;

    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    startGame();
});

/* =========================
   GAME
========================= */

function startGame() {
    clearInterval(gameLoop);

    snake = [
        { x: 180, y: 180 },
        { x: 160, y: 180 },
        { x: 140, y: 180 }
    ];

    direction = "right";
    nextDirection = "right";
    score = 0;

    scoreText.textContent = score;

    createFood();

    // semakin besar angkanya = semakin lambat
    gameLoop = setInterval(updateGame, 160);
}

function updateGame() {
    direction = nextDirection;

    const head = {
        x: snake[0].x,
        y: snake[0].y
    };

    if (direction === "up") {
        head.y -= box;
    }

    if (direction === "down") {
        head.y += box;
    }

    if (direction === "left") {
        head.x -= box;
    }

    if (direction === "right") {
        head.x += box;
    }

    // Tabrak dinding
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= canvasSize ||
        head.y >= canvasSize
    ) {
        gameOver();
        return;
    }

    // Tabrak badan sendiri
    if (hitSelf(head)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Makan buah
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreText.textContent = score;

        createFood();

        // badan tidak dihapus sehingga cacing bertambah besar
    } else {
        snake.pop();
    }

    drawGame();
}

/* =========================
   GAMBAR GAME
========================= */

function drawGame() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = "#1c1c1c";

    for (let x = 0; x < canvasSize; x += box) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize);
        ctx.stroke();
    }

    for (let y = 0; y < canvasSize; y += box) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasSize, y);
        ctx.stroke();
    }

    // Cacing
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#00ff88" : "#00cc66";

        ctx.fillRect(
            part.x + 1,
            part.y + 1,
            box - 2,
            box - 2
        );
    });

    // Mata cacing
    ctx.fillStyle = "black";

    ctx.fillRect(
        snake[0].x + 5,
        snake[0].y + 4,
        4,
        4
    );

    ctx.fillRect(
        snake[0].x + 12,
        snake[0].y + 4,
        4,
        4
    );

    // Buah
    ctx.fillStyle = "#ff4757";

    ctx.beginPath();
    ctx.arc(
        food.x + box / 2,
        food.y + box / 2,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();
}

/* =========================
   BUAH
========================= */

function createFood() {
    let newFood;

    do {
        newFood = {
            x: Math.floor(Math.random() * (canvasSize / box)) * box,
            y: Math.floor(Math.random() * (canvasSize / box)) * box
        };
    } while (
        snake &&
        snake.some(
            part =>
                part.x === newFood.x &&
                part.y === newFood.y
        )
    );

    food = newFood;
}

/* =========================
   TABRAK BADAN
========================= */

function hitSelf(head) {
    return snake.some(
        part => part.x === head.x && part.y === head.y
    );
}

/* =========================
   GAME OVER
========================= */

function gameOver() {
    clearInterval(gameLoop);

    saveScore();

    setTimeout(() => {
        alert(
            "Game Over!\n\n" +
            "Username: " + player.username +
            "\nScore: " + score
        );
    }, 50);
}

/* =========================
   KONTROL KEYBOARD
========================= */

document.addEventListener("keydown", event => {
    const key = event.key;

    if (key === "ArrowUp" && direction !== "down") {
        nextDirection = "up";
    }

    if (key === "ArrowDown" && direction !== "up") {
        nextDirection = "down";
    }

    if (key === "ArrowLeft" && direction !== "right") {
        nextDirection = "left";
    }

    if (key === "ArrowRight" && direction !== "left") {
        nextDirection = "right";
    }
});

/* =========================
   KONTROL HP
========================= */

document.querySelectorAll("[data-direction]").forEach(button => {
    button.addEventListener("click", () => {
        const newDirection = button.dataset.direction;

        if (
            newDirection === "up" &&
            direction !== "down"
        ) {
            nextDirection = "up";
        }

        if (
            newDirection === "down" &&
            direction !== "up"
        ) {
            nextDirection = "down";
        }

        if (
            newDirection === "left" &&
            direction !== "right"
        ) {
            nextDirection = "left";
        }

        if (
            newDirection === "right" &&
            direction !== "left"
        ) {
            nextDirection = "right";
        }
    });
});

/* =========================
   SIMPAN LEADERBOARD
========================= */

function saveScore() {
    let leaderboard =
        JSON.parse(localStorage.getItem("snakeLeaderboard")) || [];

    const existingPlayer = leaderboard.find(
        item =>
            item.username.toLowerCase() ===
            player.username.toLowerCase()
    );

    if (existingPlayer) {
        // hanya update jika skor baru lebih tinggi
        if (score > existingPlayer.score) {
            existingPlayer.score = score;
        }

        existingPlayer.whatsapp = player.whatsapp;
    } else {
        leaderboard.push({
            username: player.username,
            whatsapp: player.whatsapp,
            score: score
        });
    }

    leaderboard.sort((a, b) => b.score - a.score);

    // simpan maksimal 10 pemain
    leaderboard = leaderboard.slice(0, 10);

    localStorage.setItem(
        "snakeLeaderboard",
        JSON.stringify(leaderboard)
    );
}

/* =========================
   TAMPILKAN LEADERBOARD
========================= */

function loadLeaderboard() {
    const leaderboard =
        JSON.parse(localStorage.getItem("snakeLeaderboard")) || [];

    leaderboardList.innerHTML = "";

    if (leaderboard.length === 0) {
        leaderboardList.innerHTML =
            "<p>Belum ada skor.</p>";
        return;
    }

    leaderboard.forEach((item, index) => {
        const div = document.createElement("div");

        div.className = "rank";

        let medal = "";

        if (index === 0) medal = "🥇 ";
        if (index === 1) medal = "🥈 ";
        if (index === 2) medal = "🥉 ";

        div.innerHTML = `
            <span>
                ${medal}#${index + 1} ${escapeHTML(item.username)}
            </span>

            <strong>${item.score}</strong>
        `;

        leaderboardList.appendChild(div);
    });
}

/* =========================
   CEGAH HTML INJECTION
========================= */

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/* =========================
   NAVIGASI
========================= */

leaderboardBtn.addEventListener("click", () => {
    startScreen.classList.add("hidden");
    leaderboardScreen.classList.remove("hidden");

    loadLeaderboard();
});

backLeaderboardBtn.addEventListener("click", () => {
    leaderboardScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
});

backBtn.addEventListener("click", () => {
    clearInterval(gameLoop);

    gameScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
});

restartBtn.addEventListener("click", () => {
    startGame();
});

/* =========================
   HAPUS LEADERBOARD
========================= */

clearDataBtn.addEventListener("click", () => {
    const confirmDelete = confirm(
        "Yakin ingin menghapus semua data leaderboard?"
    );

    if (confirmDelete) {
        localStorage.removeItem("snakeLeaderboard");
        loadLeaderboard();
    }
});
