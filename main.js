(() => {
  "use strict";
  const cfg = window.SITE_CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- Enlaces configurables ---------- */
  $$("[data-linkedin]").forEach((a) => {
    if (cfg.LINKEDIN_URL) a.href = cfg.LINKEDIN_URL;
    else a.hidden = true;
  });
  const bookingLink = $("[data-booking-link]");
  if (cfg.BOOKING_URL && bookingLink) { bookingLink.href = cfg.BOOKING_URL; bookingLink.hidden = false; bookingLink.target = "_blank"; bookingLink.rel = "noopener"; }
  $$("[data-booking]").forEach((a) => { if (cfg.BOOKING_URL) { a.href = cfg.BOOKING_URL; a.target = "_blank"; a.rel = "noopener"; } });
  const emailLink = $("[data-email]");
  if (cfg.CONTACT_EMAIL && emailLink) { emailLink.href = "mailto:" + cfg.CONTACT_EMAIL; emailLink.textContent = cfg.CONTACT_EMAIL; emailLink.hidden = false; }

  /* ---------- Bienvenida si llega desde LinkedIn ---------- */
  try {
    const qs = new URLSearchParams(location.search);
    const fromLi = (qs.get("utm_source") || "").toLowerCase().includes("linkedin") || /linkedin\.com|lnkd\.in/i.test(document.referrer);
    if (fromLi) $("#from-li").hidden = false;
  } catch (_) { /* sin efecto */ }

  /* ---------- Demo: factura → planilla ---------- */
  const demo = $("#demo");
  if (demo) {
    const src = $$("[data-src]", demo);
    const cells = $$("[data-cell]", demo);
    const chip = $("#demo-chip");
    const replay = $("#replay");
    let runId = 0;

    const showFinal = () => {
      cells.forEach((c) => { c.textContent = c.dataset.text; c.classList.remove("is-typing"); });
      src.forEach((s) => s.classList.remove("hl"));
      chip.classList.add("is-on");
      replay.classList.add("is-on");
    };
    const reset = () => {
      cells.forEach((c) => { c.textContent = ""; c.classList.remove("is-typing"); });
      src.forEach((s) => s.classList.remove("hl"));
      chip.classList.remove("is-on");
      replay.classList.remove("is-on");
    };
    const typeInto = async (el, text, id) => {
      el.classList.add("is-typing");
      for (let i = 1; i <= text.length; i++) {
        if (id !== runId) return false;
        el.textContent = text.slice(0, i);
        await sleep(38);
      }
      el.classList.remove("is-typing");
      return true;
    };
    const play = async () => {
      const id = ++runId;
      reset();
      await sleep(900);
      for (let i = 0; i < cells.length; i++) {
        if (id !== runId) return;
        src.forEach((s) => s.classList.remove("hl"));
        src[i].classList.add("hl");
        await sleep(280);
        if (!(await typeInto(cells[i], cells[i].dataset.text, id))) return;
        await sleep(160);
      }
      if (id !== runId) return;
      src.forEach((s) => s.classList.remove("hl"));
      await sleep(250);
      chip.classList.add("is-on");
      await sleep(500);
      replay.classList.add("is-on");
    };

    replay.addEventListener("click", () => { if (reduce) return showFinal(); play(); });

    if (reduce) showFinal();
    else if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { io.disconnect(); play(); }
      }, { threshold: 0.35 });
      io.observe(demo);
    } else play();
  }

  /* ---------- Formulario → Supabase ---------- */
  const form = $("#form");
  const statusEl = $("#status");
  const submitBtn = $("#submit");
  const setStatus = (msg, kind) => { statusEl.textContent = msg; statusEl.className = "form__status" + (kind ? " is-" + kind : ""); };
  const emailOk = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form).entries());
      const name = (d.name || "").trim();
      const email = (d.email || "").trim();
      const company = (d.company || "").trim();
      const message = (d.message || "").trim();

      $$("input, textarea", form).forEach((el) => el.removeAttribute("aria-invalid"));
      const bad = [];
      if (name.length < 2) bad.push("#f-name");
      if (!emailOk(email)) bad.push("#f-email");
      if (message.length < 10) bad.push("#f-message");
      if (bad.length) {
        bad.forEach((s) => $(s).setAttribute("aria-invalid", "true"));
        $(bad[0]).focus();
        setStatus("Revisá los campos marcados: nombre, un email válido y un mensaje de al menos 10 caracteres.", "err");
        return;
      }

      // Trampa para bots: si el campo oculto tiene contenido, simulamos éxito sin enviar.
      if (d.website) { form.reset(); setStatus("Listo, recibí tu mensaje. Te respondo en un día hábil.", "ok"); return; }

      if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
        setStatus("El formulario todavía no está conectado. Escribime por LinkedIn y te respondo por ahí.", "err");
        return;
      }

      submitBtn.disabled = true;
      setStatus("Enviando…");
      try {
        const res = await fetch(cfg.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/contact_requests", {
          method: "POST",
          headers: Object.assign({
            "Content-Type": "application/json",
            apikey: cfg.SUPABASE_ANON_KEY,
            Prefer: "return=minimal"
          }, /^eyJ/.test(cfg.SUPABASE_ANON_KEY) ? { Authorization: "Bearer " + cfg.SUPABASE_ANON_KEY } : {}),
          body: JSON.stringify({
            name, email,
            company: company || null,
            message,
            source: (new URLSearchParams(location.search).get("utm_source") || (/linkedin/i.test(document.referrer) ? "linkedin" : "directo")).slice(0, 80)
          })
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        setStatus("Listo, recibí tu mensaje. Te respondo en un día hábil.", "ok");
      } catch (err) {
        setStatus("No pude enviar el mensaje. Probá de nuevo en un rato o escribime por LinkedIn.", "err");
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
})();
