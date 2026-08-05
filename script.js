/* CS2 Map Banpick */

  IMAGE_EXTENSIONS = ['webp', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'avif', 'svg'];

const ALL_MAPS = [
  { id: 'mirage',   name: 'Mirage',   num: 1 },
  { id: 'dust2',    name: 'Dust 2',   num: 2 },
  { id: 'nuke',     name: 'Nuke',     num: 3 },
  { id: 'inferno',  name: 'Inferno',  num: 4 },
  { id: 'ancient',  name: 'Ancient',  num: 5 },
  { id: 'anubis',   name: 'Anubis',   num: 6 },
  { id: 'cache',    name: 'Cache',    num: 7 },
  { id: 'overpass', name: 'Overpass', num: 8 },
  { id: 'train',    name: 'Train',    num: 9 },
  { id: 'vertigo',  name: 'Vertigo',  num: 10 },
];

const PLACEHOLDER_GRADIENTS = {
  train: 'linear-gradient(135deg, #2a3a4a 0%, #1a2530 50%, #3d4f5f 100%)',
  vertigo: 'linear-gradient(135deg, #4a2a5a 0%, #2a1a40 50%, #5f3d6f 100%)',
};

const MIN_MAPS = { bo1: 2, bo3: 3, premier: 2 };

const HISTORY_KEY = 'cs2veto_history';

const ICONS = {
  ban: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>',
  pick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  decider: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
};

const imageCache = {};

function resolveMapImage(num) {
  const key = `map-${num}`;
  if (imageCache[key] !== undefined) return Promise.resolve(imageCache[key]);

  return new Promise((resolve) => {
    let i = 0;
    const tryNext = () => {
      if (i >= IMAGE_EXTENSIONS.length) {
        imageCache[key] = null;
        resolve(null);
        return;
      }
      const src = `${num}.${IMAGE_EXTENSIONS[i++]}`;
      const img = new Image();
      img.onload = () => {
        imageCache[key] = src;
        resolve(src);
      };
      img.onerror = tryNext;
      img.src = src;
    };
    tryNext();
  });
}

function preloadMapImages() {
  ALL_MAPS.forEach((m) => resolveMapImage(m.num));
}

function appendMapImage(map, container) {
  resolveMapImage(map.num).then((src) => {
    container.innerHTML = '';
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = map.name;
      img.loading = 'lazy';
      container.appendChild(img);
    } else {
      const grad = document.createElement('div');
      grad.className = 'map-gradient';
      grad.style.background = PLACEHOLDER_GRADIENTS[map.id] || 'linear-gradient(135deg, #333 0%, #222 100%)';
      grad.style.width = '100%';
      grad.style.height = '100%';
      grad.style.display = 'flex';
      grad.style.alignItems = 'center';
      grad.style.justifyContent = 'center';
      grad.innerHTML = `<span style="font-family:var(--font-heading);font-size:0.55rem;opacity:0.5">${map.name}</span>`;
      container.appendChild(grad);
    }
  });
}

