import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { Submission, Output, OutputVod } from "./types";
import * as utils from "./utils";

export type Entry = {
  twitch_username: string;
  discord_username: string;
  pending: NonEmptyArray<Submission>;
  completed: Submission[];
};
type PendingEntry = Omit<Entry, "pending"> & {
  pending: Submission[];
};

function updateEntry(
  entry: PendingEntry,
  submission: Submission
): PendingEntry {
  const { twitch_username, status_ } = submission;
  console.assert(
    entry.twitch_username === twitch_username,
    `Tried to update an entry with a submission for a different twitch user! (twitch_username: ${twitch_username}, entry_username: ${entry.twitch_username}`
  );

  switch (status_) {
    case "completed":
      return {
        ...entry,
        completed: [...entry.completed, submission],
      };
    case "pending":
      return {
        ...entry,
        pending: [...entry.pending, submission],
      };
    case "expired":
      return entry;
  }
}

function newEntry(submission: Submission): PendingEntry {
  const { twitch_username, discord_username } = submission;
  const emptyEntry: PendingEntry = {
    twitch_username,
    discord_username,
    pending: [],
    completed: [],
  };

  return updateEntry(emptyEntry, submission);
}

function generateEntries(
  acc: generateEntries.Accumulator,
  submission: Submission
): generateEntries.Accumulator {
  const { users, entries } = acc;
  const { twitch_username } = submission;

  const entry = entries[twitch_username];
  if (entry === undefined) {
    return {
      users: [...users, twitch_username],
      entries: { ...entries, [twitch_username]: newEntry(submission) },
    };
  }

  return {
    users,
    entries: { ...entries, [twitch_username]: updateEntry(entry, submission) },
  };
}

namespace generateEntries {
  export type Lookup = { [twitch_username: string]: PendingEntry };
  export type Accumulator = { users: string[]; entries: Lookup };

  export const baseAccumulator = { users: [], entries: {} };

  export const handleAccumulator = ({ users, entries }: Accumulator) =>
    users.map((user) => entries[user]).filter(utils.notNull);
}

export function processSubmissions(submissions: Submission[]): PendingEntry[] {
  const accumulator = submissions.reduce(
    generateEntries,
    generateEntries.baseAccumulator
  );

  return generateEntries.handleAccumulator(accumulator);
}

export function generateOutput(
  entries: Entry[],
  vodCodeExpiration: Date
): Output {
  const convertVod = ({ id, vod_code, sr, notes }: Submission): OutputVod => ({
    id,
    code: vod_code || "",
    sr,
    notes,
  });

  return {
    vodCodeExpiration,
    vods: entries.map((entry) => {
      const [vod, ...backups] = entry.pending;

      return {
        twitch_username: vod.twitch_username,
        discord_username: vod.discord_username,
        vod_queue: entry.completed.length === 0 ? "Newbie" : "Homie",
        vod: convertVod(vod),
        backups: backups.map(convertVod),
      };
    }),
  };
}
