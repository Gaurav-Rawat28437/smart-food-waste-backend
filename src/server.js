const app = require("./app");
const mongoose = require("mongoose");
const syncDAOutput = require("./services/daSync");
require("dotenv").config();

const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

const PORT = process.env.PORT || 8080;

mongoose
    .connect(process.env.MONGO_URI)

    .then(async () => {

        console.log("MongoDB connected");

        // ==========================================
        // INITIAL DA OUTPUT SYNC
        // ==========================================

        try {

            await syncDAOutput();

            console.log(
                "Initial DA output sync completed"
            );

        } catch (error) {

            console.error(
                "Initial DA sync failed:",
                error.message
            );

        }

        // ==========================================
        // DA OUTPUT SYNC EVERY 5 MINUTES
        // ==========================================

        setInterval(async () => {

            try {

                await syncDAOutput();

            } catch (error) {

                console.error(
                    "DA sync failed:",
                    error.message
                );

            }

        }, 5 * 60 * 1000);

        // ==========================================
        // START SERVER
        // ==========================================

        app.listen(PORT, () => {

            console.log(
                `Server running on port ${PORT}`
            );

        });

    })

    .catch((error) => {

        console.error(
            `MongoDB connection failed: ${error.message}`
        );

        process.exit(1);

    });