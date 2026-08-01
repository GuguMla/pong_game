// ----- Canvas Setup -----
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');

// ----- Game Constants -----
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const PLAYER_SPEED = 5;
const COMPUTER_SPEED = 4.5;
const BALL_SPEED_INITIAL = 4;
const BALL_SPEED_INCREMENT = 0.5;
const MAX_BALL_SPEED = 10;

// ----- Game State -----
const player = {
    x: 20,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    score: 0
};

const computer = {
    x: canvas.width - 20 - PADDLE_WIDTH,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    score: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: BALL_SIZE,
    dx: BALL_SPEED_INITIAL,
    dy: BALL_SPEED_INITIAL * 0.6,
    speed: BALL_SPEED_INITIAL
};

let gameRunning = false;
let gameOver = false;

// ----- Keyboard Input -----
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    // Space to start / restart
    if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        if (gameOver) {
            resetGame();
        } else if (!gameRunning) {
            startGame();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// ----- Game Functions -----
function startGame() {
    gameRunning = true;
    gameOver = false;
    resetBall();
}

function resetGame() {
    player.score = 0;
    computer.score = 0;
    playerScoreEl.textContent = '0';
    computerScoreEl.textContent = '0';
    player.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    computer.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    resetBall();
    gameRunning = true;
    gameOver = false;
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = BALL_SPEED_INITIAL;
    const angle = (Math.random() * 0.8 - 0.4); // Random angle between -0.4 and 0.4 rad
    ball.dx = ball.speed * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = ball.speed * Math.sin(angle);
}

// ----- Collision Detection -----
function checkCollision() {
    // Player paddle collision
    if (
        ball.x - ball.size / 2 < player.x + player.width &&
        ball.x + ball.size / 2 > player.x &&
        ball.y + ball.size / 2 > player.y &&
        ball.y - ball.size / 2 < player.y + player.height
    ) {
        ball.dx = Math.abs(ball.dx);
        ball.speed = Math.min(ball.speed + BALL_SPEED_INCREMENT, MAX_BALL_SPEED);
        // Add slight random direction change
        ball.dy += (Math.random() - 0.5) * 1.5;
        // Keep ball from going too vertical
        if (Math.abs(ball.dy) < 1) ball.dy = ball.dy > 0 ? 1.5 : -1.5;
        // Normalize speed
        const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = (ball.dx / currentSpeed) * ball.speed;
        ball.dy = (ball.dy / currentSpeed) * ball.speed;
    }

    // Computer paddle collision
    if (
        ball.x + ball.size / 2 > computer.x &&
        ball.x - ball.size / 2 < computer.x + computer.width &&
        ball.y + ball.size / 2 > computer.y &&
        ball.y - ball.size / 2 < computer.y + computer.height
    ) {
        ball.dx = -Math.abs(ball.dx);
        ball.speed = Math.min(ball.speed + BALL_SPEED_INCREMENT, MAX_BALL_SPEED);
        ball.dy += (Math.random() - 0.5) * 1.5;
        if (Math.abs(ball.dy) < 1) ball.dy = ball.dy > 0 ? 1.5 : -1.5;
        const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = (ball.dx / currentSpeed) * ball.speed;
        ball.dy = (ball.dy / currentSpeed) * ball.speed;
    }
}

// ----- Update Logic -----
function update() {
    if (!gameRunning || gameOver) return;

    // Player movement
    if (keys['w'] || keys['W']) player.dy = -PLAYER_SPEED;
    else if (keys['s'] || keys['S']) player.dy = PLAYER_SPEED;
    else player.dy = 0;

    player.y += player.dy;
    // Keep player paddle in bounds
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

    // Computer AI - tracks the ball with some delay
    const centerDiff = (ball.y - ball.size / 2) - (computer.y + computer.height / 2);
    if (Math.abs(centerDiff) > 15) {
        computer.dy = Math.sign(centerDiff) * COMPUTER_SPEED;
    } else {
        computer.dy = 0;
    }
    computer.y += computer.dy;
    computer.y = Math.max(0, Math.min(canvas.height - computer.height, computer.y));

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball wall collision (top/bottom)
    if (ball.y - ball.size / 2 <= 0 || ball.y + ball.size / 2 >= canvas.height) {
        ball.dy *= -1;
        ball.y = Math.max(ball.size / 2, Math.min(canvas.height - ball.size / 2, ball.y));
    }

    // Ball out of bounds (scoring)
    if (ball.x - ball.size / 2 <= 0) {
        // Computer scores
        computer.score++;
        computerScoreEl.textContent = computer.score;
        resetBall();
        // Give the ball a random direction toward the player
        const angle = (Math.random() * 0.8 - 0.4);
        ball.dx = ball.speed * Math.cos(angle);
        ball.dy = ball.speed * Math.sin(angle);
    } else if (ball.x + ball.size / 2 >= canvas.width) {
        // Player scores
        player.score++;
        playerScoreEl.textContent = player.score;
        resetBall();
        const angle = (Math.random() * 0.8 - 0.4);
        ball.dx = -ball.speed * Math.cos(angle);
        ball.dy = ball.speed * Math.sin(angle);
    }

    // Paddle collision
    checkCollision();

    // Win condition (first to 5)
    if (player.score >= 5 || computer.score >= 5) {
        gameRunning = false;
        gameOver = true;
    }
}

// ----- Drawing -----
function draw() {
    // Clear
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center line (dashed)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Center circle
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Player paddle
    ctx.fillStyle = '#e94560';
    ctx.shadowColor = '#e94560';
    ctx.shadowBlur = 15;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Computer paddle
    ctx.fillStyle = '#0f3460';
    ctx.shadowColor = '#0f3460';
    ctx.fillRect(computer.x, computer.y, computer.width, computer.height);

    // Ball
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#eee';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;

    // Game Over message
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const winner = player.score >= 5 ? '🎉 You Win!' : '😢 Computer Wins!';
        ctx.fillText(winner, canvas.width / 2, canvas.height / 2 - 30);
        ctx.font = '20px "Segoe UI", sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Press SPACE to play again', canvas.width / 2, canvas.height / 2 + 40);
    } else if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏓 PONG', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '18px "Segoe UI", sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Press SPACE to start', canvas.width / 2, canvas.height / 2 + 40);
    }
}

// ----- Game Loop -----
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ----- Start the Loop -----
gameLoop();

// ----- Handle Window Resize (keep canvas proportional) -----
function resizeCanvas() {
    const maxWidth = window.innerWidth - 40;
    const maxHeight = window.innerHeight - 200;
    const canvasAspect = canvas.width / canvas.height;
    let displayWidth = Math.min(800, maxWidth);
    let displayHeight = displayWidth / canvasAspect;
    if (displayHeight > maxHeight) {
        displayHeight = maxHeight;
        displayWidth = displayHeight * canvasAspect;
    }
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
