import fs from "fs";
import path from "path";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim().replace(/\r$/, "");
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));

const { testMistralConnectivity } = await import(
  "../src/lib/bhardwajbot/connectivity-test.ts"
);

const result = await testMistralConnectivity();

console.log("\n--- Connectivity Test Summary ---");
console.log("Success:", result.success);
console.log("Model:", result.model);
console.log("Status:", result.status);
console.log("Latency (ms):", result.latencyMs);
console.log("Preview:", result.responsePreview);

if (result.error) {
  console.error("Error:", result.error);
  process.exit(1);
}
