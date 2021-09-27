//@ts-check

import { HANDLE_COLOR, MODE_DEFAULT } from "./config.js"

/**
 * 
 * @param {number[][]} points 
 * @returns {any[]}
 */
export function pointsToAnchors(points) {
    return points.map(point => {
        let x = point[0] * window.innerWidth
        let y = point[1] * window.innerHeight

        return new Two.Anchor(x, y)
    })
}

/**
 * 
 * @param {any[]} anchors 
 * @returns {any[]}
 */
export function anchorsToCircles(anchors) {
    return anchors.map(anchor => {
        return anchorToCircle(anchor)
    })
}

/**
 * 
 * @param {any} anchor 
 * @returns {any}
 */
export function anchorToCircle(anchor) {
    const circle = two.makeCircle(anchor.x, anchor.y, 5);
    circle.fill = HANDLE_COLOR
    circle.linewidth = 0
    return circle
}


export function cleanupState(state) {
    state.handles.forEach((handle) => {
        two.remove(handle)
    })
    two.remove(state.tooltip)
    two.remove(state.guides)
}



export function createState(degree, knotVector) {
    const state = {
        anchors: [],
        handles: [],
        guides: null,
        dragging: false,
        selected: null,
        tooltip: new Two.Text("_", 100, 100),
        mode: MODE_DEFAULT,
        degree: degree,
        message: null,
        knots: knotVector,
        maxPoints: 0
    }

    state.guides = new Two.Path(state.anchors.flat())
    state.guides.noFill()
    two.add(state.guides)

    state.tooltip.visible = false
    two.add(state.tooltip)

    return state
}