function buildSteps(format, mapCount) {
  const extra = Math.max(0, mapCount - 7);

  if (format === 'bo3') {
    const steps = [];
    for (let i = 0; i < extra; i++) {
      steps.push({ team: i % 2 === 0 ? 'a' : 'b', action: 'ban', description: 'bans a map' });
    }
    steps.push(
      { team: 'a', action: 'ban', description: 'bans a map' },
      { team: 'b', action: 'ban', description: 'bans a map' },
      { team: 'a', action: 'pick', description: 'picks a map' },
      { team: 'b', action: 'side_pick', description: 'picks side on picked map' },
      { team: 'b', action: 'pick', description: 'picks a map' },
      { team: 'a', action: 'side_pick', description: 'picks side on picked map' },
      { team: 'a', action: 'ban', description: 'bans a map' },
      { team: 'b', action: 'ban', description: 'bans a map' },
      { team: 'a', action: 'decider', description: 'Remaining map = Decider (Knife)' }
    );
    return steps;
  }

  if (format === 'bo1') {
    const steps = [];
    for (let i = 0; i < extra; i++) {
      steps.push({ team: i % 2 === 0 ? 'a' : 'b', action: 'ban', description: 'bans a map' });
    }
    steps.push(
      { team: 'a', action: 'ban', description: 'bans a map' },
      { team: 'b', action: 'ban', banIndex: 1, banTotal: 2 },
      { team: 'b', action: 'ban', banIndex: 2, banTotal: 2 },
      { team: 'a', action: 'ban', banIndex: 1, banTotal: 2 },
      { team: 'a', action: 'ban', banIndex: 2, banTotal: 2 },
      { team: 'b', action: 'ban', description: 'bans a map' },
      { team: 'a', action: 'decider', description: 'Remaining map is played (Knife)' }
    );
    return steps;
  }

  if (format === 'premier') {
    const steps = [];
    steps.push(
      { team: 'a', action: 'ban', banIndex: 1, banTotal: 2 },
      { team: 'a', action: 'ban', banIndex: 2, banTotal: 2 }
    );
    const bTotal = 3 + extra;
    for (let i = 1; i <= bTotal; i++) {
      steps.push({ team: 'b', action: 'ban', banIndex: i, banTotal: bTotal });
    }
    steps.push(
      { team: 'a', action: 'ban', description: 'picks the map (bans 1 of last 2)' },
      { team: 'a', action: 'decider', description: 'Remaining map is played' },
      { team: 'b', action: 'side_pick', description: 'picks starting side' }
    );
    return steps;
  }

  return [];
}

function getStepDescription(step) {
  if (step.banIndex && step.banTotal) {
    return `bans a map (${step.banIndex} of ${step.banTotal})`;
  }
  return step.description;
}

function getStepPlanActionText(step) {
  if (step.action === 'decider') {
    return step.description || 'Remaining map is played (Knife)';
  }
  if (step.action === 'pick') {
    return 'picks a map';
  }
  if (step.action === 'side_pick') {
    return 'picks side on picked map';
  }
  if (step.action === 'ban') {
    if (step.banIndex && step.banTotal) {
      if (step.banIndex === 1) {
        const countWords = { 2: 'two', 3: 'three', 4: 'four', 5: 'five' };
        const word = countWords[step.banTotal] || step.banTotal;
        return `bans ${word} maps`;
      }
      return `bans (map ${step.banIndex} of ${step.banTotal})`;
    }
    if (step.description && step.description.includes('picks the map')) {
      return 'picks the map (bans 1 of last 2)';
    }
    return 'bans a map';
  }
  return step.description || '';
}

function renderStepPlan() {
  const container = $('#step-plan-list');
  container.innerHTML = '';

  state.steps.forEach((step, index) => {
    const row = document.createElement('div');
    row.className = 'step-plan-item';
    if (index === state.currentStep) row.classList.add('active');
    if (index < state.currentStep) row.classList.add('done');

    const num = document.createElement('span');
    num.className = 'step-plan-num';
    num.textContent = index + 1;

    const text = document.createElement('span');
    text.className = 'step-plan-text';

    if (step.action === 'decider') {
      const decLabel = document.createElement('span');
      decLabel.className = 'step-decider-label';
      decLabel.textContent = 'Decider';
      text.appendChild(decLabel);
      text.appendChild(document.createTextNode(` ${getStepPlanActionText(step)}`));
    } else {
      const actualTeam = getActualTeam(step);
      const teamSpan = document.createElement('span');
      teamSpan.className = `step-team ${actualTeam === 'a' ? 'team-ct' : 'team-t'}`;
      teamSpan.textContent = getTeamName(actualTeam);
      text.appendChild(teamSpan);
      text.appendChild(document.createTextNode(` ${getStepPlanActionText(step)}`));
    }

    row.appendChild(num);
    row.appendChild(text);
    container.appendChild(row);
  });

  const activeRow = container.querySelector('.step-plan-item.active');
  if (activeRow) {
    activeRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

let state = {
  teamA: '',
  teamB: '',
  starter: null,
  format: 'bo3',
  activeMaps: [],
  steps: [],
  currentStep: 0,
  mapStates: {},
  results: [],
  completed: false,
  deciderHandled: false,
  sidePickHandled: false,
};

let selectedMapIds = new Set(ALL_MAPS.map((m) => m.id));

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const screens = {
  home: $('#screen-home'),
  veto: $('#screen-veto'),
  history: $('#screen-history'),
  historyDetail: $('#screen-history-detail'),
  rules: $('#screen-rules'),
};

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove('active'));
  screens[name].classList.add('active');
}

