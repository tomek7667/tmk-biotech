const fs = require("fs");
const path = require("path");

'use strict';

/**
 * Function to load the reads (genomes) from a fasta/fastq file into valid objects
 *
 * @param {*} path - Path to the file to be read. Extenstions: .fasta, .fastq, .fa
 * @param {Function | undefined} errorCallback function to be called after unknown extenstion
 * @returns {Object} - Data object with the following properties:
 * - readsNames: Array of strings
 * - reads: Array of strings
 * - readsQualities: Array of arrays of numbers (qualities corresponding to the reads)
 * - type: "fasta" or "fastq"
 */
let loadFastFile = (path, errorCallback) => {
	let extension = path.split(".")[path.split(".").length - 1].toLowerCase();
	let dataObject;
	switch (extension) {
		case "fa":
		case "fasta":
			dataObject = loadFasta(path);
			break;
		case "fastq":
			dataObject = loadFastq(path);
			break;
		default:
			if (errorCallback !== undefined) {
				errorCallback();
			}
			return;
	}
	return dataObject;
};

let loadFasta = (path) => {
	let dataObj = {
		readsNames: [],
		reads: [],
		readsQualities: [],
		type: "fasta",
	};
	let fastaContent = fs.readFileSync(path).toString().split("\n");
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

let loadFastq = (path) => {
	let dataObj = {
		readsNames: [],
		reads: [],
		readsQualities: [],
		type: "fastq",
	};
	let fastqContent = fs.readFileSync(path).toString().split("\n");
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
 * @returns a complementarified version of the sequence
 */
let complementarify = (sequence) => {
	return sequence
		.split("")
		.reverse()
		.join("")
		.replaceAll("T", "a")
		.replaceAll("C", "g")
		.replaceAll("A", "t")
		.replaceAll("G", "c")
		.toUpperCase();
};

/**
 *
 * @param {String} sequence - sequence to be sanititzed from any whitespaces and lowercase letters
 * @returns a sanitized version of the sequence
 */
let sanitizeGenome = (sequence) => {
	return sequence
		.replaceAll("\n", "")
		.replaceAll("\r", "")
		.replaceAll(" ", "")
		.toUpperCase();
};

/**
 *
 * @param {String} dir - A path to a directory to be created
 */
let makeSureDirectory = (dir) => {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, {
			recursive: true,
		});
	}
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

// Exporting
module.exports = {
	loadFastFile,
	complementarify,
	sanitizeGenome,
	makeSureDirectory,
	getAppDataPath,
};
