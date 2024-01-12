import {Directions, ONE_BLOCK_SIZE, MAP as map} from "./constants.ts";
import {getCanvasContext, getGhostFrames, getPacmanFrames} from "./helpers.ts";
import {Pacman} from "./pacman.ts";
import D = Phaser.Input.Keyboard.KeyCodes.D;
import ONE = Phaser.Input.Keyboard.KeyCodes.ONE;

const canvasCtx = getCanvasContext()
const ghostFrames = getGhostFrames()

let randomTargetsForGhosts = [
  { x: ONE_BLOCK_SIZE, y: ONE_BLOCK_SIZE },
  { x: ONE_BLOCK_SIZE, y: (map.length - 2) * ONE_BLOCK_SIZE },
  { x: (map[0].length - 2) * ONE_BLOCK_SIZE, y: ONE_BLOCK_SIZE },
  { x: (map[0].length - 2) * ONE_BLOCK_SIZE, y: (map.length - 2) * ONE_BLOCK_SIZE },
]

export class Ghost {
  public direction: Directions
  public currentFrame: number
  public frameCount: number
  public nextDirection: Directions
  public target: { x: number; y: number }
  public randomTargetIndex: number

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public speed: number,
    public imageX: number,
    public imageY: number,
    public imageWidth: number,
    public imageHeight: number,
    public range: number,
    readonly pacman: Pacman,
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

    this.imageX = imageX
    this.imageY = imageY
    this.imageWidth = imageWidth
    this.imageHeight = imageHeight
    this.range = range
    this.target = { x: 0, y: 0 }
    this.randomTargetIndex = ~~(Math.random() * randomTargetsForGhosts.length)

    setInterval(() => {
      this.changeRandomDirection()
    }, 1000)
  }

  changeRandomDirection() {
    this.randomTargetIndex = 1
    this.randomTargetIndex = this.randomTargetIndex % 4
  }

  moveProcess() {
    if (this.isInRangeOfPacman()) {
      this.target = this.pacman
    } else {
      this.target = randomTargetsForGhosts[this.randomTargetIndex]
    }
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

  isInRangeOfPacman() {
    let xDistance = Math.abs(this.pacman.getMapX() - this.getMapX());
    let yDistance = Math.abs(this.pacman.getMapY() - this.getMapY());
    if (Math.sqrt(xDistance * xDistance + yDistance * yDistance) <= this.range) {
      return true
    }
    return false
  }

  changeDirectionIfPossible() {
    // if (this.direction === this.nextDirection) return
    let tempDirection = this.direction
    this.direction = this.calculateNewDirection(
      map,
      ~~(this.target.x / ONE_BLOCK_SIZE),
      ~~(this.target.y / ONE_BLOCK_SIZE),
    )

    if (typeof this.direction === 'undefined') {
      this.direction = tempDirection
      return
    }
    if (this.getMapY())

    this.moveForwards()
    if (this.checkCollision()) {
      this.moveBackwards()
      this.direction = tempDirection
    } else {
      this.moveBackwards()
    }
  }

  calculateNewDirection(map: number[][], destX: number, destY: number) {
    let mp = []
    for (let i = 0; i < map.length; i++) {
      mp[i] = map[i].slice()
    }
    let queue: Array<{ x: number; y: number; moves: number[] }> = [
      { x: this.getMapX(), y: this.getMapY(), moves: [] }
    ]
    while (queue.length > 0) {
      let popped = queue.shift()
      if (popped && popped.x === destX && popped.y === destY) {
        return popped.moves[0]
      } else if (popped) {
        mp[popped.y][popped.x] = 1
        let neighborList = this.addNeighbors(popped, mp)
        for (let i = 0; i < neighborList.length; i++) {
          queue.push(neighborList[i])
        }
      }
    }

    return Directions.BOTTOM
  }

  addNeighbors(popped: { x: number, y: number, moves: number[] }, map: number[][]) {
    const queue = []
    const numOfRows = map.length
    const numOfColumns = map[0].length

    if (
      popped.x - 1 >= 0 &&
      popped.x - 1 < numOfRows &&
      map[popped.y][popped.x - 1] != 1
    ) {
      let tempMoves = popped.moves.slice();
      tempMoves.push(Directions.LEFT);
      queue.push({ x: popped.x - 1, y: popped.y, moves: tempMoves });
    }
    if (
      popped.x + 1 >= 0 &&
      popped.x + 1 < numOfRows &&
      map[popped.y][popped.x + 1] != 1
    ) {
      let tempMoves = popped.moves.slice();
      tempMoves.push(Directions.RIGHT);
      queue.push({ x: popped.x + 1, y: popped.y, moves: tempMoves });
    }
    if (
      popped.y - 1 >= 0 &&
      popped.y - 1 < numOfColumns &&
      map[popped.y - 1][popped.x] != 1
    ) {
      let tempMoves = popped.moves.slice();
      tempMoves.push(Directions.UP);
      queue.push({ x: popped.x, y: popped.y - 1, moves: tempMoves });
    }
    if (
      popped.y + 1 >= 0 &&
      popped.y + 1 < numOfColumns &&
      map[popped.y + 1][popped.x] != 1
    ) {
      let tempMoves = popped.moves.slice();
      tempMoves.push(Directions.BOTTOM);
      queue.push({ x: popped.x, y: popped.y + 1, moves: tempMoves });
    }
    return queue
  }

  changeAnimation() {
    this.currentFrame = this.currentFrame === this.frameCount
      ? 1 : this.currentFrame + 1
  }

  draw() {
    canvasCtx.save()
    canvasCtx.drawImage(
      ghostFrames,
      this.imageX,
      this.imageY,
      this.imageWidth,
      this.imageHeight,
      this.x,
      this.y,
      this.width,
      this.height,
    )

    canvasCtx.restore()
    canvasCtx.beginPath()
    canvasCtx.strokeStyle = 'red'
    canvasCtx.arc(
      this.x + ONE_BLOCK_SIZE / 2,
      this.y + ONE_BLOCK_SIZE / 2,
      this.range * ONE_BLOCK_SIZE,
      0,
      2 * Math.PI
    )
    canvasCtx.stroke()
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
}

export let ghosts: Ghost[] = []