function toggleHalfscreen() {
  document.body.classList.toggle('halfscreen');
  document.body.classList.toggle('halfscreen-active');
}

$$('#btn-halfscreen, #btn-halfscreen-veto').forEach((btn) => {
  btn.addEventListener('click', toggleHalfscreen);
});

const teamAInput = $('#team-a-input');
const teamBInput = $('#team-b-input');
const starterSection = $('#starter-section');
const starterA = $('#starter-a');
const starterB = $('#starter-b');
const btnStart = $('#btn-start-veto');
const mapPoolHint = $('#map-pool-hint');
let selectedFormat = 'bo3';
let selectedStarter = null;

function getSelectedMaps() {
  return ALL_MAPS.filter((m) => selectedMapIds.has(m.id));
}

function renderMapPoolPicker() {
  const grid = $('#map-pool-grid');
  grid.innerHTML = '';

  ALL_MAPS.forEach((map) => {
    const item = document.createElement('div');
    item.className = `map-pool-item${selectedMapIds.has(map.id) ? ' selected' : ''}`;
    item.dataset.id = map.id;

    const thumb = document.createElement('div');
    thumb.className = 'map-pool-thumb';
    appendMapImage(map, thumb);

    const name = document.createElement('span');
    name.className = 'map-pool-name';
    name.textContent = map.name;

    item.appendChild(thumb);
    item.appendChild(name);

    item.addEventListener('click', () => {
      if (selectedMapIds.has(map.id)) {
        selectedMapIds.delete(map.id);
        item.classList.remove('selected');
      } else {
        selectedMapIds.add(map.id);
        item.classList.add('selected');
      }
      updateMapPoolHint();
      updateStartBtn();
    });

    grid.appendChild(item);
  });

  updateMapPoolHint();
}

function updateMapPoolHint() {
  const count = selectedMapIds.size;
  const min = MIN_MAPS[selectedFormat];
  mapPoolHint.textContent = `${count} map${count !== 1 ? 's' : ''} selected (min ${min})`;
  mapPoolHint.classList.toggle('error', count < min);
}

$('#btn-select-all-maps').addEventListener('click', () => {
  selectedMapIds = new Set(ALL_MAPS.map((m) => m.id));
  renderMapPoolPicker();
  updateStartBtn();
});

$('#btn-clear-maps').addEventListener('click', () => {
  selectedMapIds.clear();
  renderMapPoolPicker();
  updateStartBtn();
});

function updateStarterSection() {
  const a = teamAInput.value.trim();
  const b = teamBInput.value.trim();
  if (a && b) {
    starterSection.classList.remove('hidden');
    starterA.textContent = a;
    starterB.textContent = b;
  } else {
    starterSection.classList.add('hidden');
    selectedStarter = null;
    starterA.classList.remove('active');
    starterB.classList.remove('active');
  }
  updateStartBtn();
}

function updateStartBtn() {
  const min = MIN_MAPS[selectedFormat];
  const mapsOk = selectedMapIds.size >= min;
  btnStart.disabled = !teamAInput.value.trim() || !teamBInput.value.trim() || !selectedStarter || !mapsOk;
}

