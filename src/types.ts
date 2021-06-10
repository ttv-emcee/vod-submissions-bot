import * as t from "io-ts";
// import * as t_ from "io-ts-types/lib";
import { pipe } from "fp-ts/lib/function";
import * as Either from "fp-ts/lib/Either";

const SECONDS_PER_DAY = 24 /* hours */ * 60 /* minutes */ * 60; /* seconds */
const GOOGLE_START_DATE_MS = Date.UTC(1899, 11, 30);
export const daysFrom1899 = new t.Type<Date, number, unknown>(
  "Days_From_12-30-1899",
  (u): u is Date => u instanceof Date,
  (u, c) =>
    pipe(
      t.number.validate(u, c),
      Either.map((days) => days * SECONDS_PER_DAY),
      Either.chain((n) => {
        const d = new Date(n * 1000 + GOOGLE_START_DATE_MS);
        return isNaN(d.getTime()) ? t.failure(u, c) : t.success(d);
      })
    ),
  (a) => Math.floor(a.getTime() / 1000)
);

export const submission = t.type({
  submission_timestamp: daysFrom1899,
  twitch_username: t.string,
  discord_username: t.string,
  in_game_name: t.string,
  vod_code: t.union([t.string, t.null]),
  sr: t.number,
  role: t.keyof({ Tank: null, DPS: null, Support: null }),
  notes: t.union([t.string, t.null]),
});

export type Submission = t.TypeOf<typeof submission>;
