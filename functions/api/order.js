const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

export async function onRequestPost({ request, env }) {
  if (!env.GOOGLE_SCRIPT_URL || !env.ORDER_SHARED_SECRET) {
    return json({ ok: false, error: "La réception des commandes n’est pas encore configurée." }, 503);
  }

  let order;
  try {
    order = await request.json();
  } catch {
    return json({ ok: false, error: "Les informations envoyées sont invalides." }, 400);
  }

  const name = String(order.customerName || "").trim();
  const phone = String(order.customerPhone || "").replace(/[\s().-]/g, "");
  const city = String(order.customerCity || "").trim();
  const address = String(order.customerAddress || "").trim();
  const color = String(order.color || "").trim();
  const size = String(order.size || "").trim();
  const quantity = Number(order.quantity);

  if (!name || name.length > 120 || !city || city.length > 100 ||
      !address || address.length > 300 ||
      !/^(?:\+212|0)[567]\d{8}$/.test(phone) ||
      color !== "Brun chocolat" ||
      !["S", "M", "L"].includes(size) ||
      !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return json({ ok: false, error: "Vérifie ton nom, ton téléphone, ton adresse et les options choisies." }, 400);
  }

  try {
    const response = await fetch(env.GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.ORDER_SHARED_SECRET,
        customerName: name,
        customerPhone: phone,
        customerCity: city,
        customerAddress: address,
        product: "Manteau Alma — Brun Chocolat",
        color,
        size,
        quantity,
        unitPrice: 599,
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      return json({ ok: false, error: "La commande n’a pas pu être enregistrée. Réessaie ou contacte-nous." }, 502);
    }
    return json({ ok: true, orderId: result.orderId });
  } catch {
    return json({ ok: false, error: "Le service de commande est temporairement indisponible." }, 502);
  }
}
