import * as data from "./data";
import { Submission } from "./types";

type Entry = {
  twitch_username: string;
  discord_username: string;
  pending: Submission[];
  completed: Submission[];
};
type Lookup = { [twitch_username: string]: Entry };

type Accumulator = { users: string[]; entries: Lookup };

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

function generateEntries(
  acc: Accumulator,
  submission: Submission
): Accumulator {
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

async function main(): Promise<void> {
  const submissions = await data.fetchSubmissions();
  const { users, entries } = submissions.reduce(generateEntries, {
    users: [],
    entries: {},
  });

  const output = users
    .flatMap((user) => (entries[user] ? [entries[user]] : []))
    .slice(0, 5);
  console.log(JSON.stringify(output, null, 2));
}

main();
