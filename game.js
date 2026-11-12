const canvas = document.querySelector("#game-canvas");
const context = canvas.getContext("2d");
const overlay = document.querySelector("#game-overlay");
const startButton = document.querySelector("#start-button");
const overlayEyebrow = document.querySelector("#overlay-eyebrow");
const overlayTitle = document.querySelector("#overlay-title");
const overlayCopy = document.querySelector("#overlay-copy");
const coinCount = document.querySelector("#coin-count");
const progressLabel = document.querySelector("#progress-label");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const WORLD_WIDTH = 3200;
const GOAL_X = 3020;
const GRAVITY = 1750;
const MOVE_SPEED = 285;
const JUMP_SPEED = 670;

const platforms = [
    { x: 0, y: 460, width: 680, height: 80 },
    { x: 790, y: 460, width: 580, height: 80 },
    { x: 1490, y: 460, width: 600, height: 80 },
    { x: 2210, y: 460, width: 890, height: 80 },
    { x: 430, y: 375, width: 150, height: 18 },
    { x: 920, y: 355, width: 150, height: 18 },
    { x: 1630, y: 375, width: 170, height: 18 },
    { x: 2440, y: 355, width: 170, height: 18 },
];

const coins = [
    { x: 270, y: 415 },
    { x: 510, y: 330 },
    { x: 700, y: 400 },
    { x: 1000, y: 310 },
    { x: 1270, y: 410 },
    { x: 1710, y: 330 },
    { x: 1980, y: 410 },
    { x: 2525, y: 310 },
];

const player = {
    x: 72,
    y: 360,
    width: 34,
    height: 44,
    velocityY: 0,
    grounded: false,
    facing: 1,
};

const input = {
    left: false,
    right: false,
    jumpPressed: false,
};

let state = "ready";
let cameraX = 0;
let elapsed = 0;
let noticeTimer = 0;
let collectedCoins = 0;
let previousTime = 0;

function startGame() {
    if (state === "won") {
        collectedCoins = 0;
        coins.forEach((coin) => {
            coin.collected = false;
        });
        player.x = 72;
        player.y = 360;
        player.velocityY = 0;
        player.grounded = false;
        cameraX = 0;
        updateCoinCount();
    }

    state = "playing";
    overlay.classList.add("is-hidden");
}

function updateCoinCount() {
    coinCount.textContent = String(collectedCoins);
}

function setOverlay(eyebrow, title, copy, buttonText) {
    overlayEyebrow.textContent = eyebrow;
    overlayTitle.textContent = title;
    overlayCopy.textContent = copy;
    startButton.innerHTML = `${buttonText} <span aria-hidden="true">→</span>`;
    overlay.classList.remove("is-hidden");
}

function handleJump() {
    if (state !== "playing") {
        startGame();
    }
    input.jumpPressed = true;
}

function onKeyDown(event) {
    const key = event.key.toLowerCase();
    if (["arrowleft", "arrowright", "arrowup", " ", "a", "d", "w"].includes(key)) {
        event.preventDefault();
    }

    if (key === "arrowleft" || key === "a") input.left = true;
    if (key === "arrowright" || key === "d") input.right = true;
    if (key === "arrowup" || key === " " || key === "w") {
        if (!event.repeat) handleJump();
    }
    if (key === "enter" && state !== "playing") startGame();
}

function onKeyUp(event) {
    const key = event.key.toLowerCase();
    if (key === "arrowleft" || key === "a") input.left = false;
    if (key === "arrowright" || key === "d") input.right = false;
}

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);
window.addEventListener("blur", () => {
    input.left = false;
    input.right = false;
});

document.querySelectorAll("[data-control]").forEach((button) => {
    const control = button.dataset.control;

    button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        button.classList.add("is-pressed");
        if (control === "jump") {
            handleJump();
        } else {
            input[control] = true;
            if (state !== "playing") startGame();
        }
    });

    const release = () => {
        button.classList.remove("is-pressed");
        if (control !== "jump") input[control] = false;
    };

    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
});

startButton.addEventListener("click", startGame);

