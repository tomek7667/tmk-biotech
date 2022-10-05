# Package tmk-biotech

Used for reading fasta and fastq files and structuring as valid javascript objects.
The package provides also some useful utility functions like `complementarify` used for getting complementary sequence, or `sanitizeGenome` for sanitizing user input.

Example usage:

```javascript
const {
	loadFastFile,
	loadFastArchive,
	complementarify,
	sanitizeGenome,
	makeSureDirectory,
	getAppDataPath,
	supportedFileTypes,
} = require('@tomek7667/tmk-biotech');

// Loading genomes from a file (with their qualities), a custom error callback can be specified in case of invalid format of a file.
const dataObject = loadFastFile("path/to/file.fastq", () => { console.log("Custom error when invalid format"); }) // Or .fa or .fasta
// OUT: 
// {
// 	"readsNames": ["Read 1", "Read 2"],
// 	"reads": ["GAATA", "TGTGG"],
// 	"readsQualities": [[0, 0, 0, 0, 0], [1, 2, 5, 2, 0]],
// 	"type": "fastq"
// }

// Loading genomes from a '.gz' archive (with one file currently tested). A custom error callback can be specified in case of invalid format of a file.
const dataObject = await loadFastArchive("path/to/file.fastq.gz", "Test app", () => { console.log("Custom error when invalid format"); }) // Or .fa.gz or .fasta.gz
// OUT:
// {
// 	"readsNames": ["Read 1", "Read 2"],
// 	"reads": ["GAATA", "TGTGG"],
// 	"readsQualities": [[0, 0, 0, 0, 0], [1, 2, 5, 2, 0]],
// 	"type": "fastq"
// }

// Returning complementary sequence to the input one
const complementarySequence = complementarify("GAATACCACA")
// OUT: TGTGGTATTC

// Sanitizes user input
const sanitizedGenome = sanitizeGenome("gA tcca ACa \n")
// OUT: GATCCAACA

// Recursively ensuring a directory exists
makeSureDirectory("/path/to/dir")

// Getting absolute path to the directory of the current project/app
const pathToFileStoring = getAppDataPath("Test app")

// Getting supported file extensions
console.log(supportedFileTypes)
// OUT: ["fa", "fasta", "fastq", "fastq.gz", fasta.gz", "fa.gz"]
```
