"use strict";

/*
=========================================================
KAVUN SECURITY STUDIO
Main interaction layer
=========================================================
*/


const $ = (selector, parent = document) => {
  return parent.querySelector(selector);
};


const $$ = (selector, parent = document) => {
  return [...parent.querySelectorAll(selector)];
};


/* =======================================================
   STATE
======================================================= */

const state = {
  activeNode: "gateway",
  telemetryPaused: false,
  simulationRunning: false,
  commandOpen: false,
  mobileMenuOpen: false
};


/* =======================================================
   NODE DATA
======================================================= */

const nodeData = {

  gateway: {
    code: "GW-01",
    title: "Edge Gateway",
    status: "MONITORED",
    statusClass: "status-green",

    description:
      "Public ingress boundary responsible for request filtering, rate controls and edge authentication.",

    metrics: [
      "18.4k/min",
      "1.7%",
      "24ms"
    ]
  },


  identity: {
    code: "ID-02",
    title: "Identity Layer",
    status: "ELEVATED",
    statusClass: "status-yellow",

    description:
      "Central authentication boundary responsible for sessions, device trust and privileged access.",

    metrics: [
      "8,421",
      "94.2%",
      "MEDIUM"
    ]
  },


  api: {
    code: "API-03",
    title: "API Mesh",
    status: "INVESTIGATE",
    statusClass: "status-red",

    description:
      "Service-to-service API surface showing an unusual concentration of rejected authorization attempts.",

    metrics: [
      "42.8k/min",
      "3.8%",
      "HIGH"
    ]
  },


  data: {
    code: "DB-04",
    title: "Data Plane",
    status: "PROTECTED",
    statusClass: "status-green",

    description:
      "Encrypted data layer segmented from application workloads and monitored for anomalous access.",

    metrics: [
      "12.8M",
      "100%",
      "LOW"
    ]
  },


  worker: {
    code: "WK-05",
    title: "Worker Cluster",
    status: "HEALTHY",
    statusClass: "status-green",

    description:
      "Background processing cluster isolated from the public application layer.",

    metrics: [
      "4,210/min",
      "0.8%",
      "99.98%"
    ]
  }

};


/* =======================================================
   INIT
======================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    updateYear();

    startClock();

    setupNavigation();

    setupMobileMenu();

    setupLab();

    setupTelemetry();

    setupMethodAccordion();

    setupContactForm();

    setupCommandPalette();

    setupScrollReveal();

  }
);


/* =======================================================
   YEAR
======================================================= */

function updateYear() {

  const year =
    $("#year");

  if (!year) {
    return;
  }

  year.textContent =
    new Date().getFullYear();

}


/* =======================================================
   CLOCK
======================================================= */

function startClock() {

  const clock =
    $("#systemClock");

  if (!clock) {
    return;
  }


  function update() {

    const now =
      new Date();

    const hours =
      String(
        now.getHours()
      ).padStart(2, "0");

    const minutes =
      String(
        now.getMinutes()
      ).padStart(2, "0");

    const seconds =
      String(
        now.getSeconds()
      ).padStart(2, "0");


    clock.textContent =
      `${hours}:${minutes}:${seconds}`;

  }


  update();

  setInterval(
    update,
    1000
  );

}


/* =======================================================
   NAVIGATION
======================================================= */

function setupNavigation() {

  $$('a[href^="#"]').forEach(
    (link) => {

      link.addEventListener(
        "click",
        (event) => {

          const targetId =
            link.getAttribute(
              "href"
            );


          if (
            !targetId ||
            targetId === "#"
          ) {
            return;
          }


          const target =
            document.querySelector(
              targetId
            );


          if (!target) {
            return;
          }


          event.preventDefault();


          target.scrollIntoView({
            behavior:
              prefersReducedMotion()
                ? "auto"
                : "smooth",

            block: "start"
          });


          closeMobileMenu();

        }
      );

    }
  );

}


/* =======================================================
   MOBILE MENU
======================================================= */

function setupMobileMenu() {

  const button =
    $("#mobileMenuButton");

  const menu =
    $("#mobileMenu");


  if (!button || !menu) {
    return;
  }


  button.addEventListener(
    "click",
    () => {

      state.mobileMenuOpen =
        !state.mobileMenuOpen;


      menu.classList.toggle(
        "open",
        state.mobileMenuOpen
      );


      button.setAttribute(
        "aria-expanded",
        String(
          state.mobileMenuOpen
        )
      );

    }
  );

}


