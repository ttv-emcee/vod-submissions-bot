import * as data from "./data";

async function main(): Promise<void> {
  const foo = await data.fetchSubmissions();

  console.log(JSON.stringify(foo, null, 2));
}

main();
