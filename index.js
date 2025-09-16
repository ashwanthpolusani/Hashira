const fs = require("fs");

// Convert number string in given base to BigInt
function baseToBigInt(str, base) {
  let result = 0n;
  const digits = "0123456789abcdefghijklmnopqrstuvwxyz";
  for (let char of str.toLowerCase()) {
    let digit = BigInt(digits.indexOf(char));
    if (digit < 0n || digit >= BigInt(base)) {
      throw new Error(`Invalid digit '${char}' for base ${base}`);
    }
    result = result * BigInt(base) + digit;
  }
  return result;
}

// Compute constant term using first k roots
function computeConstant(filePath) {
  const raw = fs.readFileSync(filePath);
  const json = JSON.parse(raw);

  const n = json.keys.n; // total roots provided
  const k = json.keys.k; // required roots
  const degree = k - 1;  // polynomial degree

  if (n < k) {
    throw new Error(
      `Not enough roots: provided ${n}, but at least ${k} required`
    );
  }

  let roots = [];

  // Use only first k roots
  for (let i = 1; i <= k; i++) {
    if (json[i]) {
      const base = parseInt(json[i].base);
      const value = json[i].value;
      const root = baseToBigInt(value, base);
      roots.push(root);
    } else {
      throw new Error(`Root ${i} missing in JSON`);
    }
  }

  // Multiply roots
  let c = 1n;
  for (let r of roots) {
    c *= r;
  }

  // Apply (-1)^degree
  if (degree % 2 !== 0) {
    c = -c;
  }

  return {
    degree,
    constant: c.toString()
  };
}

// Runner
if (process.argv.length < 3) {
  console.log("Usage: node poly_constant.js <input.json>");
  process.exit(1);
}

const filePath = process.argv[2];
try {
  const result = computeConstant(filePath);
  console.log(`Degree of polynomial: ${result.degree}`);
  console.log(`Constant term (c): ${result.constant}`);
} catch (err) {
  console.error("Error:", err.message);
}