function closeMobileMenu() {

  const button =
    $("#mobileMenuButton");

  const menu =
    $("#mobileMenu");


  state.mobileMenuOpen =
    false;


  if (menu) {

    menu.classList.remove(
      "open"
    );

  }


  if (button) {

    button.setAttribute(
      "aria-expanded",
      "false"
    );

  }

}


/* =======================================================
   LAB
======================================================= */

function setupLab() {

  const nodes =
    $$(".architecture-node");


  nodes.forEach(
    (node) => {

      node.addEventListener(
        "click",
        () => {

          activateNode(
            node.dataset.node
          );

        }
      );

    }
  );


  activateNode(
    state.activeNode
  );

}


function activateNode(nodeName) {

  const data =
    nodeData[nodeName];


  if (!data) {
    return;
  }


  state.activeNode =
    nodeName;


  $$(".architecture-node")
    .forEach(
      (node) => {

        node.classList.toggle(
          "active",
          node.dataset.node === nodeName
        );

      }
    );


  const status =
    $("#nodeStatus");

  const code =
    $("#nodeCode");

  const title =
    $("#nodeTitle");

  const description =
    $("#nodeDescription");

  const metricOne =
    $("#metricOne");

  const metricTwo =
    $("#metricTwo");

  const metricThree =
    $("#metricThree");


  if (status) {

    status.textContent =
      data.status;

    status.className =
      `status ${data.statusClass}`;

  }


  if (code) {
    code.textContent =
      data.code;
  }


  if (title) {
    title.textContent =
      data.title;
  }


  if (description) {

    description.textContent =
      data.description;

  }


  if (metricOne) {
    metricOne.textContent =
      data.metrics[0];
  }


  if (metricTwo) {
    metricTwo.textContent =
      data.metrics[1];
  }


  if (metricThree) {
    metricThree.textContent =
      data.metrics[2];
  }

}


/* =======================================================
   ATTACK SIMULATION
======================================================= */

function setupSimulation() {

  const button =
    $("#runSimulation");


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    runAttackSimulation
  );

}


/* initialize simulation listener */

document.addEventListener(
  "DOMContentLoaded",
  setupSimulation
);


function runAttackSimulation() {

  if (
    state.simulationRunning
  ) {
    return;
  }


  const button =
    $("#runSimulation");


  if (!button) {
    return;
  }


  state.simulationRunning =
    true;


  button.disabled =
    true;


  const originalText =
    button.innerHTML;


  button.innerHTML =
    "ANALYZING ATTACK PATH...";


  showToast(
    "Simulation started",
    "Scanning trust boundaries and service paths."
  );


  const sequence = [
    "gateway",
    "identity",
    "api",
    "data",
    "worker",
    "api"
  ];


  let index = 0;


  const interval =
    setInterval(
      () => {

        activateNode(
          sequence[index]
        );


        index++;


        if (
          index >=
          sequence.length
        ) {

          clearInterval(
            interval
          );


          setTimeout(
            () => {

              button.disabled =
                false;


              button.innerHTML =
                originalText;


              state.simulationRunning =
                false;


              showToast(
                "Simulation complete",
                "API Mesh surfaced as the highest-priority investigation point."
              );

            },
            350
          );

        }

      },
      prefersReducedMotion()
        ? 180
        : 620
    );

}


/* =======================================================
   TELEMETRY
======================================================= */

function setupTelemetry() {

  const toggle =
    $("#telemetryToggle");


  if (toggle) {

    toggle.addEventListener(
      "click",
      toggleTelemetry
    );

  }


  setInterval(
    () => {

      if (
        !state.telemetryPaused
      ) {

        generateTelemetryEvent();

      }

    },
    4000
  );

}


function toggleTelemetry() {

  state.telemetryPaused =
    !state.telemetryPaused;


  const button =
    $("#telemetryToggle");


  if (!button) {
    return;
  }


  button.textContent =
    state.telemetryPaused
      ? "RESUME FEED"
      : "PAUSE FEED";


  showToast(
    state.telemetryPaused
      ? "Telemetry paused"
      : "Telemetry resumed",

    state.telemetryPaused
      ? "Live events are no longer updating."
      : "Live event stream is active again."
  );

}


