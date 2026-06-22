/* ================================================================
   script.js  |  ApexPlanet Internship — Task 2
   ================================================================
   MODULES
   ───────
   A. Utilities          — DOM helpers, toast, year
   B. Contact Form       — validation, submission, reset
   C. To-Do List         — add, toggle, delete, filter, render
   D. Stats Strip        — live counter updates
   E. Navigation         — hamburger, scroll-shadow, active links
   F. Scroll Reveal      — fade-in on scroll (IntersectionObserver)
   G. Init               — wire everything on DOMContentLoaded
================================================================ */

'use strict';


/* ================================================================
   A. UTILITIES
================================================================ */

/**
 * qs(selector, context?)
 * Shorthand for document.querySelector / context.querySelector
 */
const qs = (sel, ctx = document) => ctx.querySelector(sel);

/**
 * qsa(selector, context?)
 * Shorthand — returns a real Array (not NodeList)
 */
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/**
 * showToast(message, type)
 * Displays a temporary notification in the bottom-right corner.
 *
 * @param {string} message  — text to show
 * @param {string} type     — 'ok' (green) | 'bad' (red) | '' (dark)
 */
function showToast(message, type = '') {
  const toast = qs('#toast');
  toast.textContent = message;
  // Reset classes then apply type
  toast.className = 'toast';
  if (type) toast.classList.add(type);
  toast.classList.add('show');

  // Clear any running timer so repeated calls reset the countdown
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 3200);
}

/**
 * setFooterYear()
 * Inserts the current year into the footer automatically.
 */
function setFooterYear() {
  const el = qs('#footerYear');
  if (el) el.textContent = new Date().getFullYear();
}


/* ================================================================
   B. CONTACT FORM
   ─────────────────────────────────────────────────────────────────
   Validation functions (pure — return boolean + update UI).
   Real-time feedback on blur; full validation on submit.
================================================================ */

/* ── Validation rules ─────────────────────────────────────────── */

const isEmpty   = v => v.trim().length === 0;
const emailRx   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmail   = v => emailRx.test(v.trim());
const phoneDigits = v => v.replace(/\D/g, '').length;

/* ── UI helpers ───────────────────────────────────────────────── */

/**
 * setError(groupId, errId, msg)
 * Marks a field group as invalid and shows an error message.
 */
function setError(groupId, errId, msg) {
  const grp = qs(`#${groupId}`);
  const err = qs(`#${errId}`);
  grp.classList.remove('has-success');
  grp.classList.add('has-error');
  err.textContent = msg;
}

/**
 * setSuccess(groupId, errId)
 * Marks a field group as valid and clears the error message.
 */
function setSuccess(groupId, errId) {
  const grp = qs(`#${groupId}`);
  const err = qs(`#${errId}`);
  grp.classList.remove('has-error');
  grp.classList.add('has-success');
  err.textContent = '';
}

/**
 * clearState(groupId, errId)
 * Removes both valid and invalid styling (neutral state on input).
 */
function clearState(groupId, errId) {
  const grp = qs(`#${groupId}`);
  const err = qs(`#${errId}`);
  grp.classList.remove('has-error', 'has-success');
  err.textContent = '';
}

/* ── Individual field validators ──────────────────────────────── */

/** Validates the Full Name field. Returns true if valid. */
function validateName() {
  const val = qs('#inp-name').value;
  if (isEmpty(val)) {
    setError('grpName', 'err-name', 'Full name is required.');
    return false;
  }
  if (val.trim().length < 2) {
    setError('grpName', 'err-name', 'Name must be at least 2 characters.');
    return false;
  }
  setSuccess('grpName', 'err-name');
  return true;
}

/** Validates the Email field. Returns true if valid. */
function validateEmail() {
  const val = qs('#inp-email').value;
  if (isEmpty(val)) {
    setError('grpEmail', 'err-email', 'Email address is required.');
    return false;
  }
  if (!isEmail(val)) {
    setError('grpEmail', 'err-email', 'Enter a valid email (e.g. user@example.com).');
    return false;
  }
  setSuccess('grpEmail', 'err-email');
  return true;
}

/** Validates the Phone field. Returns true if valid. */
function validatePhone() {
  const val = qs('#inp-phone').value;
  if (isEmpty(val)) {
    setError('grpPhone', 'err-phone', 'Phone number is required.');
    return false;
  }
  const digits = phoneDigits(val);
  if (digits < 7 || digits > 15) {
    setError('grpPhone', 'err-phone', 'Enter a valid phone number (7–15 digits).');
    return false;
  }
  setSuccess('grpPhone', 'err-phone');
  return true;
}

