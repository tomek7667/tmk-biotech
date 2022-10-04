const {
	loadFastFile,
	loadFastArchive,
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

	const testFasta = loadFastFile("example_data/example.fasta", appName);

	// console.log(testFasta);
};

main();
