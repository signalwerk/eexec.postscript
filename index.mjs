// if you get gibberish text in the output file,
// try ignoring the first 4 characters of the decrypted data
// → in decryptEexec; return decrypt(decoded.slice(4));

import fs from "fs";
import { decryptText } from "./decrypt.mjs";

const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3];

if (!inputFilePath || !outputFilePath) {
  console.error("Please specify an input and output file path.");
  process.exit(1);
}

function processFile(inputFilePath, outputFilePath) {
  fs.readFile(inputFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }

    try {
      const decryptedData = decryptText(data);
      fs.writeFile(outputFilePath, decryptedData, (err) => {
        if (err) {
          console.error("Error writing the decrypted data to the file:", err);
          return;
        }
        console.log(`Decrypted data has been written to ${outputFilePath}`);
      });
    } catch (error) {
      console.error(error.message);
    }
  });
}

processFile(inputFilePath, outputFilePath);
