import { Output, OutputVod, SubmissionOutput } from "./types";
import { Entry, CompleteSubmission } from "./submissions";

const convertVod = (vod: CompleteSubmission): OutputVod => ({
  id: vod.id,
  code: vod.vod_code || "",
  sr: vod.sr || "",
  notes: vod.notes,
});

function convertEntry(entry: Entry): SubmissionOutput {
  const [vod, ...backups] = entry.pending;

  return {
    twitch_username: vod.twitch_username,
    discord_username: vod.discord_username,
    vod_queue: entry.completed.length === 0 ? "Newbie" : "Homie",
    vod: convertVod(vod),
    backups: backups.map(convertVod),
  };
}

export function generateOutput(
  entries: Entry[],
  vodCodeExpiration: Date
): Output {
  return {
    vodCodeExpiration,
    vods: entries.map(convertEntry),
  };
}
