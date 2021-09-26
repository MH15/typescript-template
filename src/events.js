//@ts-check
import { HANDLE_COLOR, HANDLE_COLOR_FOCUSED } from "./config.js"

export function mousedownHandler(e, state, Two) {
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