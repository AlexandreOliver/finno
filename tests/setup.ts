import { config } from "dotenv";
import { resolve } from "node:path";
// import { endOfMonth, parse, startOfMonth } from "date-fns";

export default function setup() {
  config({
    path: resolve(__dirname, "../.env"),
    quiet: true,
  });
}

// const data = parse("2026-07-12", "yyyy-MM-dd", new Date());
// console.log(new Date("2026-07"));
// console.log(data);

// console.log(startOfMonth(data));
// console.log(endOfMonth(data));
