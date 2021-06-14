import * as submissions from "./submissions";
import * as data from "./data";

async function main(): Promise<void> {
  const entries = await data
    .fetchSubmissions()
    .then(submissions.processSubmissions);

  const output = entries.slice(0, 5);

  console.log(JSON.stringify(output, null, 2));
}

main();
