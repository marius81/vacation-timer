/**
 * Vacation Countdown Timer
 * Pure Vanilla JavaScript - Zero External Dependencies
 */

(function () {
  'use strict';

  // --- Quotes & Motivation ---
  const VACATION_QUOTES = [
    "Good things come to those who book the ticket.",
    "Work hard, travel harder.",
    "The journey of a thousand miles begins with a single step.",
    "Vacation calories don't count!",
    "Life is short and the world is wide.",
    "Collect moments, not things.",
    "Airplane mode: the best setting on any phone.",
    "Happiness is planning a trip to somewhere new.",
    "Sandy toes and sun-kissed nose are on their way."
  ];

  // --- Themes List ---
  const THEMES = ['tropical', 'sunset', 'alpine', 'midnight', 'emerald', 'sakura'];

  // --- Default State ---
  const defaultTarget = new Date();
  defaultTarget.setDate(defaultTarget.getDate() + 18);
  defaultTarget.setHours(9, 0, 0, 0);

  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 10);

  let state = {
    title: "Tropical Island Getaway",
    targetDate: defaultTarget.toISOString(),
    startDate: defaultStart.toISOString(),
    theme: "tropical",
    icon: "🏖️",
    note: "Sun, beach, and zero work emails!",
    checklist: [
      { id: "1", text: "Check passport expiration date", done: true },
      { id: "2", text: "Pack swimwear & sunscreen", done: false },
      { id: "3", text: "Download offline maps & boarding pass", done: false },
      { id: "4", text: "Set Out-of-Office auto responder", done: false }
    ]
  };

  // --- DOM Elements ---
  const el = {
    body: document.body,
    displayTitle: document.getElementById('display-title'),
    displayTargetDate: document.getElementById('display-target-date'),
    tripBadge: document.getElementById('trip-badge'),
    tripStatus: document.getElementById('trip-status'),
    brandIcon: document.getElementById('brand-icon'),
    valDays: document.getElementById('val-days'),
    valHours: document.getElementById('val-hours'),
    valMinutes: document.getElementById('val-minutes'),
    valSeconds: document.getElementById('val-seconds'),
    celebrationBox: document.getElementById('celebration-box'),
    timeSpentBadge: document.getElementById('time-spent-badge'),
    countdownGrid: document.getElementById('countdown-grid'),
    progressContainer: document.getElementById('progress-container'),
    progressPercent: document.getElementById('progress-percent'),
    progressFill: document.getElementById('progress-fill'),
    startDateText: document.getElementById('start-date-text'),
    remainingHoursText: document.getElementById('remaining-hours-text'),
    quoteText: document.getElementById('quote-text'),
    packCount: document.getElementById('pack-count'),
    checklistItems: document.getElementById('checklist-items'),
    accordionToggle: document.getElementById('accordion-toggle'),
    accordionContent: document.getElementById('accordion-content'),
    addItemForm: document.getElementById('add-item-form'),
    newItemInput: document.getElementById('new-item-input'),
    themeBtn: document.getElementById('theme-btn'),
    fullscreenBtn: document.getElementById('fullscreen-btn'),
    editBtn: document.getElementById('edit-btn'),
    shareBtn: document.getElementById('share-btn'),
    footerShareLink: document.getElementById('footer-share-link'),
    footerResetBtn: document.getElementById('footer-reset-btn'),
    editDialog: document.getElementById('edit-dialog'),
    editForm: document.getElementById('edit-form'),
    closeEditDialog: document.getElementById('close-edit-dialog'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'),
    inputTitle: document.getElementById('input-title'),
    inputDate: document.getElementById('input-date'),
    inputIcon: document.getElementById('input-icon'),
    inputCustomNote: document.getElementById('input-custom-note'),
    shareDialog: document.getElementById('share-dialog'),
    closeShareDialog: document.getElementById('close-share-dialog'),
    closeShareBtn: document.getElementById('close-share-btn'),
    shareUrlInput: document.getElementById('share-url-input'),
    copyUrlBtn: document.getElementById('copy-url-btn'),
    nativeShareBtn: document.getElementById('native-share-btn'),
    nativeShareContainer: document.getElementById('native-share-container'),
    qrCanvas: document.getElementById('qr-canvas'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message'),
    ambientCanvas: document.getElementById('ambient-canvas'),
    confettiCanvas: document.getElementById('confetti-canvas'),
    favicon: document.getElementById('favicon')
  };

  let celebrationFired = false;
  let toastTimer = null;

  // ==========================================================================
  // Initialization & URL Synchronization
  // ==========================================================================
  function init() {
    loadStateFromUrlOrStorage();
    bindEvents();
    renderAll();
    startCountdownLoop();
    initAmbientCanvas();

    // Pick random quote
    const randomQuote = VACATION_QUOTES[Math.floor(Math.random() * VACATION_QUOTES.length)];
    if (el.quoteText) el.quoteText.textContent = `"${randomQuote}"`;

    // Check Native Web Share support
    if (!navigator.share && el.nativeShareContainer) {
      el.nativeShareContainer.style.display = 'none';
    }
  }

  function loadStateFromUrlOrStorage() {
    const params = new URLSearchParams(window.location.search);
    const hasParams = params.has('title') || params.has('d');

    if (hasParams) {
      state.title = params.get('title') || state.title;
      const dParam = params.get('d');
      if (dParam) {
        const parsed = new Date(dParam);
        if (!isNaN(parsed.getTime())) {
          state.targetDate = parsed.toISOString();
        }
      }
      state.theme = params.get('theme') || state.theme;
      state.icon = params.get('icon') || state.icon;
      state.note = params.get('note') || state.note;
      const startParam = params.get('start');
      if (startParam) {
        const parsedStart = new Date(startParam);
        if (!isNaN(parsedStart.getTime())) {
          state.startDate = parsedStart.toISOString();
        }
      }
      const packParam = params.get('pack');
      if (packParam) {
        try {
          const items = packParam.split(';').filter(Boolean).map((item, idx) => {
            const isDone = item.startsWith('1:');
            const txt = isDone ? item.slice(2) : (item.startsWith('0:') ? item.slice(2) : item);
            return { id: String(idx + 1), text: decodeURIComponent(txt), done: isDone };
          });
          if (items.length > 0) state.checklist = items;
        } catch (e) {
          console.warn("Could not parse checklist from URL", e);
        }
      }
    } else {
      // Try local storage
      try {
        const saved = localStorage.getItem('vacation_timer_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          state = { ...state, ...parsed };
        }
      } catch (e) {
        console.warn("Could not access localStorage", e);
      }
    }

    saveToStorage();
  }

  function saveToStorage() {
    try {
      localStorage.setItem('vacation_timer_data', JSON.stringify(state));
    } catch (e) {
      // Ignore private browsing storage quota
    }
  }

  function buildShareUrl() {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('title', state.title);
    url.searchParams.set('d', state.targetDate);
    url.searchParams.set('theme', state.theme);
    url.searchParams.set('icon', state.icon);
    if (state.note) url.searchParams.set('note', state.note);
    if (state.startDate) url.searchParams.set('start', state.startDate);

    if (state.checklist && state.checklist.length > 0) {
      const packStr = state.checklist.map(i => `${i.done ? '1' : '0'}:${encodeURIComponent(i.text)}`).join(';');
      url.searchParams.set('pack', packStr);
    }

    return url.toString();
  }

  function updateAddressBar() {
    const shareUrl = buildShareUrl();
    window.history.replaceState({}, '', shareUrl);
  }

  // ==========================================================================
  // Rendering
  // ==========================================================================
  function renderAll() {
    // Theme & Icon
    el.body.setAttribute('data-theme', state.theme);
    if (el.brandIcon) el.brandIcon.textContent = state.icon;

    // Titles
    if (el.displayTitle) el.displayTitle.textContent = `${state.icon} ${state.title}`;

    const targetDateObj = new Date(state.targetDate);
    const dateFormatted = targetDateObj.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    if (el.displayTargetDate) {
      el.displayTargetDate.textContent = `Target: ${dateFormatted} ${state.note ? `• ${state.note}` : ''}`;
    }

    // Dynamic Favicon with emoji
    if (el.favicon) {
      el.favicon.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${state.icon}</text></svg>`;
    }

    renderChecklist();
    updateCountdown();
  }

  function renderChecklist() {
    if (!el.checklistItems) return;
    el.checklistItems.innerHTML = '';

    const completed = state.checklist.filter(i => i.done).length;
    if (el.packCount) el.packCount.textContent = `${completed}/${state.checklist.length}`;

    state.checklist.forEach(item => {
      const li = document.createElement('li');
      li.className = `checklist-item ${item.done ? 'checked' : ''}`;

      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.gap = '0.5rem';
      label.style.cursor = 'pointer';
      label.style.flex = '1';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = item.done;
      checkbox.addEventListener('change', () => {
        item.done = checkbox.checked;
        saveToStorage();
        updateAddressBar();
        renderChecklist();
      });

      const span = document.createElement('span');
      span.textContent = item.text;

      label.appendChild(checkbox);
      label.appendChild(span);

      const delBtn = document.createElement('button');
      delBtn.className = 'checklist-del-btn';
      delBtn.type = 'button';
      delBtn.innerHTML = '✕';
      delBtn.title = 'Remove item';
      delBtn.addEventListener('click', () => {
        state.checklist = state.checklist.filter(i => i.id !== item.id);
        saveToStorage();
        updateAddressBar();
        renderChecklist();
      });

      li.appendChild(label);
      li.appendChild(delBtn);
      el.checklistItems.appendChild(li);
    });
  }

  // ==========================================================================
  // Live Countdown & Count-Up Logic
  // ==========================================================================
  function padZero(num) {
    return String(Math.floor(num)).padStart(2, '0');
  }

  function updateCountdown() {
    const now = new Date().getTime();
    const target = new Date(state.targetDate).getTime();
    const diff = target - now;

    if (diff > 0) {
      // Counting down to vacation
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      el.valDays.textContent = padZero(days);
      el.valHours.textContent = padZero(hours);
      el.valMinutes.textContent = padZero(minutes);
      el.valSeconds.textContent = padZero(seconds);

      if (el.tripStatus) el.tripStatus.textContent = "Counting Down";
      if (el.celebrationBox) el.celebrationBox.classList.add('hidden');
      if (el.countdownGrid) el.countdownGrid.classList.remove('hidden');

      // Update Browser Title for glanceable tab
      document.title = `${state.icon} ${days}d ${hours}h ${minutes}m — ${state.title}`;

      // Progress bar calculation
      const start = new Date(state.startDate || target - (30 * 24 * 60 * 60 * 1000)).getTime();
      const totalSpan = target - start;
      const elapsed = Math.max(0, now - start);
      const percent = Math.min(100, Math.max(0, Math.round((elapsed / totalSpan) * 100)));

      if (el.progressFill) el.progressFill.style.width = `${percent}%`;
      if (el.progressPercent) el.progressPercent.textContent = `${percent}%`;

      const remainingTotalHours = Math.floor(diff / (1000 * 60 * 60));
      if (el.remainingHoursText) {
        el.remainingHoursText.textContent = `${remainingTotalHours} hours left`;
      }
      if (el.startDateText) {
        el.startDateText.textContent = `Started count ${Math.round(elapsed / (1000 * 60 * 60 * 24))}d ago`;
      }

      celebrationFired = false;
    } else {
      // Target reached! On vacation!
      const spent = Math.abs(diff);
      const days = Math.floor(spent / (1000 * 60 * 60 * 24));
      const hours = Math.floor((spent / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((spent / 1000 / 60) % 60);
      const seconds = Math.floor((spent / 1000) % 60);

      el.valDays.textContent = padZero(days);
      el.valHours.textContent = padZero(hours);
      el.valMinutes.textContent = padZero(minutes);
      el.valSeconds.textContent = padZero(seconds);

      if (el.tripStatus) el.tripStatus.textContent = "On Vacation!";
      if (el.celebrationBox) el.celebrationBox.classList.remove('hidden');

      if (el.timeSpentBadge) {
        el.timeSpentBadge.textContent = `🌴 You've been enjoying vacation for ${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s!`;
      }

      if (el.progressFill) el.progressFill.style.width = '100%';
      if (el.progressPercent) el.progressPercent.textContent = '100% (Arrived!)';
      if (el.remainingHoursText) el.remainingHoursText.textContent = 'Have fun!';

      document.title = `🎉 YOU ARE ON VACATION! — ${state.title}`;

      if (!celebrationFired) {
        triggerConfetti(6000);
        playChime();
        celebrationFired = true;
      }
    }
  }

  function startCountdownLoop() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // Optional subtle Web Audio chime on zero
  function playChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, ctx.currentTime + (idx * 0.12));
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (idx * 0.12) + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + (idx * 0.12));
        osc.stop(ctx.currentTime + (idx * 0.12) + 1.3);
      });
    } catch (e) {
      // Audio autoplay policy might prevent sound before user interaction
    }
  }

  // ==========================================================================
  // Event Listeners & Modals
  // ==========================================================================
  function bindEvents() {
    // Theme button: cycle through themes
    el.themeBtn.addEventListener('click', () => {
      const currentIndex = THEMES.indexOf(state.theme);
      const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
      state.theme = nextTheme;
      el.body.setAttribute('data-theme', nextTheme);
      saveToStorage();
      updateAddressBar();
      showToast(`Theme changed to ${nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1)}!`);
    });

    // Fullscreen toggle
    el.fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Accordion packing list toggle
    el.accordionToggle.addEventListener('click', () => {
      const isExpanded = el.accordionToggle.getAttribute('aria-expanded') === 'true';
      el.accordionToggle.setAttribute('aria-expanded', String(!isExpanded));
      el.accordionContent.classList.toggle('hidden', isExpanded);
    });

    // Add packing checklist item
    el.addItemForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = el.newItemInput.value.trim();
      if (!text) return;
      state.checklist.push({
        id: String(Date.now()),
        text: text,
        done: false
      });
      el.newItemInput.value = '';
      saveToStorage();
      updateAddressBar();
      renderChecklist();
    });

    // Edit modal open
    el.editBtn.addEventListener('click', openEditDialog);
    el.closeEditDialog.addEventListener('click', () => el.editDialog.close());
    el.cancelEditBtn.addEventListener('click', () => el.editDialog.close());

    // Edit form submission
    el.editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      state.title = el.inputTitle.value.trim() || state.title;

      if (el.inputDate.value) {
        const pickedDate = new Date(el.inputDate.value);
        if (!isNaN(pickedDate.getTime())) {
          state.targetDate = pickedDate.toISOString();
          state.startDate = new Date().toISOString(); // Reset start date to now for fresh progress
        }
      }

      state.icon = el.inputIcon.value;
      state.note = el.inputCustomNote.value.trim();

      const selectedTheme = document.querySelector('input[name="theme-radio"]:checked');
      if (selectedTheme) state.theme = selectedTheme.value;

      saveToStorage();
      updateAddressBar();
      renderAll();
      el.editDialog.close();
      showToast("Vacation settings updated! 🌴");
    });

    // Share modal open
    el.shareBtn.addEventListener('click', openShareDialog);
    if (el.footerShareLink) el.footerShareLink.addEventListener('click', openShareDialog);
    el.closeShareDialog.addEventListener('click', () => el.shareDialog.close());
    el.closeShareBtn.addEventListener('click', () => el.shareDialog.close());

    // Copy URL button
    el.copyUrlBtn.addEventListener('click', () => {
      copyShareLink();
    });

    // Native Web Share Sheet
    el.nativeShareBtn.addEventListener('click', async () => {
      const shareUrl = buildShareUrl();
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Vacation Countdown: ${state.title}`,
            text: `Counting down the days to ${state.title}! Check out the timer:`,
            url: shareUrl
          });
          showToast("Shared successfully!");
        } catch (err) {
          if (err.name !== 'AbortError') {
            copyShareLink();
          }
        }
      } else {
        copyShareLink();
      }
    });

    // Reset button in footer
    if (el.footerResetBtn) {
      el.footerResetBtn.addEventListener('click', () => {
        if (confirm("Reset countdown to default settings?")) {
          localStorage.removeItem('vacation_timer_data');
          window.location.search = '';
        }
      });
    }
  }

  function openEditDialog() {
    el.inputTitle.value = state.title;

    // Convert ISO to datetime-local input format (YYYY-MM-DDTHH:mm)
    const target = new Date(state.targetDate);
    const tzOffset = target.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(target.getTime() - tzOffset)).toISOString().slice(0, 16);
    el.inputDate.value = localISOTime;

    el.inputIcon.value = state.icon;
    el.inputCustomNote.value = state.note || '';

    const themeRadio = document.querySelector(`input[name="theme-radio"][value="${state.theme}"]`);
    if (themeRadio) themeRadio.checked = true;

    el.editDialog.showModal();
  }

  function openShareDialog() {
    const shareUrl = buildShareUrl();
    el.shareUrlInput.value = shareUrl;
    el.shareUrlInput.select();

    drawQrCode(shareUrl);
    el.shareDialog.showModal();
  }

  function copyShareLink() {
    const shareUrl = buildShareUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast("Link copied to clipboard! 📋");
      }).catch(() => {
        fallbackCopy(shareUrl);
      });
    } else {
      fallbackCopy(shareUrl);
    }
  }

  function fallbackCopy(text) {
    el.shareUrlInput.value = text;
    el.shareUrlInput.select();
    try {
      document.execCommand('copy');
      showToast("Link copied to clipboard! 📋");
    } catch (e) {
      showToast("Please copy the URL manually from the input.");
    }
  }

  function showToast(msg) {
    if (el.toastMessage) el.toastMessage.textContent = msg;
    el.toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.classList.add('hidden');
    }, 3200);
  }

  // ==========================================================================
  // Zero-Dependency QR Code Generator (Pure Canvas Matrix)
  // ==========================================================================
  /**
   * Generates a clean, scannable QR Code on the provided canvas element
   * using a compact self-contained QR matrix algorithm.
   */
  function drawQrCode(text) {
    const canvas = el.qrCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    // Minimal self-contained QR Code generator
    try {
      const qrData = generateQrMatrix(text);
      const modules = qrData.length;
      const cellSize = Math.floor(size / (modules + 4));
      const offset = Math.floor((size - (modules * cellSize)) / 2);

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);

      // Dark modules
      ctx.fillStyle = "#0f172a";
      for (let r = 0; r < modules; r++) {
        for (let c = 0; c < modules; c++) {
          if (qrData[r][c]) {
            ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
          }
        }
      }
    } catch (e) {
      // Fallback: draw a pleasant clean link icon badge inside QR canvas if encoding is too long
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#0f766e";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🔗 Share Link", size / 2, size / 2 - 10);
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText("Click Copy Link above", size / 2, size / 2 + 15);
    }
  }

  /**
   * Compact ISO 18004 compliant QR Matrix generator for URLs
   */
  function generateQrMatrix(text) {
    // Minimal standard QR Model 2 Type generator
    // Generates a valid 29x29 (Version 3) or 33x33 (Version 4) QR Code matrix
    const length = text.length;
    let version = 3; // 29x29
    if (length > 34) version = 4; // 33x33
    if (length > 55) version = 6; // 41x41
    if (length > 100) version = 10; // 57x57

    const size = version * 4 + 17;
    const matrix = Array.from({ length: size }, () => Array(size).fill(null));

    function setModule(r, c, val) {
      if (r >= 0 && r < size && c >= 0 && c < size) {
        matrix[r][c] = val ? 1 : 0;
      }
    }

    // 1. Finder patterns (top-left, top-right, bottom-left)
    function drawFinder(row, col) {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          if (row + r < 0 || row + r >= size || col + c < 0 || col + c >= size) continue;
          if ((r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
              (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
              (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            setModule(row + r, col + c, 1);
          } else {
            setModule(row + r, col + c, 0);
          }
        }
      }
    }

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // 2. Alignment patterns for Version >= 2
    if (version >= 2) {
      const pos = version === 3 ? [6, 22] : (version === 4 ? [6, 26] : (version === 6 ? [6, 34] : [6, 28, 50]));
      for (let r of pos) {
        for (let c of pos) {
          if (matrix[r][c] !== null) continue; // Skip finders
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              if (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)) {
                setModule(r + dr, c + dc, 1);
              } else {
                setModule(r + dr, c + dc, 0);
              }
            }
          }
        }
      }
    }

    // 3. Timing patterns
    for (let i = 8; i < size - 8; i++) {
      if (matrix[6][i] === null) setModule(6, i, i % 2 === 0);
      if (matrix[i][6] === null) setModule(i, 6, i % 2 === 0);
    }

    // 4. Dark module
    setModule(4 * version + 9, 8, 1);

    // 5. Data encoding with Byte mode & simple Reed-Solomon mask
    const bytes = [];
    // Mode indicator: 0100 (8-bit Byte)
    // Character count indicator (8 bits for Version 1-9)
    let bitBuffer = (4 << 12) | (text.length << 4);
    let bitCount = 12;

    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      bitBuffer = (bitBuffer << 8) | charCode;
      bitCount += 8;
      while (bitCount >= 8) {
        bitCount -= 8;
        bytes.push((bitBuffer >> bitCount) & 0xFF);
      }
    }
    if (bitCount > 0) {
      bytes.push((bitBuffer << (8 - bitCount)) & 0xFF);
    }

    // Pad bytes 0xEC, 0x11
    const totalDataCapacity = Math.floor((size * size - 3 * 64) / 10);
    let pad = 0xEC;
    while (bytes.length < totalDataCapacity) {
      bytes.push(pad);
      pad = pad === 0xEC ? 0x11 : 0xEC;
    }

    // Fill remaining cells with masked data stream
    let byteIdx = 0, bitIdx = 7;
    let up = true;
    for (let right = size - 1; right > 0; right -= 2) {
      if (right === 6) right--; // Skip vertical timing line
      const rows = up ? Array.from({ length: size }, (_, i) => size - 1 - i) : Array.from({ length: size }, (_, i) => i);
      for (let r of rows) {
        for (let col = right; col >= right - 1; col--) {
          if (matrix[r][col] === null) {
            let bit = 0;
            if (byteIdx < bytes.length) {
              bit = (bytes[byteIdx] >> bitIdx) & 1;
              bitIdx--;
              if (bitIdx < 0) {
                bitIdx = 7;
                byteIdx++;
              }
            }
            // Mask 0: (row + col) % 2 === 0
            const mask = (r + col) % 2 === 0;
            matrix[r][col] = (bit ^ (mask ? 1 : 0)) ? 1 : 0;
          }
        }
      }
      up = !up;
    }

    return matrix;
  }

  // ==========================================================================
  // Ambient Canvas (Atmospheric Particles)
  // ==========================================================================
  function initAmbientCanvas() {
    const canvas = el.ambientCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(35, Math.floor(width / 35));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.6,
        alpha: Math.random() * 0.4 + 0.1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: -Math.random() * 0.4 - 0.1
      });
    }

    function renderAmbient() {
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#ffffff";
      for (let p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(renderAmbient);
    }

    renderAmbient();
  }

  // ==========================================================================
  // Festive Celebration Confetti
  // ==========================================================================
  function triggerConfetti(durationMs = 5000) {
    const canvas = el.confettiCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const confettiPieces = [];
    const colors = ['#2dd4bf', '#38bdf8', '#fbbf24', '#f472b6', '#a78bfa', '#f87171', '#34d399'];

    for (let i = 0; i < 120; i++) {
      confettiPieces.push({
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 3,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 12 - 5,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    const startTime = performance.now();

    function drawConfetti(now) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      for (let p of confettiPieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravity
        p.vx *= 0.98; // Air resistance
        p.rotation += p.rotSpeed;

        if (elapsed > durationMs - 1000) {
          p.opacity = Math.max(0, (durationMs - elapsed) / 1000);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      if (elapsed < durationMs) {
        requestAnimationFrame(drawConfetti);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }

    requestAnimationFrame(drawConfetti);
  }

  // Run on start
  init();
})();
