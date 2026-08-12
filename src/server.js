const app = require("./app");
const mongoose = require("mongoose");
const syncDAOutput = require("./services/daSync");

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

        // Sync DA output immediately when server starts
        await syncDAOutput();

        // Sync DA output every 5 minutes
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