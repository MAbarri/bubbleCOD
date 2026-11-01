const SHEET_NAME = "Commandes";

function setupOrdersSheet() {
  const properties = PropertiesService.getScriptProperties();
  let spreadsheetId = properties.getProperty("SPREADSHEET_ID");
  let spreadsheet;

  if (spreadsheetId) {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } else {
    spreadsheet = SpreadsheetApp.create("Commandes — Manteau Alma");
    spreadsheetId = spreadsheet.getId();
    properties.setProperty("SPREADSHEET_ID", spreadsheetId);
  }

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Date", "Référence", "Nom complet", "Téléphone", "Ville", "Adresse",
      "Produit", "Couleur", "Taille", "Quantité", "Prix unitaire (DH)",
      "Total produits (DH)", "Statut"
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 13).setFontWeight("bold");
  }

  let secret = properties.getProperty("ORDER_SHARED_SECRET");
  if (!secret) {
    secret = Utilities.getUuid() + Utilities.getUuid() + Utilities.getUuid();
    properties.setProperty("ORDER_SHARED_SECRET", secret);
  }

  console.log("Spreadsheet: " + spreadsheet.getUrl());
  console.log("ORDER_SHARED_SECRET: " + secret);
  return "Feuille prête. Récupère le lien et ORDER_SHARED_SECRET dans le journal d’exécution.";
}

function doPost(e) {
  try {
    const properties = PropertiesService.getScriptProperties();
    const expectedSecret = properties.getProperty("ORDER_SHARED_SECRET");
    const order = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    if (!expectedSecret || order.secret !== expectedSecret) {
      return jsonResponse({ ok: false, error: "Unauthorized" });
    }

    const required = ["customerName", "customerPhone", "customerCity", "customerAddress", "product", "color", "size"];
    if (required.some((key) => !String(order[key] || "").trim())) {
      return jsonResponse({ ok: false, error: "Missing required fields" });
    }

    const quantity = Number(order.quantity);
    const unitPrice = Number(order.unitPrice);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10 ||
        unitPrice !== 599 || !["S", "M", "L"].includes(order.size) ||
        order.color !== "Brun chocolat") {
      return jsonResponse({ ok: false, error: "Invalid order" });
    }

    const spreadsheet = SpreadsheetApp.openById(properties.getProperty("SPREADSHEET_ID"));
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error("Orders sheet is missing. Run setupOrdersSheet first.");

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    const orderId = "ALMA-" +
      Utilities.formatDate(new Date(), "Africa/Casablanca", "yyyyMMdd-HHmmss") +
      "-" + Utilities.getUuid().slice(0, 6).toUpperCase();

    sheet.appendRow([
      new Date(),
      orderId,
      safeCell(order.customerName),
      safeCell(order.customerPhone),
      safeCell(order.customerCity),
      safeCell(order.customerAddress),
      "Manteau Alma — Brun Chocolat",
      "Brun chocolat",
      order.size,
      quantity,
      599,
      599 * quantity,
      "À confirmer"
    ]);
    lock.releaseLock();
    return jsonResponse({ ok: true, orderId });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error && error.message || error) });
  }
}

function safeCell(value) {
  const text = String(value || "").trim();
  return /^[=+@\-]/.test(text) ? "'" + text : text;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