teamAInput.addEventListener('input', updateStarterSection);
teamBInput.addEventListener('input', updateStarterSection);

starterA.addEventListener('click', () => {
  selectedStarter = 'a';
  starterA.classList.add('active');
  starterB.classList.remove('active');
  updateStartBtn();
});

starterB.addEventListener('click', () => {
  selectedStarter = 'b';
  starterB.classList.add('active');
  starterA.classList.remove('active');
  updateStartBtn();
});

$('#starter-random').addEventListener('click', () => {
  selectedStarter = Math.random() < 0.5 ? 'a' : 'b';
  if (selectedStarter === 'a') {
    starterA.classList.add('active');
    starterB.classList.remove('active');
  } else {
    starterB.classList.add('active');
    starterA.classList.remove('active');
  }
  updateStartBtn();
});

$$('.format-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.format-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    selectedFormat = btn.dataset.format;
    updateMapPoolHint();
    updateStartBtn();
  });
});

btnStart.addEventListener('click', startVeto);

function beginBanpick(config) {
  const { teamA, teamB, starter, format, activeMaps } = config;
  const steps = buildSteps(format, activeMaps.length);

  state = {
    teamA,
    teamB,
    starter,
    format,
    activeMaps,
    steps,
    currentStep: 0,
    mapStates: initMapStates(activeMaps),
    results: [],
    completed: false,
    deciderHandled: false,
    sidePickHandled: false,
  };

  $('#side-modal').classList.add('hidden');
  $('#decider-modal').classList.add('hidden');
  $('#veto-complete').classList.add('hidden');
  $('#maps-grid').classList.remove('hidden');
  $('#turn-banner').classList.remove('hidden');
  $('#step-plan').classList.remove('hidden');
  document.querySelector('.progress-bar').classList.remove('hidden');
  $('#step-counter').classList.remove('hidden');
  $('#picked-maps').classList.remove('hidden');

  renderVetoScreen();
  showScreen('veto');
}

function resetBanpick() {
  if (!confirm('Начать банпик заново с теми же настройками?')) return;

  beginBanpick({
    teamA: state.teamA,
    teamB: state.teamB,
    starter: state.starter,
    format: state.format,
    activeMaps: state.activeMaps,
  });
}

function getTeamName(team) {
  return team === 'a' ? state.teamA : state.teamB;
}

function getActualTeam(step) {
  if (state.starter === 'b') {
    return step.team === 'a' ? 'b' : 'a';
  }
  return step.team;
}

function initMapStates(maps) {
  const ms = {};
  maps.forEach((m) => {
    ms[m.id] = { status: null, team: null, side: null };
  });
  return ms;
}

function startVeto() {
  beginBanpick({
    teamA: teamAInput.value.trim(),
    teamB: teamBInput.value.trim(),
    starter: selectedStarter,
    format: selectedFormat,
    activeMaps: getSelectedMaps(),
  });
}

function getRemainingMaps() {
  return state.activeMaps.filter((m) => !state.mapStates[m.id].status);
}

function renderVetoScreen() {
  const steps = state.steps;
  const step = steps[state.currentStep];

  $('#match-title').textContent = `${state.teamA} vs ${state.teamB}`;
  $('#format-badge').textContent = state.format === 'premier' ? 'PREMIER' : state.format.toUpperCase();

  if (state.completed) {
    renderComplete();
    return;
  }

  if (!step) {
    finishVeto();
    return;
  }

  const actualTeam = getActualTeam(step);
  const teamName = getTeamName(actualTeam);

  const turnTeam = $('#turn-team');
  turnTeam.textContent = teamName;
  turnTeam.className = `turn-team ${actualTeam === 'a' ? 'team-ct' : 'team-t'}`;
  $('#turn-action').textContent = getStepDescription(step);

  const progress = (state.currentStep / steps.length) * 100;
  $('#progress-fill').style.width = `${progress}%`;
  $('#step-counter').textContent = `STEP ${state.currentStep + 1} / ${steps.length}`;

  renderStepPlan();
  renderMapsGrid(step, actualTeam);
  renderPickedTags();
}

