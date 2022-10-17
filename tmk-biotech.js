("use strict");

const fs = require("fs");
const path = require("path");
const gunzip = require("gunzip-file");
const { randomUUID } = require("crypto");

const supportedFileTypes = [
	"fasta",
	"fastq",
	"fa",
	"fastq.gz",
	"fasta.gz",
	"fa.gz",
];

/**
 * Function to load the reads (genomes) from a fasta/fastq file into valid objects
 *
 * @param {String} p - Path to the file to be read. Extensions: .fasta, .fastq, .fa
 * @param {Function<String> | undefined} errorCallback function to be called after an error, an argument with the error message is passed
 * @returns {Object} - Data object with the following properties:
 * - readsNames: Array of strings
 * - reads: Array of strings
 * - readsQualities: Array of arrays of numbers (qualities corresponding to the reads)
 * - type: "fasta" or "fastq"
 */
let loadFastFile = (p, errorCallback) => {
	let ext = path.extname(p).slice(1).toLowerCase();
	let dataObject;
	switch (ext) {
		case "fa":
		case "fasta":
			try {
				dataObject = loadFasta(p);
			} catch (e) {
				if (errorCallback !== undefined) {
					errorCallback(e.message);
				}
				return;
			}
			break;
		case "fastq":
			try {
				dataObject = loadFastq(p);
			} catch (e) {
				if (errorCallback !== undefined) {
					errorCallback(e.message);
				}
				return;
			}
			break;
		default:
			if (errorCallback !== undefined) {
				errorCallback("Unsupported file type");
			}
			return;
	}
	return dataObject;
};

/**
 *
 * @param {Sting} p - Path to the file to be read. Extensions: .fasta, .fastq, .fa
 * @param {String} appName - Name of the app to be used in the path for temporary zip files
 * @param {Function<String> | undefined} errorCallback function to be called after an error, an argument with the error message is passed
 * @returns {Promise<Object>} - Data object with the following properties:
 * - readsNames: Array of strings
 * - reads: Array of strings
 * - readsQualities: Array of arrays of numbers (qualities corresponding to the reads)
 * - type: "fasta" or "fastq"
 * - wasArchived: boolean
 */
let loadFastArchive = async (p, appName, errorCallback) => {
	let ext = path.extname(p).slice(1).toLowerCase();
	let dataObject;
	switch (ext) {
		case "gz":
			try {
				dataObject = await loadFastGz(p, appName, errorCallback);
			} catch (e) {
				if (errorCallback !== undefined) {
					errorCallback(e.message);
				}
				return;
			}
			break;
		default:
			if (errorCallback !== undefined) {
				errorCallback("Unsupported file type");
			}
			return;
	}
	return { ...dataObject, wasArchived: true };
};

let loadFastGz = (p, appName, errorCallback) => {
	return new Promise((resolve, reject) => {
		let dataObject;
		if (
			p.split(".")[p.split(".").length - 2].toLowerCase() === "fastq" ||
			p.split(".")[p.split(".").length - 2].toLowerCase() === "fasta" ||
			p.split(".")[p.split(".").length - 2].toLowerCase() === "fa"
		) {
			makeSureDirectory(path.join(getAppDataPath(appName), "tempGz/"));
			const tempFile = path.join(
				getAppDataPath(appName),
				"tempGz/",
				randomUUID() +
					p.split("/")[p.split("/").length - 1].split(".gz")[0]
			);
			gunzip(p, tempFile, () => {
				dataObject = loadFastFile(tempFile, appName, errorCallback);
				fs.unlinkSync(tempFile);
				return resolve(dataObject);
			});
		} else {
			if (errorCallback !== undefined) {
				errorCallback("Unsupported file type");
			}
			return reject();
		}
	});
};

let loadFasta = (p) => {
	let dataObj = {
		readsNames: [],
		reads: [],
		readsQualities: [],
		type: "fasta",
	};
	let fastaContent = fs.readFileSync(p).toString().split("\n");
	let i = 0;
	while (i < fastaContent.length) {
		if (
			!fastaContent[i] ||
			fastaContent[i].length === 0 ||
			fastaContent[i][0] === "\n"
		)
			break;
		if (fastaContent[i][0] === ">") {
			dataObj.readsNames.push(fastaContent[i].substring(1));
			i++;
		} else {
			let read = "";
			while (
				fastaContent[i] &&
				fastaContent[i].length > 0 &&
				fastaContent[i][0] !== ">" &&
				fastaContent[i][0] !== "\n"
			) {
				read += fastaContent[i].trim();
				i++;
			}
			dataObj.reads.push(read);
			dataObj.readsQualities.push(Array(read.length).fill(0));
		}
	}
	return dataObj;
};

