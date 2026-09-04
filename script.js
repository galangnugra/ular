const API_URL = "MASUKKAN_URL_WEB_APP_DISINI";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const leaderboardScreen = document.getElementById("leaderboardScreen");

const usernameInput = document.getElementById("username");
const whatsappInput = document.getElementById("whatsapp");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const backBtn = document.getElementById("backBtn");

const playerName = document.getElementById("playerName");
const scoreText = document.getElementById("score");
const errorMessage = document.getElementById("errorMessage");
const leaderboardList = document.getElementById("leaderboardList");

const grid = 20;
const tileCount = canvas.width / grid;

let snake;
let food;
let direction;
let nextDirection;
let score;
let gameLoop;
let gameRunning = false;

let player = {
  username: "",
  whatsapp: ""
};


// =========================
// MULAI GAME
// =========================

startBtn.addEventListener("click", () => {

  const username = usernameInput.value.trim();
  const whatsapp = whatsappInput.value.trim();

  if (username.length < 3) {
    errorMessage.textContent = "Username minimal 3 karakter.";
    return;
  }

  if (!/^[0-9]{10,15}$/.test(whatsapp)) {
    errorMessage.textContent = "Nomor WhatsApp harus 10-15 angka.";
    return;
  }

  player.username = username;
  player.whatsapp = whatsapp;

  playerName.textContent = username;

  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  startGame();
});


// =========================
// GAME
// =========================

function startGame() {

  clearInterval(gameLoop);

  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];

  direction = {
    x: 1,
    y: 0
  };

  nextDirection = {
    x: 1,
    y: 0
  };

  score = 0;

  scoreText.textContent = score;

  createFood();

  gameRunning = true;

  gameLoop = setInterval(updateGame, 160);
}


// =========================
// UPDATE GAME
// =========================

function updateGame() {

  if (!gameRunning) return;

  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  // Tabrak dinding
  if (
    head.x < 0 ||
    head.x >= tileCount ||
    head.y < 0 ||
    head.y >= tileCount
  ) {
    gameOver();
    return;
  }

  // Tabrak badan sendiri
  for (let i = 0; i < snake.length; i++) {

    if (
      head.x === snake[i].x &&
      head.y === snake[i].y
    ) {
      gameOver();
      return;
    }
  }

  snake.unshift(head);

  // Makan buah
  if (
    head.x === food.x &&
    head.y === food.y
  ) {

    score++;

    scoreText.textContent = score;

    createFood();

  } else {

    // Tidak makan buah = ekor berkurang
    snake.pop();
  }

  drawGame();
}


// =========================
// GAMBAR GAME
// =========================

function drawGame() {

  ctx.fillStyle = "#081c15";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Buah
  ctx.fillStyle = "#ff595e";

  ctx.beginPath();

  ctx.arc(
    food.x * grid + grid / 2,
    food.y * grid + grid / 2,
    7,
    0,
    Math.PI * 2
  );

  ctx.fill();

  // Cacing
  snake.forEach((part, index) => {

    ctx.fillStyle =
      index === 0 ? "#95d5b2" : "#52b788";

    ctx.fillRect(
      part.x * grid + 2,
      part.y * grid + 2,
      grid - 4,
      grid - 4
    );
  });
}


// =========================
// BUAT BUAH
// =========================

function createFood() {

  let validPosition = false;

  while (!validPosition) {

    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };

    validPosition = !snake.some(
      part =>
        part.x === food.x &&
        part.y === food.y
    );
  }
}


// =========================
// GAME OVER
// =========================

function gameOver() {

  gameRunning = false;

  clearInterval(gameLoop);

  alert(
    "Game Over!\n\n" +
    "Pemain: " + player.username +
    "\nSkor: " + score
  );

  saveScore();
}


// =========================
// SIMPAN SKOR
// =========================

async function saveScore() {

  if (!API_URL || API_URL === "MASUKKAN_URL_WEB_APP_DISINI") {
    console.log("API_URL belum diatur.");
    return;
  }

  try {

    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "saveScore",
        username: player.username,
        whatsapp: player.whatsapp,
        score: score
      })
    });

  } catch (error) {

    console.error(
      "Gagal menyimpan skor:",
      error
    );
  }
}


// =========================
// LEADERBOARD
// =========================

leaderboardBtn.addEventListener("click", () => {

  gameScreen.classList.add("hidden");
  leaderboardScreen.classList.remove("hidden");

  loadLeaderboard();
});


async function loadLeaderboard() {

  leaderboardList.innerHTML =
    "<p>Memuat leaderboard...</p>";

  if (!API_URL || API_URL === "MASUKKAN_URL_WEB_APP_DISINI") {

    leaderboardList.innerHTML =
      "<p>API_URL belum diatur.</p>";

    return;
  }

  try {

    const response = await fetch(
      API_URL + "?action=leaderboard"
    );

    const data = await response.json();

    leaderboardList.innerHTML = "";

    if (!data.length) {

      leaderboardList.innerHTML =
        "<p>Belum ada skor.</p>";

      return;
    }

    data.forEach((item, index) => {

      const div = document.createElement("div");

      div.className = "rank";

      div.innerHTML = `
        <span>
          #${index + 1} ${escapeHTML(item.username)}
        </span>

        <strong>
          ${item.score}
        </strong>
      `;

      leaderboardList.appendChild(div);
    });

  } catch (error) {

    console.error(error);

    leaderboardList.innerHTML =
      "<p>Gagal mengambil leaderboard.</p>";
  }
}


// =========================
// KEMBALI
// =========================

backBtn.addEventListener("click", () => {

  leaderboardScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
});


// =========================
// RESTART
// =========================

restartBtn.addEventListener("click", () => {

  startGame();
});


// =========================
// KONTROL KEYBOARD
// =========================

document.addEventListener("keydown", event => {

  if (!gameRunning) return;

  switch (event.key) {

    case "ArrowUp":

      if (direction.y !== 1) {
        nextDirection = { x: 0, y: -1 };
      }

      break;

    case "ArrowDown":

      if (direction.y !== -1) {
        nextDirection = { x: 0, y: 1 };
      }

      break;

    case "ArrowLeft":

      if (direction.x !== 1) {
        nextDirection = { x: -1, y: 0 };
      }

      break;

    case "ArrowRight":

      if (direction.x !== -1) {
        nextDirection = { x: 1, y: 0 };
      }

      break;
  }
});


// =========================
// KONTROL HP
// =========================

document.querySelectorAll(
  ".controls button"
).forEach(button => {

  button.addEventListener("click", () => {

    const dir = button.dataset.direction;

    if (dir === "up" && direction.y !== 1) {
      nextDirection = { x: 0, y: -1 };
    }

    if (dir === "down" && direction.y !== -1) {
      nextDirection = { x: 0, y: 1 };
    }

    if (dir === "left" && direction.x !== 1) {
      nextDirection = { x: -1, y: 0 };
    }

    if (dir === "right" && direction.x !== -1) {
      nextDirection = { x: 1, y: 0 };
    }

  });

});


// =========================
// KEAMANAN OUTPUT
// =========================

function escapeHTML(text) {

  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
      }
