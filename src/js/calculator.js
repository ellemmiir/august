document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("calculator-modal");
  const overlay = document.getElementById("calculator-overlay");
  const openBtns = document.querySelectorAll("#calculator-open-btn");
  const closeBtn = document.getElementById("calculator-close");
  const backBtn = document.getElementById("calculator-back");
  const footerBack = document.getElementById("footer-back");
  const nextBtn = document.getElementById("footer-next");

  let currentStep = 1;
  const totalSteps = 5;
  const state = {
    siteType: null,
    hasDesign: null,
    hasSpecs: null,
    pageCount: 5,
    functionality: null,
    needsResponsive: null,
    urgency: null,
  };

  function openModal() {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    goToStep(1);
  }

  function closeModal() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  function goToStep(step) {
    currentStep = step;

    document.querySelectorAll(".calculator-step").forEach((el) => {
      el.classList.toggle("active", parseInt(el.dataset.step) === step);
    });

    document.querySelectorAll(".step-dot").forEach((dot, index) => {
      dot.classList.toggle("active", index + 1 <= step);
    });

    const isFirst = step === 1;
    const isLast = step === totalSteps;

    backBtn.disabled = isFirst;
    footerBack.disabled = isFirst;

    nextBtn.textContent = isLast ? "Готово" : "Далее";

    const pageCountGroup = document.getElementById("page-count-group");
    if (
      state.siteType &&
      ["visiting-card", "corporate"].includes(state.siteType)
    ) {
      pageCountGroup.style.display = "block";
    } else {
      pageCountGroup.style.display = "none";
    }

    if (isLast) {
      updateResult();
    }
  }

  function validateStep(step) {
    console.log("=== validateStep ===");
    console.log("step:", step);
    console.log("state:", state);

    switch (step) {
      case 1:
        return state.siteType !== null;
      case 2:
        return state.hasDesign !== null && state.hasSpecs !== null;
      case 3:
        return state.functionality !== null && state.needsResponsive !== null;
      case 4:
        return state.urgency !== null;
      default:
        return true;
    }
  }

  function nextStep() {
    console.log("=== nextStep ===");
    console.log("currentStep:", currentStep);
    console.log("state:", state);

    if (!validateStep(currentStep)) {
      console.log("VALIDATION FAILED for step", currentStep);
      return;
    }

    console.log("Validation passed");

    if (currentStep === totalSteps) {
      closeModal();
      return;
    }

    goToStep(currentStep + 1);
  }

  function prevStep() {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }

  function updateResult() {
    const min = document.getElementById("result-min");
    const max = document.getElementById("result-max");
    const list = document.getElementById("result-list");

    let basePrice = 0;
    switch (state.siteType) {
      case "landing":
        basePrice = 55000;
        break;
      case "visiting-card":
        basePrice = 105000;
        break;
      case "corporate":
        basePrice = 260000;
        break;
      case "ecommerce":
        basePrice = 500000;
        break;
    }

    let multiplier = 1;
    if (state.hasDesign === "no") multiplier *= 1.35;
    if (state.hasSpecs === "no") multiplier *= 1.25;
    if (state.functionality === "advanced") multiplier *= 1.4;
    if (state.needsResponsive === "no") multiplier *= 0.85;
    if (state.urgency === "urgent") multiplier *= 1.3;

    if (
      state.pageCount > 5 &&
      ["visiting-card", "corporate"].includes(state.siteType)
    ) {
      basePrice += (state.pageCount - 5) * 5000;
    }

    const finalPrice = basePrice * multiplier;
    const minPrice = Math.round((finalPrice * 0.85) / 1000) * 1000;
    const maxPrice = Math.round((finalPrice * 1.15) / 1000) * 1000;

    min.textContent = minPrice.toLocaleString("ru-RU");
    max.textContent = maxPrice.toLocaleString("ru-RU");

    const items = [];
    const siteNames = {
      landing: "Лендинг",
      "visiting-card": "Сайт-визитка",
      corporate: "Корпоративный сайт",
      ecommerce: "Интернет-магазин",
    };
    items.push(`Тип: ${siteNames[state.siteType] || state.siteType}`);
    items.push(
      `Дизайн: ${state.hasDesign === "yes" ? "готовый" : "разработка"}`,
    );
    items.push(`ТЗ: ${state.hasSpecs === "yes" ? "готовое" : "разработка"}`);
    if (
      state.pageCount > 1 &&
      ["visiting-card", "corporate"].includes(state.siteType)
    ) {
      items.push(`Страниц: ${state.pageCount}`);
    }
    items.push(
      `Функционал: ${state.functionality === "basic" ? "базовый" : "расширенный"}`,
    );
    items.push(
      `Адаптив: ${state.needsResponsive === "yes" ? "нужен" : "не нужен"}`,
    );
    items.push(
      `Сроки: ${state.urgency === "standard" ? "стандартные" : "срочные"}`,
    );

    list.innerHTML = items.map((item) => `<li>• ${item}</li>`).join("");
  }

  // Обработчики

  openBtns.forEach((btn) => btn.addEventListener("click", openModal));

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  backBtn.addEventListener("click", prevStep);
  footerBack.addEventListener("click", prevStep);
  nextBtn.addEventListener("click", nextStep);

  document.querySelectorAll(".option-card").forEach((card) => {
    card.addEventListener("click", function () {
      document
        .querySelectorAll(".option-card")
        .forEach((c) => c.classList.remove("active"));
      this.classList.add("active");
      state.siteType = this.dataset.value;
      console.log("siteType selected:", state.siteType);
    });
  });

  document.querySelectorAll(".step-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const group = this.dataset.group;
      const value = this.dataset.value;

      const stateKeyMap = {
        specs: "hasSpecs",
        design: "hasDesign",
        responsive: "needsResponsive",
        functionality: "functionality",
        urgency: "urgency",
      };
      const stateKey = stateKeyMap[group] || group;

      const parent = this.closest(".step-buttons");
      if (parent) {
        parent
          .querySelectorAll(".step-btn")
          .forEach((b) => b.classList.remove("active"));
      }
      this.classList.add("active");

      state[stateKey] = value;
      console.log(`State updated: ${stateKey} = ${value}`);
      console.log("State after update:", state);

      const hint = this.closest(".step-group")?.querySelector(".step-hint");
      if (hint) {
        const hintKey = `${group}-${value}`;
        const targetHint = this.closest(".step-group")?.querySelector(
          `[data-hint="${hintKey}"]`,
        );
        if (targetHint) {
          targetHint.classList.add("visible");
        }
      }
    });
  });

  // Ползунок страниц
  const range = document.getElementById("page-count-range");
  const valueDisplay = document.getElementById("page-count-value");
  if (range) {
    range.addEventListener("input", function () {
      state.pageCount = parseInt(this.value);
      valueDisplay.textContent = state.pageCount;
    });
  }

  // Форма результата
  document
    .getElementById("result-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("form-name").value.trim();
      const phone = document.getElementById("form-phone").value.trim();
      const email = document.getElementById("form-email").value.trim();

      if (!name || !phone || !email) {
        alert("Пожалуйста, заполните все обязательные поля");
        return;
      }

      alert(`Спасибо, ${name}! Мы свяжемся с вами в ближайшее время.`);
      closeModal();
    });
});
