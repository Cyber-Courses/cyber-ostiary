import { eq } from "drizzle-orm";

import { db } from "@ostiary/core/db/index";
import { oauthClient } from "@ostiary/core/db/schema";
import { cyberProductFor, type CyberProduct } from "@ostiary/core/lib/brand";
import { registrationSource } from "@ostiary/core/lib/client-registration-policy";

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname || null;
  } catch {
    return null;
  }
}

/**
 * The Cyber product behind an authorize request, for the auth screens' product tint
 * ("Continue to Cyber Library"). Visual only: it never changes the OAuth flow.
 *
 * Only a client that exists and was registered by an admin can claim a product: a
 * self-registered client (dynamic registration, metadata document) could otherwise dress
 * its sign-in page as a Cyber product. Matched by client id, then by the hosts of the
 * client's registered redirect URIs (never by the request's own redirect_uri).
 */
export async function clientProduct(clientId: string | string[] | undefined): Promise<CyberProduct | null> {
  const id = Array.isArray(clientId) ? clientId[0] : clientId;
  if (!id || id.length > 512) return null;
  try {
    const [row] = await db
      .select({
        redirectUris: oauthClient.redirectUris,
        uri: oauthClient.uri,
        clientDiscoveryId: oauthClient.clientDiscoveryId,
        metadata: oauthClient.metadata,
        adminRegistered: oauthClient.adminRegistered,
        disabled: oauthClient.disabled,
      })
      .from(oauthClient)
      .where(eq(oauthClient.clientId, id))
      .limit(1);
    if (!row || row.disabled || registrationSource(row) !== "admin") return null;
    const hosts = [...(row.redirectUris ?? []), ...(row.uri ? [row.uri] : [])]
      .map(hostOf)
      .filter((h): h is string => Boolean(h));
    return cyberProductFor(id, hosts);
  } catch {
    // No tint when the lookup fails: the neutral family screen is always correct.
    return null;
  }
}
