import * as google from "@googleapis/sheets";
import { sheets_v4 as Sheets } from "@googleapis/sheets";
import { secrets } from "./config";

let sheets: Sheets.Sheets | undefined = undefined;

export type Spreadsheet = {
  id: string;
  sheet: number;
};

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
  spreadsheet: Spreadsheet
): Promise<Sheets.Schema$GridData> {
  sheets = await getSheets();

  const res = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheet.id,
    includeGridData: true,
  });

  const data = res.data.sheets?.find(
    (sheet) => sheet.properties?.sheetId == spreadsheet.sheet
  )?.data;

  if (!data || !data[0]) {
    const errorMsg =
      `Spreadsheet (id: ${spreadsheet.sheet})` +
      ` not found on spreadsheet ${spreadsheet.id}`;
    throw new Error(errorMsg);
  }

  return data[0];
}

export async function writeData(
  spreadsheet: Spreadsheet,
  payload: Sheets.Schema$BatchUpdateValuesRequest
): Promise<void> {
  sheets = await getSheets();

  const response = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: spreadsheet.id,
    requestBody: payload,
  });

  console.log(
    JSON.stringify(
      {
        type_: "LOG",
        payload: {
          type_: "DATA_WRITE",
          data: response.data,
        },
      },
      null,
      2
    )
  );
}
