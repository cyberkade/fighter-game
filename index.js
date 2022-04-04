const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

context.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
};

let gameOver = false;
console.log(gameOver);

const background = new Sprite({
  position: { x: 0, y: 0 },
  imgSrc: "./images/background.png",
});

const shop = new Sprite({
  position: { x: 625, y: 128 },
  imgSrc: "./images/shop.png",
  scale: 2.75,
  framesMax: 6,
});

const player = new Fighter({
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 10 },
  offset: { x: 0, y: 0 },
});

const enemy = new Fighter({
  position: { x: 900, y: 50 },
  velocity: { x: 0, y: 10 },
  offset: { x: 50, y: 0 },
  color: "blue",
});

function animate() {
  //   if (gameOver === false) {
  window.requestAnimationFrame(animate);
  //   }
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  player.update();
  // enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  //player movement
  if (player.health > 0 && keys.a.pressed && player.lastKey === "a") {
    player.velocity.x = -5;
  } else if (player.health > 0 && keys.d.pressed && player.lastKey === "d") {
    player.velocity.x = 5;
  }

  //enemy movement
  if (
    enemy.health > 0 &&
    keys.ArrowLeft.pressed &&
    enemy.lastKey === "ArrowLeft"
  ) {
    enemy.velocity.x = -5;
  } else if (
    enemy.health > 0 &&
    keys.ArrowRight.pressed &&
    enemy.lastKey === "ArrowRight"
  ) {
    enemy.velocity.x = 5;
  }

  // collision detection
  if (
    rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
    player.isAttacking
  ) {
    player.isAttacking = false;
    enemy.health -= 20;
    document.querySelector("#enemyHealth").style.width = enemy.health + "%";
  }
  if (
    rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
    enemy.isAttacking
  ) {
    enemy.isAttacking = false;
    player.health -= 20;
    document.querySelector("#playerHealth").style.width = player.health + "%";
  }

  //end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    if (gameOver === false) {
      determineWinner({ player, enemy, timerId });
    }
  }
}

//event listeners for movement
window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "d":
      keys.d.pressed = true;
      player.lastKey = "d";
      break;
    case "a":
      keys.a.pressed = true;
      player.lastKey = "a";
      break;
    case "w":
      if (player.health > 0) {
        player.velocity.y = -20;
      }
      break;
    case " ":
      player.attack();
      break;

    //enemy keys
    case "ArrowRight":
      keys.ArrowRight.pressed = true;
      enemy.lastKey = "ArrowRight";
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = true;
      enemy.lastKey = "ArrowLeft";
      break;
    case "ArrowUp":
      if (enemy.health > 0) {
        enemy.velocity.y = -20;
      }
      break;
    case "ArrowDown":
      enemy.attack();
      break;
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;

    //enemy keys
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
  }
});

handleTimer();
animate();
