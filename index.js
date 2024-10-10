document.getElementById("calculate-btn").addEventListener("click", () => {
    const rows = parseInt(document.getElementById("rows").value);
    const cols = parseInt(document.getElementById("columns").value);
    const elements = document.getElementById("elements").value.trim().split(" ").map(Number);

    if (elements.length !== rows * cols) {
        alert("Number of elements does not match the specified dimensions!");
        return; // Check for correct number of elements
    }

    // Build the matrix
    let matrix = [];
    for (let i = 0; i < rows; i++) {
        matrix.push(elements.slice(i * cols, (i + 1) * cols));
    }

    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = `Matrix (${rows}x${cols}):<br>${matrix.map(row => row.join(" ")).join("<br>")}`;

    // Check if the matrix is square
    if (rows === cols) {
        const det = Math.round(determinant(matrix));
        const trace = Math.round(matrixTrace(matrix));
        const transposed = transpose(matrix);
        const rank = matrixRank(matrix);
        const inv = inverse(matrix);
        const eigenVals = eigenvalues(matrix).map(val => Math.round(val)); // Round eigenvalues
        const eigenVecs = eigenvectors(matrix, eigenVals).map(vec => vec.map(val => Math.round(val))); // Round eigenvectors

        outputDiv.innerHTML += `<br><br>Determinant: ${det}`; 
        outputDiv.innerHTML += `<br>Trace: ${trace}`;
        outputDiv.innerHTML += `<br>Transpose:<br>${transposed.map(row => row.join(" ")).join("<br>")}`;
        outputDiv.innerHTML += `<br>Rank: ${rank}`;
        outputDiv.innerHTML += `<br>Inverse:<br>${inv ? inv.map(row => row.join(" ")).join("<br>") : 'Not available (Singular matrix)'}`;
        outputDiv.innerHTML += `<br>Eigenvalues:<br>${eigenVals.join(", ")}`;
        outputDiv.innerHTML += `<br>Eigenvectors:<br>${eigenVecs.map(vec => `[${vec.join(", ")}]`).join("<br>")}`;
    } else {
        outputDiv.innerHTML += `<br><br>Determinant: Not available (matrix is not square)`;
        outputDiv.innerHTML += `<br>Trace: Not available (matrix is not square)`;
        outputDiv.innerHTML += `<br>Transpose:<br>${transpose(matrix).map(row => row.join(" ")).join("<br>")}`;
        outputDiv.innerHTML += `<br>Rank: ${matrixRank(matrix)}`;
        outputDiv.innerHTML += `<br>Inverse: Not available (matrix is not square)`;
        outputDiv.innerHTML += `<br>Eigenvalues: Not available (matrix is not square)`;
        outputDiv.innerHTML += `<br>Eigenvectors: Not available (matrix is not square)`;
    }
});

function transpose(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

function matrixTrace(matrix) {
    return matrix.reduce((acc, row, i) => acc + row[i], 0);
}

function determinant(matrix) {
    if (matrix.length === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }
    let det = 0;
    for (let i = 0; i < matrix.length; i++) {
        let subMatrix = matrix.slice(1).map(row => row.filter((_, colIndex) => colIndex !== i));
        det += matrix[0][i] * determinant(subMatrix) * (i % 2 === 0 ? 1 : -1);
    }
    return det;
}

function matrixRank(matrix) {
    const n = matrix.length;
    const m = matrix[0].length;
    let rank = Math.min(n, m);
    let mat = matrix.map(row => row.slice());

    for (let row = 0; row < rank; row++) {
        if (mat[row][row] !== 0) {
            for (let col = 0; col < n; col++) {
                if (col !== row) {
                    let mult = mat[col][row] / mat[row][row];
                    for (let i = 0; i < rank; i++) {
                        mat[col][i] -= mult * mat[row][i];
                    }
                }
            }
        } else {
            let reduce = true;
            for (let i = row + 1; i < n; i++) {
                if (mat[i][row] !== 0) {
                    [mat[row], mat[i]] = [mat[i], mat[row]];
                    reduce = false;
                    break;
                }
            }

            if (reduce) {
                rank--;
                for (let i = 0; i < n; i++) {
                    mat[i][row] = mat[i][rank];
                }
            }
            row--;
        }
    }
    return rank;
}

function inverse(matrix) {
    const n = matrix.length;
    let I = matrix.map((row, i) => row.map((_, j) => (i === j ? 1 : 0))); // Identity matrix
    let A = matrix.map(row => row.slice()); // Copy of the original matrix

    for (let i = 0; i < n; i++) {
        // Ensure that the factor is an integer
        let factor = A[i][i];
        if (factor === 0) return null; // Singular matrix

        for (let j = 0; j < n; j++) {
            A[i][j] = Math.round(A[i][j] / factor); // Make this row integer
            I[i][j] = Math.round(I[i][j] / factor); // Scale identity matrix
        }

        for (let k = 0; k < n; k++) {
            if (k !== i) {
                let mult = A[k][i];
                for (let j = 0; j < n; j++) {
                    A[k][j] -= mult * A[i][j];
                    I[k][j] -= mult * I[i][j];
                }
            }
        }
    }
    return I.map(row => row.map(Math.round)); // Ensure all elements are rounded to integers
}

function eigenvalues(matrix) {
    const [a, b, c] = [matrix[0][0], matrix[0][1], matrix[1][1]];
    const trace = a + c;
    const determinant = a * c - b * b;
    const eigenValue1 = Math.round(trace / 2 + Math.sqrt(trace * trace / 4 - determinant));
    const eigenValue2 = Math.round(trace / 2 - Math.sqrt(trace * trace / 4 - determinant));
    return [eigenValue1, eigenValue2];
}

function eigenvectors(matrix, eigenvalues) {
    const [[a, b], [c, d]] = matrix;
    let eigenvectors = [];

    eigenvalues.forEach(lambda => {
        let vector = [];
        if (b !== 0) {
            vector = [lambda - d, b];
        } else if (c !== 0) {
            vector = [c, lambda - a];
        } else {
            vector = [1, 0];
        }
        eigenvectors.push(normalize(vector));
    });

    return eigenvectors;
}

function normalize(vector) {
    const length = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => Math.round(val / length)); // Normalize and round to integer
}
