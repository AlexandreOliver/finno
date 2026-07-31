import { config } from "dotenv";
import { resolve } from "node:path";

export default function setup() {
  config({
    path: resolve(__dirname, "../.env"),
    quiet: true,
  });
}
