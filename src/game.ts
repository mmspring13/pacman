import {
  Directions, FOOD_COLOR,
  FPS as fps,
  MAP as map,
  ONE_BLOCK_SIZE,
  WALL_OFFSET as wallOffset,
  WALL_SPACE_WIDTH as wallSpaceWidth,
  WALL_COLOR as wallColor,
} from "./constants.ts";
import {Pacman} from "./pacman.ts";
import {getCanvas, getCanvasContext} from "./helpers.ts";
import {Ghost, ghosts} from "./ghost.ts";

const canvas = getCanvas()
const canvasCtx = getCanvasContext()

const wallInnerColor = "black"

let pacman: null | Pacman = null
let ghostLocations = [
  { x: 0, y: 0 },
  { x: 176, y: 0 },
  { x: 0, y: 121 },
  { x: 176, y: 121 },
]

const createRect = (
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) => {
  canvasCtx.fillStyle = color
  canvasCtx.fillRect(x, y, width, height)
}

const update = () => {
  if (pacman) {
    pacman.moveProcess()
    pacman.eat()
    if (pacman.checkGhostCollision()) {
      console.log('hit')
    }
  }
  for (let i = 0; i < ghosts.length; i++) {
    ghosts[i].moveProcess()
  }
}

const drawFoods = () => {
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[0].length; j++) {
      if (map[i][j] === 2) {
        createRect(
            j * ONE_BLOCK_SIZE + ONE_BLOCK_SIZE / 3,
            i * ONE_BLOCK_SIZE + ONE_BLOCK_SIZE / 3,
            ONE_BLOCK_SIZE / 3,
            ONE_BLOCK_SIZE / 3,
            FOOD_COLOR
        )
      }
    }
  }
}

const drawScore = () => {
  canvasCtx.font = '20px Emulogic'
  canvasCtx.fillStyle = 'white'
  canvasCtx.fillText(
    `Score: ${pacman?.score}`,
    0,
    ONE_BLOCK_SIZE * (map.length + 1) + 4,
  )
}

const drawGhosts = () => {
  for (let i = 0; i < ghosts.length; i++) {
    ghosts[i].draw()
  }
}

const draw = () => {
  createRect(0, 0 , canvas.width, canvas.height, 'black')
  drawWalls()
  drawFoods()
  drawScore()
  if (pacman) {
    pacman.draw()
  }
  drawGhosts()
}

const gameLoop = () => {
  update()
  draw()
}

setInterval(gameLoop, 1000 / fps)

const drawWalls = () => {
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[0].length; j++) {
      if (map[i][j] === 1) {
        createRect(
          j * ONE_BLOCK_SIZE,
          i * ONE_BLOCK_SIZE,
          ONE_BLOCK_SIZE,
          ONE_BLOCK_SIZE,
          wallColor
        );
        if (j > 0 && map[i][j - 1] === 1) {
          createRect(
            j * ONE_BLOCK_SIZE,
            i * ONE_BLOCK_SIZE + wallOffset,
            wallSpaceWidth + wallOffset,
            wallSpaceWidth,
            wallInnerColor
          )
        }
        if (j < map[0].length - 1 && map[i][j + 1] === 1) {
          createRect(
            j * ONE_BLOCK_SIZE + wallOffset,
            i * ONE_BLOCK_SIZE + wallOffset,
            wallSpaceWidth + wallOffset,
            wallSpaceWidth,
            wallInnerColor
          )
        }
        if (i > 0 && map[i - 1][j] === 1) {
          createRect(
            j * ONE_BLOCK_SIZE + wallOffset,
            i * ONE_BLOCK_SIZE,
            wallSpaceWidth,
            wallSpaceWidth + wallOffset,
            wallInnerColor
          )
        }
        if (i < map.length - 1 && map[i + 1][j] === 1) {
          createRect(
            j * ONE_BLOCK_SIZE + wallOffset,
            i * ONE_BLOCK_SIZE + wallOffset,
            wallSpaceWidth,
            wallSpaceWidth + wallOffset,
            wallInnerColor
          )
        }
      }
    }
  }
}

const createGhosts = () => {
  if (!pacman) {
    return
  }
  for (let i = 0; i < 4; i++) {
    let newGhost: Ghost = new Ghost(
      9 * ONE_BLOCK_SIZE + (i % 2 == 0 ? 0 : 1) * ONE_BLOCK_SIZE,
      10 * ONE_BLOCK_SIZE + (i % 2 == 0 ? 0 : 1) * ONE_BLOCK_SIZE,
      ONE_BLOCK_SIZE,
      ONE_BLOCK_SIZE,
      pacman.speed / 2,
      ghostLocations[i % 4].x,
      ghostLocations[i % 4].y,
      124,
      116,
      6 + i,
      pacman
    );
    ghosts.push(newGhost);
  }
}

const createNewPacman = () => {
  pacman = new Pacman(
    ONE_BLOCK_SIZE,
    ONE_BLOCK_SIZE,
    ONE_BLOCK_SIZE,
    ONE_BLOCK_SIZE,
    ONE_BLOCK_SIZE / 5
  );
}
createNewPacman()
createGhosts()
gameLoop()

window.addEventListener('keydown', (event) => {
  const k = event.keyCode
  setTimeout(() => {
    if (!pacman) {
      return
    }
    if (k === 37 || k === 65) {
      pacman.nextDirection = Directions.LEFT
    } else if (k === 38 || k === 87) {
      pacman.nextDirection = Directions.UP
    } else if (k === 39 || k === 60) {
      pacman.nextDirection = Directions.RIGHT
    } else if (k === 40 || k === 83) {
      pacman.nextDirection = Directions.BOTTOM
    }
  }, 1)
})