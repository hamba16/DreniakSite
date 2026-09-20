import { sendButtondownSubscriber } from "./buttondown";

// Sequential and bounded by the caller's page size. Collision behavior "add"
// preserves Buttondown suppression; this never PATCHes a subscriber to active.
export async function reconcileSubscribers(emails: string[]) {
  let failed = 0;
  for (const email of emails) {
    if (!(await sendButtondownSubscriber(email)).ok) failed++;
  }
  return { checked: emails.length, failed };
}
