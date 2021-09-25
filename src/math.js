// @ts-check
/**
 * 
 * @param {number} u 
 * @param {number} k degree + 1
 * @param {number[][]} points 
 * @param {number[]} knots 
 */
export function deBoor(u, k, points, knots) {
    // console.log(`deBoors(${u},${k})`)
    const n = points.length
    let j = 0

    // find j (the spline segment) for the [t] value provided
    // for (j = domain[0]; s < domain[1]; s++) {
    //     if (t >= knots[s] && t <= knots[s + 1]) {
    //         break;
    //     }
    // }
    const degree = k - 1

    let domain = [
        degree,
        knots.length - 1 - degree
    ];

    // remap t to the domain where the spline is defined
    var low = knots[domain[0]];
    var high = knots[domain[1]];
    let t = u * (high - low) + low;

    for (j = domain[0]; j < domain[1]; j++) {
        if (t >= knots[j] && t <= knots[j + 1]) {
            break;
        }
    }
    // console.log("j:", j, "t:", t)

    let q = []
    q[0] = []
    for (let i = j - k + 1; i < j; i++) {
        q[0][i] = points[i]
    }

    // for (let i = 0; i < n; i++) {
    //     q[i] = []
    //     q[0][i] = points[i]
    // }

    // console.log(q)

    for (let r = 1; r < k; r++) {
        let h = k - r
        // console.log("r:", r)
        // Construct control points for order h spline
        for (let i = j - h + 1; i < j; i++) {
            // console.log("i:", i)
            let alpha = (u - knots[i]) / (knots[i + k - r] - knots[i])
            // console.log("alpha:", alpha)

            let a = q[r - 1][i - 1]
            let b = q[r - 1][i]
            // console.log(a, b)
            q[r] = []
            q[r][i] = lerpVector(alpha, a, b)
        }
    }

    // console.log(q)

    return q[k - 1 - 1][j - 1]
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



export function interpolate(t, degree, points, knots, weights) {

    let s, l;              // function-scoped iteration letiables
    let n = points.length;    // points count
    let d = points[0].length; // point dimensionality
    const k = degree + 1

    if (degree < 1) throw new Error('degree must be at least 1 (linear)');
    if (degree > (n - 1)) throw new Error('degree must be less than or equal to point count - 1');

    if (!weights) {
        // build weight vector of length [n]
        weights = [];
        for (let i = 0; i < n; i++) {
            weights[i] = 1;
        }
    }


    if (!knots) {
        // build knot vector of length [n + degree + 1]
        let knots = [];
        for (let i = 0; i < n + degree + 1; i++) {
            knots[i] = i;
        }
    } else {
        if (knots.length !== n + degree + 1) throw new Error('bad knot vector length');
    }

    let domain = [
        degree,
        knots.length - 1 - degree
    ];

    // remap t to the domain where the spline is defined
    let low = knots[domain[0]];
    let high = knots[domain[1]];
    t = t * (high - low) + low;

    if (t < low || t > high) throw new Error('out of bounds');

    // find s (the spline segment) for the [t] value provided
    for (s = domain[0]; s < domain[1]; s++) {
        if (t >= knots[s] && t <= knots[s + 1]) {
            break;
        }
    }

    // convert points to homogeneous coordinates
    let v = [];
    for (let i = 0; i < n; i++) {
        v[i] = [];
        for (let j = 0; j < d; j++) {
            v[i][j] = points[i][j];
        }
        v[i][d] = 1;
    }

    // console.log(v)
    // l (level) goes from 1 to the curve degree + 1
    let alpha;
    for (l = 1; l <= k; l++) {
        let h = k - l
        // build level l of the pyramid
        for (let i = s; i > s - degree - 1 + l; i--) {

            alpha = (t - knots[i]) / (knots[i + k - l] - knots[i]);

            let a = v[i - 1]
            let b = v[i]
            v[i] = lerpVector(alpha, a, b)
            console.log(v[i])
        }
    }

    // convert back to cartesian and return
    let result = [];
    for (let i = 0; i < d; i++) {
        result[i] = v[s][i] / v[s][d];
    }

    return result;
}