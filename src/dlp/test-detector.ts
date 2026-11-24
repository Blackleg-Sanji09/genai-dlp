import { containsSensitiveMarker } from "./detector";

const tests = [
  "Hello world",
  "This contains WALLED_SENSITIVE data",
  "My secret is WALLED_SENSITIVE",
];

for (const text of tests) {
  console.log(text, "=>", containsSensitiveMarker(text));
}
