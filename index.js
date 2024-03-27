// if you get gibberish text in the output file,
// try ignoring the first 4 characters of the decrypted data
// → in decryptEexec; return decrypt(decoded.slice(4));

const fs = require("fs");

function decryptEexec(encodedString) {
  // Hex decoding
  const hexDecode = (str) => {
    let result = "";
    for (let i = 0; i < str.length; i += 2) {
      result += String.fromCharCode(parseInt(str.substr(i, 2), 16));
    }
    return result;
  };

  // Decrypting the eexec encrypted block
  // The encryption key for eexec
  let R = 55665;
  const decrypt = (str) => {
    let result = "";
    for (let i = 0; i < str.length; i++) {
      const cipher = str.charCodeAt(i);
      const plain = cipher ^ (R >> 8);
      result += String.fromCharCode(plain);
      R = ((cipher + R) * 52845 + 22719) % 65536;
    }
    return result;
  };

  const decoded = hexDecode(encodedString);
  return decrypt(decoded);
}

function processFile(inputFilePath, outputFilePath) {
  fs.readFile(inputFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }

    const startMarker = "eexec";
    const endMarker = "cleartomark";
    const startIndex = data.indexOf(startMarker) + startMarker.length;
    const endIndex = data.indexOf(endMarker, startIndex);

    if (startIndex < 0 || endIndex < 0 || startIndex >= endIndex) {
      console.error("eexec data not found or invalid in the file.");
      return;
    }

    let encryptedData = data.substring(startIndex, endIndex).trim();

    // Remove all whitespace characters from the encrypted data
    encryptedData = encryptedData.replace(/\s+/g, "");

    if (encryptedData.length % 2 !== 0) {
      console.error("Invalid encrypted data length.");
      return;
    }

    const decryptedData = decryptEexec(encryptedData);

    // Write the decrypted data to the specified output file
    fs.writeFile(outputFilePath, decryptedData, (err) => {
      if (err) {
        console.error("Error writing the decrypted data to the file:", err);
        return;
      }
      console.log(`Decrypted data has been written to ${outputFilePath}`);
    });
  });
}

const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3];

if (!inputFilePath || !outputFilePath) {
  console.error("Please specify an input and output file path.");
  process.exit(1);
}

processFile(inputFilePath, outputFilePath);
