import Player from "./Player.js";
import Ground from "./Ground.js";

const canvas = document.getElementById("game");
const  ctx = canvas.getContext("2d");

const GAME_SPEED_START = 0.75;
const GAME_SPEED_INCREMENT = 0.00001;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
const PLAYER_WIDTH = 88/1.5;
const PLAYER_HEIGHT = 94/1.5;
const MAX_JUMP_HEIGHT = GAME_HEIGHT;
const MIN_JUMP_HEIGHT = 150;
const GROUND_WIDTH = 2400;
const GROUND_HEIGHT = 24;
const GROUND_AND_CACTUS_SPEED = 0.5;

//Game Object
let player1 = null;
let player2 = null;
let ground = null;

let scaleRatio = null;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;

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
    player2.x = 80 * scaleRatio;

    const groundWidthInGame = GROUND_WIDTH * scaleRatio;
    const groundHeightInGame = GROUND_HEIGHT * scaleRatio;
    ground = new Ground(
      ctx,
      groundWidthInGame,
      groundHeightInGame,
      GROUND_AND_CACTUS_SPEED,
      scaleRatio
    );
}

function setScreen() {
  scaleRatio = getScaleRatio();
  canvas.width = GAME_WIDTH * scaleRatio;
  canvas.height = GAME_HEIGHT * scaleRatio;
  createSprites();
}

setScreen();
//Use setTimeout on Safari mobile rotation otherwise works fine on desktop
window.addEventListener("resize", () => setTimeout(setScreen, 500));

if (screen.orientation) {
  screen.orientation.addEventListener("change", setScreen);
}

function clearScreen(){
    ctx.fillStyle = "white";
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

    //update game objects
    player1.setRunning(true);
    player2.setRunning(true);
    ground.update(gameSpeed, frameTimeDelta);
    player1.update(gameSpeed, frameTimeDelta);
    player2.update(gameSpeed, frameTimeDelta);

    //draw game objects
    ground.draw();
    player1.draw();
    player2.draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);