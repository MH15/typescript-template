//@ts-check
/**
 * 
 * @param {string} content 
 */
export function parse(content) {
    let lines = content.split(/\r\n|\r|\n/)
    let ptr = 0

    // ignore comments
    lines = lines.filter((line) => !line.startsWith("#"))


    if (lines[ptr] != "BSPLINE") throw new Error("File must begin with 'BEZIER'")

    ptr++
    const [dimension, numberOfPoints, degree] = validate(lines[ptr])

    ptr++
    const knotVector = lines[ptr].split(" ").map(char => parseInt(char))

    ptr++
    let points = []
    while (ptr < lines.length) {
        let chars = lines[ptr].split(" ")

        if (chars.length == 2) {
            let x = parseFloat(chars[0])
            let y = parseFloat(chars[1])
            points.push([x, y])
        }

        ptr++
    }



    return {
        points,
        knotVector,
        dimension,
        numPoints: numberOfPoints,
        degree
    }
}

/**
 * 
 * @param {string} line 
 * @returns {[number, number, number]}
 */
function validate(line) {
    let chars = line.split(" ")
    let dimension = parseInt(chars[0])
    let numberOfPoints = parseInt(chars[1])
    let degree = parseInt(chars[2])

    return [dimension, numberOfPoints, degree]
}