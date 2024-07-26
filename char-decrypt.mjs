// decrypts the charstring of a Type 1 font
// adapted from
// https://github.com/kohler/t1utils/blob/master/t1disasm.c

import fs from "fs";

const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3];

if (!inputFilePath || !outputFilePath) {
  console.error("Please specify an input and output file path.");
  process.exit(1);
}

// Function to decrypt Type 1 CharString
function decryptType1CharString(encryptedString, lenIV = 4) {
  const c1 = 52845;
  const c2 = 22719;
  let r = 4330; // cr_default
  let decryptedBytes = [];

  // Decrypt CharString
  for (let i = 0; i < encryptedString.length; i++) {
    const cipherByte = encryptedString.charCodeAt(i);
    const plainByte = cipherByte ^ (r >> 8);
    decryptedBytes.push(plainByte);
    r = (cipherByte + r) * c1 + c2;
    r = r & 0xffff; // Ensure r stays within 16-bit unsigned integer
  }

  // Skip lenIV Bytes
  if (lenIV >= 0) {
    decryptedBytes = decryptedBytes.slice(lenIV);
  }

  // Process Decrypted Bytes into Tokens
  let tokens = [];
  for (let i = 0; i < decryptedBytes.length; i++) {
    const b = decryptedBytes[i];
    let val;

    if (b >= 32) {
      if (b <= 246) {
        val = b - 139;
      } else if (b <= 250) {
        i++;
        val = (b - 247) * 256 + decryptedBytes[i] + 108;
      } else if (b <= 254) {
        i++;
        val = -(b - 251) * 256 - decryptedBytes[i] - 108;
      } else {
        val =
          (decryptedBytes[i + 1] << 24) |
          (decryptedBytes[i + 2] << 16) |
          (decryptedBytes[i + 3] << 8) |
          decryptedBytes[i + 4];
        if (val & 0x80000000) val |= ~0xffffffff;
        val = val | 0;
        i += 4;
      }
      tokens.push(val);
    } else {
      switch (b) {
        case 0:
          tokens.push("error");
          break; /* special */
        case 1:
          tokens.push("hstem");
          break;
        case 3:
          tokens.push("vstem");
          break;
        case 4:
          tokens.push("vmoveto");
          break;
        case 5:
          tokens.push("rlineto");
          break;
        case 6:
          tokens.push("hlineto");
          break;
        case 7:
          tokens.push("vlineto");
          break;
        case 8:
          tokens.push("rrcurveto");
          break;
        case 9:
          tokens.push("closepath");
          break; /* Type 1 ONLY */
        case 10:
          tokens.push("callsubr");
          break;
        case 11:
          tokens.push("return");
          break;
        case 13:
          tokens.push("hsbw");
          break; /* Type 1 ONLY */
        case 14:
          tokens.push("endchar");
          break;
        case 16:
          tokens.push("blend");
          break; /* Type 2 */
        case 18:
          tokens.push("hstemhm");
          break; /* Type 2 */
        case 19:
          tokens.push("hintmask");
          break; /* Type 2 */
        case 20:
          tokens.push("cntrmask");
          break; /* Type 2 */
        case 21:
          tokens.push("rmoveto");
          break;
        case 22:
          tokens.push("hmoveto");
          break;
        case 23:
          tokens.push("vstemhm");
          break; /* Type 2 */
        case 24:
          tokens.push("rcurveline");
          break; /* Type 2 */
        case 25:
          tokens.push("rlinecurve");
          break; /* Type 2 */
        case 26:
          tokens.push("vvcurveto");
          break; /* Type 2 */
        case 27:
          tokens.push("hhcurveto");
          break; /* Type 2 */
        case 28:
          tokens.push("shortint");
          break; /* Type 2 */
        case 29:
          tokens.push("callgsubr");
          break; /* Type 2 */
        case 30:
          tokens.push("vhcurveto");
          break;
        case 31:
          tokens.push("hvcurveto");
          break;
        case 12:
          i++;
          const b2 = decryptedBytes[i];
          switch (b2) {
            case 0:
              tokens.push("dotsection");
              break; /* Type 1 ONLY */
            case 1:
              tokens.push("vstem3");
              break; /* Type 1 ONLY */
            case 2:
              tokens.push("hstem3");
              break; /* Type 1 ONLY */
            case 3:
              tokens.push("and");
              break; /* Type 2 */
            case 4:
              tokens.push("or");
              break; /* Type 2 */
            case 5:
              tokens.push("not");
              break; /* Type 2 */
            case 6:
              tokens.push("seac");
              break; /* Type 1 ONLY */
            case 7:
              tokens.push("sbw");
              break; /* Type 1 ONLY */
            case 8:
              tokens.push("store");
              break; /* Type 2 */
            case 9:
              tokens.push("abs");
              break; /* Type 2 */
            case 10:
              tokens.push("add");
              break; /* Type 2 */
            case 11:
              tokens.push("sub");
              break; /* Type 2 */
            case 12:
              tokens.push("div");
              break;
            case 13:
              tokens.push("load");
              break; /* Type 2 */
            case 14:
              tokens.push("neg");
              break; /* Type 2 */
            case 15:
              tokens.push("eq");
              break; /* Type 2 */
            case 16:
              tokens.push("callothersubr");
              break; /* Type 1 ONLY */
            case 17:
              tokens.push("pop");
              break; /* Type 1 ONLY */
            case 18:
              tokens.push("drop");
              break; /* Type 2 */
            case 20:
              tokens.push("put");
              break; /* Type 2 */
            case 21:
              tokens.push("get");
              break; /* Type 2 */
            case 22:
              tokens.push("ifelse");
              break; /* Type 2 */
            case 23:
              tokens.push("random");
              break; /* Type 2 */
            case 24:
              tokens.push("mul");
              break; /* Type 2 */
            case 27:
              tokens.push("dup");
              break; /* Type 2 */
            case 28:
              tokens.push("exch");
              break; /* Type 2 */
            case 29:
              tokens.push("index");
              break; /* Type 2 */
            case 30:
              tokens.push("roll");
              break; /* Type 2 */
            case 33:
              tokens.push("setcurrentpoint");
              break; /* Type 1 ONLY */
            case 34:
              tokens.push("hflex");
              break; /* Type 2 */
            case 35:
              tokens.push("flex");
              break; /* Type 2 */
            case 36:
              tokens.push("hflex1");
              break; /* Type 2 */
            case 37:
              tokens.push("flex1");
              break; /* Type 2 */
            default:
              tokens.push(`escape_${b2}`);
              break;
          }
          break;
        default:
          tokens.push(`UNKNOWN_${b}`);
          break;
      }
    }
  }

  // Return Decrypted Tokens
  return tokens.join(" ");
}

// Function to process the file
function processFile(inputFilePath, outputFilePath) {
  const fileContent = fs.readFileSync(inputFilePath, "utf8");
  let outputContent = "";
  let lastIndex = 0;

  while (true) {
    const start = fileContent.indexOf(" RD", lastIndex);
    const end = fileContent.indexOf(" ND", lastIndex);

    if (start === -1 || end === -1) {
      outputContent += fileContent.slice(lastIndex);
      break;
    }

    // Append the content before the encrypted section
    outputContent += fileContent.slice(lastIndex, start + 2);

    // Decrypt the encrypted section
    const encryptedSection = fileContent.slice(start + 2, end).trim();
    const decryptedSection = decryptType1CharString(encryptedSection);
    outputContent += decryptedSection;

    lastIndex = end + 2;
  }

  fs.writeFileSync(outputFilePath, outputContent);
  console.log(`Decrypted file written to ${outputFilePath}`);
}

processFile(inputFilePath, outputFilePath);
