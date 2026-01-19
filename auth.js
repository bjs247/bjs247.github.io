/* auth.js — Supabase email/password auth + account drawer */

(function () {
  // 1) Paste your values here (Supabase dashboard -> Project Settings -> API)
  const SUPABASE_URL = "https://cinmadmozpgzxynclvwb.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_5wg8WzAObeUpkMCpF7ZgQw_vr2Z5E7d";

  if (!window.supabase) {
    console.error("Supabase library not loaded. Did you add the CDN <script> tag?");
    return;
  }

  const { createClient } = window.supabase;
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  // ---- Drawer UI ----
  const accountBtn = document.getElementById("accountBtn");
  const avatarInitial = document.getElementById("avatarInitial");
  const avatarIcon = document.getElementById("avatarIcon");

  const drawer = document.getElementById("accountDrawer");
  const backdrop = document.getElementById("accountBackdrop");
  const closeBtn = document.getElementById("accountClose");

  const tabs = Array.from(document.querySelectorAll(".drawer-tab"));
  const panels = Array.from(document.querySelectorAll(".drawer-panel"));

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const logoutBtn = document.getElementById("logoutBtn");

  const authMsg = document.getElementById("authMsg");
  const authMsg2 = document.getElementById("authMsg2");
  const userEmailEl = document.getElementById("userEmail");

  function openDrawer() {
    if (!drawer || !backdrop) return;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    backdrop.hidden = false;
    document.body.classList.add("drawer-open");

    requestAnimationFrame(() => {
      drawer.querySelector(".drawer-panel.is-active input")?.focus();
    });
  }

  function closeDrawer() {
    if (!drawer || !backdrop) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    backdrop.hidden = true;
    document.body.classList.remove("drawer-open");
    accountBtn?.focus();
  }

  function setTab(tabName) {
    tabs.forEach((b) => {
      const active = b.dataset.tab === tabName;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });

    panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === tabName));

    requestAnimationFrame(() => {
      document.querySelector(`.drawer-panel.is-active input`)?.focus();
    });
  }

  accountBtn?.addEventListener("click", openDrawer);
  closeBtn?.addEventListener("click", closeDrawer);
  backdrop?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer?.classList.contains("is-open")) closeDrawer();
  });

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => setTab(btn.dataset.tab));
  });

  function setMessage(el, text) {
    if (!el) return;
    el.textContent = text || "";
  }

  function setAuthUI(user) {
    const email = user?.email || "";

    // Header avatar
    if (avatarInitial && avatarIcon) {
      if (email) {
        avatarInitial.hidden = false;
        avatarInitial.textContent = email[0] || "U";
        avatarIcon.style.display = "none";
      } else {
        avatarInitial.hidden = true;
        avatarIcon.style.display = "";
      }
    }

    // Drawer content
    if (userEmailEl) userEmailEl.textContent = email ? `Signed in as ${email}` : "";

    // Show logout only when signed in
    if (logoutBtn) logoutBtn.hidden = !user;

    // When signed in, you might want to hide forms (optional).
    // I’m leaving forms visible, but you could disable them here if you prefer.
  }

  // ---- Auth actions ----

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMessage(authMsg, "Logging in…");

    const email = loginForm.email.value.trim().toLowerCase();
    const password = loginForm.password.value;

    const { data, error } = await sb.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(authMsg, error.message);
      return;
    }

    setMessage(authMsg, "");
    setAuthUI(data.user);
    closeDrawer();
  });

  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMessage(authMsg2, "Creating your account…");

    const email = signupForm.email.value.trim().toLowerCase();
    const password = signupForm.password.value;

    const { data, error } = await sb.auth.signUp({ email, password });

    if (error) {
      setMessage(authMsg2, error.message);
      return;
    }

    // If Confirm Email is ON (default), session will be null and they must confirm via email.
    if (!data.session) {
      setMessage(authMsg2, "Check your email to confirm your account, then come back and log in.");
      return;
    }

    // If Confirm Email is OFF, they’ll be signed in immediately.
    setMessage(authMsg2, "");
    setAuthUI(data.user);
    closeDrawer();
  });

  logoutBtn?.addEventListener("click", async () => {
    await sb.auth.signOut();
    setAuthUI(null);
    setTab("login");
    closeDrawer();
  });

  // Keep UI in sync across refreshes / tabs
  sb.auth.getSession().then(({ data }) => setAuthUI(data.session?.user || null));
  sb.auth.onAuthStateChange((_event, session) => setAuthUI(session?.user || null));
})();