let loadFastq = (p) => {
	let dataObj = {
		readsNames: [],
		reads: [],
		readsQualities: [],
		type: "fastq",
	};
	let fastqContent = fs.readFileSync(p).toString().split("\n");
	let i = 0;
	while (i < fastqContent.length) {
		if (fastqContent[i].length === 0) break;
		dataObj.readsNames.push(fastqContent[i].substring(1));
		i++;
		dataObj.reads.push(fastqContent[i].trim());
		let localQualities = [];
		let qualityString = fastqContent[i + 2].trim();
		for (let j = 0; j < qualityString.length; j++) {
			let qualityLevel = qualityString.charCodeAt(j) - 0x21;
			localQualities.push(qualityLevel);
		}
		dataObj.readsQualities.push(localQualities);
		i += 3;
	}
	return dataObj;
};

/**
 * @param {String} sequence - sequence to be complementarified
 * @returns {String} a complementarified version of the sequence
 */
let complementarify = (sequence) => {
	return sequence
		.split("")
		.reverse()
		.join("")
		.replace(/T/g, "a")
		.replace(/C/g, "g")
		.replace(/A/g, "t")
		.replace(/G/g, "c")
		.toUpperCase();
};

/**
 *
 * @param {String} sequence - sequence to be sanititzed from any whitespaces and lowercase letters
 * @returns {String} a sanitized version of the sequence
 */
let sanitizeGenome = (sequence) => {
	return sequence
		.replace(/\n/g, "")
		.replace(/\r/g, "")
		.replace(/ /g, "")
		.trim()
		.toUpperCase();
};

/**
 *
 * @param {String} dir - A path to a directory to be created
 * @returns {String} the path to the directory
 */
let makeSureDirectory = (dir) => {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, {
			recursive: true,
		});
	}
	return dir;
};

/**
 *
 * @param {String} appName - Name of the app to be used in the path
 * @returns {String} - Path to the app's data directory (To be used for storing files)
 */
let getAppDataPath = (appName) => {
	switch (process.platform) {
		case "darwin": {
			return path.join(
				process.env.HOME,
				"Library",
				"Application Support",
				appName
			);
		}
		case "win32": {
			return path.join(process.env.APPDATA, appName);
		}
		case "linux": {
			return path.join(process.env.HOME, appName);
		}
		default: {
			alert("Unsupported platform!");
			process.exit(1);
		}
	}
};

/**
 *
 * @param {String} iupacSequence - A sequence with IUPAC codes
 * @returns {Array<String>} - An array of all possible sequences that can be generated from the IUPAC sequence
 */
let iupacTOgatc = (iupacSequence) => {
	const translations = {
		A: ["A"],
		C: ["C"],
		G: ["G"],
		T: ["T"],
		R: ["A", "G"],
		Y: ["C", "T"],
		S: ["G", "C"],
		W: ["A", "T"],
		K: ["G", "T"],
		M: ["A", "C"],
		B: ["C", "G", "T"],
		D: ["A", "G", "T"],
		H: ["A", "C", "T"],
		V: ["A", "C", "G"],
		N: ["A", "C", "G", "T"],
	};
	// Generate all possible sequences
	let sequences = [];
	for (let i = 0; i < iupacSequence.length; i++) {
		let newSequences = [];
		for (let j = 0; j < translations[iupacSequence[i]].length; j++) {
			if (sequences.length === 0) {
				newSequences.push(translations[iupacSequence[i]][j]);
			}
			for (let k = 0; k < sequences.length; k++) {
				newSequences.push(
					sequences[k] + translations[iupacSequence[i]][j]
				);
			}
		}
		sequences = newSequences;
	}
	return sequences;
};

// Exporting
module.exports = {
	loadFastFile,
	loadFastArchive,
	complementarify,
	sanitizeGenome,
	makeSureDirectory,
	getAppDataPath,
	iupacTOgatc,
	supportedFileTypes,
};