function update(delta) {
    if (state !== "playing") return;

    elapsed += delta;
    noticeTimer = Math.max(0, noticeTimer - delta);

    const direction = Number(input.right) - Number(input.left);
    player.x += direction * MOVE_SPEED * delta;
    player.x = Math.max(0, Math.min(WORLD_WIDTH - player.width, player.x));
    if (direction !== 0) player.facing = direction;

    if (input.jumpPressed && player.grounded) {
        player.velocityY = -JUMP_SPEED;
        player.grounded = false;
    }
    input.jumpPressed = false;

    const previousBottom = player.y + player.height;
    player.velocityY += GRAVITY * delta;
    player.y += player.velocityY * delta;
    player.grounded = false;

    if (player.velocityY >= 0) {
        const nextBottom = player.y + player.height;
        for (const platform of platforms) {
            const overlaps = player.x + player.width > platform.x
                && player.x < platform.x + platform.width;
            if (overlaps && previousBottom <= platform.y && nextBottom >= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.grounded = true;
                break;
            }
        }
    }

    for (const coin of coins) {
        if (coin.collected) continue;
        const distanceX = player.x + player.width / 2 - coin.x;
        const distanceY = player.y + player.height / 2 - coin.y;
        if (Math.hypot(distanceX, distanceY) < 33) {
            coin.collected = true;
            collectedCoins += 1;
            updateCoinCount();
        }
    }

    if (player.y > HEIGHT + 80) {
        player.x = 72;
        player.y = 360;
        player.velocityY = 0;
        player.grounded = false;
        cameraX = 0;
        noticeTimer = 1.4;
    }

    if (player.x + player.width >= GOAL_X) {
        state = "won";
        setOverlay(
            "STAGE CLEAR!",
            "ゴール！おめでとう。",
            `コインを ${collectedCoins} 枚集めたよ。もう一度プレイして、全部集めてみよう。`,
            "もう一度プレイ",
        );
    }

    cameraX = Math.max(0, Math.min(WORLD_WIDTH - WIDTH, player.x - WIDTH * 0.36));
    progressLabel.innerHTML = `ゴールまで <span>${Math.max(0, Math.ceil(GOAL_X - player.x))}m</span>`;
}

function drawBackground() {
    const sky = context.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, "#26385e");
    sky.addColorStop(0.65, "#53658a");
    sky.addColorStop(1, "#f1a37c");
    context.fillStyle = sky;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.fillStyle = "rgba(255, 222, 164, 0.85)";
    context.beginPath();
    context.arc(760 - cameraX * 0.08, 115, 36, 0, Math.PI * 2);
    context.fill();

    drawSkyline(0.16, 300, "#354568", 54, 100, 19);
    drawSkyline(0.3, 370, "#283858", 40, 130, 37);

    context.fillStyle = "rgba(28, 38, 63, 0.36)";
    for (let i = 0; i < 8; i += 1) {
        const x = ((i * 170 - cameraX * 0.22) % (WIDTH + 220)) - 100;
        const y = 90 + (i % 3) * 35;
        context.beginPath();
        context.ellipse(x, y, 42, 9, 0, 0, Math.PI * 2);
        context.ellipse(x + 24, y - 5, 28, 11, 0, 0, Math.PI * 2);
        context.ellipse(x + 49, y, 34, 8, 0, 0, Math.PI * 2);
        context.fill();
    }
}

function drawSkyline(parallax, baseY, color, minWidth, maxHeight, gap) {
    context.fillStyle = color;
    const shift = (cameraX * parallax) % (minWidth + gap);
    for (let i = -2; i < 20; i += 1) {
        const x = i * (minWidth + gap) - shift;
        const height = 55 + ((i * 43 + 120) % maxHeight);
        context.fillRect(x, baseY - height, minWidth, height);
        if (i % 3 === 0) {
            context.fillRect(x + minWidth * 0.25, baseY - height - 12, minWidth * 0.5, 12);
        }
    }
}