/** Validates the Message textarea. Returns true if valid. */
function validateMessage() {
  const val = qs('#inp-message').value;
  if (isEmpty(val)) {
    setError('grpMessage', 'err-message', 'Message is required.');
    return false;
  }
  if (val.trim().length < 10) {
    setError('grpMessage', 'err-message', 'Message must be at least 10 characters.');
    return false;
  }
  setSuccess('grpMessage', 'err-message');
  return true;
}

/* ── Character counter ────────────────────────────────────────── */

/**
 * setupCharCounter()
 * Listens to the message textarea and updates the counter below it.
 * Changes color when approaching/at the 500-char limit.
 */
function setupCharCounter() {
  const ta      = qs('#inp-message');
  const counter = qs('#msgCounter');
  const MAX     = 500;

  ta.addEventListener('input', () => {
    const len = ta.value.length;
    counter.textContent = `${len} / ${MAX}`;
    counter.className   = 'f-counter';
    if (len >= MAX)          counter.classList.add('limit');
    else if (len >= MAX * 0.85) counter.classList.add('warn');
  });
}

/* ── Real-time (blur) validation ──────────────────────────────── */

/**
 * setupBlurValidation()
 * Each field is validated when the user leaves it (blur).
 * Invalid state is cleared immediately when the user starts typing.
 */
function setupBlurValidation() {
  // Validate on blur (when user leaves the field)
  qs('#inp-name').addEventListener('blur',    validateName);
  qs('#inp-email').addEventListener('blur',   validateEmail);
  qs('#inp-phone').addEventListener('blur',   validatePhone);
  qs('#inp-message').addEventListener('blur', validateMessage);

  // Clear error while user is actively typing (better UX)
  ['name','email','phone'].forEach(id => {
    qs(`#inp-${id}`).addEventListener('input', () => clearState(`grp${cap(id)}`, `err-${id}`));
  });
  qs('#inp-message').addEventListener('input', () => clearState('grpMessage', 'err-message'));
}

/* ── Helper: capitalise first letter ──── */
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ── Form submission ──────────────────────────────────────────── */

/**
 * handleSubmit(e)
 * Runs all validators; if all pass, simulates an API call.
 */
function handleSubmit(e) {
  e.preventDefault();

  // Run all four validators and collect boolean results
  const valid = [
    validateName(),
    validateEmail(),
    validatePhone(),
    validateMessage(),
  ].every(Boolean); // true only if ALL are true

  if (!valid) {
    // Scroll the first error into view for usability
    const firstErr = qs('.f-group.has-error');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('Please fix the highlighted errors.', 'bad');
    return;
  }

  // ── Simulate async form submission ──
  const btn      = qs('#submitBtn');
  const label    = btn.querySelector('.btn-label');

  btn.disabled   = true;
  label.textContent = 'Sending…';

  // After 1.3s, show success screen
  setTimeout(() => {
    qs('#contactForm').hidden  = true;
    qs('#formSuccess').hidden  = false;
    btn.disabled               = false;
    label.textContent          = 'Send Message';
    showToast('Message sent successfully! 🎉', 'ok');
  }, 1300);
}

/**
 * resetForm()
 * Returns the form to its initial state after success screen.
 */
function resetForm() {
  const form = qs('#contactForm');
  form.reset();

  // Remove all validation styling
  qsa('.f-group').forEach(g => g.classList.remove('has-error', 'has-success'));
  qsa('.f-err').forEach(p => p.textContent = '');
  qs('#msgCounter').textContent = '0 / 500';

  // Swap views
  form.hidden               = false;
  qs('#formSuccess').hidden = true;
}

/* ── Wire up the form module ──────────────────────────────────── */
function initContactForm() {
  setupCharCounter();
  setupBlurValidation();
  qs('#contactForm').addEventListener('submit', handleSubmit);
  qs('#resetBtn').addEventListener('click', resetForm);
}


/* ================================================================
   C. TO-DO LIST
   ─────────────────────────────────────────────────────────────────
   Data structure: tasks[] — array of { id, text, done }
   No localStorage; state lives in memory for this task.
================================================================ */

/** @type {{ id: number, text: string, done: boolean }[]} */
let tasks = [];

/** Current active filter: 'all' | 'active' | 'done' */
let activeFilter = 'all';

/* ── CRUD operations ──────────────────────────────────────────── */

