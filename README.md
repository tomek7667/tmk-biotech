# Package tmk-biotech

Used for reading fasta and fastq files and structuring as valid javascript objects.
The package provides also some useful utility functions like `complementarify` used for getting complementary sequence, or `sanitizeGenome` for sanitizing user input.

### Example usage:

Requiring the package:

```javascript
const {
	loadFastFile,
	loadFastArchive,
	complementarify,
	sanitizeGenome,
	makeSureDirectory,
	getAppDataPath,
	supportedFileTypes,
} = require("@tomek7667/tmk-biotech");
```

---

Loading genomes from a file (with their qualities), a custom error callback can be specified in case of invalid format of a file.

```javascript
const dataObject = loadFastFile("path/to/file.fastq", () => {
	console.log("Custom error when invalid format");
}); // Or .fa or .fasta
```

Out:

```javascript
{
	"readsNames": ["Read 1", "Read 2"],
	"reads": ["GAATA", "TGTGG"],
	"readsQualities": [[0, 0, 0, 0, 0], [1, 2, 5, 2, 0]],
	"type": "fastq"
}
```

---

Loading genomes from a '.gz' archive (with one file currently tested). A custom error callback can be specified in case of invalid format of a file.

```jacascript
const dataObject = await loadFastArchive("path/to/file.fastq.gz", "Test app", () => { console.log("Custom error when invalid format"); }) // Or .fa.gz or .fasta.gz
```

Out:

```javascript
{
	"readsNames": ["Read 1", "Read 2"],
	"reads": ["GAATA", "TGTGG"],
	"readsQualities": [[0, 0, 0, 0, 0], [1, 2, 5, 2, 0]],
	"type": "fastq"
}
```

---

Returning complementary sequence to the input one

```javascript
const complementarySequence = complementarify("GAATACCACA");
```

Out:

```javascript
"TGTGGTATTC";
```

---

Sanitizing user input

```javascript
const sanitizedGenome = sanitizeGenome("gA tcca ACa \n");
```

Out:

```javascript
"GATCCAACA";
```

---

Recursively ensuring a directory exists

```javascript
makeSureDirectory("/path/to/dir");
```

---

Getting absolute path to the directory of the current project/app

```javascript
const pathToFileStoring = getAppDataPath("Test app");
```

---

Getting supported file extensions

```javascript
console.log(supportedFileTypes);
```

Out:

```javascript
// ["fa", "fasta", "fastq", "fastq.gz", fasta.gz", "fa.gz"]
```

---

Generate all GATC sequences

```javascript
const gatcSequences = iupacTOgatc("TTTRT");

console.log(gatcSequences);
```

Out:

```javascript
["TTTAT", "TTTGT"];
```

---
