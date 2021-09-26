//@ts-check
import { HANDLE_COLOR, MODE_DEFAULT, MODE_ADD_POINT } from "./config.js";
import { mousedownHandler, mousemoveHandler, mouseupHandler } from "./events.js";
import { parse } from "./files.js"
import { deBoor } from "./math.js";


// Make an instance of two and place it on the page.
const elem = document.getElementById('canvas');

let two = new Two({
    width: window.innerWidth, height: window.innerHeight,
    type: Two.Types.svg
}).appendTo(elem)




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

const state = {
    anchors: [],
    handles: [],
    guides: null,
    dragging: false,
    selected: null,
    tooltip: new Two.Text("_", 100, 100),
    mode: MODE_DEFAULT,
    degree: data.degree,
    message: null,
    knots: data.knotVector
}

state.tooltip.visible = false
two.add(state.tooltip)


// Construct a CLAMPED B-Spline

// Add anchors mapped to window space
state.anchors = data.points.map(point => {
    let x = point[0] * window.innerWidth
    let y = point[1] * window.innerHeight

    return new Two.Anchor(x, y)
})

// Draw guides between each handle
state.guides = new Two.Path(state.anchors.flat())
state.guides.noFill()
two.add(state.guides)

let curve = new Two.Path([])
curve.stroke = "green"
curve.linewidth = 2
curve.noFill()
two.add(curve)

// Add the handles
state.handles = state.anchors.map(anchor => {
    const circle = two.makeCircle(anchor.x, anchor.y, 5);
    circle.fill = HANDLE_COLOR
    circle.linewidth = 0
    return circle
})




elem?.addEventListener("mousedown", (e) => mousedownHandler(e, state, Two, two))
elem?.addEventListener("mouseup", (e) => mouseupHandler(state))
elem?.addEventListener("mousemove", (e) => mousemoveHandler(e, state, Two))
// elem?.addEventListener("click", (e) => addpointHandler(e, state, Two, two))



document.querySelector("#add-control-point").addEventListener("click", (e) => {
    state.message = Toastify({
        text: "Select a point h where h >= d",
        duration: -1,
        // destination: "https://github.com/apvarun/toastify-js",
        // newWindow: true,
        // close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        // backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
        stopOnFocus: true, // Prevents dismissing of toast on hover
        onClick: function () { } // Callback after click
    }).showToast();

    state.mode = MODE_ADD_POINT

    // message.hideToast()
})

two.bind('update', () => {
    // This code is called everytime two.update() is called.
    // Effectively 60 times per second.
    // console.log(resolution.val)

    const lim = 1
    const res = .01

    state.guides.vertices = state.handles.map(handle => {
        return handle.translation
    })

    let pointsOnCurve = []
    let controlPoints = state.handles.map(handle => {
        return [handle.translation.x / window.innerWidth, handle.translation.y / window.innerHeight]
    })
    for (let i = 0; i < lim; i += res) {
        let v = deBoor(i, data.degree + 1, controlPoints, state.knots)
        pointsOnCurve.push(v)
        // let b = interpolate(i, data.degree, data.points, data.knotVector)
        // points2.push(b)
    }

    const pointsInWindowSpace = pointsOnCurve.map(point => {
        let x = point[0] * window.innerWidth
        let y = point[1] * window.innerHeight

        return new Two.Anchor(x, y)
    })

    curve.vertices = pointsInWindowSpace
}).play();




