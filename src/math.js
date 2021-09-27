// @ts-check
/**
 * 
 * @param {number} u 
 * @param {number} k degree + 1
 * @param {number[][]} points 
 * @param {number[]} knots 
 */
export function deBoor(u, k, points, knots) {
    let j;              // function-scoped iteration letiables
    let n = points.length;    // points count
    let d = points[0].length; // point dimensionality
    const degree = k - 1



    let low = knots[degree];
    let high = knots[knots.length - degree - 1];
    let t = u * (high - low) + low;
    // console.log(low, high)


    // find the spline segment for t
    for (j = degree; j < knots.length - degree - 1; j++) {
        if (t >= knots[j] && t <= knots[j + 1]) {
            break;
        }
    }

    // convert points to homogeneous coordinates
    let v = [];
    for (let i = 0; i < n; i++) {
        v[i] = [];
        v[i] = points[i]
    }

    // console.log(v)
    // l (level) goes from 1 to the curve degree + 1
    for (let r = 1; r <= k; r++) {
        let h = k - r
        // console.log(r)
        // build level l of the pyramid
        // for (let i = j - degree + r; i <= j; i++) {
        for (let i = j; i > j - degree - 1 + r; i--) {
            let alpha = (t - knots[i]) / (knots[i + k - r] - knots[i]);

            let a = v[i - 1]
            let b = v[i]
            // console.log(a, b)
            v[i] = lerpVector(alpha, a, b)
        }
    }
    // console.log(v)

    // convert back to cartesian and return
    let result = [];
    for (let i = 0; i < d; i++) {
        result[i] = v[j][i]
    }

    return result;

}


/**
 * 
 * @param {number} t 
 * @param {[number, number]} a 
 * @param {[number, number]} b 
 * @returns 
 */
function lerpVector(t, a, b) {
    let result = []

    // for each dimension x and y
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i] * (1 - t) + b[i] * t
    }
    return result
}




/**
 * 
 * @param {number} h 
 * @param {number} k 
 * @param {[number, number][]} points 
 * @param {number[]} knots 
 */
export function BoehmKnotInsertion(h, k, points, knots) {
    let n = points.length;    // points count
    const degree = k - 1


    console.log(`BoehmKnotInsertion(${h},${k})`)


    // find s (the spline segment) for the [t] value provided
    let j = 0
    for (j = degree; j < knots.length - degree - 1; j++) {
        if (h >= knots[j] && h <= knots[j + 1]) {
            break;
        }
    }

    // Insert new knot
    let newKnotPos = j + 1
    let newKnotVector = knots.slice(0, newKnotPos)
    let newKnot = (knots[newKnotPos - 1] + knots[newKnotPos]) / 2
    newKnotVector.push(h, ...knots.slice(newKnotPos))
    console.log(newKnotVector)


    knots = newKnotVector

    console.log("newKnot:", h)


    let q = Array(points.length + degree - 1)

    // Keep the first j - k + 1 control points
    for (let i = 0; i <= j - k + 1; i++) {
        console.log("i1:", i)
        q[i] = points[i]
    }

    // Keep the last n - j + 1 control points
    for (let i = j; i < n; i++) {
        console.log("i2:", i)
        q[i + degree - 1] = points[i]
    }

    // newKnot = newKnot + 2

    // Replace k - 2 control points
    for (let i = j - k + 2; i <= j; i++) {
        console.log("i3:", i)
        let alpha = (h - knots[i]) / (knots[i + degree] - knots[i]);
        console.log(`${alpha} = (${newKnot} - ${knots[i]}) / (${knots[i + degree]} - ${knots[i]})`)

        let a = points[i - 1]
        let b = points[i]
        console.log(a, b)
        let vec = lerpVector(alpha, a, b)
        vec[2] = "added"
        q[i] = vec
    }



    console.log(q)

    console.log(newKnotVector)

    return [q, newKnotVector]

}