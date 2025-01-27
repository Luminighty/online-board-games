import { getContext, setupCanvas } from "./render/canvas"
import { Flippable } from "./components/flip"
import { GameObject } from "./components/gameobject"
import catan from "@res/default.yaml?raw"
import YAML from "yaml"
import { loadTexture } from "./render/texture"
import { createSprite, renderSprites } from "./render/sprite"
import { mainViewport } from "./render/viewport"
import { Camera, setupCamera } from "./camera"
import { worldBounds } from "./bounds"
import { drawBackground, setBackground } from "./render/background"
import { ContextMenu, renderContextMenu } from "./render/contextmenu/index"
import { SingleSprite } from "./components/singlesprite"
import { Catan } from "./catan"


setupCanvas("#app")
const textZipChip = loadTexture("assets/default/chips/zipchip.png")
const context = getContext()

setBackground("assets/background.png")



function render() {
  context.fillStyle = "black"
  context.fillRect(0, 0, window.innerWidth, window.innerHeight)
  mainViewport.applyToContext(context)
  //context.drawImage(background.image, 0, 0)
  drawBackground(context)

  context.lineWidth = 2
  context.strokeStyle = "white"
  context.strokeRect(
    worldBounds.minX, worldBounds.minY, 
    worldBounds.maxX - worldBounds.minX, worldBounds.maxY - worldBounds.minY
  )
  renderSprites()

  context.resetTransform()
  renderContextMenu(context, Camera.screen.x, Camera.screen.y)

  requestAnimationFrame(render)
}

function setup() {
  setupCamera()
  render()

  ContextMenu.new()
    .label("What the dog doin")
    .button("Hello", () => console.log("clicked"))
    .idLabel(123)
    .show(100, 100)
}
Catan.load()

const object = {
  ...GameObject.create({x: 100, y: 100}),
  ...Flippable.create(),
}
SingleSprite.create(object, textZipChip, {
  width: 85, height: 85
})
const other = {
  ...GameObject.create(),
}

console.log(object.flip)
Flippable.flip(object)


const catanData = YAML.parse(catan)
console.log(Object.keys(catanData))
console.log(catanData)


setTimeout(setup)