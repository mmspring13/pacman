export const getCanvas = (): HTMLCanvasElement => {
  return document.getElementById('canvas') as HTMLCanvasElement
}

export const getCanvasContext = (): CanvasRenderingContext2D => {
  return getCanvas().getContext('2d') as CanvasRenderingContext2D
}

export const getPacmanFrames = () => {
  return document.getElementById('img-animations') as HTMLImageElement
}

export const getGhostFrames = () => {
  return document.getElementById('img-ghost') as HTMLImageElement
}