/**
 * addTask(text)
 * Creates a new task object, prepends it to tasks[], re-renders.
 */
function addTask(text) {
  const trimmed = text.trim();

  // Guard: must have content
  if (!trimmed) {
    showToast('Please type a task first.', 'bad');
    return;
  }
  // Guard: reasonable length
  if (trimmed.length > 120) {
    showToast('Task too long (max 120 characters).', 'bad');
    return;
  }

  tasks.unshift({
    id:   Date.now(),        // millisecond timestamp = unique ID
    text: trimmed,
    done: false,
  });

  renderTasks();
  updateStats();
  showToast(`Added: "${trimmed}"`, 'ok');
}

/**
 * toggleTask(id)
 * Flips the done state for the task with the given id.
 */
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  renderTasks();
  updateStats();
  showToast(task.done ? '✅ Task completed!' : '↩ Marked as active.');
}

/**
 * deleteTask(id)
 * Animates the item out, then removes it from the array.
 */
function deleteTask(id) {
  const li = qs(`[data-task-id="${id}"]`);
  if (!li) return;

  // Add CSS removing class (slide-out animation)
  li.classList.add('removing');

  // Remove from array after animation completes (~280ms)
  setTimeout(() => {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
    updateStats();
  }, 280);

  showToast('Task removed.');
}

/**
 * clearDone()
 * Removes all completed tasks at once.
 */
function clearDone() {
  const count = tasks.filter(t => t.done).length;
  if (count === 0) { showToast('No completed tasks to clear.'); return; }

  tasks = tasks.filter(t => !t.done);
  renderTasks();
  updateStats();
  showToast(`Cleared ${count} completed task${count !== 1 ? 's' : ''}.`);
}

/* ── Filtering ────────────────────────────────────────────────── */

/**
 * filteredTasks()
 * Returns the tasks array filtered by activeFilter.
 */
function filteredTasks() {
  if (activeFilter === 'active') return tasks.filter(t => !t.done);
  if (activeFilter === 'done')   return tasks.filter(t =>  t.done);
  return tasks; // 'all'
}

/* ── Rendering ────────────────────────────────────────────────── */

/**
 * makeLi(task)
 * Builds and returns a <li> DOM element for a single task.
 * Uses createElement for XSS safety (no innerHTML with user data).
 */
function makeLi(task) {
  // <li class="task-item [done]" data-task-id="...">
  const li = document.createElement('li');
  li.className = `task-item${task.done ? ' done' : ''}`;
  li.dataset.taskId = task.id;

  // Circular checkbox button
  const check = document.createElement('button');
  check.className = 'task-check';
  check.setAttribute('aria-label', task.done ? 'Mark as active' : 'Mark as done');
  check.textContent = task.done ? '✓' : '';
  check.addEventListener('click', () => toggleTask(task.id));

  // Task text span
  const txt = document.createElement('span');
  txt.className   = 'task-txt';
  txt.textContent = task.text;   // textContent is XSS-safe

  // Delete button
  const del = document.createElement('button');
  del.className = 'task-del';
  del.setAttribute('aria-label', `Delete: ${task.text}`);
  del.textContent = '✕';
  del.addEventListener('click', () => deleteTask(task.id));

  li.append(check, txt, del);
  return li;
}

/**
 * renderTasks()
 * Clears and re-builds the task list based on activeFilter.
 * Also updates the panel meta text, empty state, and footer.
 */