function generateTelemetryEvent() {

  const events = [

    {
      source: "gateway",
      message: "Request fingerprint updated",
      result: "NORMAL",
      className: "event-normal"
    },

    {
      source: "identity",
      message: "Device trust evaluated",
      result: "PASSED",
      className: "event-normal"
    },

    {
      source: "api",
      message: "Authorization anomaly detected",
      result: "REVIEW",
      className: "event-review"
    },

    {
      source: "data",
      message: "Encrypted query executed",
      result: "NORMAL",
      className: "event-normal"
    },

    {
      source: "gateway",
      message: "Suspicious request blocked",
      result: "BLOCKED",
      className: "event-blocked"
    }

  ];


  const event =
    events[
      Math.floor(
        Math.random() *
        events.length
      )
    ];


  const now =
    new Date();


  const time =
    now.toLocaleTimeString(
      "en-GB",
      {
        hour12: false
      }
    );


  const container =
    $("#telemetryRows");


  if (!container) {
    return;
  }


  const row =
    document.createElement(
      "div"
    );


  row.className =
    "telemetry-row new";


  row.innerHTML = `

    <span>
      ${escapeHTML(time)}
    </span>

    <span>
      ${escapeHTML(event.source)}
    </span>

    <span>
      ${escapeHTML(event.message)}
    </span>

    <strong class="${event.className}">
      ${escapeHTML(event.result)}
    </strong>

  `;


  container.prepend(
    row
  );


  while (
    container.children.length > 5
  ) {

    container.lastElementChild.remove();

  }


  updateSignal();


  setTimeout(
    () => {

      row.classList.remove(
        "new"
      );

    },
    500
  );

}


/* =======================================================
   SIGNAL
======================================================= */

function updateSignal() {

  const latency =
    $("#latencyValue");

  const blocked =
    $("#blockedValue");


  if (latency) {

    const value =
      Math.floor(
        21 +
        Math.random() * 10
      );


    latency.textContent =
      `${value}ms`;

  }


  if (blocked) {

    const value =
      (
        1.3 +
        Math.random() * 0.8
      ).toFixed(1);


    blocked.textContent =
      `${value}%`;

  }

}


/* =======================================================
   METHOD ACCORDION
======================================================= */

function setupMethodAccordion() {

  const items =
    $$("[data-method]");


  items.forEach(
    (item) => {

      const trigger =
        $(".method-trigger", item);


      if (!trigger) {
        return;
      }


      trigger.addEventListener(
        "click",
        () => {

          const alreadyActive =
            item.classList.contains(
              "active"
            );


          items.forEach(
            (other) => {

              other.classList.remove(
                "active"
              );

            }
          );


          if (!alreadyActive) {

            item.classList.add(
              "active"
            );

          }

        }
      );

    }
  );

}


/* =======================================================
   CONTACT FORM
======================================================= */

function setupContactForm() {

  const form =
    $("#contactForm");


  if (!form) {
    return;
  }


  const fields =
    $$(
      "input, textarea, select",
      form
    );


  fields.forEach(
    (field) => {

      field.addEventListener(
        "input",
        () => {

          clearFieldError(
            field
          );

        }
      );


      field.addEventListener(
        "change",
        () => {

          clearFieldError(
            field
          );

        }
      );

    }
  );


  form.addEventListener(
    "submit",
    handleFormSubmit
  );

}


async function handleFormSubmit(event) {

  event.preventDefault();


  const form =
    event.currentTarget;


  const fields =
    $$(
      "input, textarea, select",
      form
    );


  let valid = true;


  fields.forEach(
    (field) => {

      if (
        !validateField(
          field
        )
      ) {

        valid = false;

      }

    }
  );


  if (!valid) {

    showFormMessage(
      "Please check the highlighted fields.",
      "error"
    );


    const firstInvalid =
      $(".invalid input, .invalid textarea, .invalid select");


    if (firstInvalid) {

      firstInvalid.focus();

    }


    showToast(
      "Form needs attention",
      "Some required fields are missing or invalid."
    );


    return;
  }


  const submit =
    $(".submit-button", form);


  const original =
    submit.innerHTML;


  submit.disabled =
    true;


  submit.innerHTML =
    "ENCRYPTING REQUEST...";


  showFormMessage(
    "Preparing secure intake.",
    ""
  );


  await delay(
    1200
  );


  form.reset();


  submit.disabled =
    false;


  submit.innerHTML =
    original;


  showFormMessage(
    "Request received. This demo stores nothing and sends no data.",
    "success"
  );


  showToast(
    "Request received",
    "Your security intake was processed locally."
  );

}


