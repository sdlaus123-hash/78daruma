const SPREADSHEET_ID = "1swxFCol1DJSc5a_gBboMRI-iBBAGd8IoeXxML8cTPQM";
const SHEET_NAME = "waitlist";
const BRAND_NAME = "78達磨";
const LAUNCH_URL = "https://YOUR-VERCEL-DOMAIN.vercel.app/collection.html";

function doGet() {
  return json_({ ok: true, service: "78daruma-waitlist" });
}

function authorizeOnce() {
  getSheet_();
  MailApp.getRemainingDailyQuota();
  return "authorized";
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const data = parsePayload_(e);
    const email = String(data.email || "").trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json_({ ok: false, error: "invalid_email" });
    }

    const sheet = getSheet_();
    const now = new Date();
    const source = String(data.source || "").trim();
    const item = String(data.item || "launch").trim();
    const rows = sheet.getDataRange().getValues();
    const existingRow = findEmailRow_(rows, email);

    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, 5).setValues([[now, email, item, source, "updated"]]);
      return json_({ ok: true, status: "updated" });
    }

    const confirmationSentAt = sendConfirmation_(email, now);
    sheet.appendRow([now, email, item, source, "new", confirmationSentAt, ""]);
    return json_({ ok: true, status: "created" });
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["createdAt", "email", "item", "source", "status", "confirmationSentAt", "launchSentAt"]);
  }

  return sheet;
}

function sendConfirmation_(email, now) {
  try {
    MailApp.sendEmail({
      to: email,
      name: BRAND_NAME,
      subject: "78達磨｜Waitlistへのご登録ありがとうございます",
      body: [
        "78達磨のWaitlistにご登録いただきありがとうございます。",
        "",
        "78達磨は、願いを空間に宿すための現代の達磨オブジェです。",
        "販売開始の準備が整い次第、このメールアドレスへ優先してお知らせします。",
        "",
        "静かに、その時をお待ちください。",
        "",
        "78達磨",
        "NANAHACHI DARUMA"
      ].join("\n"),
      htmlBody: [
        '<div style="margin:0;padding:32px;background:#f7f1e8;color:#111;font-family:serif;line-height:1.9;">',
        '<p style="margin:0 0 24px;font-size:12px;letter-spacing:.18em;font-family:sans-serif;">78 DARUMA / WAITLIST</p>',
        '<p style="margin:0 0 20px;">78達磨のWaitlistにご登録いただきありがとうございます。</p>',
        '<p style="margin:0 0 20px;">78達磨は、願いを空間に宿すための現代の達磨オブジェです。<br>販売開始の準備が整い次第、このメールアドレスへ優先してお知らせします。</p>',
        '<p style="margin:0 0 28px;">静かに、その時をお待ちください。</p>',
        '<p style="margin:0;font-size:12px;letter-spacing:.12em;font-family:sans-serif;">78達磨<br>NANAHACHI DARUMA</p>',
        '</div>'
      ].join("")
    });
    return now;
  } catch (error) {
    return "mail_failed: " + String(error);
  }
}

function sendLaunchNotice() {
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();
  const now = new Date();

  for (let i = 1; i < rows.length; i += 1) {
    const email = String(rows[i][1] || "").trim().toLowerCase();
    const launchSentAt = rows[i][6];

    if (!email || launchSentAt) {
      continue;
    }

    MailApp.sendEmail({
      to: email,
      name: BRAND_NAME,
      subject: "78達磨｜販売開始のお知らせ",
      body: [
        "78達磨 Collection 01 の販売を開始しました。",
        "",
        "Waitlistにご登録いただいた方へ、先行してお知らせしています。",
        "願いを、空間に宿す一体を。",
        "",
        "朱、墨、胡粉。",
        "三つの静かな意志を公開しています。",
        "",
        "作品を見る",
        LAUNCH_URL,
        "",
        "78達磨",
        "NANAHACHI DARUMA"
      ].join("\n"),
      htmlBody: [
        '<div style="margin:0;padding:32px;background:#f7f1e8;color:#111;font-family:serif;line-height:1.9;">',
        '<p style="margin:0 0 24px;font-size:12px;letter-spacing:.18em;font-family:sans-serif;">78 DARUMA / COLLECTION 01</p>',
        '<p style="margin:0 0 20px;">78達磨 Collection 01 の販売を開始しました。</p>',
        '<p style="margin:0 0 20px;">Waitlistにご登録いただいた方へ、先行してお知らせしています。<br>願いを、空間に宿す一体を。</p>',
        '<p style="margin:0 0 28px;">朱、墨、胡粉。<br>三つの静かな意志を公開しています。</p>',
        '<p style="margin:0 0 32px;"><a href="', LAUNCH_URL, '" style="color:#111;text-decoration:underline;text-underline-offset:4px;">作品を見る</a></p>',
        '<p style="margin:0;font-size:12px;letter-spacing:.12em;font-family:sans-serif;">78達磨<br>NANAHACHI DARUMA</p>',
        '</div>'
      ].join("")
    });

    sheet.getRange(i + 1, 7).setValue(now);
  }
}

function findEmailRow_(rows, email) {
  for (let i = 1; i < rows.length; i += 1) {
    if (String(rows[i][1] || "").trim().toLowerCase() === email) {
      return i + 1;
    }
  }

  return -1;
}

function parsePayload_(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (error) {
      return e.parameter || {};
    }
  }

  return e && e.parameter ? e.parameter : {};
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
