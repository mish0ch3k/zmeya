const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20;
let snake = [{ x: 10 * box, y: 10 * box }];
let direction = "RIGHT";
let changingDirection = false;
let food = generateFood();
let score = 0;
let gameRunning = false;
let highScore = localStorage.getItem("highScore") || 0;
let gameSpeed = 80; // default: Medium
document.getElementById("highScore").innerHTML = `High Score: ${highScore}`;

function startGame() {
    let nickname = document.getElementById("nickname").value || "Player";
    let snakeColor = document.getElementById("snakeColor").value;

    gameSpeed = parseInt(document.getElementById("difficulty").value);

    
    document.getElementById("menu").style.display = "none";
    document.getElementById("gameOverScore").style.display = "none";
    canvas.style.display = "block";
    document.getElementById("scoreDisplay").style.display = "block";

    score = 0;
    snake = [{ x: 10 * box, y: 10 * box }];
    direction = "RIGHT";
    gameRunning = true;
    requestAnimationFrame(mainGameLoop);
}

function mainGameLoop() {
    if (!gameRunning) return;

    setTimeout(() => {
        changingDirection = false;
        clearCanvas();
        drawFood();
        moveSnake();
        drawSnake();
    
        if (!isGameOver()) {
            requestAnimationFrame(mainGameLoop);
        } else {
            gameOver();
        }
    }, gameSpeed);
    
}

function clearCanvas() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function lightenColor(color, percent) {
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);

    const newR = Math.min(255, r + (255 - r) * percent);
    const newG = Math.min(255, g + (255 - g) * percent);
    const newB = Math.min(255, b + (255 - b) * percent);

    return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
}
function drawSnake() {
    let snakeColor = document.getElementById("snakeColor").value;

    snake.forEach((segment, index) => {
        ctx.beginPath();
        if (index === 0) {
            // Голова — коло
            ctx.fillStyle = snakeColor;
            ctx.arc(segment.x + box / 2, segment.y + box / 2, box / 2, 0, 2 * Math.PI);
        } else {
            // Тіло — закруглений прямокутник
            ctx.fillStyle = lightenColor(snakeColor, 0.3);
            roundRect(ctx, segment.x, segment.y, box, box, 6);
        }
        ctx.fill();
    });
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}



function drawFood() {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, 2 * Math.PI);
    ctx.fill();
}

function moveSnake() {
    let newHead = { ...snake[0] };

    if (direction === "UP") newHead.y -= box;
    if (direction === "DOWN") newHead.y += box;
    if (direction === "LEFT") newHead.x -= box;
    if (direction === "RIGHT") newHead.x += box;

    if (newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        food = generateFood();
    } else {
        snake.pop();
    }

    snake.unshift(newHead);
    document.getElementById("scoreDisplay").innerHTML = `Score: ${score}`;
}

function generateFood() {
    return {
        x: Math.floor(Math.random() * 20) * box,
        y: Math.floor(Math.random() * 20) * box
    };
}

function isGameOver() {
    const head = snake[0];
    return (
        head.x < 0 || head.x >= canvas.width ||
        head.y < 0 || head.y >= canvas.height ||
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
    );
}

function gameOver() {
    gameRunning = false;
    document.getElementById("menu").style.display = "flex";
    document.getElementById("gameOverScore").innerHTML = `Game Over - Score: <b>${score}</b>`;
    document.getElementById("gameOverScore").style.display = "block";

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }
    
    document.getElementById("highScore").innerHTML = `High Score: ${highScore}`;

    fetch("/submit_score", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nickname: document.getElementById("nickname").value || "Player",
            score: score,
            difficulty: document.getElementById("difficulty").value
        })
    });
    
}

document.addEventListener("keydown", event => {
    if (changingDirection) return;
    changingDirection = true;
    
    const key = event.key;
    if (key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    if (key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});
