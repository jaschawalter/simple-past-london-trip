'use strict';

const main = document.querySelector('#main');
const locationLabel = document.querySelector('#location');
const template = document.querySelector('#exercise');
const session = taskSets.map(levels => levels.map(tasks => tasks.map(() => ({
  solved: false, bank: null, choices: null, picked: [], value: '', feedback: '', good: false, helpOpen: false
}))));

const titles = ['Erkennen und sortieren', 'Ergänzen und umformen', 'Selbst schreiben'];
const count = (chapter, level) => session[chapter][level].filter(task => task.solved).length;
const unlocked = (chapter, level) => level === 0 || count(chapter, level - 1) >= 7;
const resume = chapters.map(() => ({level: 0, index: 0}));

function button(label, click, attributes = {}) {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = label;
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  element.addEventListener('click', click);
  return element;
}

function moveFocus(selector) {
  window.scrollTo(0, 0);
  main.querySelector(selector).focus({preventScroll: true});
}

function showHome() {
  locationLabel.textContent = 'Simple Past';
  main.innerHTML = `
    <section class="cover">
      <div>
        <div class="issue">Englisch · Klasse 6 und 7</div>
        <h1 tabindex="-1">London<br><i>Trip</i></h1>
        <p>Wähle ein Kapitel und wiederhole das Simple Past. Mit 7 von 10 richtigen Aufgaben öffnest du das nächste Level.</p>
      </div>
      <div class="ticket" aria-hidden="true">
        <span>London · Travel Journal</span><span>Big Ben</span><span>River Thames</span><span>British Museum</span>
      </div>
    </section>
    <section class="cards" aria-label="Kapitel"></section>`;
  const cards = main.querySelector('.cards');
  chapters.forEach(({name, description}, chapter) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `<h2 lang="en">${name}</h2><p>${description}</p>`;
    const started = session[chapter].some(level => level.some(task => task.bank || task.choices || task.value || task.solved));
    card.append(button(started ? 'Weiterüben' : 'Kapitel starten', () => {
      const {level, index} = resume[chapter];
      showTask(chapter, level, index);
    }, {'aria-label': `${name} · ${started ? 'Weiterüben' : 'Kapitel starten'}`}));
    cards.append(card);
  });
  moveFocus('h1');
}

