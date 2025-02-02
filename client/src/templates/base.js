import { GameObject } from "../components/gameobject"
import { Stack } from "../components/stack"
import { Card } from "./common"

const suits = ["clubs", "diamonds", "hearts", "spades"]
const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king", "ace"]


export function FrenchCardDeck(x, y) {
	const cards = []
	for (const suit of suits) {
		for (const value of values) {
			cards.push(Card({ 
				front: `assets/default/cards/${value}_of_${suit}.png`,
				back: "assets/default/cards/back.png",
				x: 0, y: 0,
				width: 500 / 4,
				height: 726 / 4,
			}))
		}
	}
	const deck = GameObject.create({ x, y, })  
	Stack.create(deck, { objects: cards })
	Stack.shuffle(deck, false)
}