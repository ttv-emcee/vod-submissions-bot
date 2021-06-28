import * as submissions from "./submissions";
import * as data from "./data";
import * as output from "./output";

async function main(): Promise<void> {
  const o = await data
    .fetchSubmissions()
    .then(submissions.processSubmissions)
    .then((entries) => output.generateOutput(entries, new Date()));

  await data.writeOutput(o);

  console.log(JSON.stringify(o, null, 2));
}

main();
