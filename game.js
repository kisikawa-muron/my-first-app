const canvas = document.querySelector("#game-canvas");
const context = canvas.getContext("2d");
const overlay = document.querySelector("#game-overlay");
const startButton = document.querySelector("#start-button");
const overlayEyebrow = document.querySelector("#overlay-eyebrow");
const overlayTitle = document.querySelector("#overlay-title");
const overlayCopy = document.querySelector("#overlay-copy");
const coinCount = document.querySelector("#coin-count");
const coinTotal = document.querySelector("#coin-total");
const progressLabel = document.querySelector("#progress-label");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const WORLD_WIDTH = 5400;
const GOAL_X = 5150;
const GRAVITY = 1750;
const MOVE_SPEED = 285;
const JUMP_SPEED = 670;

const platforms = [
    { x: 0, y: 460, width: 680, height: 80 },
    { x: 790, y: 460, width: 580, height: 80 },
    { x: 1490, y: 460, width: 600, height: 80 },
    { x: 2210, y: 460, width: 590, height: 80 },
    { x: 2920, y: 460, width: 590, height: 80 },
    { x: 3630, y: 460, width: 590, height: 80 },
    { x: 4340, y: 460, width: 1060, height: 80 },
    { x: 430, y: 375, width: 150, height: 18 },
    { x: 920, y: 355, width: 150, height: 18 },
    { x: 1630, y: 375, width: 170, height: 18 },
    { x: 2440, y: 355, width: 170, height: 18 },
    { x: 3150, y: 375, width: 170, height: 18 },
    { x: 3860, y: 355, width: 170, height: 18 },
    { x: 4570, y: 375, width: 180, height: 18 },
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
    { x: 3070, y: 415 },
    { x: 3235, y: 330 },
    { x: 3470, y: 410 },
    { x: 3945, y: 310 },
    { x: 4140, y: 410 },
    { x: 4650, y: 330 },
    { x: 4920, y: 410 },
];

const enemies = [
    { spawnX: 335, x: 335, minX: 190, maxX: 570, y: 420, width: 36, height: 40, speed: 82, direction: 1, defeated: false },
    { spawnX: 1050, x: 1050, minX: 850, maxX: 1260, y: 420, width: 36, height: 40, speed: 96, direction: -1, defeated: false },
    { spawnX: 1810, x: 1810, minX: 1550, maxX: 2010, y: 420, width: 36, height: 40, speed: 88, direction: 1, defeated: false },
    { spawnX: 2530, x: 2530, minX: 2300, maxX: 2760, y: 420, width: 36, height: 40, speed: 104, direction: -1, defeated: false },
    { spawnX: 3260, x: 3260, minX: 3000, maxX: 3470, y: 420, width: 36, height: 40, speed: 92, direction: 1, defeated: false },
    { spawnX: 3900, x: 3900, minX: 3700, maxX: 4170, y: 420, width: 36, height: 40, speed: 100, direction: -1, defeated: false },
    { spawnX: 4740, x: 4740, minX: 4420, maxX: 5090, y: 420, width: 36, height: 40, speed: 108, direction: 1, defeated: false },
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
let noticeText = "もう一度ジャンプ！";
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
        enemies.forEach((enemy) => {
            enemy.x = enemy.spawnX;
            enemy.direction = 1;
            enemy.defeated = false;
        });
        updateCoinCount();
    }

    state = "playing";
    overlay.classList.add("is-hidden");
}

