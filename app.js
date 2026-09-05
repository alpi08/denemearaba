```javascript
(() => {
  "use strict";

  /*
   * KAVUN Security Studio
   * app.js
   *
   * Vanilla JS interaction layer.
   * No external dependencies.
   */

  const state = {
    activeNode: "gateway",
    commandPaletteOpen: false,
    mobileMenuOpen: false,
    labRunning: false,
    selectedService: null,
    telemetryPaused: false,
    formSubmitting: false,
  };

  const DOM = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheDOM();
    bindNavigation();
    bindMobileMenu();
    bindCommandPalette();
    bindLab();
    bindTelemetry();
    bindForm();
    bindAccordions();
    bindCopyButtons();
    bindScrollReveal();
    bindKeyboardShortcuts();
    updateCurrentYear();
    startTelemetry();
  }

  function cacheDOM() {
    DOM.body = document.body;

    DOM.menuToggle = document.querySelector("[data-menu-toggle]");
    DOM.mobileMenu = document.querySelector("[data-mobile-menu]");

    DOM.commandPalette = document.querySelector("[data-command-palette]");
    DOM.commandInput = document.querySelector("[data-command-input]");
    DOM.commandResults = document.querySelector("[data-command-results]");

    DOM.toastRegion =
      document.querySelector("[data-toast-region]") ||
      createToastRegion();

    DOM.lab = document.querySelector("[data-lab]");
    DOM.labNodes = document.querySelectorAll("[data-lab-node]");
    DOM.labStatus = document.querySelector("[data-lab-status]");
    DOM.labDetails = document.querySelector("[data-lab-details]");
    DOM.labRunButton = document.querySelector("[data-lab-run]");
    DOM.labResetButton = document.querySelector("[data-lab-reset]");

    DOM.telemetryRows = document.querySelector("[data-telemetry-rows]");
    DOM.telemetryToggle = document.querySelector("[data-telemetry-toggle]");

    DOM.contactForm = document.querySelector("[data-contact-form]");
    DOM.formStatus = document.querySelector("[data-form-status]");

    DOM.year = document.querySelector("[data-year]");

    DOM.accordions = document.querySelectorAll("[data-accordion]");
    DOM.copyButtons = document.querySelectorAll("[data-copy]");

    DOM.revealItems = document.querySelectorAll("[data-reveal]");
  }

  /* ---------------------------------------------------------------------- */
  /* Navigation                                                             */
  /* ---------------------------------------------------------------------- */

  function bindNavigation() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") {
          return;
        }

        const target = document.querySelector(targetId);

        if (!target) {
          return;
        }

        event.preventDefault();

        closeMobileMenu();

        target.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start",
        });

        history.replaceState(null, "", targetId);
      });
    });
  }

  function bindMobileMenu() {
    if (!DOM.menuToggle || !DOM.mobileMenu) {
      return;
    }

    DOM.menuToggle.addEventListener("click", () => {
      state.mobileMenuOpen = !state.mobileMenuOpen;

      DOM.mobileMenu.classList.toggle(
        "is-open",
        state.mobileMenuOpen
      );

      DOM.menuToggle.setAttribute(
        "aria-expanded",
        String(state.mobileMenuOpen)
      );

      DOM.body.classList.toggle(
        "menu-open",
        state.mobileMenuOpen
      );
    });
  }

  function closeMobileMenu() {
    if (!DOM.mobileMenu || !DOM.menuToggle) {
      return;
    }

    state.mobileMenuOpen = false;

    DOM.mobileMenu.classList.remove("is-open");
    DOM.menuToggle.setAttribute("aria-expanded", "false");
    DOM.body.classList.remove("menu-open");
  }

  /* ---------------------------------------------------------------------- */
  /* Command Palette                                                       */
  /* ---------------------------------------------------------------------- */

  const commands = [
    {
      label: "Threat Lab",
      description: "Live security architecture",
      action: () => scrollTo("#lab"),
    },
    {
      label: "Engineering",
      description: "Software engineering capabilities",
      action: () => scrollTo("#engineering"),
    },
    {
      label: "Field Notes",
      description: "Selected security cases",
      action: () => scrollTo("#field-notes"),
    },
    {
      label: "Method",
      description: "KAVUN engagement method",
      action: () => scrollTo("#method"),
    },
    {
      label: "Contact",
      description: "Start a security assessment",
      action: () => scrollTo("#contact"),
    },
  ];

  function bindCommandPalette() {
    if (!DOM.commandPalette) {
      return;
    }

    const closeButtons = DOM.commandPalette.querySelectorAll(
      "[data-command-close]"
    );

    closeButtons.forEach((button) => {
      button.addEventListener("click", closeCommandPalette);
    });

    DOM.commandPalette.addEventListener("click", (event) => {
      if (event.target === DOM.commandPalette) {
        closeCommandPalette();
      }
    });

    if (DOM.commandInput) {
      DOM.commandInput.addEventListener("input", () => {
        renderCommands(DOM.commandInput.value);
      });

      DOM.commandInput.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeCommandPalette();
        }

        if (event.key === "Enter") {
          const first = DOM.commandResults?.querySelector(
            "[data-command-index]"
          );

          if (first) {
            first.click();
          }
        }
      });
    }

    renderCommands("");
  }

  function openCommandPalette() {
    if (!DOM.commandPalette) {
      return;
    }

    state.commandPaletteOpen = true;

    DOM.commandPalette.classList.add("is-open");
    DOM.commandPalette.setAttribute("aria-hidden", "false");

    if (DOM.commandInput) {
      DOM.commandInput.value = "";

      requestAnimationFrame(() => {
        DOM.commandInput.focus();
      });
    }

    renderCommands("");
  }

  function closeCommandPalette() {
    if (!DOM.commandPalette) {
      return;
    }

    state.commandPaletteOpen = false;

    DOM.commandPalette.classList.remove("is-open");
    DOM.commandPalette.setAttribute("aria-hidden", "true");
  }

  function renderCommands(query) {
    if (!DOM.commandResults) {
      return;
    }

    const normalizedQuery = String(query)
      .trim()
      .toLowerCase();

    const filtered = commands.filter((command) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        command.label.toLowerCase().includes(normalizedQuery) ||
        command.description.toLowerCase().includes(normalizedQuery)
      );
    });

    DOM.commandResults.innerHTML = "";

    if (!filtered.length) {
      const empty = document.createElement("div");
      empty.className = "command-empty";
      empty.textContent = "No matching command.";
      DOM.commandResults.appendChild(empty);
      return;
    }

    filtered.forEach((command, index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "command-item";
      button.dataset.commandIndex = String(index);

      button.innerHTML = `
        <span class="command-item__main">
          <strong>${escapeHTML(command.label)}</strong>
          <small>${escapeHTML(command.description)}</small>
        </span>
        <span class="command-item__arrow" aria-hidden="true">↗</span>
      `;

      button.addEventListener("click", () => {
        closeCommandPalette();
        command.action();
      });

      DOM.commandResults.appendChild(button);
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Threat Lab                                                             */
  /* ---------------------------------------------------------------------- */

  const labData = {
    gateway: {
      title: "Edge Gateway",
      code: "GW-01",
      severity: "Monitored",
      severityClass: "status-ok",
      description:
        "Public ingress point responsible for request filtering, rate control and edge authentication.",
      metrics: [
        ["Requests", "18.4k/min"],
        ["Blocked", "1.7%"],
        ["Latency", "24ms"],
      ],
    },

    identity: {
      title: "Identity Layer",
      code: "ID-02",
      severity: "Elevated",
      severityClass: "status-warning",
      description:
        "Central authentication boundary handling sessions, device trust and privileged access.",
      metrics: [
        ["Sessions", "8,421"],
        ["MFA", "94.2%"],
        ["Risk", "Medium"],
      ],
    },

    api: {
      title: "API Mesh",
      code: "API-03",
      severity: "Investigate",
      severityClass: "status-danger",
      description:
        "Service-to-service API surface with an unusual concentration of rejected authorization attempts.",
      metrics: [
        ["Calls", "42.8k/min"],
        ["4xx", "3.8%"],
        ["Anomaly", "High"],
      ],
    },

    data: {
      title: "Data Plane",
      code: "DB-04",
      severity: "Protected",
      severityClass: "status-ok",
      description:
        "Encrypted data layer segmented from application workloads and monitored for anomalous access.",
      metrics: [
        ["Records", "12.8M"],
        ["Encryption", "100%"],
        ["Exposure", "Low"],
      ],
    },

    worker: {
      title: "Worker Cluster",
      code: "WK-05",
      severity: "Healthy",
      severityClass: "status-ok",
      description:
        "Background processing cluster isolated from the public application layer.",
      metrics: [
        ["Jobs", "4,210/min"],
        ["Retries", "0.8%"],
        ["Health", "99.98%"],
      ],
    },
  };

  function bindLab() {
    if (!DOM.lab) {
      return;
    }

    DOM.labNodes.forEach((node) => {
      node.addEventListener("click", () => {
        const key = node.dataset.labNode;

        if (!key || !labData[key]) {
          return;
        }

        activateLabNode(key);
      });

      node.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();

          const key = node.dataset.labNode;

          if (key && labData[key]) {
            activateLabNode(key);
          }
        }
      });
    });

    if (DOM.labRunButton) {
      DOM.labRunButton.addEventListener("click", runLabSimulation);
    }

    if (DOM.labResetButton) {
      DOM.labResetButton.addEventListener("click", () => {
        activateLabNode("gateway");
        stopLabSimulation();
        showToast("Lab reset", "Architecture returned to baseline.");
      });
    }

    activateLabNode(state.activeNode);
  }

  function activateLabNode(key) {
    if (!labData[key]) {
      return;
    }

    state.activeNode = key;

    DOM.labNodes.forEach((node) => {
      const active = node.dataset.labNode === key;

      node.classList.toggle("is-active", active);
      node.setAttribute("aria-selected", String(active));
    });

    const item = labData[key];

    if (DOM.labStatus) {
      DOM.labStatus.innerHTML = `
        <span class="${item.severityClass}">
          ${escapeHTML(item.severity)}
        </span>
      `;
    }

    if (DOM.labDetails) {
      DOM.labDetails.innerHTML = `
        <div class="lab-detail__header">
          <div>
            <span class="eyebrow">${escapeHTML(item.code)}</span>
            <h3>${escapeHTML(item.title)}</h3>
          </div>
        </div>

        <p>${escapeHTML(item.description)}</p>

        <dl class="lab-metrics">
          ${item.metrics
            .map(
              ([label, value]) => `
                <div class="lab-metric">
                  <dt>${escapeHTML(label)}</dt>
                  <dd>${escapeHTML(value)}</dd>
                </div>
              `
            )
            .join("")}
        </dl>
      `;
    }
  }

  function runLabSimulation() {
    if (state.labRunning) {
      return;
    }

    state.labRunning = true;

    if (DOM.labRunButton) {
      DOM.labRunButton.disabled = true;
      DOM.labRunButton.setAttribute("aria-busy", "true");

      DOM.labRunButton.innerHTML = `
        <span class="button-spinner" aria-hidden="true"></span>
        Running simulation...
      `;
    }

    showToast(
      "Simulation started",
      "Analyzing attack paths across the architecture."
    );

    const sequence = ["gateway", "identity", "api", "data", "worker"];
    let index = 0;

    const interval = window.setInterval(() => {
      activateLabNode(sequence[index]);
      index += 1;

      if (index >= sequence.length) {
        window.clearInterval(interval);

        window.setTimeout(() => {
          activateLabNode("api");

          state.labRunning = false;

          if (DOM.labRunButton) {
            DOM.labRunButton.disabled = false;
            DOM.labRunButton.removeAttribute("aria-busy");

            DOM.labRunButton.textContent = "Run attack simulation";
          }

          showToast(
            "Simulation complete",
            "API Mesh surfaced as the highest-priority investigation point."
          );
        }, 350);
      }
    }, prefersReducedMotion() ? 250 : 650);
  }

  function stopLabSimulation() {
    state.labRunning = false;

    if (DOM.labRunButton) {
      DOM.labRunButton.disabled = false;
      DOM.labRunButton.removeAttribute("aria-busy");
      DOM.labRunButton.textContent = "Run attack simulation";
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Telemetry                                                              */
  /* ---------------------------------------------------------------------- */

  function bindTelemetry() {
    if (!DOM.telemetryToggle) {
      return;
    }

    DOM.telemetryToggle.addEventListener("click", () => {
      state.telemetryPaused = !state.telemetryPaused;

      DOM.telemetryToggle.setAttribute(
        "aria-pressed",
        String(state.telemetryPaused)
      );

      DOM.telemetryToggle.textContent = state.telemetryPaused
        ? "Resume feed"
        : "Pause feed";

      showToast(
        state.telemetryPaused ? "Telemetry paused" : "Telemetry resumed",
        state.telemetryPaused
          ? "Live events will stop updating."
          : "Live events are updating again."
      );
    });
  }

  function startTelemetry() {
    if (!DOM.telemetryRows) {
      return;
    }

    const initialEvents = [
      {
        time: "18:42:11",
        source: "gateway",
        event: "WAF rule triggered",
        result: "blocked",
      },
      {
        time: "18:42:08",
        source: "identity",
        event: "MFA challenge",
        result: "passed",
      },
      {
        time: "18:41:57",
        source: "api",
        event: "Token scope mismatch",
        result: "review",
      },
      {
        time: "18:41:44",
        source: "worker",
        event: "Job completed",
        result: "normal",
      },
    ];

    initialEvents.forEach((event) => {
      appendTelemetryEvent(event);
    });

    window.setInterval(() => {
      if (state.telemetryPaused) {
        return;
      }

      appendTelemetryEvent(generateTelemetryEvent());
    }, 4200);
  }

  function generateTelemetryEvent() {
    const events = [
      {
        source: "gateway",
        event: "Request fingerprint updated",
        result: "normal",
      },
      {
        source: "identity",
        event: "Device trust evaluated",
        result: "passed",
      },
      {
        source: "api",
        event: "Authorization anomaly detected",
        result: "review",
      },
      {
        source: "data",
        event: "Encrypted query executed",
        result: "normal",
      },
      {
        source: "worker",
        event: "Queue latency checked",
        result: "normal",
      },
    ];

    const random = events[
      Math.floor(Math.random() * events.length)
    ];

    return {
      ...random,
      time: formatCurrentTime(),
    };
  }

  function appendTelemetryEvent(event) {
    if (!DOM.telemetryRows) {
      return;
    }

    const row = document.createElement("div");

    row.className = "telemetry-row telemetry-row--new";

    row.innerHTML = `
      <time datetime="${escapeHTML(event.time)}">
        ${escapeHTML(event.time)}
      </time>

      <span class="telemetry-source">
        ${escapeHTML(event.source)}
      </span>

      <span class="telemetry-event">
        ${escapeHTML(event.event)}
      </span>

      <span class="telemetry-result telemetry-result--${escapeHTML(
        event.result
      )}">
        ${escapeHTML(event.result)}
      </span>
    `;

    DOM.telemetryRows.prepend(row);

    window.setTimeout(() => {
      row.classList.remove("telemetry-row--new");
    }, 500);

    while (DOM.telemetryRows.children.length > 7) {
      DOM.telemetryRows.lastElementChild.remove();
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Contact Form                                                           */
  /* ---------------------------------------------------------------------- */

  function bindForm() {
    if (!DOM.contactForm) {
      return;
    }

    const inputs = DOM.contactForm.querySelectorAll(
      "input, textarea, select"
    );

    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        clearFieldError(input);
      });

      input.addEventListener("blur", () => {
        validateField(input);
      });
    });

    DOM.contactForm.addEventListener("submit", handleFormSubmit);
  }

  async function handleFormSubmit(event) {
    event.preventDefault();

    if (state.formSubmitting) {
      return;
    }

    const form = event.currentTarget;
    const fields = Array.from(
      form.querySelectorAll("input, textarea, select")
    );

    const invalidFields = fields.filter(
      (field) => !validateField(field)
    );

    if (invalidFields.length) {
      invalidFields[0].focus();

      setFormStatus(
        "error",
        "Please check the highlighted fields."
      );

      showToast(
        "Form needs attention",
        "A few required fields are missing or invalid."
      );

      return;
    }

    state.formSubmitting = true;

    const submitButton = form.querySelector(
      'button[type="submit"]'
    );

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
      submitButton.dataset.originalText =
        submitButton.textContent;

      submitButton.innerHTML = `
        <span class="button-spinner" aria-hidden="true"></span>
        Sending request...
      `;
    }

    setFormStatus(
      "loading",
      "Encrypting request and preparing secure intake..."
    );

    await wait(1200);

    setFormStatus(
      "success",
      "Request received. We will review the scope and return with a proposed next step."
    );

    showToast(
      "Request received",
      "Your security intake has been recorded locally for this demo."
    );

    form.reset();

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");

      submitButton.textContent =
        submitButton.dataset.originalText ||
        "Start a conversation";
    }

    state.formSubmitting = false;
  }

  function validateField(field) {
    if (field.disabled) {
      return true;
    }

    const value = field.value.trim();

    if (field.required && !value) {
      setFieldError(field, "This field is required.");
      return false;
    }

    if (
      field.type === "email" &&
      value &&
      !isValidEmail(value)
    ) {
      setFieldError(field, "Enter a valid email address.");
      return false;
    }

    clearFieldError(field);
    return true;
  }

  function setFieldError(field, message) {
    field.setAttribute("aria-invalid", "true");

    const wrapper =
      field.closest("[data-field]") || field.parentElement;

    if (!wrapper) {
      return;
    }

    let error =
      wrapper.querySelector("[data-field-error]");

    if (!error) {
      error = document.createElement("small");
      error.dataset.fieldError = "true";
      error.className = "field-error";

      wrapper.appendChild(error);
    }

    error.textContent = message;
  }

  function clearFieldError(field) {
    field.removeAttribute("aria-invalid");

    const wrapper =
      field.closest("[data-field]") || field.parentElement;

    if (!wrapper) {
      return;
    }

    const error =
      wrapper.querySelector("[data-field-error]");

    if (error) {
      error.remove();
    }
  }

  function setFormStatus(type, message) {
    if (!DOM.formStatus) {
      return;
    }

    DOM.formStatus.dataset.status = type;
    DOM.formStatus.textContent = message;
    DOM.formStatus.hidden = false;
  }

  /* ---------------------------------------------------------------------- */
  /* Accordions                                                             */
  /* ---------------------------------------------------------------------- */

  function bindAccordions() {
    DOM.accordions.forEach((accordion) => {
      const trigger = accordion.querySelector(
        "[data-accordion-trigger]"
      );

      const content = accordion.querySelector(
        "[data-accordion-content]"
      );

      if (!trigger || !content) {
        return;
      }

      trigger.addEventListener("click", () => {
        const open =
          accordion.getAttribute("data-open") === "true";

        DOM.accordions.forEach((item) => {
          item.setAttribute("data-open", "false");

          const itemTrigger = item.querySelector(
            "[data-accordion-trigger]"
          );

          if (itemTrigger) {
            itemTrigger.setAttribute(
              "aria-expanded",
              "false"
            );
          }
        });

        accordion.setAttribute(
          "data-open",
          String(!open)
        );

        trigger.setAttribute(
          "aria-expanded",
          String(!open)
        );
      });
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Copy buttons                                                            */
  /* ---------------------------------------------------------------------- */

  function bindCopyButtons() {
    DOM.copyButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const value =
          button.dataset.copy ||
          button.textContent.trim();

        try {
          await navigator.clipboard.writeText(value);

          const original = button.innerHTML;

          button.innerHTML = "Copied ✓";

          showToast(
            "Copied",
            "The value has been copied to your clipboard."
          );

          window.setTimeout(() => {
            button.innerHTML = original;
          }, 1300);
        } catch (error) {
          showToast(
            "Clipboard unavailable",
            "Your browser blocked clipboard access."
          );
        }
      });
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Scroll reveal                                                          */
  /* ---------------------------------------------------------------------- */

  function bindScrollReveal() {
    if (
      !DOM.revealItems.length ||
      !("IntersectionObserver" in window)
    ) {
      DOM.revealItems.forEach((item) => {
        item.classList.add("is-visible");
      });

      return;
    }

    if (prefersReducedMotion()) {
      DOM.revealItems.forEach((item) => {
        item.classList.add("is-visible");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observerInstance.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    DOM.revealItems.forEach((item) => {
      observer.observe(item);
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Keyboard shortcuts                                                     */
  /* ---------------------------------------------------------------------- */

  function bindKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
      const modifier = event.ctrlKey || event.metaKey;

      if (modifier && event.key.toLowerCase() === "k") {
        event.preventDefault();

        if (state.commandPaletteOpen) {
          closeCommandPalette();
        } else {
          openCommandPalette();
        }

        return;
      }

      if (event.key === "Escape") {
        closeCommandPalette();
        closeMobileMenu();
      }
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Toasts                                                                 */
  /* ---------------------------------------------------------------------- */

  function createToastRegion() {
    const region = document.createElement("div");

    region.className = "toast-region";
    region.dataset.toastRegion = "true";
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-atomic", "true");

    document.body.appendChild(region);

    return region;
  }

  function showToast(title, message) {
    if (!DOM.toastRegion) {
      return;
    }

    const toast = document.createElement("article");

    toast.className = "toast";

    toast.innerHTML = `
      <div class="toast__indicator" aria-hidden="true"></div>

      <div class="toast__content">
        <strong>${escapeHTML(title)}</strong>
        <p>${escapeHTML(message)}</p>
      </div>

      <button
        class="toast__close"
        type="button"
        aria-label="Close notification"
      >
        ×
      </button>
    `;

    DOM.toastRegion.appendChild(toast);

    const closeButton = toast.querySelector(
      ".toast__close"
    );

    closeButton?.addEventListener("click", () => {
      dismissToast(toast);
    });

    window.setTimeout(() => {
      dismissToast(toast);
    }, 4200);
  }

  function dismissToast(toast) {
    if (!toast || !toast.isConnected) {
      return;
    }

    toast.classList.add("is-leaving");

    window.setTimeout(() => {
      toast.remove();
    }, prefersReducedMotion() ? 0 : 220);
  }

  /* ---------------------------------------------------------------------- */
  /* Utilities                                                              */
  /* ---------------------------------------------------------------------- */

  function scrollTo(selector) {
    const target = document.querySelector(selector);

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  }

  function updateCurrentYear() {
    if (DOM.year) {
      DOM.year.textContent = String(
        new Date().getFullYear()
      );
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }

  function formatCurrentTime() {
    const now = new Date();

    return now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function wait(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }
})();
```
