const {
	loadFastFile,
	loadFastArchive,
	iupacTOgatc,
	complementarify,
	sanitizeGenome,
	makeSureDirectory,
	getAppDataPath,
} = require("./tmk-biotech");
const appName = "tmk-biotech";

const main = async () => {
	const testFastqGz = await loadFastArchive(
		"example_data/example.fastq.gz",
		appName,
		() => {
			console.log("An error occured while loading the genome!");
		}
	);

	// console.log(testFastqGz);

	const testFasta = loadFastFile("example_data/example.fasta", () => {
		console.log("An error occured while loading the genome!");
	});

	// console.log(testFasta);

	const gatcSequences = iupacTOgatc("RTTTT");

	// console.log(gatcSequences);
};

main();
