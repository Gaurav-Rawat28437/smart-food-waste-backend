const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
    keyFile: "credentials/service-account.json",

    scopes: [
        "https://www.googleapis.com/auth/spreadsheets"
    ]
});

const sheets = google.sheets({
    version: "v4",
    auth
});

const spreadsheetId =
    process.env.GOOGLE_SPREADSHEET_ID;


// ========================================
// ADD ROW
// ========================================

const addRow = async (sheetName, rowData) => {

    try {

        await sheets.spreadsheets.values.append({

            spreadsheetId,

            range: `${sheetName}!A:Z`,

            valueInputOption: "USER_ENTERED",

            insertDataOption: "INSERT_ROWS",

            requestBody: {
                values: [rowData]
            }

        });

        console.log(
            `Row added to ${sheetName}`
        );

    } catch (error) {

        console.error(
            "Google Sheets add error:",
            error.message
        );

        throw error;
    }
};


// ========================================
// READ ROWS
// ========================================

const getRows = async (sheetName) => {

    try {

        const response =
            await sheets.spreadsheets.values.get({

                spreadsheetId,

                range: `${sheetName}!A:Z`

            });

        return response.data.values || [];

    } catch (error) {

        console.error(
            "Google Sheets read error:",
            error.message
        );

        throw error;
    }
};


// ========================================
// UPDATE DONATION ROW
// ========================================

const updateDonationRow = async (
    donationId,
    rowData
) => {

    try {

        // Read Donations sheet
        const rows =
            await getRows("Donations");

        if (!rows || rows.length <= 1) {

            throw new Error(
                "Donations sheet is empty"
            );
        }

        // Find donation row
        const rowIndex =
            rows.findIndex(
                (row, index) =>
                    index > 0 &&
                    row[0] === donationId
            );

        if (rowIndex === -1) {

            throw new Error(
                `Donation ${donationId} not found in Google Sheet`
            );
        }

        // Google Sheet rows start from 1
        const sheetRow =
            rowIndex + 1;

        await sheets.spreadsheets.values.update({

            spreadsheetId,

            range:
                `Donations!A${sheetRow}:L${sheetRow}`,

            valueInputOption:
                "USER_ENTERED",

            requestBody: {
                values: [rowData]
            }

        });

        console.log(
            `Donation ${donationId} updated in Google Sheet`
        );

    } catch (error) {

        console.error(
            "Google Sheets donation update error:",
            error.message
        );

        throw error;
    }
};


// ========================================
// EXPORT
// ========================================

module.exports = {

    addRow,
    getRows,
    updateDonationRow

};