function validateField(field) {

  const wrapper =
    field.closest(
      ".form-field"
    );


  if (!wrapper) {
    return true;
  }


  const value =
    field.value.trim();


  if (
    field.required &&
    !value
  ) {

    setFieldError(
      wrapper,
      "Required field."
    );


    return false;

  }


  if (
    field.type === "email" &&
    value &&
    !isValidEmail(value)
  ) {

    setFieldError(
      wrapper,
      "Invalid email address."
    );


    return false;

  }


  clearFieldError(
    field
  );


  return true;

}


function setFieldError(
  wrapper,
  message
) {

  wrapper.classList.add(
    "invalid"
  );


  const small =
    $("small", wrapper);


  if (small) {

    small.textContent =
      message;

  }

}


function clearFieldError(field) {

  const wrapper =
    field.closest(
      ".form-field"
    );


  if (!wrapper) {
    return;
  }


  wrapper.classList.remove(
    "invalid"
  );


  const small =
    $("small", wrapper);


  if (small) {

    small.textContent =
      "";

  }

}


function showFormMessage(
  message,
  type
) {

  const element =
    $("#formMessage");


  if (!element) {
    return;
  }


  element.textContent =
    message;


  element.className =
    `form-message ${type}`;

}


function isValidEmail(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );

}


/* =======================================================
   COMMAND PALETTE
======================================================= */

const commands = [

  {
    title: "Threat Lab",
    description:
      "Open the interactive architecture laboratory.",
    target: "#lab"
  },

  {
    title: "Capabilities",
    description:
      "Explore security and engineering capabilities.",
    target: "#services"
  },

  {
    title: "Field Notes",
    description:
      "Read selected engineering observations.",
    target: "#notes"
  },

  {
    title: "Method",
    description:
      "Inspect the four-step engagement method.",
    target: "#method"
  },

  {
    title: "Contact",
    description:
      "Start a security review.",
    target: "#contact"
  }

];


let commandSelection = 0;


function setupCommandPalette() {

  const open =
    $("#commandOpen");

  const close =
    $("#commandClose");

  const input =
    $("#commandInput");


  if (open) {

    open.addEventListener(
      "click",
      openCommandPalette
    );

  }


  if (close) {

    close.addEventListener(
      "click",
      closeCommandPalette
    );

  }


  if (input) {

    input.addEventListener(
      "input",
      () => {

        commandSelection = 0;

        renderCommands(
          input.value
        );

      }
    );


    input.addEventListener(
      "keydown",
      (event) => {

        const results =
          $$(".command-item");


        if (
          event.key === "ArrowDown"
        ) {

          event.preventDefault();

          commandSelection =
            Math.min(
              commandSelection + 1,
              Math.max(
                results.length - 1,
                0
              )
            );


          updateCommandSelection();

        }


        if (
          event.key === "ArrowUp"
        ) {

          event.preventDefault();

          commandSelection =
            Math.max(
              commandSelection - 1,
              0
            );


          updateCommandSelection();

        }


        if (
          event.key === "Enter"
        ) {

          event.preventDefault();


          if (
            results[
              commandSelection
            ]
          ) {

            results[
              commandSelection
            ].click();

          }

        }


        if (
          event.key === "Escape"
        ) {

          closeCommandPalette();

        }

      }
    );

  }


  const overlay =
    $("#commandOverlay");


  if (overlay) {

    overlay.addEventListener(
      "click",
      (event) => {

        if (
          event.target === overlay
        ) {

          closeCommandPalette();

        }

      }
    );

  }


  renderCommands("");

}


function openCommandPalette() {

  const overlay =
    $("#commandOverlay");

  const input =
    $("#commandInput");


  if (!overlay) {
    return;
  }


  state.commandOpen =
    true;


  overlay.classList.add(
    "open"
  );


  overlay.setAttribute(
    "aria-hidden",
    "false"
  );


  if (input) {

    input.value = "";

    renderCommands("");

    setTimeout(
      () => input.focus(),
      50
    );

  }

}


function closeCommandPalette() {

  const overlay =
    $("#commandOverlay");


  state.commandOpen =
    false;


  if (!overlay) {
    return;
  }


  overlay.classList.remove(
    "open"
  );


  overlay.setAttribute(
    "aria-hidden",
    "true"
  );

}


