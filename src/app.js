const express = require("express");

const cors = require("cors");

const cookieParser =
    require("cookie-parser");

require("dotenv").config();


const Donor =
    require("./models/Donor");

const Donation =
    require("./models/Donation");

const NGO =
    require("./models/NGO");

const Claim =
    require("./models/Claim");

    const {

    addRow
} = require("./services/googleSheets");


const authRouter =
    require("./routes/auth.routes");


const {
    isLoggedIn,
    authorize
} = require("./middleware/authMiddleware");


const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
    cors({

        origin:
            "http://localhost:5173",

        credentials: true

    })
);

app.use(express.json());

app.use(cookieParser());


// ==========================================
// AUTH ROUTES
// ==========================================

app.use(
    "/api/auth",
    authRouter
);


// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "Smart Food Waste API is running"

    });

});


// ==========================================
// DONORS
// ==========================================


// CREATE DONOR
app.post(
    "/api/donors",
    isLoggedIn,
    authorize("DONOR"),
    async (req, res) => {

        try {

            console.log(
                "Donor data received:",
                req.body
            );


            const donor =
                await Donor.create({

                    ...req.body,

                    userId:
                        req.user._id

                });


            await addRow(
                "Donors",
                [

                    donor.donorId,

                    donor.userId.toString(),

                    donor.organizationName,

                    donor.phone,

                    donor.address,

                    donor.location?.latitude
                        || "",

                    donor.location?.longitude
                        || ""

                ]
            );


            res.status(201).json({

                success: true,

                message:
                    "Donor created successfully",

                donor

            });


        } catch (error) {

            console.error(
                "Donor creation error:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


// GET DONORS
app.get(
    "/api/donors",
    isLoggedIn,
    authorize("ADMIN"),
    async (req, res) => {

        try {

            const donors =
                await Donor.find();

            res.status(200).json({

                success: true,

                count:
                    donors.length,

                donors

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


// GET DONOR BY ID
app.get(
    "/api/donors/:id",
    isLoggedIn,
    async (req, res) => {

        try {

            const donor =
                await Donor.findById(
                    req.params.id
                );

            if (!donor) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Donor not found"

                });

            }


            res.status(200).json({

                success: true,

                donor

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


// ==========================================
// DONATIONS
// ==========================================


// CREATE DONATION
app.post(
    "/api/donations",
    isLoggedIn,
    authorize("DONOR"),
    async (req, res) => {

        try {

            const donation =
                await Donation.create({

                    ...req.body,

                    donorId:
                        req.user._id

                });


            await addRow(
                "Donations",
                [

                    donation.donationId,

                    donation.donorId.toString(),

                    donation.foodName,

                    donation.category,

                    donation.quantity,

                    donation.unit,

                    donation.location,

                    donation.expiryTime,

                    donation.status

                ]
            );


            res.status(201).json({

                success: true,

                message:
                    "Donation created successfully",

                donation

            });


        } catch (error) {

            console.error(
                "Donation creation error:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


// GET DONATIONS
app.get(
    "/api/donations",
    isLoggedIn,
    authorize("NGO", "ADMIN"),
    async (req, res) => {

        try {

            const donations =
                await Donation
                    .find()
                    .populate(
                        "donorId"
                    );


            res.status(200).json({

                success: true,

                count:
                    donations.length,

                donations

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


// ==========================================
// NGOS
// ==========================================


// CREATE NGO PROFILE
app.post(
    "/api/ngos",
    isLoggedIn,
    authorize("NGO"),
    async (req, res) => {

        try {

            console.log(
                "NGO data received:",
                req.body
            );


            const existingNGO =
                await NGO.findOne({

                    userId:
                        req.user._id

                });


            if (existingNGO) {

                return res.status(400).json({

                    success: false,

                    message:
                        "NGO profile already exists"

                });

            }


            const ngo =
                await NGO.create({

                    userId:
                        req.user._id,

                    ngoId:
                        req.body.ngoId,

                    organizationName:
                        req.body.organizationName,

                    phone:
                        req.body.phone,

                    address:
                        req.body.address,

                    capacity:
                        req.body.capacity,

                    foodTypes:
                        req.body.foodTypes,

                    location:
                        req.body.location

                });


            await addRow(
                "NGOs",
                [

                    ngo.ngoId,

                    ngo.organizationName,

                    ngo.phone,

                    ngo.address,

                    ngo.capacity,

                    Array.isArray(
                        ngo.foodTypes
                    )
                        ? ngo.foodTypes.join(
                            ", "
                        )
                        : "",

                    ngo.location?.latitude
                        || "",

                    ngo.location?.longitude
                        || ""

                ]
            );


            res.status(201).json({

                success: true,

                message:
                    "NGO created successfully",

                ngo

            });


        } catch (error) {

            console.error(
                "NGO creation error:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


// GET NGOS
app.get(
    "/api/ngos",
    isLoggedIn,
    authorize("ADMIN", "DONOR"),
    async (req, res) => {

        try {

            const ngos =
                await NGO.find();

            res.status(200).json({

                success: true,

                count:
                    ngos.length,

                ngos

            });

        } catch (error) {

            console.error(
                "Get NGOs error:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


// GET NGO
app.get(
    "/api/ngos/:id",
    isLoggedIn,
    async (req, res) => {

        try {

            const ngo =
                await NGO.findById(
                    req.params.id
                );

            if (!ngo) {

                return res.status(404).json({

                    success: false,

                    message:
                        "NGO not found"

                });

            }


            res.status(200).json({

                success: true,

                ngo

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


// ==========================================
// CLAIMS
// ==========================================


// CLAIM DONATION
app.post(
    "/api/claims",
    isLoggedIn,
    authorize("NGO"),
    async (req, res) => {

        try {

            console.log(
                "Claim made by:",
                req.user.email
            );


            const donation =
                await Donation.findById(
                    req.body.donationId
                );


            if (!donation) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Donation not found"

                });

            }


            const ngo =
                await NGO.findOne({

                    userId:
                        req.user._id

                });


            if (!ngo) {

                return res.status(404).json({

                    success: false,

                    message:
                        "NGO profile not found"

                });

            }


            if (
                donation.status !==
                "AVAILABLE"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Donation is not available"

                });

            }


            const claim =
                await Claim.create({

                    claimId:
                        req.body.claimId,

                    donationId:
                        donation._id,

                    ngoId:
                        ngo._id

                });


            donation.status =
                "CLAIMED";


            await donation.save();


            await addRow(
                "Claims",
                [

                    claim.claimId,

                    claim.donationId
                        .toString(),

                    claim.ngoId
                        .toString(),

                    "CLAIMED",

                    new Date()
                        .toISOString()

                ]
            );


            res.status(201).json({

                success: true,

                message:
                    "Donation claimed successfully",

                claim

            });


        } catch (error) {

            console.error(
                "Claim creation error:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


// GET CLAIMS
app.get(
    "/api/claims",
    isLoggedIn,
    authorize("NGO", "ADMIN"),
    async (req, res) => {

        try {

            const claims =
                await Claim
                    .find()
                    .populate(
                        "donationId"
                    )
                    .populate(
                        "ngoId"
                    );


            res.status(200).json({

                success: true,

                count:
                    claims.length,

                claims

            });

        } catch (error) {

            console.error(
                "Get claims error:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


// ==========================================
// ADMIN DASHBOARD
// ==========================================

app.get(
    "/api/admin/dashboard",
    isLoggedIn,
    authorize("ADMIN"),
    async (req, res) => {

        try {

            const [

                totalDonors,

                totalNGOs,

                totalDonations,

                availableDonations,

                claimedDonations,

                pickedUpDonations,

                deliveredDonations,

                expiredDonations

            ] = await Promise.all([

                Donor.countDocuments(),

                NGO.countDocuments(),

                Donation.countDocuments(),

                Donation.countDocuments({
                    status:
                        "AVAILABLE"
                }),

                Donation.countDocuments({
                    status:
                        "CLAIMED"
                }),

                Donation.countDocuments({
                    status:
                        "PICKED_UP"
                }),

                Donation.countDocuments({
                    status:
                        "DELIVERED"
                }),

                Donation.countDocuments({
                    status:
                        "EXPIRED"
                })

            ]);


            res.status(200).json({

                success: true,

                stats: {

                    totalDonors,

                    totalNGOs,

                    totalDonations,

                    availableDonations,

                    claimedDonations,

                    pickedUpDonations,

                    deliveredDonations,

                    expiredDonations

                }

            });


        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


// ==========================================
// GOOGLE SHEETS TEST
// ==========================================

app.get(
    "/api/test-sheets",
    async (req, res) => {

        try {

            await addRow(
                "Donors",
                [
                    "TEST001",
                    "Test Restaurant",
                    "9999999999"
                ]
            );


            res.json({

                success: true,

                message:
                    "Google Sheet write successful"

            });


        } catch (error) {

            console.error(
                "Test Sheets Error:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


// ==========================================
// DA OUTPUT
// ==========================================

app.post(
    "/api/da-output",
    async (req, res) => {

        try {

            const {

                donationId,

                priority,

                recommendedNGO,

                reason

            } = req.body;


            if (
                !donationId ||
                !priority
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "donationId and priority are required"

                });

            }


            const donation =
                await Donation.findOne({

                    donationId:
                        donationId

                });


            if (!donation) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Donation not found"

                });

            }


            donation.priority =
                priority;

            donation.recommendedNGO =
                recommendedNGO;

            donation.reason =
                reason;


            await donation.save();


            res.status(200).json({

                success: true,

                message:
                    "DA output saved successfully",

                donation

            });


        } catch (error) {

            console.error(
                "DA output error:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


module.exports = app;