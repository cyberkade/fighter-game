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
  position: { x: 50, y: 0 },
  velocity: { x: 0, y: 10 },
  imgSrc: "./images/samuraiMack/Idle.png",
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 155,
  },
  sprites: {
    idle: {
      imgSrc: "./images/samuraiMack/Idle.png",
      framesMax: 8,
    },
    run: {
      imgSrc: "./images/samuraiMack/Run.png",
      framesMax: 8,
    },
    jump: {
      imgSrc: "./images/samuraiMack/Jump.png",
      framesMax: 2,
    },
    fall: {
      imgSrc: "./images/samuraiMack/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imgSrc: "./images/samuraiMack/attack1.png",
      framesMax: 6,
    },
    takeHit: {
      imgSrc: "./images/samuraiMack/Take Hit S.png",
      framesMax: 4,
    },
    death: {
      imgSrc: "./images/samuraiMack/Death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: -60,
      y: -50,
    },
    width: 185,
    height: 50,
  },
});

const enemy = new Fighter({
  position: { x: 830, y: 100 },
  velocity: { x: 0, y: 10 },
  imgSrc: "./images/evilWizard/Idle.png",
  framesMax: 8,
  scale: 2.4,
  offset: {
    x: 285,
    y: 251,
  },
  sprites: {
    idle: {
      imgSrc: "./images/evilWizard/Idle.png",
      framesMax: 8,
    },
    run: {
      imgSrc: "./images/evilWizard/Run.png",
      framesMax: 8,
    },
    jump: {
      imgSrc: "./images/evilWizard/Jump.png",
      framesMax: 2,
    },
    fall: {
      imgSrc: "./images/evilWizard/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imgSrc: "./images/evilWizard/attack1.png",
      framesMax: 8,
    },
    takeHit: {
      imgSrc: "./images/evilWizard/Take hit.png",
      framesMax: 3,
    },
    death: {
      imgSrc: "./images/evilWizard/Death.png",
      framesMax: 7,
    },
  },
  attackBox: {
    offset: {
      x: 195,
      y: -50,
    },
    width: 185,
    height: 50,
  },
  name: "evilWizard",
});

function animate() {
  //   if (gameOver === false) {
  window.requestAnimationFrame(animate);
  //   }
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  context.fillStyle = "rgba(255,255,255, 0.1)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  //player movement
  if (player.health > 0 && keys.a.pressed && player.lastKey === "a") {
    player.velocity.x = -5;
    player.switchSprite("run");
  } else if (player.health > 0 && keys.d.pressed && player.lastKey === "d") {
    player.velocity.x = 5;
    player.switchSprite("run");
  } else {
    player.switchSprite("idle");
  }

  // player jumping
  if (player.velocity.y < 0) {
    player.switchSprite("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprite("fall");
  }

  //enemy movement
  if (
    enemy.health > 0 &&
    keys.ArrowLeft.pressed &&
    enemy.lastKey === "ArrowLeft"
  ) {
    enemy.velocity.x = -5;
    enemy.switchSprite("run");
  } else if (
    enemy.health > 0 &&
    keys.ArrowRight.pressed &&
    enemy.lastKey === "ArrowRight"
  ) {
    enemy.velocity.x = 5;
    enemy.switchSprite("run");
  } else {
    enemy.switchSprite("idle");
  }

  // enemy jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite("fall");
  }

  // collision detection player, enemy gets hit
  if (
    rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit();
    player.isAttacking = false;
    // document.querySelector("#enemyHealth").style.width = enemy.health + "%";
    gsap.to("#enemyHealth", {
      width: enemy.health + "%",
    });
  }
  // missed attack player
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }

  // collision detection enemy, player gets hit
  if (
    rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 4
  ) {
    player.takeHit();
    enemy.isAttacking = false;
    gsap.to("#playerHealth", {
      width: player.health + "%",
    });
  }

  // missed attack enemy
  if (enemy.isAttacking && enemy.framesCurrent === 4) {
    enemy.isAttacking = false;
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
