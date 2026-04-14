const STORAGE_KEY = "quiet-focus-state-v1";
const MODES = {
  focus: { label: "Focus", minutes: 25, hint: "Stay with one task until the bell." },
  shortBreak: { label: "Short break", minutes: 5, hint: "Stand up, breathe, let your eyes rest." },
  longBreak: { label: "Long break", minutes: 15, hint: "Step away long enough to reset your pace." },
};
const RING_LENGTH = 2 * Math.PI * 92;

const elements = {
  todayDate: document.querySelector("#todayDate"),
  modeTitle: document.querySelector("#modeTitle"),
  modeHint: document.querySelector("#modeHint"),
  timeLabel: document.querySelector("#timeLabel"),
  timerDisplay: document.querySelector("#timerDisplay"),
  nextLabel: document.querySelector("#nextLabel"),
  progressCircle: document.querySelector("#progressCircle"),
  toggleTimer: document.querySelector("#toggleTimer"),
  resetTimer: document.querySelector("#resetTimer"),
  skipTimer: document.querySelector("#skipTimer"),
  modeTabs: [...document.querySelectorAll(".mode-tab")],
  intentionForm: document.querySelector("#intentionForm"),
  intentionInput: document.querySelector("#intentionInput"),
  intentionOutput: document.querySelector("#intentionOutput"),
  taskForm: document.querySelector("#taskForm"),
  taskInput: document.querySelector("#taskInput"),
  taskList: document.querySelector("#taskList"),
  taskSummary: document.querySelector("#taskSummary"),
  focusMinutes: document.querySelector("#focusMinutes"),
  shortBreakMinutes: document.querySelector("#shortBreakMinutes"),
  longBreakMinutes: document.querySelector("#longBreakMinutes"),
  focusCount: document.querySelector("#focusCount"),
  focusMinutesTotal: document.querySelector("#focusMinutesTotal"),
  tasksDoneCount: document.querySelector("#tasksDoneCount"),
};

let tickInterval = null;

const defaultState = () => ({
  mode: "focus",
  focusStreak: 0,
  durations: {
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
  },
  remainingSeconds: 25 * 60,
  isRunning: false,
  startedAt: null,
  startingSeconds: 25 * 60,
  intention: "",
  tasks: [],
  stats: {
    focusSessions: 0,
    focusedMinutes: 0,
    tasksCompleted: 0,
  },
});

let state = loadState();

init();

function init() {
  elements.progressCircle.style.strokeDasharray = `${RING_LENGTH}`;
  elements.todayDate.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  bindEvents();
  recoverRunningTimer();
  syncSettingsInputs();
  render();
}

