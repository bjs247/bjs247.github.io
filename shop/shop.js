(async function () {
  const grid = document.getElementById("productGrid");
  const msg = document.getElementById("shopMsg");
  const title = document.getElementById("shopTitle");
  const subtitle = document.getElementById("shopSubtitle");

  if (!grid) return;

  // auth.js should set window.sb = supabase client
  const sb = window.sb;
  if (!sb) {
    msg.textContent = "Supabase not loaded. Check script order (supabase-js → auth.js → shop.js).";
    return;
  }

  const params = new URLSearchParams(location.search);
  const category = (params.get("category") || "").toLowerCase();

  const pretty = (c) => (c ? c[0].toUpperCase() + c.slice(1) : "Shop");

  title.textContent = category ? pretty(category) : "Shop";
  subtitle.textContent = category ? `Showing ${pretty(category)}.` : "Choose a category from Shop.";

  msg.textContent = "Loading…";

  let query = sb
    .from("products")
    .select("id,name,category,price_cents,image_url")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (["bowls", "cups", "vases"].includes(category)) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    msg.textContent = error.message || "Failed to load products.";
    return;
  }

  if (!data || data.length === 0) {
    msg.textContent = "No items yet.";
    return;
  }

  msg.textContent = "";

  grid.innerHTML = data.map((p) => {
    const price = (p.price_cents / 100).toFixed(2);
    return `
      <article class="product-card">
        <img src="${p.image_url}" alt="${escapeHtml(p.name)}" loading="lazy" />
        <div class="product-card__info">
          <h3 class="product-card__name">${escapeHtml(p.name)}</h3>
          <div class="product-card__price">$${price}</div>
        </div>
      </article>
    `;
  }).join("");

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }
})();
