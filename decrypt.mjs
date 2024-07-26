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

function decryptEexec(encodedString) {
  const decoded = hexDecode(encodedString);
  return decrypt(decoded);
}

export function decryptText(originalText) {
  const startMarker = "currentfile eexec";
  const endMarker = "cleartomark";
  const startMarkerIndex = originalText.indexOf(startMarker);
  const startIndex = startMarkerIndex + startMarker.length;
  const endIndex = originalText.indexOf(endMarker, startIndex);

  if (startIndex < 0 || endIndex < 0 || startIndex >= endIndex) {
    throw new Error("eexec data not found or invalid in the text.");
  }

  let encryptedData = originalText.substring(startIndex, endIndex).trim();
  encryptedData = encryptedData.replace(/\s+/g, "");

  if (encryptedData.length % 2 !== 0) {
    throw new Error("Invalid encrypted data length.");
  }

  const decryptedData = decryptEexec(encryptedData).slice(ignoreFirstNCharacters);

  // Replace the encrypted part with the decrypted part
  const result =
    originalText.substring(0, startMarkerIndex) +
    "\n" +
    decryptedData +
    "\n" +
    originalText.substring(endIndex);

  return result;
}
