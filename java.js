(() => {
  "use strict";

  const rootEl = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const THEME_KEY = "ingtelecom_theme";

  function applyTheme(theme) {
    rootEl.setAttribute("data-theme", theme);
    themeToggle.textContent = theme === "dark" ? "☀️ Modo Claro" : "🌙 Modo Oscuro";
    localStorage.setItem(THEME_KEY, theme);
  }

  applyTheme(localStorage.getItem(THEME_KEY) || "light");
  themeToggle.addEventListener("click", () => {
    applyTheme(rootEl.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  menuToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

  const techFilter = document.getElementById("techFilter");
  const tableRows = document.querySelectorAll("#techTable tbody tr");
  techFilter.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    tableRows.forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });

  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
      tabPanels.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  const txPowerInput = document.getElementById("txPower");
  const txGainInput = document.getElementById("txGain");
  const rxGainInput = document.getElementById("rxGain");
  const pathLossInput = document.getElementById("pathLoss");
  const rxResultEl = document.getElementById("rxResult");
  const linkQualityText = document.getElementById("linkQualityText");
  const signalMeter = document.getElementById("signalMeter");
  const txLinearEl = document.getElementById("txLinear");
  const netGainEl = document.getElementById("netGain");

  function calculateRF() {
    const pTx = parseFloat(txPowerInput.value) || 0;
    const gTx = parseFloat(txGainInput.value) || 0;
    const gRx = parseFloat(rxGainInput.value) || 0;
    const loss = Math.max(0, parseFloat(pathLossInput.value) || 0);

    const netGain = gTx + gRx;
    const pRx = pTx + netGain - loss;
    const pMw = Math.pow(10, pTx / 10);

    rxResultEl.textContent = `${pRx.toFixed(2)} dBm`;
    netGainEl.textContent = `${netGain >= 0 ? "+" : ""}${netGain.toFixed(2)} dBi`;
    txLinearEl.textContent = `${pMw.toFixed(2)} mW (${(pMw / 1000).toFixed(4)} W)`;

    const percent = ((Math.min(-30, Math.max(-100, pRx)) + 100) / 70) * 100;
    signalMeter.style.width = `${percent}%`;

    if (pRx >= -65) {
      linkQualityText.textContent = "Señal Excelente (Enlace estable de alta capacidad)";
      linkQualityText.style.color = signalMeter.style.backgroundColor = "var(--success)";
    } else if (pRx >= -82) {
      linkQualityText.textContent = "Señal Aceptable (Operativa con modulación media)";
      linkQualityText.style.color = signalMeter.style.backgroundColor = "var(--warning)";
    } else {
      linkQualityText.textContent = "Señal Débil / Crítica (Riesgo de desconexión)";
      linkQualityText.style.color = signalMeter.style.backgroundColor = "var(--danger)";
    }
  }

  [txPowerInput, txGainInput, rxGainInput, pathLossInput].forEach(el => el.addEventListener("input", calculateRF));

  const rfPresets = {
    wifi: { tx: 18, gTx: 3, gRx: 2, loss: 78 },
    ptp: { tx: 23, gTx: 19, gRx: 19, loss: 112 },
    fibra: { tx: 3, gTx: 0, gRx: 0, loss: 16 }
  };
  document.querySelectorAll("[data-preset]").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = rfPresets[btn.dataset.preset];
      txPowerInput.value = p.tx;
      txGainInput.value = p.gTx;
      rxGainInput.value = p.gRx;
      pathLossInput.value = p.loss;
      calculateRF();
    });
  });
  calculateRF();

  const fileSizeInput = document.getElementById("fileSize");
  const fileUnitSelect = document.getElementById("fileUnit");
  const netSpeedInput = document.getElementById("netSpeed");
  const downloadTimeEl = document.getElementById("downloadTime");
  const totalBitsEl = document.getElementById("totalBits");
  const mbPerSecEl = document.getElementById("mbPerSec");

  function calculateDownload() {
    const size = Math.max(0.01, parseFloat(fileSizeInput.value) || 0);
    const speedMbps = Math.max(0.1, parseFloat(netSpeedInput.value) || 0.1);
    const sizeInMegabits = (fileUnitSelect.value === "GB" ? size * 1000 : size) * 8;
    const totalSeconds = sizeInMegabits / speedMbps;

    totalBitsEl.textContent = `${sizeInMegabits.toLocaleString("es-PE")} Megabits`;
    mbPerSecEl.textContent = `${(speedMbps / 8).toFixed(2)} MB/s`;

    if (totalSeconds < 60) {
      downloadTimeEl.textContent = `${totalSeconds.toFixed(1)} segundos`;
    } else if (totalSeconds < 3600) {
      downloadTimeEl.textContent = `${Math.floor(totalSeconds / 60)} min ${Math.round(totalSeconds % 60)} s`;
    } else {
      downloadTimeEl.textContent = `${Math.floor(totalSeconds / 3600)} h ${Math.round((totalSeconds % 3600) / 60)} min`;
    }
  }

  [fileSizeInput, fileUnitSelect, netSpeedInput].forEach(el => el.addEventListener("input", calculateDownload));
  document.querySelectorAll("[data-dl]").forEach(btn => {
    btn.addEventListener("click", () => {
      const [size, unit, speed] = btn.dataset.dl.split(",");
      fileSizeInput.value = size;
      fileUnitSelect.value = unit;
      netSpeedInput.value = speed;
      calculateDownload();
    });
  });
  calculateDownload();

  const STORAGE_KEY = "ingtelecom_consultas_v1";
  const consultaForm = document.getElementById("consultaForm");
  const formFeedback = document.getElementById("formFeedback");
  const inboxList = document.getElementById("inboxList");
  const inboxCount = document.getElementById("inboxCount");

  const getConsultas = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  };
  const saveConsultas = (list) => localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  const escapeHTML = (str) => {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  };

  function renderInbox() {
    const consultas = getConsultas();
    inboxCount.textContent = consultas.length;

    if (!consultas.length) {
      inboxList.innerHTML = `<p class="empty-inbox">Aún no hay consultas guardadas.</p>`;
      return;
    }

    inboxList.innerHTML = consultas.map(item => {
      const subject = encodeURIComponent(`[IngTelecom] Consulta: ${item.topic}`);
      const body = encodeURIComponent(`Nombre: ${item.name}\nCorreo: ${item.email}\nTema: ${item.topic}\n\nMensaje:\n${item.message}`);
      return `
        <article class="consulta-item">
          <div class="consulta-top">
            <strong>${escapeHTML(item.name)}</strong>
            <span class="badge">${escapeHTML(item.topic)}</span>
          </div>
          <div class="consulta-meta">${escapeHTML(item.email)} • ${escapeHTML(item.date)}</div>
          <p class="consulta-body">${escapeHTML(item.message)}</p>
          <a class="btn btn-outline btn-sm" href="mailto:${escapeHTML(item.email)}?subject=${subject}&body=${body}">✉️ Enviar por Correo</a>
        </article>
      `;
    }).join("");
  }

  consultaForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("userName").value.trim();
    const email = document.getElementById("userEmail").value.trim();
    const topic = document.getElementById("userTopic").value;
    const message = document.getElementById("userMessage").value.trim();

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !topic || message.length < 5) {
      formFeedback.style.color = "var(--danger)";
      formFeedback.textContent = "Por favor completa todos los campos con un correo válido.";
      return;
    }

    const consultas = getConsultas();
    consultas.unshift({ id: Date.now(), name, email, topic, message, date: new Date().toLocaleString("es-PE") });
    saveConsultas(consultas);
    renderInbox();
    consultaForm.reset();

    formFeedback.style.color = "var(--success)";
    formFeedback.textContent = "✓ Consulta guardada correctamente.";
  });

  function downloadFile(content, filename, mime) {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  document.getElementById("exportJsonBtn").addEventListener("click", () => {
    const list = getConsultas();
    if (list.length) downloadFile(JSON.stringify(list, null, 2), "consultas_ingtelecom.json", "application/json");
  });

  document.getElementById("exportTxtBtn").addEventListener("click", () => {
    const list = getConsultas();
    if (!list.length) return;
    const txt = list.map((c, i) => `#${i + 1} | ${c.date}\nNombre: ${c.name} (${c.email})\nTema: ${c.topic}\nMensaje: ${c.message}\n${"-".repeat(45)}`).join("\n\n");
    downloadFile(txt, "consultas_ingtelecom.txt", "text/plain;charset=utf-8");
  });

  document.getElementById("clearInboxBtn").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    renderInbox();
  });

  renderInbox();
})();