/**
 * Simulated computer-vision analysis (pre-trained model proxy for demo).
 * In production, swap `analyzeTravelImage` for OpenAI Vision / Hugging Face API.
 */

const SCENE_HINTS = [
  { tags: ["beach", "ocean", "sand", "coast"], destination: "Beach & coastal escapes", mood: "Relaxation" },
  { tags: ["mountain", "snow", "alps", "peak"], destination: "Alpine adventure", mood: "Adventure" },
  { tags: ["city", "skyline", "urban", "street"], destination: "City breaks", mood: "Culture" },
  { tags: ["museum", "historic", "temple", "church"], destination: "Heritage tours", mood: "Culture" },
  { tags: ["food", "restaurant", "dining", "cafe"], destination: "Culinary journeys", mood: "Food & wine" },
  { tags: ["airport", "plane", "terminal", "flight"], destination: "Flight deals", mood: "Transit" },
];

export async function analyzeTravelImage(file) {
  await delay(900 + Math.random() * 400);

  const name = (file.name ?? "").toLowerCase();
  const sizeKb = Math.round((file.size ?? 0) / 1024);
  const tokens = name.replace(/\.[a-z]+$/, "").split(/[-_\s]+/);

  let best = SCENE_HINTS[2];
  let bestScore = 0;

  for (const hint of SCENE_HINTS) {
    const score = hint.tags.filter((t) => name.includes(t) || tokens.includes(t)).length;
    if (score > bestScore) {
      bestScore = score;
      best = hint;
    }
  }

  if (bestScore === 0) {
    if (sizeKb > 800) best = SCENE_HINTS[0];
    else if (name.includes("img") || name.includes("photo")) best = SCENE_HINTS[1];
  }

  const confidence = Math.min(0.97, 0.72 + bestScore * 0.08 + (sizeKb > 100 ? 0.05 : 0));

  return {
    model: "SmartTravel-Vision v2.1 (simulated)",
    labels: [
      { label: best.mood, confidence: confidence },
      { label: best.destination.split(" ")[0], confidence: confidence * 0.92 },
      { label: "Travel", confidence: 0.88 },
    ],
    suggestedQuery: best.destination,
    suggestedFilters: {
      experience: best.mood === "Relaxation" ? "beach" : best.mood === "Adventure" ? "adventure" : "luxury",
    },
    caption: `Detected ${best.mood.toLowerCase()} travel scene — recommend exploring ${best.destination.toLowerCase()}.`,
  };
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
