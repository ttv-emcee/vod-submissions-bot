import * as google from "@googleapis/sheets";
import * as types from "./types";
import { sheets_v4 as Sheets } from "@googleapis/sheets";
import { config, secrets } from "./config";

async function getSheets(): Promise<Sheets.Sheets> {
  const auth = new google.auth.GoogleAuth({
    keyFile: secrets.keyFile,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({
    version: "v4",
    auth: await auth.getClient(),
  });

  return sheets;
}

types;
// async function fetchSubmissions(): Promise<types.Submission[]> {
async function fetchSubmissions(): Promise<unknown> {
  const sheets = await getSheets();

  const res = await sheets.spreadsheets.get({
    spreadsheetId: config.spreadsheet.id,
    includeGridData: true,
  });

  const data = res.data.sheets?.find(
    (sheet) => sheet.properties?.sheetId == config.spreadsheet.data_sheet_id
  )?.data;

  if (!data || data.length != 1) {
    const errorMsg = `Data spreadsheet (id: ${config.spreadsheet.data_sheet_id}) not found on spreadsheet ${config.spreadsheet.id}`;
    throw new Error(errorMsg);
  }

  return data;
}

async function main(): Promise<void> {
  const foo = await fetchSubmissions();

  console.log(JSON.stringify(foo, null, 2));
}

main();