function drawPlatforms() {
    for (const platform of platforms) {
        const screenX = platform.x - cameraX;
        if (screenX + platform.width < -5 || screenX > WIDTH + 5) continue;

        context.fillStyle = platform.height > 30 ? "#28344d" : "#374866";
        context.fillRect(screenX, platform.y, platform.width, platform.height);
        context.fillStyle = "#78f0c2";
        context.fillRect(screenX, platform.y, platform.width, 5);

        context.fillStyle = "rgba(154, 177, 210, 0.17)";
        for (let x = screenX + 16; x < screenX + platform.width - 8; x += 32) {
            context.fillRect(x, platform.y + 20, 3, 3);
        }
    }
}

function drawCoins() {
    for (const coin of coins) {
        if (coin.collected) continue;
        const x = coin.x - cameraX;
        if (x < -20 || x > WIDTH + 20) continue;
        const pulse = 1 + Math.sin(elapsed * 5 + coin.x) * 0.08;

        context.save();
        context.translate(x, coin.y + Math.sin(elapsed * 3 + coin.x) * 4);
        context.scale(pulse, 1);
        context.fillStyle = "rgba(255, 215, 111, 0.2)";
        context.beginPath();
        context.arc(0, 0, 15, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#ffd76f";
        context.beginPath();
        context.arc(0, 0, 8, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#fff0b8";
        context.fillRect(-1, -4, 2, 8);
        context.restore();
    }
}

function drawGoal() {
    const x = GOAL_X - cameraX;
    context.fillStyle = "#e7ecfa";
    context.fillRect(x, 310, 5, 150);
    context.fillStyle = "#78f0c2";
    context.beginPath();
    context.moveTo(x + 5, 312);
    context.lineTo(x + 61, 330);
    context.lineTo(x + 5, 348);
    context.closePath();
    context.fill();
    context.fillStyle = "rgba(120, 240, 194, 0.15)";
    context.beginPath();
    context.ellipse(x + 3, 460, 28, 7, 0, 0, Math.PI * 2);
    context.fill();
}

function drawPlayer() {
    const x = player.x - cameraX;
    const bob = player.grounded && (input.left || input.right)
        ? Math.sin(elapsed * 18) * 2
        : 0;
    const y = player.y + bob;

    context.fillStyle = "rgba(11, 18, 33, 0.25)";
    context.beginPath();
    context.ellipse(x + player.width / 2, player.y + player.height + 4, 18, 5, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#ff956f";
    context.fillRect(x + 4, y + 9, player.width - 8, player.height - 10);
    context.fillStyle = "#ffb18e";
    context.fillRect(x + 7, y, player.width - 14, 17);
    context.fillStyle = "#24314a";
    const eyeX = player.facing > 0 ? x + 23 : x + 10;
    context.fillRect(eyeX, y + 6, 4, 4);
    context.fillStyle = "#78f0c2";
    context.fillRect(x + 4, y + player.height - 9, player.width - 8, 6);
    context.fillStyle = "#d4e4f2";
    context.fillRect(x + 3, y + player.height - 3, 12, 4);
    context.fillRect(x + player.width - 15, y + player.height - 3, 12, 4);
}

function drawNotice() {
    if (noticeTimer <= 0) return;
    context.save();
    context.globalAlpha = Math.min(1, noticeTimer * 2);
    context.fillStyle = "rgba(16, 23, 42, 0.72)";
    context.fillRect(WIDTH / 2 - 100, 34, 200, 36);
    context.fillStyle = "#f4f6ff";
    context.font = "600 12px 'DM Sans', 'Noto Sans JP', sans-serif";
    context.textAlign = "center";
    context.fillText("もう一度ジャンプ！", WIDTH / 2, 57);
    context.restore();
}

function render() {
    context.clearRect(0, 0, WIDTH, HEIGHT);
    drawBackground();
    drawPlatforms();
    drawCoins();
    drawGoal();
    drawPlayer();
    drawNotice();
}

function frame(timestamp) {
    const delta = previousTime === 0 ? 0 : Math.min((timestamp - previousTime) / 1000, 0.033);
    previousTime = timestamp;
    update(delta);
    render();
    requestAnimationFrame(frame);
}

updateCoinCount();
requestAnimationFrame(frame);