function renderMapsGrid(step, actualTeam) {
  const grid = $('#maps-grid');
  grid.innerHTML = '';

  const isSidePick = step.action === 'side_pick';
  const isDecider = step.action === 'decider';
  const isBan = step.action === 'ban';
  const isPick = step.action === 'pick';
  const isDone = step.action === 'done';

  state.activeMaps.forEach((map) => {
    const ms = state.mapStates[map.id];
    const card = document.createElement('div');
    card.className = 'map-card';

    if (ms.status === 'ban') card.classList.add('banned');
    else if (ms.status === 'pick') card.classList.add('picked');
    else if (ms.status === 'decider') card.classList.add('decider');

    const selectable = !isDone && !ms.status && !isSidePick && (isBan || isPick || isDecider);
    if (selectable) card.classList.add('selectable');
    else card.classList.add('disabled');

    const imgWrap = document.createElement('div');
    imgWrap.style.width = '100%';
    imgWrap.style.height = '100%';
    imgWrap.style.position = 'absolute';
    imgWrap.style.inset = '0';
    appendMapImage(map, imgWrap);
    card.appendChild(imgWrap);

    const overlay = document.createElement('div');
    overlay.className = 'map-overlay';
    card.appendChild(overlay);

    const nameEl = document.createElement('div');
    nameEl.className = 'map-name';
    nameEl.textContent = map.name;
    card.appendChild(nameEl);

    if (ms.status) {
      const badge = document.createElement('div');
      badge.className = 'status-badge';
      const label = ms.status === 'ban' ? 'BANNED' : ms.status === 'pick' ? 'PICKED' : 'DECIDER';
      badge.innerHTML = `${ICONS[ms.status]}<span class="status-label">${label}</span>`;
      card.appendChild(badge);

      if (ms.team || ms.side) {
        const meta = document.createElement('div');
        meta.className = 'map-meta';
        let text = ms.team ? getTeamName(ms.team) : '';
        if (ms.side) text += ` · ${ms.side}`;
        if (ms.sidePickerTeam && ms.sidePickerSide) {
          text += ` / ${getTeamName(ms.sidePickerTeam)} · ${ms.sidePickerSide}`;
        }
        meta.textContent = text;
        meta.style.color = ms.status === 'ban' ? 'var(--ban)' : ms.status === 'decider' ? 'var(--decider)' : 'var(--pick)';
        card.appendChild(meta);
      }
    }

    if (selectable) {
      card.addEventListener('click', () => handleMapClick(map, step, actualTeam));
    }

    grid.appendChild(card);
  });

  if (isSidePick && !state.sidePickHandled) {
    state.sidePickHandled = true;
    handleSidePickStep(actualTeam);
  }

  if (isDecider && !state.deciderHandled) {
    const remaining = getRemainingMaps();
    if (remaining.length === 1) {
      state.deciderHandled = true;
      autoDecider(remaining[0], actualTeam);
    } else if (remaining.length > 1) {
      state.deciderHandled = true;
      showDeciderModal(remaining, actualTeam);
    }
  }
}

function handleMapClick(map, step, actualTeam) {
  if (step.action === 'ban') {
    applyAction(map, 'ban', actualTeam);
  } else if (step.action === 'pick') {
    applyAction(map, 'pick', actualTeam);
  } else if (step.action === 'decider') {
    applyAction(map, 'decider', actualTeam);
  }
}

function applyAction(map, action, team) {
  state.mapStates[map.id] = { status: action, team, side: null };
  state.results.push({
    mapId: map.id,
    mapName: map.name,
    action,
    team,
    side: null,
    stepIndex: state.currentStep,
  });
  advanceStep();
}

