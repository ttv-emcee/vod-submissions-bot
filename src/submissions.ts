import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { Submission } from "./types";
import * as utils from "./utils";

export type CompleteSubmission = Submission & { vod_code: string };
export type Entry = {
  twitch_username: string;
  discord_username: string;
  pending: NonEmptyArray<CompleteSubmission>;
  completed: Submission[];
};
type PendingEntry = Omit<Entry, "pending"> & {
  pending: CompleteSubmission[];
};
function hasPendingSubmissions(entry: PendingEntry): entry is Entry {
  return entry.pending.length >= 0;
}

function updateEntry(
  entry: PendingEntry,
  submission: Submission
): PendingEntry {
  const { twitch_username, status_ } = submission;
  console.assert(
    entry.twitch_username === twitch_username,
    "Tried to update an entry with a submission for a different twitch user!\n" +
      `twitch_username: ${twitch_username}, entry_username: ${entry.twitch_username}`
  );

  switch (status_) {
    case "completed":
      return {
        ...entry,
        completed: [...entry.completed, submission],
      };
    case "pending":
      const { vod_code } = submission;
      if (vod_code === null) {
        return entry;
      }

      return {
        ...entry,
        pending: [...entry.pending, { ...submission, vod_code }],
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

export function processSubmissions(submissions: Submission[]): Entry[] {
  const accumulator = submissions.reduce(
    generateEntries,
    generateEntries.baseAccumulator
  );

  return generateEntries
    .handleAccumulator(accumulator)
    .filter(hasPendingSubmissions)
    .slice(0, 3);
}