function assess(task, value) {
  const correct = task.answers.some(answer => normalize(answer) === normalize(value));
  if (correct) {
    const apostrophe = /\b(didnt|wasnt|werent)\b/i.test(value);
    return {
      correct,
      message: apostrophe ? `Richtig. Schreibhinweis · ${value.replace(/\b(didnt|wasnt|werent)\b/gi,
        word => word.slice(0, -1) + '’' + word.slice(-1))}` : 'Richtig!'
    };
  }
  const answer = normalize(value);
  if (!answer) return {correct, message: 'Gib zuerst eine Antwort ein.'};
  if (!task.isBe && task.chapter !== 0 && task.base !== task.past &&
      answer.split(' ').includes(task.past.toLowerCase()) && /\bdid(?:n't)?\b/.test(answer) &&
      !task.answers.some(valid => normalize(valid).split(' ').includes(task.past.toLowerCase()))) {
    return {correct, message: `Verwende nach did oder didn’t die Grundform ${task.base}.`};
  }
  return {correct, message: `Versuch es noch einmal. ${task.grammar}`};
}

function showTask(chapter, level, index) {
  if (!unlocked(chapter, level)) return;
  resume[chapter] = {level, index};
  locationLabel.textContent = `${chapters[chapter].name} · Level ${level + 1} von 3`;
  const task = taskSets[chapter][level][index];
  const state = session[chapter][level][index];
  main.replaceChildren(template.content.cloneNode(true));
  const find = selector => main.querySelector(selector);
  find('.meta').textContent = `Aufgabe ${index + 1} von 10 · ${titles[level]}`;
  find('.instruction').textContent = task.instruction;
  find('.prompt').textContent = task.prompt;
  find('.prompt').lang = 'en';
  find('.prompt').hidden = !task.prompt;
  find('.hint').textContent = task.help;
  const help = find('details');
  help.open = state.helpOpen;
  help.addEventListener('toggle', () => { state.helpOpen = help.open; });
  const input = find('.input');
  const feedback = find('.feedback');

  function updateProgress() {
    const total = count(chapter, level);
    const next = level < 2 ? (total >= 7 ? ` · Level ${level + 2} ist offen.`
      : ` · Noch ${7 - total} bis Level ${level + 2}.`) : '';
    find('.progress').textContent = `${total} von 10 richtig${next}`;
    find('.levels').replaceChildren(...titles.map((title, number) => {
      const available = unlocked(chapter, number);
      const control = button(`Level ${number + 1}${available ? '' : ' · gesperrt'}`,
        () => showTask(chapter, number, 0), {'aria-label': `Level ${number + 1} · ${title}${available ? '' : ' · gesperrt'}`});
      control.disabled = !available;
      if (level === number) control.setAttribute('aria-current', 'true');
      return control;
    }));
    [...find('.tasks').children].forEach((control, number) => {
      const done = session[chapter][level][number].solved;
      control.classList.toggle('done', done);
      control.setAttribute('aria-label', `Aufgabe ${number + 1}${done ? ' · richtig gelöst' : ''}`);
    });
  }

  function updateFeedback() {
    feedback.textContent = state.feedback;
    feedback.className = `feedback ${state.good ? 'good' : 'retry'}`;
  }

  find('.tasks').replaceChildren(...taskSets[chapter][level].map((item, number) => {
    const control = button(String(number + 1), () => showTask(chapter, level, number));
    if (number === index) control.setAttribute('aria-current', 'true');
    return control;
  }));

  if (task.type === 'choice') {
    state.choices ??= shuffle(task.choices);
    input.className = 'input options';
    state.choices.forEach(choice => input.append(button(choice, () => {
      state.value = choice;
      [...input.children].forEach(control => control.setAttribute('aria-pressed', String(control.textContent === choice)));
    }, {'aria-pressed': String(state.value === choice), lang: 'en'})));
  } else if (task.type === 'words') {
    state.bank ??= mixedWords(task);
    const built = document.createElement('div');
    built.className = 'built';
    built.setAttribute('aria-label', 'Dein Satz. Antippen entfernt das Wort.');
    const bank = document.createElement('div');
    bank.className = 'bank';
    bank.setAttribute('aria-label', 'Verfügbare Wörter');
    input.append(built, bank);
    const controls = state.bank.map((word, position) => button(word, () => {
      state.picked.push(position);
      updateWords();
      (controls.find(control => !control.disabled) ?? find('.primary')).focus();
    }, {lang: 'en'}));
    bank.append(...controls);
    function updateWords() {
      built.replaceChildren(...state.picked.map((position, selectedIndex) => button(
        selectedIndex === 0 ? upperFirst(state.bank[position]) : state.bank[position],
        () => {
          state.picked.splice(selectedIndex, 1);
          updateWords();
          controls[position].focus();
        }, {lang: 'en'}
      )));
      controls.forEach((control, position) => { control.disabled = state.picked.includes(position); });
      if (!built.childElementCount) built.textContent = 'Dein Satz erscheint hier.';
      state.value = state.picked.map(position => state.bank[position]).join(' ');
    }
    updateWords();
  } else {
    const field = document.createElement('input');
    field.type = 'text';
    field.lang = 'en';
    field.autocomplete = 'off';
    field.spellcheck = false;
    field.setAttribute('aria-label', 'Deine Antwort auf Englisch');
    field.value = state.value;
    field.addEventListener('input', () => { state.value = field.value; });
    input.append(field);
  }

  find('form').addEventListener('submit', event => {
    event.preventDefault();
    const before = count(chapter, level);
    const {correct, message} = assess(task, state.value);
    state.good = correct;
    state.solved ||= correct;
    state.feedback = message;
    if (level < 2 && before === 6 && count(chapter, level) === 7) {
      state.feedback += ` Level ${level + 2} ist jetzt offen.`;
    }
    updateFeedback();
    updateProgress();
  });
  const next = find('.next');
  next.textContent = index === 9 ? 'Kapitelübersicht' : 'Weiter';
  next.addEventListener('click', () => {
    if (index < 9) showTask(chapter, level, index + 1);
    else showHome();
  });
  updateProgress();
  updateFeedback();
  moveFocus('.instruction');
}

document.querySelector('#home').addEventListener('click', showHome);
// A page restored from the browser's back/forward cache is a new visit.
window.addEventListener('pageshow', event => { if (event.persisted) window.location.reload(); });
showHome();
