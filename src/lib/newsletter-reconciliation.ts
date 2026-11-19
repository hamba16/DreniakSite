import { sendButtondownSubscriber } from "./buttondown";

// Sequential and bounded by the caller's page size. Collision behavior "add"
// preserves Buttondown suppression; this never PATCHes a subscriber to active.
export async function reconcileSubscribers(
  subscribers: { email: string; source: string }[],
) {
  let failed = 0;
  let metadataUnavailable = 0;
  for (const subscriber of subscribers) {
    const result = await sendButtondownSubscriber(subscriber.email, {
        source: subscriber.source,
      });
    if (!result.ok) failed++;
    else if (result.metadataApplied === false) metadataUnavailable++;
  }
  return { checked: subscribers.length, failed, metadataUnavailable };
}
