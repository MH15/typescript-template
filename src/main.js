//@ts-check
import { HANDLE_COLOR } from "./config.js";
import { mousedownHandler, mousemoveHandler, mouseupHandler } from "./events.js";
import { parse } from "./files.js"
import { deBoor, interpolate } from "./math.js";


// Make an instance of two and place it on the page.
const elem = document.getElementById('canvas');

let two = new Two({
    width: window.innerWidth, height: window.innerHeight,
    type: Two.Types.svg
}).appendTo(elem)


const state = {
    anchors: [],
    handles: [],
    guides: null,
    dragging: false,
    selected: null,
    tooltip: new Two.Text("_", 100, 100)
}

state.tooltip.visible = false
two.add(state.tooltip)

const data = parse(`BSPLINE
# Sample file containing Bspline control points
# {dimension} {number of points} {degree}
2 7 2
0 0 0 1 2 3 4 5 5 5
0.15 0.2
0.20 0.2
0.30 0.8
0.34 0.6
0.42 0.7
0.63 0.5
0.7 0.3
`)

const knotVector = data.knotVector
const n = data.numPoints
const d = data.degree

const knotVectorSize = n + d + 1

// (a) The knot vector has n + d + 1 knots
if (knotVectorSize != knotVector.length) throw new Error("Knot vector must have (n + d + 1) entries.")

// (b) The first d + 1 knots are all 0
for (let i = 0; i < d + 1; i++) {
    if (knotVector[i] != 0) throw new Error("First (d + 1) entries in the knot vector must be 0.")
}

// (c) The last d + 1 knots are n - d
const starting = knotVector.length - d - 1
for (let i = starting; i < knotVector.length; i++) {
    if (knotVector[i] != n - d) throw new Error("Last (d + 1) entries in the knot vector must be (n - d).")
}


// Construct a CLAMPED B-Spline

// Add anchors mapped to window space
state.anchors = data.points.map(point => {
    let x = point[0] * window.innerWidth
    let y = point[1] * window.innerHeight

    return new Two.Anchor(x, y)
})

// Draw guides between each handle
// state.guides = new Two.Path(state.anchors.flat())
// state.guides.noFill()
// two.add(state.guides)

// Add the handles
state.handles = state.anchors.map(anchor => {
    const circle = two.makeCircle(anchor.x, anchor.y, 5);
    circle.fill = HANDLE_COLOR
    circle.linewidth = 0
    return circle
})


const lim = 1
const res = .01
// let points = []
// for (let i = 0; i < lim; i += res) {
//     let v = deBoor(i, data.degree + 1, data.points, knotVector)
//     points.push(v)
// }


// let curvePoints = points.map(point => {
//     let x = point[0] * window.innerWidth
//     let y = point[1] * window.innerHeight

//     return new Two.Anchor(x, y)
// })



let test = new Two.Path([])
test.stroke = "green"
test.noFill()
two.add(test)

// let curvePoints2 = points2.map(point => {
//     let x = point[0] * window.innerWidth
//     let y = point[1] * window.innerHeight

//     return new Two.Anchor(x, y)
// })
// let test2 = new Two.Path(curvePoints2)
// test2.stroke = "red"
// test2.noFill()
// two.add(test2)


// console.log(deBoor(.5, data.degree + 1, data.points, knotVector))



elem?.addEventListener("mousedown", (e) => mousedownHandler(e, state, Two))
elem?.addEventListener("mouseup", (e) => mouseupHandler(state))
elem?.addEventListener("mousemove", (e) => mousemoveHandler(e, state, Two))
// elem?.addEventListener("click", (e) => addpointHandler(e, state, Two, two))


let pointsOnCurve = []
let controlPoints = state.handles.map(handle => {
    return [handle.translation.x / window.innerWidth, handle.translation.y / window.innerHeight]
})
console.log(controlPoints)

two.bind('update', () => {
    // This code is called everytime two.update() is called.
    // Effectively 60 times per second.
    // console.log(resolution.val)

    const lim = 1
    const res = .01

    let pointsOnCurve = []
    let controlPoints = state.handles.map(handle => {
        return [handle.translation.x / window.innerWidth, handle.translation.y / window.innerHeight]
    })
    for (let i = 0; i < lim; i += res) {
        let v = deBoor(i, data.degree + 1, controlPoints, knotVector)
        pointsOnCurve.push(v)
        // let b = interpolate(i, data.degree, data.points, data.knotVector)
        // points2.push(b)
    }

    const pointsInWindowSpace = pointsOnCurve.map(point => {
        let x = point[0] * window.innerWidth
        let y = point[1] * window.innerHeight

        return new Two.Anchor(x, y)
    })

    test.vertices = pointsInWindowSpace
}).play();




