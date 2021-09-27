//@ts-check
import { HANDLE_COLOR, HANDLE_COLOR_FOCUSED, MODE_ADD_POINT, MODE_DEFAULT, MODE_INSERT } from "./config.js"
import { download } from "./files.js"
import { BoehmKnotInsertion } from "./math.js"
import { anchorsToCircles, pointsToAnchors } from "./state.js"

export function mousedownHandler(e, state, Two, two) {
    if (state.mode == MODE_ADD_POINT) {
        let x = e.clientX
        let y = e.clientY
        let point = new Two.Vector(x, y)
        let closest = findClosestPoint(state.handles, point, 35)
        let h = getIndex(state.handles, closest)
        if (h >= state.degree) {
            state.message.hideToast()
            state.mode = MODE_DEFAULT
            let controlPoints = state.handles.map(handle => {
                return [handle.translation.x / window.innerWidth, handle.translation.y / window.innerHeight]
            })
            console.log("h:", h)
            console.log(state.knots)

            let newKnot = (state.knots[h] + state.knots[h + 1]) / 2

            let [newControlPoints, newKnotVector] = BoehmKnotInsertion(newKnot, state.degree + 1, controlPoints, state.knots)

            state.handles.forEach((handle) => {
                two.remove(handle)
            })

            state.anchors = pointsToAnchors(newControlPoints)

            state.handles = anchorsToCircles(state.anchors)

            state.knots = newKnotVector
        }

        return
    }



    state.dragging = true

    let x = e.clientX
    let y = e.clientY
    let point = new Two.Vector(x, y)

    state.selected = findClosestPoint(state.handles, point, 35)
    for (const handle of state.handles) {
        handle.fill = HANDLE_COLOR
    }
    if (state.selected != null) {
        state.selected.fill = HANDLE_COLOR_FOCUSED
        drawTooltip(state.tooltip, state.selected.translation, getIndex(state.handles, state.selected))

    } else {
        state.tooltip.visible = false
    }
}


export function mouseupHandler(state) {
    state.dragging = false
}

export function mousemoveHandler(e, state, Two) {
    if (state.dragging) {
        let x = e.clientX
        let y = e.clientY
        let point = new Two.Vector(x, y)

        if (state.selected != null) {
            state.selected.translation = point
            state.selected.translation.x = point.x
            state.selected.translation.y = point.y
            drawTooltip(
                state.tooltip,
                state.selected.translation,
                getIndex(state.handles, state.selected)
            )

        }
    }
}


function getIndex(handles, point) {
    let index = handles.findIndex(i => {
        return i.translation.equals(point.translation)
    })
    return index
}

function findClosestPoint(handles, position, range) {
    let closest = null
    let distance = range
    for (const h of handles) {
        let len = h.translation.distanceTo(position)
        if (len < distance) {
            distance = len
            closest = h
        }
    }

    return closest
}


export function drawTooltip(tooltip, translation, index) {
    tooltip.visible = true
    tooltip.translation = new Two.Vector(translation.x, translation.y - 15)
    tooltip.value = `Point ${index}\n(${round(translation.x / window.innerWidth)}, ${round(translation.y / window.innerHeight)})`
}


export const round = (num) => {
    return Math.round(num * 10000) / 10000
}


export function addpointHandler(e, state, Two, two) {
    e.preventDefault()

    if (state.mode == MODE_INSERT && state.anchors.length < state.maxPoints) {
        let x = e.clientX
        let y = e.clientY
        let anchor = new Two.Anchor(x, y)
        state.anchors.push(anchor)
        // delete old points
        state.handles.forEach((handle) => {
            two.remove(handle)
        })
        state.handles = anchorsToCircles(state.anchors)

        state.guides.vertices = state.anchors
    }

    if (state.mode == MODE_INSERT && state.anchors.length == state.maxPoints) {
        state.mode = MODE_DEFAULT
    }

    console.log(state)
    return false
}



export function saveHandler(state) {
    let filename = "bspline.txt"
    // if (filename.length === 0) filename = "bezier.txt"

    let content = "BSPLINE\n"
    content += "# {dimension} {number of points} {degree}\n"

    let ndim = 2
    let nump = state.handles.length
    let ndegree = state.degree
    content += `${ndim} ${nump} ${ndegree}\n`

    content += state.knots.join(" ")

    for (const handle of state.handles) {
        content += "\n" + round(handle.translation.x / window.innerWidth) + " " + round(handle.translation.y / window.innerHeight)
    }

    download(filename, content)
}