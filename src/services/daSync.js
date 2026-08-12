const Donation = require("../models/Donation");
const { getRows } = require("./googleSheets");

const syncDAOutput = async () => {
    try {
        console.log("Reading DA_Output sheet...");

        const rows = await getRows("DA_Output");

        if (!rows || rows.length <= 1) {
            console.log("No DA output available.");
            return;
        }

        // Remove header row
        const dataRows = rows.slice(1);

        for (const row of dataRows) {

            const [
                donationId,
                priority,
                recommendedNGO,
                reason
            ] = row;

            // Ignore empty rows
            if (!donationId) {
                continue;
            }

            // Find donation in MongoDB
            const donation = await Donation.findOne({
                donationId: donationId
            });

            if (!donation) {
                console.log(
                    `Donation not found: ${donationId}`
                );

                continue;
            }

            // Update DA information
            donation.priority = priority || null;

            donation.recommendedNGO =
                recommendedNGO || null;

            donation.reason =
                reason || null;

            // Save changes
            await donation.save();

            console.log(
                `DA output updated: ${donationId}`
            );
        }

        console.log("DA output sync completed.");

    } catch (error) {

        console.error(
            "DA output sync error:",
            error.message
        );
    }
};

module.exports = syncDAOutput;