import { Transform } from "../utils/transform"

/**
 * @typedef {Object} Animation
 * @prop {number} current
 * @prop {bool} finished
 * @prop {Timeline[]} timelines
 * @prop {Transform[]} transforms
 */

/** 
 * @typedef {Object} Timeline
 * @prop {number} type
 * @prop {number} currentKeyFrame
 * @prop {Object} object
 * @prop {string} key
 * @prop {Function?} cb
 * @prop {KeyFrame} keyframes
 */

/** @typedef {[ts: number, ...value: any]} KeyFrame */


/** @param {Animation} animation */
function step(animation, dt) {
  animation.current += dt

	// TODO(Lumi): Remove the animation if hasMore stayed false
  let hasMore = false
  for (const timeline of animation.timelines) {
    if (timeline.currentKeyFrame + 1 >= timeline.keyframes.length)
      continue
    hasMore = true
    let isLastKeyFrame = timeline.keyframes.length <= timeline.currentKeyFrame + 1
    const isKeyFrameStepped = !isLastKeyFrame && timeline.keyframes[timeline.currentKeyFrame + 1][0] <= animation.current
    if (isKeyFrameStepped) {
      timeline.currentKeyFrame++
      isLastKeyFrame = timeline.keyframes.length <= timeline.currentKeyFrame + 1
    }
    switch (timeline.type) {
      case TIMELINE_TYPE.INTERPOLATE:
        if (isLastKeyFrame) {
          // Set the value once we reach the end, no need for interpolating
          timeline.object[timeline.key] = timeline.keyframes[timeline.currentKeyFrame][1]
        } else {
          const [fromTs, fromValue] = timeline.keyframes[timeline.currentKeyFrame]
          const [toTs, toValue] = timeline.keyframes[timeline.currentKeyFrame + 1]
          const t = (animation.current - fromTs) / (toTs - fromTs)
          const value = fromValue + t * (toValue - fromValue)
          timeline.object[timeline.key] = value
        }
        break;
      case TIMELINE_TYPE.CALLBACK:
        if (isKeyFrameStepped)
          timeline.cb(timeline.keyframes[timeline.currentKeyFrame][1])
        break
      case TIMELINE_TYPE.SET:
        console.warn('TODO: Unimplemented timeline type: TIMELINE_TYPE.SET')
        break
      default:
        console.log('among us among us among us among us among us');
        break;
    }
  }

  for (const transform of animation.transforms)
		Transform.updateTransform(transform)

	animation.finished = !hasMore
}

function update(dt) {
	const finished = []
  for (let i = 0; i < animations.length; i++) {
    step(animations[i], dt)
		if (animations[i].finished)
			finished.push(i)
	}
	for (let i = finished.length - 1; i >= 0; i--)
		animations.splice(i, 1)
}

const TIMELINE_TYPE = {
  INTERPOLATE: 0,
  SET: 1,
  CALLBACK: 2,
}
/** @type {Animation[]} */
const animations = []

function create() {
  return {
    data: {
      timelines: [],
      transforms: [],
    },
    set(object, key, ...keyframes) {
      this.data.timelines.push({
        currentKeyFrame: 0,
        type: TIMELINE_TYPE.SET,
        object, key,
        keyframes
      })
      return this
    },
    interpolate(object, key, ...keyframes) {
      this.data.timelines.push({
        currentKeyFrame: 0,
        type: TIMELINE_TYPE.INTERPOLATE,
        object, key,
        keyframes
      })
      return this
    },
    /** 
     * @param {Transform} transform
     * @param {string} key
     */
    transform(transform, key, ...keyframes) {
      this.data.timelines.push({
        currentKeyFrame: 0,
        type: TIMELINE_TYPE.INTERPOLATE,
        object: transform, key,
        keyframes
      })
      if (!this.data.transforms.includes(transform))
        this.data.transforms.push(transform)
      return this
    },
    callback(cb, ...keyframes) {
      this.data.timelines.push({
        currentKeyFrame: 0,
        type: TIMELINE_TYPE.CALLBACK,
        cb, keyframes: [[-1], ...keyframes],
      })
      return this
    },
    play() {
      animations.push({
        current: 0,
        finished: false,
        timelines: this.data.timelines,
        transforms: this.data.transforms,
      })
    }
  }
}

export const Animation = {
  create, update
}