/*
  Small UX helpers for the template:
  - product quantity stepper
  - fake cart count
  - footer year
  - prevent newsletter form submit (placeholder)
*/

(function () {
  const cartCountEl = document.getElementById("cartCount");
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Persist a mock cart count so refreshes keep it (optional)
  const CART_KEY = "studiolabut_cartCount";
  let cartCount = parseInt(localStorage.getItem(CART_KEY) || "0", 10);
  if (Number.isNaN(cartCount)) cartCount = 0;
  if (cartCountEl) cartCountEl.textContent = String(cartCount);

  function updateCart(delta) {
    cartCount = Math.max(0, cartCount + delta);
    localStorage.setItem(CART_KEY, String(cartCount));
    if (cartCountEl) cartCountEl.textContent = String(cartCount);
  }

  // Quantity steppers
  document.querySelectorAll(".js-product").forEach((card) => {
    const minus = card.querySelector(".js-minus");
    const plus = card.querySelector(".js-plus");
    const qtyInput = card.querySelector(".js-qty");
    const addBtn = card.querySelector(".js-add");

    if (!qtyInput) return;

    const getQty = () => {
      const n = parseInt(qtyInput.value || "1", 10);
      return Number.isNaN(n) ? 1 : Math.max(1, Math.min(99, n));
    };

    const setQty = (n) => {
      qtyInput.value = String(Math.max(1, Math.min(99, n)));
    };

    minus?.addEventListener("click", () => setQty(getQty() - 1));
    plus?.addEventListener("click", () => setQty(getQty() + 1));

    addBtn?.addEventListener("click", () => {
      const q = getQty();
      updateCart(q);
      setQty(1);
      addBtn.classList.add("added");
      addBtn.textContent = "Added";
      window.setTimeout(() => {
        addBtn.classList.remove("added");
        addBtn.textContent = "Add to cart";
      }, 1000);
    });
  });

  // Cart button (placeholder)
  document.getElementById("cartBtn")?.addEventListener("click", () => {
    alert("Cart is a placeholder in this static template.\n\nWhen you're ready for checkout, we can add Shopify / Stripe / Squarespace / etc.");
  });

  // Newsletter (placeholder)
  document.getElementById("newsletterForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input[type=email]");
    if (!input) return;
    if (!input.value.trim()) return;
    alert("Thanks! (This form is a placeholder — connect it to Mailchimp/ConvertKit/etc. later.)");
    input.value = "";
  });
})();
