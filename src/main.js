//@ts-check
import { parse } from "./files.js"



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
console.log(data)

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
    if (knotVector[i] != d - n) throw new Error("Last (d + 1) entries in the knot vector must be (n - d).")
}


// Construct a CLAMPED B-Spline