function renderCommands(query) {

  const container =
    $("#commandResults");


  if (!container) {
    return;
  }


  const normalized =
    query
      .trim()
      .toLowerCase();


  const results =
    commands.filter(
      (command) => {

        if (!normalized) {
          return true;
        }


        return (
          command.title
            .toLowerCase()
            .includes(
              normalized
            ) ||

          command.description
            .toLowerCase()
            .includes(
              normalized
            )
        );

      }
    );


  if (!results.length) {

    container.innerHTML = `
      <div class="command-empty">
        NO MATCHING COMMAND.
      </div>
    `;


    return;

  }


  container.innerHTML =
    results
      .map(
        (
          command,
          index
        ) => `

          <button
            type="button"
            class="command-item ${
              index === commandSelection
                ? "selected"
                : ""
            }"
            data-target="${command.target}"
          >

            <span class="command-item-main">

              <strong>
                ${escapeHTML(
                  command.title
                )}
              </strong>

              <small>
                ${escapeHTML(
                  command.description
                )}
              </small>

            </span>

            <span class="command-item-arrow">
              ↗
            </span>

          </button>

        `
      )
      .join("");


  $$(".command-item")
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            const target =
              button.dataset.target;


            closeCommandPalette();

            scrollToTarget(
              target
            );

          }
        );

      }
    );

}


function updateCommandSelection() {

  $$(".command-item")
    .forEach(
      (item, index) => {

        item.classList.toggle(
          "selected",
          index === commandSelection
        );

      }
    );

}


/* =======================================================
   KEYBOARD SHORTCUTS
======================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      (
        event.ctrlKey ||
        event.metaKey
      ) &&
      event.key.toLowerCase() === "k"
    ) {

      event.preventDefault();


      if (
        state.commandOpen
      ) {

        closeCommandPalette();

      } else {

        openCommandPalette();

      }

    }


    if (
      event.key === "Escape"
    ) {

      closeCommandPalette();

      closeMobileMenu();

    }

  }
);


/* =======================================================
   SCROLL REVEAL
======================================================= */

function setupScrollReveal() {

  const elements =
    $$(".reveal");


  if (!elements.length) {
    return;
  }


  if (
    prefersReducedMotion()
  ) {

    elements.forEach(
      (element) => {

        element.classList.add(
          "visible"
        );

      }
    );


    return;

  }


  if (
    !("IntersectionObserver" in window)
  ) {

    elements.forEach(
      (element) => {

        element.classList.add(
          "visible"
        );

      }
    );


    return;

  }


  const observer =
    new IntersectionObserver(
      (entries) => {

        entries.forEach(
          (entry) => {

            if (
              !entry.isIntersecting
            ) {

              return;

            }


            entry.target.classList.add(
              "visible"
            );


            observer.unobserve(
              entry.target
            );

          }
        );

      },
      {
        threshold: 0.12,

        rootMargin:
          "0px 0px -40px 0px"
      }
    );


  elements.forEach(
    (element) => {

      observer.observe(
        element
      );

    }
  );

}


/* =======================================================
   TOAST
======================================================= */

function showToast(
  title,
  message
) {

  const container =
    $("#toastContainer");


  if (!container) {
    return;
  }


  const toast =
    document.createElement(
      "article"
    );


  toast.className =
    "toast";


  toast.innerHTML = `

    <div class="toast-indicator"></div>

    <div>

      <strong>
        ${escapeHTML(title)}
      </strong>

      <p>
        ${escapeHTML(message)}
      </p>

    </div>

    <button
      class="toast-close"
      type="button"
      aria-label="Close notification"
    >
      ×
    </button>

  `;


  container.appendChild(
    toast
  );


  const close =
    $(".toast-close", toast);


  close.addEventListener(
    "click",
    () => {

      removeToast(
        toast
      );

    }
  );


  setTimeout(
    () => {

      removeToast(
        toast
      );

    },
    4500
  );

}


function removeToast(toast) {

  if (
    !toast ||
    !toast.isConnected
  ) {

    return;

  }


  toast.classList.add(
    "out"
  );


  setTimeout(
    () => {

      toast.remove();

    },
    prefersReducedMotion()
      ? 0
      : 220
  );

}


/* =======================================================
   UTILITIES
======================================================= */

function scrollToTarget(
  selector
) {

  const target =
    document.querySelector(
      selector
    );


  if (!target) {
    return;
  }


  target.scrollIntoView({
    behavior:
      prefersReducedMotion()
        ? "auto"
        : "smooth",

    block: "start"
  });

}


function prefersReducedMotion() {

  return window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

}


function delay(ms) {

  return new Promise(
    (resolve) => {

      setTimeout(
        resolve,
        ms
      );

    }
  );

}


function escapeHTML(value) {

  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}
