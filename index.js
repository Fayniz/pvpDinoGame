import Player from "./Player.js";
import Ground from "./Ground.js";
import CactiController from "./CactiController.js";

const canvas = document.getElementById("game");
const  ctx = canvas.getContext("2d");

const GAME_SPEED_START = 0.85;
const GAME_SPEED_INCREMENT = 0.00001;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
const PLAYER_WIDTH = 88/1.5;
const PLAYER_HEIGHT = 94/1.5;
const MAX_JUMP_HEIGHT = GAME_HEIGHT*0.75;
const MIN_JUMP_HEIGHT = 150;
const GROUND_WIDTH = 2400;
const GROUND_HEIGHT = 24;
const GROUND_AND_CACTUS_SPEED = 0.5;

const cactusScale = 2;
const CACTI_CONFIG = [
  {width:48/cactusScale, height: 100/cactusScale, image: "images/cactus_1.png"},
  {width:98/cactusScale, height: 100/cactusScale, image: "images/cactus_2.png"},
  {width:68/cactusScale, height: 100/cactusScale, image: "images/cactus_3.png"}
]

//Game Object
let player1 = null;
let player2 = null;
let ground = null;
let cactiController = null;

let scaleRatio = null;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;
let gameOver = false;
let hasAddedEventListenerforRestart = false;

function updateGameSpeed(frameTimeDelta) {
  gameSpeed += GAME_SPEED_INCREMENT * frameTimeDelta;
}

function createSprites(){
  const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
  const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
  const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
  const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;

  player1 = new Player(
    ctx,
    playerWidthInGame,
    playerHeightInGame,
    minJumpHeightInGame,
    maxJumpHeightInGame,
    scaleRatio,
    "images/standing_still.png",
    ["images/dino_run1.png", "images/dino_run2.png"]
  );    
  player2 = new Player(
    ctx,
    playerWidthInGame,
    playerHeightInGame,
    minJumpHeightInGame,
    maxJumpHeightInGame,
    scaleRatio,
    "images/inverted_standing_still.png",
    ["images/inverted_dino_run1.png", "images/inverted_dino_run2.png"]
    );
    player2.x = 400* scaleRatio;

    const groundWidthInGame = GROUND_WIDTH * scaleRatio;
    const groundHeightInGame = GROUND_HEIGHT * scaleRatio;
    ground = new Ground(
      ctx,
      groundWidthInGame,
      groundHeightInGame,
      GROUND_AND_CACTUS_SPEED,
      scaleRatio
    );

    const cactiImages = CACTI_CONFIG.map(cactus => {
      const image = new Image();
      image.src = cactus.image;
      return{
        image:image,
        width: cactus.width * scaleRatio,
        height: cactus.height * scaleRatio,
      };
    });

    cactiController = new CactiController(
      ctx,
      cactiImages,
      scaleRatio,
      GROUND_AND_CACTUS_SPEED
    );
}
function setScreen() {
  scaleRatio = getScaleRatio();
  canvas.width = GAME_WIDTH * scaleRatio;
  canvas.height = GAME_HEIGHT * scaleRatio;
  createSprites();
}
function clearScreen(){
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width,canvas.height);
}
function getScaleRatio() {
  const screenHeight = Math.min(
    window.innerHeight,
    document.documentElement.clientHeight
  );

  const screenWidth = Math.min(
    window.innerWidth,
    document.documentElement.clientWidth
  );

  //window is wider than the game width
  if (screenWidth / screenHeight < GAME_WIDTH / GAME_HEIGHT) {
    return screenWidth / GAME_WIDTH;
  } else {
    return screenHeight / GAME_HEIGHT;
  }
}
function gameLoop(currentTime){
    if(previousTime === null){
        previousTime = currentTime;
        requestAnimationFrame(gameLoop);
        return;
    }
    const frameTimeDelta = currentTime - previousTime;
    previousTime = currentTime;
    clearScreen();

    if (!gameOver) {
    //update game objects
    player1.setRunning(true);
    player2.setRunning(true);
    ground.update(gameSpeed, frameTimeDelta);
    player1.update(gameSpeed, frameTimeDelta);
    player2.update(gameSpeed, frameTimeDelta);
    cactiController.update(gameSpeed, frameTimeDelta);
    updateGameSpeed(frameTimeDelta);
    }
    
    if (!gameOver && (cactiController.collideWith(player1) || cactiController.collideWith(player2))) {
      gameOver = true;
      setupGameReset();
    }

    //draw game objects
    ground.draw();
    player1.draw();
    player2.draw();
    cactiController.draw();

    if (gameOver) {
      showGameOver();
    }

    requestAnimationFrame(gameLoop);
}
function playerUnphone(){
  const socket = new WebSocket("ws://localhost:3000");

  socket.onopen = () => {console.log("Connected to WebSocket server");};

  socket.onmessage = (event) => {
    if (event.data === "jump1") {
      console.log("jump signal received");

      player1.jumpPressed = true;

      setTimeout(() => {
      player1.jumpPressed = false;
        }, 100);
    }
    else if (event.data === "jump2") {
      console.log("jump signal received");

      player2.jumpPressed = true;

      setTimeout(() => {
        player2.jumpPressed = false;
        }, 100);
    }
  };
};

function showGameOver() {
  if (cactiController.collideWith(player2)){
    const fontSize = 30 * scaleRatio;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle = "grey";
    const x = canvas.width/4.5;
    const y = canvas.height/2.3;
    ctx.fillText("Player 1 wins, press any button to restart", x, y);
  }else if (cactiController.collideWith(player1)){
    const fontSize = 30 * scaleRatio;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle = "grey";
    const x = canvas.width/4.5;
    const y = canvas.height/2.3;
    ctx.fillText("Player 2 wins, press any button to restart", x, y);
  }else{
    const fontSize = 80 * scaleRatio;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle = "grey";
    const x = canvas.width/4.5;
    const y = canvas.height/2.3;
    ctx.fillText("Game Over", x, y);
  }
  
}
function setupGameReset() {
  if(!hasAddedEventListenerforRestart){
    hasAddedEventListenerforRestart = true;

    setTimeout(() => {
       window.addEventListener("keyup", reset, {once: true});
    }, 500);
  }
}
function reset(){
  hasAddedEventListenerforRestart = false;
  gameOver = false;
  ground.reset();
  cactiController.reset();
  gameSpeed = GAME_SPEED_START;
}

setScreen();
//Use setTimeout on Safari mobile rotation otherwise works fine on desktop
window.addEventListener("resize", () => setTimeout(setScreen, 500));

if (screen.orientation) {
  screen.orientation.addEventListener("change", setScreen);
}
playerUnphone();
requestAnimationFrame(gameLoop);