function advanceStep() {
  state.deciderHandled = false;
  state.sidePickHandled = false;
  state.currentStep++;

  if (state.currentStep >= state.steps.length) {
    finishVeto();
  } else {
    renderVetoScreen();
  }
}

function autoDecider(map, team) {
  state.mapStates[map.id] = { status: 'decider', team, side: null };
  state.results.push({
    mapId: map.id,
    mapName: map.name,
    action: 'decider',
    team,
    side: null,
    stepIndex: state.currentStep,
  });
  advanceStep();
}

function oppositeSide(side) {
  return side === 'CT' ? 'T' : 'CT';
}

function handleSidePickStep(actualTeam) {
  const lastPick = [...state.results].reverse().find((r) => r.action === 'pick');
  const lastDecider = [...state.results].reverse().find((r) => r.action === 'decider');
  const target = lastPick || lastDecider;
  if (!target) {
    advanceStep();
    return;
  }

  const mapOwnerTeam = target.team;
  const modal = $('#side-modal');
  const teamName = getTeamName(actualTeam);
  const ownerName = getTeamName(mapOwnerTeam);
  $('#side-modal-title').textContent = `${teamName} — SELECT YOUR SIDE`;
  $('#side-modal-map').textContent = `${target.mapName} · ${ownerName} picked this map`;
  modal.classList.remove('hidden');

  const sideHandler = (e) => {
    const btn = e.target.closest('.side-btn');
    if (!btn) return;

    const chosenSide = btn.dataset.side;
    const ownerSide = oppositeSide(chosenSide);

    state.mapStates[target.mapId].side = ownerSide;
    state.mapStates[target.mapId].sidePickerTeam = actualTeam;
    state.mapStates[target.mapId].sidePickerSide = chosenSide;

    const resultEntry = state.results.find(
      (r) => r.mapId === target.mapId && (r.action === 'pick' || r.action === 'decider')
    );
    if (resultEntry) {
      resultEntry.side = ownerSide;
      resultEntry.sidePickerTeam = actualTeam;
      resultEntry.sidePickerSide = chosenSide;
    }

    state.results.push({
      mapId: target.mapId,
      mapName: target.mapName,
      action: 'side_pick',
      team: actualTeam,
      side: chosenSide,
      mapOwnerTeam,
      mapOwnerSide: ownerSide,
      stepIndex: state.currentStep,
    });

    modal.classList.add('hidden');
    $$('.side-btn').forEach((b) => b.removeEventListener('click', sideHandler));
    advanceStep();
  };

  $$('.side-btn').forEach((b) => b.addEventListener('click', sideHandler));
}

function showDeciderModal(maps, team) {
  const modal = $('#decider-modal');
  const container = $('#decider-options');
  container.innerHTML = '';

  maps.forEach((map) => {
    const btn = document.createElement('button');
    btn.className = 'decider-option';
    btn.textContent = map.name;
    btn.addEventListener('click', () => {
      modal.classList.add('hidden');
      applyAction(map, 'decider', team);
    });
    container.appendChild(btn);
  });

  modal.classList.remove('hidden');
}

function formatMapSides(result) {
  const picker = getTeamName(result.team);
  const pickerSide = result.side;
  if (!pickerSide) return `Picked by ${picker}`;

  if (result.sidePickerTeam && result.sidePickerSide) {
    const sidePicker = getTeamName(result.sidePickerTeam);
    return `${picker} (${pickerSide}) · ${sidePicker} (${result.sidePickerSide})`;
  }
  return `Picked by ${picker} · Side: ${pickerSide}`;
}

