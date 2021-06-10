import * as types from "./types";
import * as Either from "fp-ts/Either";
import { PathReporter } from "io-ts/PathReporter";

import { sheets_v4 as Sheets } from "@googleapis/sheets";
import * as sheets from "./sheets";

import { config } from "./config";
import * as utils from "./utils";

type CellValue = string | number | boolean | null;

function toCellValue(cell: Sheets.Schema$CellData): CellValue {
  if (cell.effectiveValue === undefined) {
    return null;
  }

  if (cell.effectiveValue.boolValue !== undefined) {
    return cell.effectiveValue.boolValue;
  }

  if (cell.effectiveValue.numberValue !== undefined) {
    return cell.effectiveValue.numberValue;
  }

  if (cell.effectiveValue.stringValue !== undefined) {
    return cell.effectiveValue.stringValue;
  }

  return null;
}

export function parseSubmission(
  row: Sheets.Schema$RowData,
  index: number
): types.Submission | null {
  const keys = [
    "id",
    "submission_timestamp",
    "twitch_username",
    "discord_username",
    "in_game_name",
    "vod_code",
    "sr",
    "role",
    "notes",
    "status_",
  ];

  const cellValues = (row.values || []).map(toCellValue);

  if (!cellValues.some((x) => x !== null)) return null;

  // Add id via row index, for now
  cellValues.unshift(`${index}`);

  const obj: Record<string, unknown> = keys
    .map((key, i) => [key, cellValues[i]] as [string, CellValue])
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

  const decoded = types.submission.decode(obj);

  if (Either.isLeft(decoded)) {
    console.error(
      JSON.stringify({
        type_: "ERROR",
        payload: {
          type_: "DECODING_ERROR",
          source: row,
          index,
          errors: PathReporter.report(decoded),
        },
      })
    );
    return null;
  }

  return decoded.right;
}

export async function fetchSubmissions(): Promise<types.Submission[]> {
  const data = await sheets.getSheet(
    config.spreadsheet.id,
    config.spreadsheet.data_sheet_id
  );

  console.log(
    JSON.stringify({
      type_: "LOG",
      payload: {
        type_: "DATA_FETCH",
        rows_fetched: (data.rowData || []).length,
        rows_with_data: (data.rowData || []).filter((r) =>
          (r.values || []).map(toCellValue).some((v) => v !== null)
        ).length,
      },
    })
  );

  return (data.rowData || [])
    .map(parseSubmission)
    .filter(utils.notNull)
    .map((x: types.Submission) => x)
    .sort(utils.sortBy((s) => s.submission_timestamp.getTime()));
}
