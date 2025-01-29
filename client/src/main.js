import { getContext, setupCanvas } from "./render/canvas"
import { renderSprites } from "./render/sprite"
import { mainViewport } from "./render/viewport"
import { Camera, setupCamera } from "./camera"
import { worldBounds } from "./bounds"
import { drawBackground, setBackground } from "./render/background"
import { renderContextMenu } from "./render/contextmenu/index"
import { Catan } from "./catan"
import { GameObject } from "./components/gameobject"
import { FrenchCardDeck } from "./templates/base"
import { loadTexture } from "./render/texture"
import { Roll } from "./components/roll"
import { GameSprite } from "./components/sprite"
import { renderHandArea, renderHandContents, setupHand } from "./render/hand"

setupCanvas("#app")
const context = getContext()
setTimeout(setup)
Catan.load()

//const catanData = YAML.parse(catan)
//console.log(Object.keys(catanData))
//console.log(catanData)

function d6(x, y) {
  const textures = [1, 2, 3, 4, 5, 6].map((v) => 
    loadTexture(`assets/default/white/side_${v}.png`)
  )
  const dice = GameObject.create({x, y})
  GameSprite.create(dice, textures[0], {
    width: 50, height: 50
  })
  Roll.create(dice, { textures, value: 1 })
  
}

function setup() {
  setBackground("assets/background.png")
  setupCamera()
  setupHand()

  FrenchCardDeck(200, 0)

  d6(0, 0)

  requestAnimationFrame(render)
}


function render() {
  context.fillStyle = "black"
  context.fillRect(0, 0, window.innerWidth, window.innerHeight)
  mainViewport.applyToContext(context)
  drawBackground(context)

  context.lineWidth = 2
  context.strokeStyle = "white"
  context.strokeRect(
    worldBounds.minX, worldBounds.minY, 
    worldBounds.maxX - worldBounds.minX, worldBounds.maxY - worldBounds.minY
  )
  renderSprites()
  renderHandArea()

  context.resetTransform()

  renderHandContents()
  renderContextMenu(context, Camera.screen.x, Camera.screen.y)

  requestAnimationFrame(render)
}