function renderPickedTags() {
  const container = $('#picked-maps');
  container.innerHTML = '';

  state.results.filter((r) => r.action === 'pick' || r.action === 'decider').forEach((r) => {
    const tag = document.createElement('span');
    tag.className = `picked-tag ${r.action === 'decider' ? 'decider' : 'pick'}`;
    let text = r.mapName;
    if (r.action === 'pick') {
      text += ` — ${formatMapSides(r)}`;
    } else if (r.side) {
      text += ` — ${formatMapSides(r)}`;
    } else {
      text += ' — DECIDER';
    }
    tag.textContent = text;
    container.appendChild(tag);
  });
}

function finishVeto() {
  state.completed = true;
  $('#progress-fill').style.width = '100%';
  renderComplete();
  saveToHistory();
}

function renderComplete() {
  $('#turn-banner').classList.add('hidden');
  $('#step-plan').classList.add('hidden');
  document.querySelector('.progress-bar').classList.add('hidden');
  $('#step-counter').classList.add('hidden');

  const completeEl = $('#veto-complete');
  completeEl.classList.remove('hidden');

  const summary = $('#complete-summary');
  summary.innerHTML = '';

  const playedMaps = state.results.filter((r) => r.action === 'pick' || r.action === 'decider');
  playedMaps.forEach((r) => {
    const item = document.createElement('div');
    item.className = 'complete-item';
    const isDec = r.action === 'decider';
    item.innerHTML = `
      <div class="map-name-big" style="color:${isDec ? 'var(--decider)' : 'var(--pick)'}">${r.mapName}</div>
      <div class="map-detail">${isDec && !r.side ? 'Decider — Knife for sides' : formatMapSides(r)}</div>
    `;
    summary.appendChild(item);
  });

  renderMapsGrid({ action: 'done' }, null);
  renderPickedTags();
}

