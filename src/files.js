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


    if (lines[ptr] != "BSPLINE") throw new Error("File must begin with 'BSPLINE'")

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

    const knotVectorSize = numberOfPoints + degree + 1

    // (a) The knot vector has n + d + 1 knots
    if (knotVectorSize != knotVector.length) throw new Error("Knot vector must have (n + d + 1) entries.")

    // (b) The first d + 1 knots are all 0
    for (let i = 0; i < degree + 1; i++) {
        if (knotVector[i] != 0) throw new Error("First (d + 1) entries in the knot vector must be 0.")
    }

    // (c) The last d + 1 knots are n - d
    const starting = knotVector.length - degree - 1
    for (let i = starting; i < knotVector.length; i++) {
        if (knotVector[i] != numberOfPoints - degree) throw new Error("Last (d + 1) entries in the knot vector must be (n - d).")
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


export function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

/**
 * 
 * @param {File} file 
 * @returns {Promise<string>}
 */
export function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (res) => {
            resolve(res.target.result.toString());
        };
        reader.onerror = (err) => reject(err);

        reader.readAsText(file);
    });
}