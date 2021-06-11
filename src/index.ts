import { generateEntries } from "./submissions";
import * as data from "./data";

async function main(): Promise<void> {
  const submissions = await data.fetchSubmissions();
  const { users, entries } = submissions.reduce(
    generateEntries,
    generateEntries.baseAccumulator
  );

  const output = users
    .flatMap((user) => (entries[user] ? [entries[user]] : []))
    .slice(0, 5);
  console.log(JSON.stringify(output, null, 2));
}

main();