function saveToHistory() {
  const playedMaps = state.results.filter((r) => r.action === 'pick' || r.action === 'decider');
  const mainMap = playedMaps.length === 1
    ? playedMaps[0].mapName
    : playedMaps.map((r) => r.mapName).join(', ');

  const entry = {
    id: Date.now().toString(),
    teamA: state.teamA,
    teamB: state.teamB,
    format: state.format,
    date: new Date().toISOString(),
    mainMap,
    mapIds: state.activeMaps.map((m) => m.id),
    results: JSON.parse(JSON.stringify(state.results)),
    mapStates: JSON.parse(JSON.stringify(state.mapStates)),
  };

  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function formatDate(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return { date, time };
}

function renderHistoryList() {
  const history = getHistory();
  const list = $('#history-list');
  const empty = $('#history-empty');
  list.innerHTML = '';

  if (history.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  history.forEach((entry) => {
    const { date, time } = formatDate(entry.date);
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="hi-teams">${entry.teamA} <span class="hi-vs">vs</span> ${entry.teamB}</div>
      <div class="hi-map">${entry.mainMap}</div>
      <div class="hi-meta">
        <span>${entry.format.toUpperCase()}</span>
        <span>${date}</span>
        <span>${time}</span>
      </div>
    `;
    item.addEventListener('click', () => showHistoryDetail(entry));
    list.appendChild(item);
  });
}

function getMapImageHtml(map) {
  const cached = imageCache[`map-${map.num}`];
  if (cached) {
    return `<img src="${cached}" alt="${map.name}" loading="lazy">`;
  }
  const grad = PLACEHOLDER_GRADIENTS[map.id] || 'linear-gradient(135deg, #333 0%, #222 100%)';
  return `<div class="map-gradient" style="background:${grad};width:100%;height:100%"></div>`;
}

function showHistoryDetail(entry) {
  const { date, time } = formatDate(entry.date);
  const container = $('#history-detail-content');
  const mapsInMatch = entry.mapIds
    ? ALL_MAPS.filter((m) => entry.mapIds.includes(m.id))
    : ALL_MAPS;

  let bannedHtml = '';
  let pickedHtml = '';
  let deciderHtml = '';
  let remainingHtml = '';

  mapsInMatch.forEach((map) => {
    const ms = entry.mapStates[map.id];
    const imgTag = getMapImageHtml(map);

    const card = (status, label) => `
      <div class="detail-map ${status}">
        ${imgTag}
        <span class="dm-status">${label}</span>
        <span class="dm-label">${map.name}</span>
      </div>
    `;

    if (!ms || !ms.status) {
      remainingHtml += card('remaining', 'LEFT');
    } else if (ms.status === 'ban') {
      bannedHtml += card('banned', 'BAN');
    } else if (ms.status === 'pick') {
      pickedHtml += card('picked', 'PICK');
    } else if (ms.status === 'decider') {
      deciderHtml += card('decider', 'DEC');
    }
  });

  let timelineHtml = '';
  entry.results.forEach((r, i) => {
    const teamName = r.team === 'a' ? entry.teamA : entry.teamB;
    let actionClass = 'ts-action-pick';
    let actionText = r.action.toUpperCase();
    if (r.action === 'ban') actionClass = 'ts-action-ban';
    if (r.action === 'decider') actionClass = 'ts-action-decider';
    if (r.action === 'side_pick') {
      const ownerTeam = r.mapOwnerTeam || (r.team === 'a' ? 'b' : 'a');
      const ownerName = ownerTeam === 'a' ? entry.teamA : entry.teamB;
      const ownerSide = r.mapOwnerSide || oppositeSide(r.side);
      actionText = `SIDE: ${r.side} · ${ownerName} → ${ownerSide}`;
      actionClass = 'ts-action-pick';
    }

    timelineHtml += `
      <div class="timeline-step">
        <span class="ts-num">${i + 1}</span>
        <span>${teamName}</span>
        <span class="${actionClass}">${actionText}</span>
        <span>— ${r.mapName}</span>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="detail-header">
      <div class="dh-teams">${entry.teamA} vs ${entry.teamB}</div>
      <div class="dh-meta">${entry.format.toUpperCase()} · ${date} · ${time}</div>
    </div>
    ${pickedHtml ? `<div class="detail-section"><h3>PICKED</h3><div class="detail-maps">${pickedHtml}</div></div>` : ''}
    ${deciderHtml ? `<div class="detail-section"><h3>DECIDER</h3><div class="detail-maps">${deciderHtml}</div></div>` : ''}
    ${bannedHtml ? `<div class="detail-section"><h3>BANNED</h3><div class="detail-maps">${bannedHtml}</div></div>` : ''}
    ${remainingHtml ? `<div class="detail-section"><h3>REMAINING</h3><div class="detail-maps">${remainingHtml}</div></div>` : ''}
    <div class="detail-section">
      <h3>TIMELINE</h3>
      <div class="detail-timeline">${timelineHtml}</div>
    </div>
  `;
  showScreen('historyDetail');
}

$('#btn-rules-home').addEventListener('click', () => showScreen('rules'));
$('#btn-back-rules').addEventListener('click', () => showScreen('home'));

$('#btn-history-home').addEventListener('click', () => {
  renderHistoryList();
  showScreen('history');
});

$('#btn-back-history').addEventListener('click', () => showScreen('home'));
$('#btn-back-detail').addEventListener('click', () => {
  renderHistoryList();
  showScreen('history');
});

$('#btn-clear-history').addEventListener('click', () => {
  if (confirm('Очистить всю историю?')) {
    localStorage.removeItem(HISTORY_KEY);
    renderHistoryList();
  }
});

$('#btn-back-veto').addEventListener('click', () => {
  if (state.completed || confirm('Прервать банпик?')) {
    showScreen('home');
  }
});

$('#btn-reset-banpick').addEventListener('click', resetBanpick);

$('#btn-new-match').addEventListener('click', () => showScreen('home'));
$('#btn-view-history').addEventListener('click', () => {
  renderHistoryList();
  showScreen('history');
});

preloadMapImages();
renderMapPoolPicker();
