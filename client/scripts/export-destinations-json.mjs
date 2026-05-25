import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { destinations } from "../src/data/destinations.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const out = join(root, "server", "Services", "ItineraryService", "Data", "destination-catalog.json");
writeFileSync(out, JSON.stringify(destinations, null, 2));
console.log(`Wrote ${destinations.length} destinations to ${out}`);
