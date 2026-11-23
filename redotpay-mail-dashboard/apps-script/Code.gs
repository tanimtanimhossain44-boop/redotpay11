function doPost(e) {
  try {
    const data = JSON.parse(e.postData?.contents || "{}");
    const secret = PropertiesService.getScriptProperties().getProperty("API_SECRET");

    if (!secret || data.secret !== secret) {
      return output({ error: "Unauthorized" });
    }

    const result = Gmail.Users.Messages.list("me", {
      q: "from:(redotpay.com) OR to:(redotpay.com)",
      maxResults: 50
    });

    const emails = (result.messages || []).map(item => {
      const mail = Gmail.Users.Messages.get("me", item.id, { format: "full" });
      const headers = mail.payload.headers || [];
      const getHeader = name =>
        headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || "";

      function decode(value) {
        if (!value) return "";
        return Utilities.newBlob(
          Utilities.base64DecodeWebSafe(value)
        ).getDataAsString("UTF-8");
      }

      let html = "";
      let plain = "";

      function readParts(part) {
        if (!part) return;
        if (part.mimeType === "text/html" && part.body?.data) html = decode(part.body.data);
        if (part.mimeType === "text/plain" && part.body?.data) plain = decode(part.body.data);
        (part.parts || []).forEach(readParts);
      }

      readParts(mail.payload);
      if (!html && !plain && mail.payload.body?.data) plain = decode(mail.payload.body.data);

      const subject = getHeader("Subject") || "(No subject)";
      const rawText = `${subject}\n${mail.snippet || ""}\n${plain}\n${html}`;
      const sensitive = /verification code|one.time password|\bOTP\b|login code|security code|authentication code|passcode/i.test(rawText);

      return {
        id: mail.id,
        subject,
        from: getHeader("From"),
        date: getHeader("Date"),
        snippet: sensitive ? "Authentication-related message — body hidden" : (mail.snippet || ""),
        html: sensitive ? "" : html,
        text: sensitive ? "" : plain,
        sensitive
      };
    });

    return output({ emails });
  } catch (error) {
    return output({ error: error.message });
  }
}

function output(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}