function updateCoinCount() {
    coinCount.textContent = String(collectedCoins);
    coinTotal.textContent = String(coins.length);
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

    enemies.forEach((enemy) => {
        if (enemy.defeated) return;
        enemy.x += enemy.speed * enemy.direction * delta;
        if (enemy.x <= enemy.minX || enemy.x + enemy.width >= enemy.maxX) {
            enemy.x = Math.max(enemy.minX, Math.min(enemy.maxX - enemy.width, enemy.x));
            enemy.direction *= -1;
        }
    });

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

    const nextBottom = player.y + player.height;
    let stompedEnemy = false;
    if (player.velocityY > 0) {
        for (const enemy of enemies) {
            const overlaps = !enemy.defeated
                && player.x + player.width > enemy.x
                && player.x < enemy.x + enemy.width;
            const landsOnEnemy = previousBottom <= enemy.y + 10 && nextBottom >= enemy.y;
            if (overlaps && landsOnEnemy) {
                enemy.defeated = true;
                player.y = enemy.y - player.height;
                player.velocityY = -JUMP_SPEED * 0.48;
                stompedEnemy = true;
                break;
            }
        }
    }

    if (player.velocityY >= 0) {
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

    if (!stompedEnemy) {
        for (const enemy of enemies) {
            const overlaps = !enemy.defeated
                && player.x + player.width > enemy.x
                && player.x < enemy.x + enemy.width
                && player.y + player.height > enemy.y + 6
                && player.y < enemy.y + enemy.height;
            if (overlaps) {
                respawnPlayer("敵にぶつかった！");
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
        respawnPlayer("もう一度ジャンプ！");
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

function respawnPlayer(message) {
    player.x = 72;
    player.y = 360;
    player.velocityY = 0;
    player.grounded = false;
    cameraX = 0;
    noticeText = message;
    noticeTimer = 1.4;
}

function drawBackground() {
    const sky = context.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, "#090d27");
    sky.addColorStop(0.52, "#20204d");
    sky.addColorStop(0.82, "#71346f");
    sky.addColorStop(1, "#f15d89");
    context.fillStyle = sky;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    for (let i = 0; i < 54; i += 1) {
        const range = WIDTH + 24;
        const drift = cameraX * (0.025 + (i % 4) * 0.012);
        const x = ((i * 149 - drift) % range + range) % range - 12;
        const y = 22 + ((i * 67 + 31) % 205);
        const twinkle = 0.45 + (Math.sin(elapsed * 2 + i * 7) + 1) * 0.25;
        context.fillStyle = `rgba(204, 229, 255, ${twinkle})`;
        context.fillRect(x, y, i % 7 === 0 ? 2 : 1, i % 7 === 0 ? 2 : 1);
    }

    const moonX = 755 - cameraX * 0.055;
    context.fillStyle = "rgba(255, 89, 206, 0.1)";
    context.beginPath();
    context.arc(moonX, 126, 62, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "rgba(255, 132, 218, 0.2)";
    context.beginPath();
    context.arc(moonX, 126, 47, 0, Math.PI * 2);
    context.fill();
    const moon = context.createLinearGradient(moonX - 30, 82, moonX + 28, 170);
    moon.addColorStop(0, "#ffe4ff");
    moon.addColorStop(1, "#ff72c8");
    context.fillStyle = moon;
    context.beginPath();
    context.arc(moonX, 126, 36, 0, Math.PI * 2);
    context.fill();

    const horizonGlow = context.createLinearGradient(0, 230, 0, 460);
    horizonGlow.addColorStop(0, "rgba(255, 79, 183, 0)");
    horizonGlow.addColorStop(0.72, "rgba(255, 67, 169, 0.13)");
    horizonGlow.addColorStop(1, "rgba(54, 219, 255, 0.12)");
    context.fillStyle = horizonGlow;
    context.fillRect(0, 230, WIDTH, 230);

    drawSkyline(0.13, 305, "#202348", 55, 105, 18);
    drawSkyline(0.28, 390, "#111a35", 42, 145, 30);
}

function drawSkyline(parallax, baseY, color, minWidth, maxHeight, gap) {
    const stride = minWidth + gap;
    const shift = ((cameraX * parallax) % stride + stride) % stride;
    for (let i = -2; i < 20; i += 1) {
        const x = i * stride - shift;
        const width = minWidth + ((i * 17 + 40) % 24);
        const height = 65 + (((i * 43 + 120) % maxHeight) + maxHeight) % maxHeight;
        context.fillStyle = color;
        context.fillRect(x, baseY - height, width, height);

        if (i % 3 === 0) {
            context.fillStyle = "#29305a";
            context.fillRect(x + width * 0.25, baseY - height - 12, width * 0.5, 12);
            context.fillStyle = "rgba(84, 245, 242, 0.48)";
            context.fillRect(x + width * 0.46, baseY - height - 10, 3, 5);
        }

        for (let row = baseY - height + 12; row < baseY - 10; row += 17) {
            for (let column = x + 7; column < x + width - 5; column += 13) {
                const lit = (Math.floor(column) + Math.floor(row) + i * 11) % 5;
                if (lit === 0 || lit === 2) {
                    context.fillStyle = lit === 0
                        ? "rgba(84, 245, 242, 0.55)"
                        : "rgba(255, 89, 206, 0.43)";
                    context.fillRect(column, row, 4, 7);
                }
            }
        }
    }
}

function drawPlatforms() {
    for (const platform of platforms) {
        const screenX = platform.x - cameraX;
        if (screenX + platform.width < -5 || screenX > WIDTH + 5) continue;

        const surface = context.createLinearGradient(0, platform.y, 0, platform.y + platform.height);
        surface.addColorStop(0, platform.height > 30 ? "#27385a" : "#3b4a75");
        surface.addColorStop(1, platform.height > 30 ? "#121a35" : "#202747");
        context.fillStyle = surface;
        context.fillRect(screenX, platform.y, platform.width, platform.height);

        context.fillStyle = "#54f5f2";
        context.fillRect(screenX, platform.y, platform.width, 4);
        context.fillStyle = "rgba(84, 245, 242, 0.22)";
        context.fillRect(screenX, platform.y + 4, platform.width, 2);
        context.fillStyle = "rgba(255, 89, 206, 0.7)";
        context.fillRect(screenX + platform.width - 18, platform.y + 1, 18, 3);

        if (platform.height > 30) {
            for (let x = screenX + 16; x < screenX + platform.width - 8; x += 42) {
                context.fillStyle = "rgba(84, 245, 242, 0.2)";
                context.fillRect(x, platform.y + 23, 12, 10);
                context.fillStyle = "rgba(255, 89, 206, 0.24)";
                context.fillRect(x + 3, platform.y + 39, 6, 8);
            }
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

function drawEnemies() {
    for (const enemy of enemies) {
        if (enemy.defeated) continue;
        const x = enemy.x - cameraX;
        if (x + enemy.width < -20 || x > WIDTH + 20) continue;
        const bob = Math.sin(elapsed * 8 + enemy.spawnX) * 2;
        const y = enemy.y + bob;

        context.fillStyle = "rgba(4, 7, 23, 0.5)";
        context.beginPath();
        context.ellipse(x + enemy.width / 2, enemy.y + enemy.height + 4, 20, 5, 0, 0, Math.PI * 2);
        context.fill();

        context.save();
        context.shadowColor = "#ff59ce";
        context.shadowBlur = 13;
        context.fillStyle = "#242143";
        context.fillRect(x + 3, y + 8, enemy.width - 6, 27);
        context.fillStyle = "#7b326f";
        context.fillRect(x + 6, y + 12, enemy.width - 12, 18);
        context.restore();

        context.fillStyle = "#ff59ce";
        context.fillRect(x + 8, y + 5, enemy.width - 16, 7);
        context.fillStyle = "#121936";
        context.fillRect(x + 9, y + 15, enemy.width - 18, 11);
        context.fillStyle = "#ff557f";
        context.shadowColor = "#ff335f";
        context.shadowBlur = 8;
        context.fillRect(x + (enemy.direction > 0 ? 13 : 21), y + 18, 5, 4);
        context.fillRect(x + (enemy.direction > 0 ? 21 : 13), y + 18, 5, 4);
        context.shadowBlur = 0;
        context.fillStyle = "#54f5f2";
        context.fillRect(x + 5, y + 32, enemy.width - 10, 3);

        context.strokeStyle = "#ff59ce";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(x + enemy.width / 2, y + 5);
        context.lineTo(x + enemy.width / 2, y - 2);
        context.stroke();
        context.fillStyle = "#54f5f2";
        context.beginPath();
        context.arc(x + enemy.width / 2, y - 3, 3, 0, Math.PI * 2);
        context.fill();
    }
}

function drawGoal() {
    const x = GOAL_X - cameraX;
    context.fillStyle = "rgba(84, 245, 242, 0.18)";
    context.beginPath();
    context.ellipse(x + 3, 460, 34, 10, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#54f5f2";
    context.fillRect(x - 2, 310, 9, 150);
    context.fillStyle = "#d9ffff";
    context.fillRect(x, 310, 3, 150);

    const flagWave = Math.sin(elapsed * 4) * 4;
    context.fillStyle = "rgba(255, 89, 206, 0.28)";
    context.beginPath();
    context.moveTo(x + 7, 312);
    context.lineTo(x + 69, 330 + flagWave);
    context.lineTo(x + 7, 348);
    context.closePath();
    context.fill();
    const flag = context.createLinearGradient(x, 0, x + 65, 0);
    flag.addColorStop(0, "#54f5f2");
    flag.addColorStop(1, "#ff59ce");
    context.fillStyle = flag;
    context.beginPath();
    context.moveTo(x + 7, 312);
    context.lineTo(x + 65, 330 + flagWave);
    context.lineTo(x + 7, 348);
    context.closePath();
    context.fill();
}

function drawPlayer() {
    const x = player.x - cameraX;
    const moving = input.left || input.right;
    const bob = player.grounded && moving
        ? Math.sin(elapsed * 18) * 1.5
        : 0;
    const y = player.y + bob;
    const stride = player.grounded && moving ? Math.sin(elapsed * 18) * 3 : 0;

    if (moving) {
        context.save();
        context.globalAlpha = 0.5;
        context.strokeStyle = "#54f5f2";
        context.lineWidth = 2;
        for (let i = 0; i < 3; i += 1) {
            const trailX = player.facing > 0 ? x - 5 - i * 7 : x + player.width + 5 + i * 7;
            context.beginPath();
            context.moveTo(trailX, y + 15 + i * 8);
            context.lineTo(trailX + (player.facing > 0 ? -8 : 8), y + 15 + i * 8);
            context.stroke();
        }
        context.restore();
    }

    context.fillStyle = "rgba(4, 7, 23, 0.52)";
    context.beginPath();
    context.ellipse(x + player.width / 2, player.y + player.height + 5, 18, 5, 0, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.shadowColor = "#54f5f2";
    context.shadowBlur = 14;
    context.fillStyle = "#171b3d";
    context.fillRect(x + 5, y + 14, 24, 21);
    const jacket = context.createLinearGradient(x, y + 13, x + 32, y + 36);
    jacket.addColorStop(0, "#ff59ce");
    jacket.addColorStop(1, "#8c5cff");
    context.fillStyle = jacket;
    context.fillRect(x + 7, y + 15, 20, 18);
    context.restore();

    context.fillStyle = "#54f5f2";
    context.fillRect(x + 7, y + 30, 20, 3);
    context.fillStyle = "#131936";
    context.fillRect(x + 8, y + 2, 19, 15);
    context.fillStyle = "#ffbfdd";
    context.fillRect(x + 11, y + 5, 13, 10);
    context.fillStyle = "#ff59ce";
    context.fillRect(x + 7, y, 21, 6);
    context.fillStyle = "#54f5f2";
    context.fillRect(x + (player.facing > 0 ? 18 : 10), y + 8, 10, 3);
    context.fillStyle = "#fff";
    context.fillRect(x + (player.facing > 0 ? 24 : 10), y + 8, 2, 2);

    context.strokeStyle = "#171b3d";
    context.lineWidth = 5;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(x + 13, y + 32);
    context.lineTo(x + 12 - stride, y + 40);
    context.moveTo(x + 22, y + 32);
    context.lineTo(x + 22 + stride, y + 40);
    context.stroke();
    context.fillStyle = "#54f5f2";
    context.fillRect(x + 6 - stride, y + 39, 9, 4);
    context.fillRect(x + 20 + stride, y + 39, 9, 4);

    context.fillStyle = "#ff8be0";
    context.beginPath();
    context.moveTo(x + (player.facing > 0 ? 7 : 27), y + 17);
    context.lineTo(x + (player.facing > 0 ? -1 : 35), y + 26 + stride);
    context.lineTo(x + (player.facing > 0 ? 8 : 26), y + 28);
    context.closePath();
    context.fill();
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
    context.fillText(noticeText, WIDTH / 2, 57);
    context.restore();
}

function render() {
    context.clearRect(0, 0, WIDTH, HEIGHT);
    drawBackground();
    drawPlatforms();
    drawCoins();
    drawEnemies();
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
