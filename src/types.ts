import * as t from "io-ts";
import * as t_ from "io-ts-types/lib";

export const submission = t.type({
  submission_timestamp: t_.DateFromUnixTime,
  twitch_username: t.string,
  discord_username: t.string,
});

export type Submission = t.TypeOf<typeof submission>;