function renderTasks() {
  const list       = qs('#taskList');
  const emptyState = qs('#emptyState');
  const footer     = qs('#todoFooter');
  const metaText   = qs('#taskMetaText');
  const remaining  = qs('#remainCount');

  const visible = filteredTasks();

  // Clear the list
  list.innerHTML = '';

  if (visible.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    const frag = document.createDocumentFragment(); // batch DOM update
    visible.forEach(t => frag.appendChild(makeLi(t)));
    list.appendChild(frag);
  }

  // Update panel header meta
  const doneCount   = tasks.filter(t => t.done).length;
  const activeCount = tasks.filter(t => !t.done).length;
  metaText.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''} \u2022 ${doneCount} completed`;

  // Show/hide footer
  footer.hidden = tasks.length === 0;
  remaining.textContent = `${activeCount} remaining`;
}

/* ── Filter tabs ──────────────────────────────────────────────── */

/**
 * setupFilterTabs()
 * Adds click listeners to the three filter buttons.
 */
function setupFilterTabs() {
  qsa('.f-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      // Deactivate all tabs
      qsa('.f-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      // Activate clicked tab
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      activeFilter = this.dataset.filter;
      renderTasks();
    });
  });
}

/* ── Wire up the To-Do module ─────────────────────────────────── */

/**
 * initTodo()
 * Seeds sample tasks and binds the add input + button.
 */
function initTodo() {
  const input    = qs('#taskInput');
  const addBtn   = qs('#addBtn');
  const clearBtn = qs('#clearDoneBtn');

  // Add on button click
  addBtn.addEventListener('click', () => {
    addTask(input.value);
    input.value = '';
    input.focus();
  });

  // Add on Enter key
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      addTask(input.value);
      input.value = '';
    }
  });

  // Clear completed tasks
  clearBtn.addEventListener('click', clearDone);

  // Setup filter tabs
  setupFilterTabs();

  // ── Seed three sample tasks so the list isn't empty ──
  const seeds = [
    'Complete HTML structure for Task 2',
    'Style the layout using Flexbox and Grid',
    'Add JavaScript form validation',
  ];
  seeds.forEach(text =>
    tasks.push({ id: Date.now() + Math.random(), text, done: false })
  );
  // Mark first seed as done for a realistic demo
  tasks[0].done = true;

  renderTasks();
}


/* ================================================================
   D. STATS STRIP  —  live counter updates
================================================================ */

/**
 * updateStats()
 * Recalculates and displays total, done, and percentage values.
 * Called after every task add / toggle / delete.
 */
function updateStats() {
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);

  qs('#statTotal').textContent = total;
  qs('#statDone').textContent  = done;
  qs('#statPct').textContent   = `${pct}%`;
}


/* ================================================================
   E. NAVIGATION
   ─────────────────────────────────────────────────────────────────
   - Hamburger open/close with animated ✕
   - Navbar box-shadow increases on scroll
   - Active link highlighted based on scroll position
================================================================ */

function initNav() {
  const hamburger = qs('#hamburger');
  const mobileNav = qs('#mobileNav');
  const navbar    = qs('#navbar');

  /* ── Hamburger toggle ── */
  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileNav.setAttribute('aria-hidden',   String(!isOpen));
  });

  /* ── Close mobile nav from module scope (called by onclick in HTML) ── */
  window.closeMobileNav = () => {
    mobileNav.classList.remove('is-open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
  };

  /* ── Navbar shadow on scroll ── */
  const updateNavShadow = () => {
    if (window.scrollY > 60) {
      navbar.style.boxShadow = '0 4px 24px rgba(108,99,255,.14)';
    } else {
      navbar.style.boxShadow = '';
    }
  };
  window.addEventListener('scroll', updateNavShadow, { passive: true });

  /* ── Active nav link on scroll (IntersectionObserver) ── */
  const sections = qsa('section[id], div.stats-strip');
  const navLinks = qsa('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(l => l.style.color = '');
      const match = qs(`nav a[href="#${entry.target.id}"]`);
      if (match) match.style.color = 'var(--purple)';
    });
  }, { threshold: 0.45 });

  sections.forEach(s => observer.observe(s));
}


/* ================================================================
   F. SCROLL REVEAL
   Fades + slides elements in when they enter the viewport.
   Elements need the CSS class  .reveal  in the HTML.
   (Or we can add it programmatically here for specific targets.)
================================================================ */

function initScrollReveal() {
  // Add .reveal to panels and stat items so they animate in
  const targets = qsa('.panel, .strip-item, .hero-tags, .hero-actions');
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.07}s`; // stagger
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // fire once
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => observer.observe(el));
}


/* ================================================================
   G. INIT  —  Entry point
   Everything is wired up here after the DOM is fully parsed.
================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // 1. Set footer year
  setFooterYear();

  // 2. Contact form — validation + submission
  initContactForm();

  // 3. To-Do list — add / toggle / delete / filter
  initTodo();

  // 4. Update stats bar with seed task data
  updateStats();

  // 5. Navigation — hamburger, scroll effects
  initNav();

  // 6. Scroll-reveal animations
  initScrollReveal();

  // 7. Developer greeting in the browser console
  console.log(
    '%c✦ DevHub — ApexPlanet Internship Task 2',
    'font-size:15px; font-weight:bold; color:#6c63ff;'
  );
  console.log(
    '%cContact Form Validation + Dynamic To-Do | HTML • CSS • Vanilla JS',
    'color:#00bfa5; font-size:13px;'
  );
});
