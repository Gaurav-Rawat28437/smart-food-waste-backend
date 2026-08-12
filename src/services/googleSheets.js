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

const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;


// ========================================
// ADD ROW TO GOOGLE SHEET
// ========================================

const addRow = async (sheetName, rowData) => {
    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,

            range: `${sheetName}!A:Z`,

            valueInputOption: "USER_ENTERED",

            insertDataOption: "INSERT_ROWS",

            requestBody: {
                values: [rowData]
            }
        });

        console.log(`Row added to ${sheetName}`);

    } catch (error) {
        console.error(
            `Google Sheets error:`,
            error.message
        );

        throw error;
    }
};


// ========================================
// READ ROWS FROM GOOGLE SHEET
// ========================================

const getRows = async (sheetName) => {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,

            range: `${sheetName}!A:Z`
        });

        return response.data.values || [];

    } catch (error) {
        console.error(
            `Google Sheets read error:`,
            error.message
        );

        throw error;
    }
};


module.exports = {
    addRow,
    getRows
};