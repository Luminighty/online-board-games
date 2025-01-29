export function assertComponent(gameobject, component, method) {
	console.assert(gameobject[component], `Attempted to "${component}.${method}", but was not a ${component} (ID=${gameobject.id})`, {gameobject})
}