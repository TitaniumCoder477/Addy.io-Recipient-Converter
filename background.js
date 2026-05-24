function parseMailboxAddress(value) {
  value = (value || "").trim();
  const angle = value.match(/<([^>]+)>/);
  if (angle) return angle[1].trim();
  return value.replace(/^"|"$/g, "").trim();
}

/**
 * Checks if an email address is already in Addy.io / alias forwarding format
 * e.g. base+recipientLocal=recipientDomain@baseDomain
 */
function isAlreadyAddyFormat(email) {
  const addr = parseMailboxAddress(email);
  if (!addr) return false;

  const localPart = addr.split('@')[0];
  if (!localPart) return false;

  // Look for pattern: something + something = something
  return /\+[^=]+=[^=]/.test(localPart);
}

function convertRecipient(baseEmail, recipient) {
  console.debug("[Addy.io Converter] Converting:", recipient, "with base:", baseEmail);

  const addr = parseMailboxAddress(recipient);
  if (!addr || !addr.includes("@")) {
    console.debug("[Addy.io Converter] Skipping (invalid format):", recipient);
    return recipient;
  }

  // NEW: Skip if already in Addy.io format
  if (isAlreadyAddyFormat(recipient)) {
    console.debug("[Addy.io Converter] Already in Addy.io format - skipping:", recipient);
    return recipient;
  }

  const at = baseEmail.indexOf("@");
  if (at < 0) {
    console.warn("[Addy.io Converter] Invalid baseEmail:", baseEmail);
    return recipient;
  }

  const baseLocal = baseEmail.slice(0, at);
  const baseDomain = baseEmail.slice(at + 1);
  const [recipientLocal, recipientDomain] = addr.split("@", 2);

  const newAddr = `${baseLocal}+${recipientLocal}=${recipientDomain}@${baseDomain}`;
  console.debug("[Addy.io Converter] Converted:", recipient, "→", newAddr);
  return newAddr;
}

/**
 * Robust rewrite that handles string | string[] | undefined | null
 */
function rewriteList(baseEmail, list) {
  if (!baseEmail || !list) {
    console.debug("[Addy.io Converter] rewriteList: nothing to process");
    return list;
  }

  if (typeof list === "string") {
    console.debug("[Addy.io Converter] rewriteList: single string recipient");
    return convertRecipient(baseEmail, list);
  }

  if (Array.isArray(list)) {
    console.debug("[Addy.io Converter] rewriteList: processing array of", list.length, "recipients");
    return list.map(r => convertRecipient(baseEmail, r));
  }

  console.debug("[Addy.io Converter] rewriteList: unsupported type", typeof list);
  return list;
}

async function getReplyToForTab(tabId) {
  try {
    console.debug("[Addy.io Converter] getReplyToForTab tab:", tabId);
    const details = await browser.compose.getComposeDetails(tabId);
    if (!details.identityId) {
      console.debug("[Addy.io Converter] No identityId");
      return null;
    }

    const identities = await browser.identities.list();
    const identity = identities.find(i => i.id === details.identityId);
    if (!identity) {
      console.warn("[Addy.io Converter] Identity not found");
      return null;
    }

    const replyTo = identity.replyTo ? identity.replyTo.trim() : "";
    console.debug("[Addy.io Converter] replyTo found:", replyTo || "(empty)");
    return replyTo || null;
  } catch (error) {
    console.error("[Addy.io Converter] Error in getReplyToForTab:", error);
    return null;
  }
}

browser.compose.onBeforeSend.addListener(async (tab, composeDetails) => {
  console.log("[Addy.io Converter] onBeforeSend fired - tab:", tab.id);

  const replyTo = await getReplyToForTab(tab.id);
  if (!replyTo) {
    console.log("[Addy.io Converter] No replyTo → skipping transformation");
    return { cancel: false };
  }

  console.log("[Addy.io Converter] Transforming recipients using replyTo:", replyTo);

  const updatedDetails = {
    to:  rewriteList(replyTo, composeDetails.to),
    cc:  rewriteList(replyTo, composeDetails.cc),
    bcc: rewriteList(replyTo, composeDetails.bcc)
  };

  console.log("[Addy.io Converter] Updated details prepared - send will continue with transformed recipients");
  return { details: updatedDetails };
});
