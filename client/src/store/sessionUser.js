/** Maps auth session to booking traveler profile fields */
export function sessionToAuthUser(session) {
  if (!session?.email) {
    return {
      id: "user_demo",
      name: "Travel Guest",
      email: "guest@smarttravel.app",
    };
  }

  const id = session.userId != null ? `user_${session.userId}` : session.email.replace(/[^a-z0-9]/gi, "_").slice(0, 48);
  return {
    id,
    name: session.name?.trim() || session.email.split("@")[0],
    email: session.email,
  };
}
