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

## Other Resources

- [Bill Casselman · Notes on reading Adobe font files](https://personal.math.ubc.ca/~cass/piscript/type1.pdf)
- [pscrypt · encryption/decryption algorithm](https://github.com/9fans/plan9port/blob/master/src/cmd/postscript/misc/pscrypt.c)
- [T1utils](https://github.com/kohler/t1utils)
