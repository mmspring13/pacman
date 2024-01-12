import {Directions, ONE_BLOCK_SIZE, MAP as map} from "./constants.ts";
import {getCanvasContext, getPacmanFrames} from "./helpers.ts";
import {ghosts} from "./ghost.ts";

const canvasCtx = getCanvasContext()
const pacmanFrames = getPacmanFrames()

export class Pacman {
  public direction: Directions
  public currentFrame: number
  public frameCount: number
  public nextDirection: Directions
  public score: number
  private changeAnimationInterval: number

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public speed: number
  ) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.speed = speed
    this.direction = Directions.RIGHT
    this.nextDirection = this.direction
    this.currentFrame = 1
    this.frameCount = 7
    this.score = 0

    this.changeAnimationInterval = setInterval(() => {
      this.changeAnimation()
    }, 100)
  }

  moveProcess() {
    this.changeDirectionIfPossible()
    this.moveForwards()
    if (this.checkCollision()) {
      this.moveBackwards()
    }
  }

  eat() {
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[0].length; j++) {
        if (
          map[i][j] === 2
          && this.getMapY() === i
          && this.getMapX() === j
        ) {
          map[i][j] = 3
          this.score += 1
        }
      }
    }
  }

  moveBackwards() {
    switch (this.direction) {
      case Directions.RIGHT:
        this.x -= this.speed
        break;
      case Directions.UP:
        this.y += this.speed
        break;
      case Directions.LEFT:
        this.x += this.speed
        break;
      case Directions.BOTTOM:
        this.y -= this.speed
        break;
    }
  }

  moveForwards() {
    switch (this.direction) {
      case Directions.RIGHT:
        this.x += this.speed
        break;
      case Directions.UP:
        this.y -= this.speed
        break;
      case Directions.LEFT:
        this.x -= this.speed
        break;
      case Directions.BOTTOM:
        this.y += this.speed
        break;
    }
  }

  checkCollision() {
    let isCollided = false;
    if (
      map[Math.floor(this.y / ONE_BLOCK_SIZE)][
        Math.floor(this.x / ONE_BLOCK_SIZE)
        ] == 1 ||
      map[Math.floor(this.y / ONE_BLOCK_SIZE + 0.9999)][
        Math.floor(this.x / ONE_BLOCK_SIZE)
        ] == 1 ||
      map[Math.floor(this.y / ONE_BLOCK_SIZE)][
        Math.floor(this.x / ONE_BLOCK_SIZE + 0.9999)
        ] == 1 ||
      map[Math.floor(this.y / ONE_BLOCK_SIZE + 0.9999)][
        Math.floor(this.x / ONE_BLOCK_SIZE + 0.9999)
        ] == 1
    ) {
      isCollided = true;
    }
    return isCollided;

  }

  checkGhostCollision() {
    for (let i = 0; i < ghosts.length; i++) {
      let ghost = ghosts[i]
      if (
        ghost.getMapX() === this.getMapX()
        && ghost.getMapY() === this.getMapY()
      ) {
        return true
      }
    }
    return false
  }

  changeDirectionIfPossible() {
    if (this.direction === this.nextDirection) return
    let tempDirection = this.direction
    this.direction = this.nextDirection
    this.moveForwards()
    if (this.checkCollision()) {
      this.moveBackwards()
      this.direction = tempDirection
    } else {
      this.moveBackwards()
    }
  }

  changeAnimation() {
    this.currentFrame = this.currentFrame === this.frameCount
      ? 1 : this.currentFrame + 1
  }

  draw() {
    canvasCtx.save()
    canvasCtx.translate(
      this.x + ONE_BLOCK_SIZE / 2,
      this.y + ONE_BLOCK_SIZE / 2)
    canvasCtx.rotate(
      (this.direction * 90 * Math.PI) / 180
    )
    canvasCtx.translate(
      -this.x - ONE_BLOCK_SIZE / 2,
      -this.y - ONE_BLOCK_SIZE / 2)
    canvasCtx.drawImage(
      pacmanFrames,
      (this.currentFrame - 1) * ONE_BLOCK_SIZE,
      0,
      ONE_BLOCK_SIZE,
      ONE_BLOCK_SIZE,
      this.x,
      this.y,
      this.width,
      this.height,
    )

    canvasCtx.restore()
  }

  getMapX() {
    return Math.floor(this.x / ONE_BLOCK_SIZE)
  }

  getMapY() {
    return Math.floor(this.y / ONE_BLOCK_SIZE)
  }

  getMapXRightSide() {
    return Math.floor((this.x + 0.9999 * ONE_BLOCK_SIZE) / ONE_BLOCK_SIZE)
  }

  getMapYRightSide() {
    return Math.floor((this.y + 0.9999 * ONE_BLOCK_SIZE) / ONE_BLOCK_SIZE)
  }

  onBeforeDestroy() {
    clearInterval(this.changeAnimationInterval)
  }
}