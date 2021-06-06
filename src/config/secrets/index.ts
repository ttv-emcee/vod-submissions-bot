import path from "path";

// To get this included in the binary
import * as _secrets from "./vod-submissions-bot.json";
_secrets;

const keyFile = path.join(__dirname, "vod-submissions-bot.json");

export { keyFile };
