# PostScript eexec Decryption Tool

This Node.js script decrypts the eexec section of a PostScript (.ps) file, following the Adobe Type 1 font encryption specification.

## Example

To decrypt the eexec segment of a PostScript file, run the script from the command line using Node.js. Specify the input PostScript file and the output file for the decrypted data.

```sh
node index.mjs <input-file.ps> <output-file.ps>
```

## Adobe Type 1 Font Format

To get readable commands in Type 1 fonts out of the binary part, you can use the following command:

```sh
node char-decrypt.mjs <input-file.ps> <output-file.ps>
```
