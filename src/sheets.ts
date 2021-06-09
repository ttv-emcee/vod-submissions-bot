import * as google from "@googleapis/sheets";
import { sheets_v4 as Sheets } from "@googleapis/sheets";
import { secrets } from "./config";

let sheets: Sheets.Sheets | undefined = undefined;

async function getSheets(): Promise<Sheets.Sheets> {
  if (sheets) return sheets;

  const auth = new google.auth.GoogleAuth({
    keyFile: secrets.keyFile,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  sheets = google.sheets({
    version: "v4",
    auth: await auth.getClient(),
  });

  return sheets;
}

export async function getSheet(
  spreadsheetId: string,
  sheetId: number
): Promise<Sheets.Schema$GridData> {
  sheets = await getSheets();

  const res = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId,
    includeGridData: true,
  });

  const data = res.data.sheets?.find(
    (sheet) => sheet.properties?.sheetId == sheetId
  )?.data;

  if (!data || !data[0]) {
    const errorMsg =
      `Data spreadsheet (id: ${sheetId})` +
      ` not found on spreadsheet ${spreadsheetId}`;
    throw new Error(errorMsg);
  }

  return data[0];
}
