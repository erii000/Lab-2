/**
 * Build a display name from profile fields without duplicating a single given name.
 */
export function formatDisplayName(firstName, lastName, email) {
  const first = String(firstName ?? "").trim();
  const last = String(lastName ?? "").trim();
  if (!first && !last) {
    const fromEmail = email?.split("@")[0]?.trim();
    return fromEmail || "User";
  }
  if (!last || last === "." || first.localeCompare(last, undefined, { sensitivity: "accent" }) === 0) {
    return first;
  }
  return `${first} ${last}`;
}
