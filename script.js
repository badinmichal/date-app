const GOOGLE_FORM_ID = '1FAIpQLSdhV7zEVxWZ_2ueH7G0pLTQgNKq3N7vhLOlcq4i5jyh--MCVQ';
const FORM_FIELDS = {
  event: 'entry.2076051600',
  date: 'entry.63586064',
  time: 'entry.1723338222',
  plan: 'entry.998363726',
  request: 'entry.1023117935',
  noClicks: 'entry.1503637458',
};

function trackEvent(data) {
  const notConfigured = Object.values(FORM_FIELDS).some(v => v.startsWith('entry.DOPLN'));
  if (notConfigured) return; // formulár ešte nie je plne nastavený
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (FORM_FIELDS[key] && value !== undefined && value !== '') {
      formData.append(FORM_FIELDS[key], value);
    }
  });
  const url = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`;
  fetch(url, { method: 'POST', mode: 'no-cors', body: formData }).catch(() => {});
}

// ---------- Padajúce tulipány na pozadí ----------
const heartsBg = document.getElementById('heartsBg');
const heartEmojis = ['🌷'];

function spawnHeart() {
  const el = document.createElement('div');
  el.className = 'floating-heart';
  el.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
  el.style.left = Math.random() * 100 + 'vw';
  el.style.fontSize = (14 + Math.random() * 16) + 'px';
  const duration = 6 + Math.random() * 6;
  el.style.animationDuration = duration + 's';
  heartsBg.appendChild(el);
  setTimeout(() => el.remove(), duration * 1000);
}

setInterval(spawnHeart, 500);
for (let i = 0; i < 6; i++) setTimeout(spawnHeart, i * 200);

trackEvent({ event: `otvorila stránku (${new Date().toLocaleString('sk-SK')})` });

// ---------- Navigácia medzi krokmi ----------
const steps = {
  0: document.getElementById('step0'),
  1: document.getElementById('step1'),
  2: document.getElementById('step2'),
  3: document.getElementById('step3'),
  4: document.getElementById('step4'),
};

function goToStep(n) {
  Object.values(steps).forEach(s => s.classList.remove('active'));
  steps[n].classList.add('active');
}

// ---------- Krok 0: Áno / Nie ----------
function handleYes() {
  trackEvent({ event: 'povedala áno', noClicks: dodgeCount });
  goToStep(1);
}

document.getElementById('yesBtn0').addEventListener('click', handleYes);

// ---------- "Nie" tlačidlo: pri každom kliknutí ušmykne inam a zmení text ----------
const noBtn = document.getElementById('noBtn0');
const noBtnSlot = document.querySelector('.no-btn-slot');

let dodgeCount = 0;
let scale = 1;
const SHRINK_FACTOR = 0.94;  // po každom úteku sa mierne zmenší
const DANGER_RADIUS = 140;   // aby nová pozícia nevyšla priamo pod kurzorom

// postupnosť textov - posledný ("Áno") sa po kliknutí správa presne ako skutočné ÁNO tlačidlo
const noLabels = [
  'Skús znova',
  'Si si istá?',
  'Zamysli sa lepšie',
  'Posledná šanca',
  'Chyť ma!',
  'Pekný pokus',
  'Áno',
];

function placeNoButtonInitially() {
  const rect = noBtnSlot.getBoundingClientRect();
  noBtn.style.width = rect.width + 'px';
  noBtn.style.top = rect.top + 'px';
  noBtn.style.left = rect.left + 'px';
}
window.addEventListener('load', placeNoButtonInitially);
window.addEventListener('resize', () => {
  if (dodgeCount === 0) placeNoButtonInitially();
});

function updateLabel() {
  if (dodgeCount === 0) {
    noBtn.textContent = 'Nie';
  } else {
    noBtn.textContent = noLabels[Math.min(dodgeCount, noLabels.length) - 1];
  }
}

function dodgeNoButton(cursorX, cursorY) {
  dodgeCount++;
  updateLabel();
  noBtn.style.width = 'auto'; // nech sa prispôsobí dĺžke nového textu

  scale = Math.max(0.6, scale * SHRINK_FACTOR);

  const btnRect = noBtn.getBoundingClientRect();
  const w = btnRect.width || 90;
  const h = btnRect.height || 44;
  const margin = 12;

  let newX, newY, tries = 0;
  do {
    newX = margin + Math.random() * (window.innerWidth - w - margin * 2);
    newY = margin + Math.random() * (window.innerHeight - h - margin * 2);
    tries++;
  } while (
    cursorX !== undefined &&
    Math.hypot(newX + w / 2 - cursorX, newY + h / 2 - cursorY) < DANGER_RADIUS &&
    tries < 12
  );

  noBtn.style.left = newX + 'px';
  noBtn.style.top = newY + 'px';
  noBtn.style.transform = `scale(${scale})`;
}

// Uteká až po skutočnom kliknutí (nie pri priblížení myšou).
// Keď tlačidlo ukazuje "Áno" (posledný stav), klik funguje presne ako skutočné ÁNO.
noBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (dodgeCount === noLabels.length) {
    handleYes();
    return;
  }
  dodgeNoButton(e.clientX, e.clientY);
});
noBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (dodgeCount === noLabels.length) {
    handleYes();
    return;
  }
  const touch = e.touches[0];
  dodgeNoButton(touch ? touch.clientX : undefined, touch ? touch.clientY : undefined);
}, { passive: false });

// ---------- "Ešte chvíľu počkám" ----------
const bgMusic = document.getElementById('bgMusic');
const waitPhoto = document.getElementById('waitPhoto');

waitPhoto.addEventListener('error', () => {
  waitPhoto.style.display = 'none';
}, { once: true });

document.getElementById('waitBtn0').addEventListener('click', () => {
  trackEvent({
    event: `zvolila "ešte chvíľu počkám" (${new Date().toLocaleString('sk-SK')})`,
    noClicks: dodgeCount,
  });
  goToStep(4);
  bgMusic.play().catch(() => {
    // prehliadač zablokoval automatické prehrávanie so zvukom - skúsi to znova pri prvom kliku
    document.addEventListener('click', () => bgMusic.play().catch(() => {}), { once: true });
  });
});

document.getElementById('backFromWait').addEventListener('click', () => {
  bgMusic.pause();
  bgMusic.currentTime = 0;
  goToStep(0);
});

// ---------- Krok 1: Kedy (dátum a čas cez dropdown selecty, 24-hod formát) ----------
const dayInput = document.getElementById('dayInput');
const monthInput = document.getElementById('monthInput');
const yearInput = document.getElementById('yearInput');
const hourInput = document.getElementById('hourInput');
const minuteInput = document.getElementById('minuteInput');

const MONTHS = [
  'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
  'Júl', 'August', 'September', 'Október', 'November', 'December',
];

function pad2(n) {
  return String(n).padStart(2, '0');
}

function fillSelect(select, items) {
  select.innerHTML = items
    .map(({ value, label }) => `<option value="${value}">${label}</option>`)
    .join('');
}

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function updateDayOptions() {
  const month = parseInt(monthInput.value, 10);
  const year = parseInt(yearInput.value, 10);
  const previousDay = dayInput.value;
  const total = daysInMonth(month, year);
  const todayDate = new Date();
  const isCurrentMonth = year === todayDate.getFullYear() && month === todayDate.getMonth() + 1;
  const firstSelectableDay = isCurrentMonth ? todayDate.getDate() : 1;

  fillSelect(dayInput, Array.from({ length: total - firstSelectableDay + 1 }, (_, i) => {
    const d = pad2(firstSelectableDay + i);
    return { value: d, label: d };
  }));

  if (previousDay && parseInt(previousDay, 10) >= firstSelectableDay && parseInt(previousDay, 10) <= total) {
    dayInput.value = previousDay;
  }
}

function initDateTimePickers() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  // rok je pevne tento rok, mesiac sa dá vyberať od dnešného až po december
  const monthOptions = [];
  for (let m = currentMonth; m <= 12; m++) {
    monthOptions.push({ value: pad2(m), label: MONTHS[m - 1] });
  }
  fillSelect(monthInput, monthOptions);
  monthInput.value = pad2(currentMonth);

  fillSelect(yearInput, [{ value: String(currentYear), label: String(currentYear) }]);
  yearInput.disabled = true;

  fillSelect(hourInput, Array.from({ length: 24 }, (_, h) => ({ value: pad2(h), label: pad2(h) })));
  fillSelect(minuteInput, Array.from({ length: 12 }, (_, i) => {
    const m = pad2(i * 5);
    return { value: m, label: m };
  }));

  updateDayOptions();
  dayInput.value = pad2(today.getDate());

  hourInput.value = '18';
  minuteInput.value = '00';

  // pri zmene mesiaca prepočítaj dostupné dni (v aktuálnom mesiaci nejde vybrať deň pred dneškom)
  monthInput.addEventListener('change', updateDayOptions);
}

initDateTimePickers();

const planInput = document.getElementById('planInput');

document.getElementById('toStep2').addEventListener('click', () => {
  goToStep(2);
});

// ---------- Krok 2: Špeciálna požiadavka ----------
const finishBtn = document.getElementById('finishBtn');
const requestInput = document.getElementById('requestInput');

document.getElementById('backBtn').addEventListener('click', () => {
  goToStep(1);
});

// ---------- Krok 3: Zhrnutie ----------
function formatDate(dateStr) {
  if (!dateStr) return '--';
  const [y, m, d] = dateStr.split('-');
  const months = ['januára','februára','marca','apríla','mája','júna','júla','augusta','septembra','októbra','novembra','decembra'];
  return `${parseInt(d, 10)}. ${months[parseInt(m, 10) - 1]} ${y}`;
}

finishBtn.addEventListener('click', () => {
  const date = `${yearInput.value}-${monthInput.value}-${dayInput.value}`;
  const time = `${hourInput.value}:${minuteInput.value}`;
  const request = requestInput.value.trim();

  document.getElementById('sumDate').textContent = formatDate(date);
  document.getElementById('sumTime').textContent = time || '--';
  document.getElementById('sumPlan').textContent = planInput.value;

  const sumRequestRow = document.getElementById('sumRequestRow');
  sumRequestRow.hidden = !request;
  if (request) document.getElementById('sumRequest').textContent = request;

  trackEvent({ event: 'finálna odpoveď', date, time, plan: planInput.value, request });

  goToStep(3);
});

// ---------- Späť z výsledku na krok 2 ----------
document.getElementById('backToStep2').addEventListener('click', () => {
  goToStep(2);
});
