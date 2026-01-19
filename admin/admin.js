(async function () {
  const sb = window.sb;
  const msg = document.getElementById("adminMsg");
  const panel = document.getElementById("adminPanel");
  const list = document.getElementById("adminList");
  const form = document.getElementById("addProductForm");

  const BUCKET = "product-images";

  function show(text) {
    if (msg) msg.textContent = text || "";
  }

  function fail(where, err) {
    console.error(where, err);
    const detail = err?.message ? `: ${err.message}` : "";
    show(`${where}${detail}`);
  }

  async function waitForSession(timeoutMs = 8000) {
    // Wait for INITIAL_SESSION / SIGNED_IN / TOKEN_REFRESHED
    const fromEvent = new Promise((resolve) => {
        const { data } = sb.auth.onAuthStateChange((event, session) => {
        if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            data.subscription.unsubscribe();
            resolve(session || null);
        }
        });
    });

    // Also try getSession, but don't let it hang the page
    const fromGetSession = sb.auth
        .getSession()
        .then(({ data }) => data?.session || null)
        .catch(() => null);

    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timed out waiting for Supabase session")), timeoutMs)
    );

    return Promise.race([fromEvent, fromGetSession, timeout]);
    }

  try {
    if (!sb) {
      show("Supabase client not found. Ensure auth.js sets window.sb = sb.");
      return;
    }

    show("Checking access… (session)");

    let session;
    try {
    session = await waitForSession(8000);
    } catch (err) {
    fail("Session check failed", err);
    show(
        "Session check timed out. Try a hard refresh (Cmd+Shift+R). If still stuck, clear site data for studiolabut.com and log in again."
    );
    return;
    }

    if (!session?.user) {
    show("Please log in first (use the avatar button).");
    return;
    }

    if (!session?.user) {
      show("Please log in first (use the avatar button).");
      return;
    }

    show("Checking access… (admin)");

    // Use maybeSingle() so missing profile row doesn't throw a "no rows" error
    const { data: profile, error: profErr } = await sb
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .maybeSingle();

    if (profErr) return fail("Profile lookup failed", profErr);

    if (!profile?.is_admin) {
      show("You are logged in, but this account is not marked as admin in Supabase.");
      return;
    }

    // If we get here, you're admin
    show("");
    panel.hidden = false;

    async function loadProducts() {
      show("Loading products…");

      const { data, error } = await sb
        .from("products")
        .select("id,name,category,price_cents,image_url,image_path,created_at,active")
        .order("created_at", { ascending: false });

      if (error) return fail("Failed to load products", error);

      show("");

      list.innerHTML = (data || []).map((p) => {
        const price = (p.price_cents / 100).toFixed(2);
        return `
          <article class="product-card">
            <img src="${p.image_url}" alt="${escapeHtml(p.name)}" loading="lazy" />
            <div class="product-card__info" style="align-items:center;">
              <div>
                <div class="product-card__name">${escapeHtml(p.name)}</div>
                <div class="muted small">${escapeHtml(p.category)} • $${price}</div>
              </div>
              <button class="pill pill--ghost"
                      data-del="${p.id}"
                      data-path="${p.image_path || ""}"
                      type="button">Delete</button>
            </div>
          </article>
        `;
      }).join("");
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const category = form.category.value;
      const price = parseFloat(form.price.value);

      const file = form.image_file?.files?.[0];

      if (!name) return show("Enter a product name.");
      if (!["bowls", "cups", "vases"].includes(category)) return show("Invalid category.");
      if (!Number.isFinite(price)) return show("Enter a valid price (e.g., 48.00).");
      if (!file) return show("Choose an image file.");

      const price_cents = Math.round(price * 100);

      // Safe filename
      const extRaw = (file.name.split(".").pop() || "jpg").toLowerCase();
      const ext = extRaw.replace(/[^a-z0-9]/g, "") || "jpg";
      const id = (crypto?.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const filePath = `${category}/${id}.${ext}`;

      show("Uploading image…");

      const { error: uploadError } = await sb.storage
        .from(BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) return fail("Upload failed", uploadError);

      const { data: publicData } = sb.storage.from(BUCKET).getPublicUrl(filePath);
      const image_url = publicData?.publicUrl;

      if (!image_url) {
        show("Upload succeeded, but could not get the image public URL.");
        return;
      }

      show("Saving product…");

      const { error: insertError } = await sb.from("products").insert([{
        name,
        category,
        price_cents,
        image_url,
        image_path: filePath,
        active: true,
      }]);

      if (insertError) return fail("Saving product failed", insertError);

      form.reset();
      show("");
      await loadProducts();
    });

    list.addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-del]");
      if (!btn) return;

      const id = btn.getAttribute("data-del");
      const path = btn.getAttribute("data-path");

      if (!confirm("Delete this product?")) return;

      show("Deleting…");

      // Try to delete image first (don’t block if missing)
      if (path) {
        const { error: rmErr } = await sb.storage.from(BUCKET).remove([path]);
        if (rmErr) console.warn("Image delete failed:", rmErr.message);
      }

      const { error } = await sb.from("products").delete().eq("id", id);
      if (error) return fail("Delete failed", error);

      show("");
      await loadProducts();
    });

    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      }[c]));
    }

    await loadProducts();
  } catch (err) {
    fail("Admin page crashed", err);
  }
})();
