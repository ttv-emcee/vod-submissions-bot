import { Submission } from "./types";

export type Entry = {
  twitch_username: string;
  discord_username: string;
  pending: Submission[];
  completed: Submission[];
};

function updateEntry(entry: Entry, submission: Submission): Entry {
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

function newEntry(submission: Submission): Entry {
  const { twitch_username, discord_username } = submission;
  const emptyEntry: Entry = {
    twitch_username,
    discord_username,
    pending: [],
    completed: [],
  };

  return updateEntry(emptyEntry, submission);
}

export function generateEntries(
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

export namespace generateEntries {
  export type Lookup = { [twitch_username: string]: Entry };
  export type Accumulator = { users: string[]; entries: Lookup };

  export const baseAccumulator = { users: [], entries: {} };
}
