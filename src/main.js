//@ts-check
import { HANDLE_COLOR, MODE_DEFAULT, MODE_ADD_POINT, MODE_INSERT } from "./config.js";
import { addpointHandler, mousedownHandler, mousemoveHandler, mouseupHandler, saveHandler } from "./events.js";
import { download, parse, readFile } from "./files.js"
import { deBoor } from "./math.js";
import { anchorsToCircles, cleanupState, createState, pointsToAnchors } from "./state.js";


// Make an instance of two and place it on the page.
const elem = document.getElementById('canvas');

window.two = new Two({
    width: window.innerWidth, height: window.innerHeight,
    type: Two.Types.svg
}).appendTo(elem)





let data = parse(`BSPLINE
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

let state = createState(data.degree, data.knotVector)


// Construct a CLAMPED B-Spline


// Draw guides between each handle


let curve = new Two.Path([])
curve.stroke = "green"
curve.linewidth = 2
curve.noFill()
two.add(curve)

// Add anchors mapped to window space
state.anchors = pointsToAnchors(data.points)
// Add the handles
state.handles = anchorsToCircles(state.anchors)


document.querySelector("#save").addEventListener("click", () => saveHandler(state))




document.querySelector("#restart").addEventListener("click", () => {
    let n = parseInt(prompt("Enter number of points n:"))
    let d = parseInt(prompt("Enter spline degree d:"))

    if (!(n >= (d + 1))) throw new Error("Inputs do not satisfy requirement n >= d + 1")

    // Create initial knot vector
    let knotVector = new Array(n + d + 1)
    for (let i = 0; i < knotVector.length; i++) {
        if (i < d + 1) knotVector[i] = 0
        else if (i < n) knotVector[i] = i - d
        else knotVector[i] = n - d
    }
    state.knots = knotVector
    state.degree = d

    // delete old points
    state.handles.forEach((handle) => {
        two.remove(handle)
    })

    state.anchors = []
    state.handles = []
    curve.vertices = []
    state.maxPoints = n


    // Enter insert mode
    state.mode = MODE_INSERT

})


/**
 * @type {HTMLInputElement}
 */
const fileUpload = document.querySelector("#fileBox")

/**
 * @type {HTMLInputElement}
 */
const fileInput = document.querySelector("#start-file")

document.querySelector("#restart-file").addEventListener("click", () => {
    fileUpload.style.display = "flex"
})

document.querySelector("#restart-file-submit").addEventListener("click", async () => {


    let file = fileInput.files[0]

    console.log("content", file)

    if (file) {
        // load curve from file
        let content = await readFile(file).catch(err => {
            console.error(err)
        })


        fileUpload.style.display = "none"

        if (content) {

            data = parse(content)

            cleanupState(state)
            state = createState(data.degree, data.knotVector)

            // Add anchors mapped to window space
            state.anchors = pointsToAnchors(data.points)
            // Add the handles
            state.handles = anchorsToCircles(state.anchors)
        }

    } else {
        alert("Please fill out one of the input fields.")
    }

})








elem?.addEventListener("mousedown", (e) => mousedownHandler(e, state, Two, two))
elem?.addEventListener("mouseup", (e) => mouseupHandler(state))
elem?.addEventListener("mousemove", (e) => mousemoveHandler(e, state, Two))
elem?.addEventListener("click", (e) => addpointHandler(e, state, Two, two))



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

    if (state.mode != MODE_INSERT) {

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

    }

}).play();




