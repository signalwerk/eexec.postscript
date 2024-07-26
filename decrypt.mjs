// try ignoring the first 4 characters of the decrypted data
const ignoreFirstNCharacters = 4;

function hexDecode(str) {
  let result = "";
  for (let i = 0; i < str.length; i += 2) {
    result += String.fromCharCode(parseInt(str.substr(i, 2), 16));
  }
  return result;
}

function decrypt(str) {
  let R = 55665;
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const cipher = str.charCodeAt(i);
    const plain = cipher ^ (R >> 8);
    result += String.fromCharCode(plain);
    R = ((cipher + R) * 52845 + 22719) % 65536;
  }
  return result;
}

function decryptEexec(encodedString, isHex) {
  const decoded = isHex ? hexDecode(encodedString) : encodedString;
  return decrypt(decoded);
}

export function decryptText(originalText) {
  const startMarker = "currentfile eexec";
  const endMarker = "cleartomark";
  const startMarkerIndex = originalText.indexOf(startMarker);
  const startIndex = startMarkerIndex + startMarker.length;
  let endIndex = originalText.indexOf(endMarker, startIndex);

  if (startIndex < 0 || endIndex < 0 || startIndex >= endIndex) {
    throw new Error("eexec data not found or invalid in the text.");
  }


  // Find the actual start of the encrypted data
  let dataStartIndex = startMarkerIndex + startMarker.length;
  while (dataStartIndex < endIndex) {
      const char = originalText[dataStartIndex];
      if (char !== '\n' && char !== '\r' && char !== ' ' && char !== '\t') {
          break;
      }
      dataStartIndex++;
  }

  // let encryptedData = originalText.substring(dataStartIndex + 6, endIndex)
  let encryptedData = originalText.substring(dataStartIndex, endIndex)


  // Determine if the encrypted data is hex-encoded or binary-encoded
  const firstFourChars = encryptedData.substring(0, 4);
  const isHex = /^[0-9A-Fa-f]{4}$/.test(firstFourChars);

  if (isHex) {
    console.log("Hex-encoded data detected.");
    // Remove all whitespace for hex-encoded data
    encryptedData = encryptedData.replace(/\s+/g, "");
    if (encryptedData.length % 2 !== 0) {
      throw new Error("Invalid encrypted data length.");
    }
  } else {
    console.log("Binary-encoded data detected.");
    // omit the first 6 characters
    encryptedData = encryptedData.slice(6);
  }

  let decryptedData = decryptEexec(encryptedData, isHex).slice(
    ignoreFirstNCharacters,
  );

  // Find the position of the "mark currentfile closefile" in decrypted data
  const endDecryptedMarker = "currentfile closefile";
  const endDecryptedIndex = decryptedData.indexOf(endDecryptedMarker);

  if (endDecryptedIndex !== -1) {
    decryptedData = decryptedData.substring(
      0,
      endDecryptedIndex 
    );
  }

  // Replace the encrypted part with the decrypted part
  const result =
    originalText.substring(0, startMarkerIndex) +
    "\n" +
    decryptedData +
    "\n" +
    originalText.substring(endIndex);

  return result;
}