function bindEvents() {
  elements.toggleTimer.addEventListener("click", toggleTimer);
  elements.resetTimer.addEventListener("click", resetTimer);
  elements.skipTimer.addEventListener("click", () => advanceMode(false));

  elements.modeTabs.forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });

  elements.intentionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.intention = elements.intentionInput.value.trim();
    persistState();
    render();
  });

  elements.taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = elements.taskInput.value.trim();
    if (!value) return;

    state.tasks.unshift({
      id: crypto.randomUUID(),
      text: value,
      done: false,
    });
    elements.taskInput.value = "";
    persistState();
    render();
  });

  const durationMap = {
    focusMinutes: "focus",
    shortBreakMinutes: "shortBreak",
    longBreakMinutes: "longBreak",
  };

  Object.entries(durationMap).forEach(([field, mode]) => {
    elements[field].addEventListener("change", () => updateDuration(mode, elements[field].value));
  });
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved) return defaultState();

    const merged = defaultState();
    return {
      ...merged,
      ...saved,
      durations: { ...merged.durations, ...saved.durations },
      stats: { ...merged.stats, ...saved.stats },
      tasks: Array.isArray(saved.tasks) ? saved.tasks : [],
    };
  } catch {
    return defaultState();
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function syncSettingsInputs() {
  elements.focusMinutes.value = state.durations.focus;
  elements.shortBreakMinutes.value = state.durations.shortBreak;
  elements.longBreakMinutes.value = state.durations.longBreak;
}

function recoverRunningTimer() {
  if (!state.isRunning || !state.startedAt) return;

  const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
  const remaining = Math.max(state.startingSeconds - elapsed, 0);

  if (remaining === 0) {
    completeInterval();
    return;
  }

  state.remainingSeconds = remaining;
  startTicker();
}

function toggleTimer() {
  if (state.isRunning) {
    pauseTimer();
    return;
  }

  state.isRunning = true;
  state.startedAt = Date.now();
  state.startingSeconds = state.remainingSeconds;
  startTicker();
  persistState();
  render();
}

function startTicker() {
  clearInterval(tickInterval);
  tickInterval = window.setInterval(() => {
    const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    const remaining = Math.max(state.startingSeconds - elapsed, 0);
    state.remainingSeconds = remaining;

    if (remaining === 0) {
      completeInterval();
      return;
    }

    render();
  }, 250);
}

function pauseTimer() {
  clearInterval(tickInterval);
  tickInterval = null;
  state.isRunning = false;
  state.startedAt = null;
  state.startingSeconds = state.remainingSeconds;
  persistState();
  render();
}

function resetTimer() {
  clearInterval(tickInterval);
  tickInterval = null;
  state.isRunning = false;
  state.startedAt = null;
  state.remainingSeconds = getModeSeconds(state.mode);
  state.startingSeconds = state.remainingSeconds;
  persistState();
  render();
}

function completeInterval() {
  clearInterval(tickInterval);
  tickInterval = null;

  if (state.mode === "focus") {
    state.stats.focusSessions += 1;
    state.stats.focusedMinutes += state.durations.focus;
    state.focusStreak += 1;
  }

  playChime();
  advanceMode();
}

function advanceMode() {
  state.isRunning = false;
  state.startedAt = null;
  const nextMode = getFollowingMode();

  state.mode = nextMode;
  state.remainingSeconds = getModeSeconds(nextMode);
  state.startingSeconds = state.remainingSeconds;

  if (state.mode === "longBreak") {
    state.focusStreak = 0;
  }

  persistState();
  render();
}

function setMode(mode) {
  if (!(mode in MODES)) return;

  clearInterval(tickInterval);
  tickInterval = null;
  state.mode = mode;
  state.isRunning = false;
  state.startedAt = null;
  state.remainingSeconds = getModeSeconds(mode);
  state.startingSeconds = state.remainingSeconds;
  persistState();
  render();
}

function updateDuration(mode, rawValue) {
  const numericValue = Number(rawValue);
  if (!Number.isFinite(numericValue)) return;

  const clamped = Math.max(1, Math.min(mode === "focus" ? 90 : mode === "shortBreak" ? 30 : 45, Math.round(numericValue)));
  state.durations[mode] = clamped;

  if (state.mode === mode) {
    state.remainingSeconds = clamped * 60;
    state.startingSeconds = state.remainingSeconds;
    state.isRunning = false;
    state.startedAt = null;
    clearInterval(tickInterval);
    tickInterval = null;
  }

  syncSettingsInputs();
  persistState();
  render();
}

function getModeSeconds(mode) {
  return state.durations[mode] * 60;
}

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getCompletionRatio() {
  const full = getModeSeconds(state.mode);
  const elapsed = full - state.remainingSeconds;
  return Math.min(Math.max(elapsed / full, 0), 1);
}

function render() {
  const modeMeta = MODES[state.mode];
  const ratio = getCompletionRatio();
  const nextMode = getFollowingMode();
  const tasksDone = state.tasks.filter((task) => task.done).length;

  elements.modeTitle.textContent = modeMeta.label;
  elements.modeHint.textContent = modeMeta.hint;
  elements.timeLabel.textContent = state.isRunning ? "In progress" : "Ready";
  elements.timerDisplay.textContent = formatClock(state.remainingSeconds);
  elements.nextLabel.textContent = state.mode === "focus"
    ? `Next: ${MODES[nextMode].label.toLowerCase()}`
    : "Next: focus";
  elements.toggleTimer.textContent = state.isRunning ? "Pause" : "Start";
  elements.progressCircle.style.strokeDashoffset = `${RING_LENGTH * (1 - ratio)}`;
  elements.intentionInput.value = state.intention;
  elements.intentionOutput.textContent = state.intention || "No intention set yet.";

  elements.modeTabs.forEach((button) => {
    const active = button.dataset.mode === state.mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });

  elements.taskSummary.textContent = state.tasks.length
    ? `${tasksDone}/${state.tasks.length} done`
    : "A short list keeps the session clear.";

  elements.focusCount.textContent = String(state.stats.focusSessions);
  elements.focusMinutesTotal.textContent = String(state.stats.focusedMinutes);
  elements.tasksDoneCount.textContent = String(tasksDone);

  renderTasks();
  syncSettingsInputs();
  document.title = `${formatClock(state.remainingSeconds)} | ${modeMeta.label}`;
  persistState();
}

function getFollowingMode() {
  if (state.mode === "focus") {
    return state.focusStreak >= 4 ? "longBreak" : "shortBreak";
  }

  return "focus";
}

function renderTasks() {
  if (!state.tasks.length) {
    elements.taskList.innerHTML = '<li><p class="empty-state">Add one task you can actually finish in a focused block.</p></li>';
    return;
  }

  const fragment = document.createDocumentFragment();

  state.tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.done ? " is-complete" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `Mark ${task.text} complete`);
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.textContent = task.text;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "task-delete";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => removeTask(task.id));

    item.append(checkbox, text, remove);
    fragment.append(item);
  });

  elements.taskList.replaceChildren(fragment);
}

function toggleTask(id) {
  state.tasks = state.tasks.map((task) => {
    if (task.id !== id) return task;
    return { ...task, done: !task.done };
  });

  state.stats.tasksCompleted = state.tasks.filter((task) => task.done).length;
  persistState();
  render();
}

function removeTask(id) {
  state.tasks = state.tasks.filter((task) => task.id !== id);
  state.stats.tasksCompleted = state.tasks.filter((task) => task.done).length;
  persistState();
  render();
}

function playChime() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(440, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(660, context.currentTime + 0.35);

  gainNode.gain.setValueAtTime(0.0001, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.03);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.55);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.56);
  oscillator.onended = () => context.close();
}
