'use strict';

const chapters = [
  {name: 'Sentences', description: 'Aussagesätze mit regelmäßigen und unregelmäßigen Verben.'},
  {name: 'Negations', description: 'Sätze mit didn’t, wasn’t und weren’t verneinen.'},
  {name: 'Questions', description: 'Ja-/Nein-Fragen, W-Fragen und Kurzantworten bilden.'}
];

// Subject | base | past | complement | time | meaning of the verb
const scenes = [
  [
    ['Mia','see','saw','Big Ben','yesterday','sehen'],
    ['Ben','visit','visited','the museum','last Monday','besuchen'],
    ['We','walk','walked','along the Thames','yesterday','laufen'],
    ['They','eat','ate','sandwiches','at noon','essen'],
    ['Leo','take','took','the bus','this morning','nehmen'],
    ['I','buy','bought','a ticket','yesterday','kaufen'],
    ['The girls','watch','watched','a street show','last night','anschauen'],
    ['Sam','play','played','football','on Tuesday','spielen'],
    ['Our guide','open','opened','the door','at nine','öffnen'],
    ['The shops','be','were','open','yesterday','sein']
  ],
  [
    ['Nina','study','studied','the map','before lunch','genau anschauen'],
    ['The bus','stop','stopped','near the station','at ten','anhalten'],
    ['We','go','went','to Hyde Park','on Monday','gehen'],
    ['I','like','liked','the boat trip','yesterday','mögen'],
    ['Tom','write','wrote','a postcard','last night','schreiben'],
    ['The twins','carry','carried','their bags','this morning','tragen'],
    ['Our hotel','be','was','quiet','last night','sein'],
    ['The cafés','be','were','busy','at noon','sein'],
    ['Lily','find','found','her ticket','after lunch','finden'],
    ['They','plan','planned','a trip','last week','planen']
  ],
  [
    ['Mia','take','took','photos of Big Ben','on Monday','machen'],
    ['Ben','buy','bought','a map','that morning','kaufen'],
    ['Mia and Ben','walk','walked','along the Thames','after lunch','laufen'],
    ['Mia','send','sent','a postcard','on Tuesday','verschicken'],
    ['Ben','try','tried','fish and chips','at noon','probieren'],
    ['They','meet','met','their guide','at nine','treffen'],
    ['Their room','be','was','warm','last night','sein'],
    ['The buses','be','were','full','this morning','sein'],
    ['Their guide','show','showed','them the park','on Wednesday','zeigen'],
    ['Mia and Ben','come','came','back to the hotel','at six','zurückkommen']
  ]
];

const lowerSubject = subject => subject === 'I' || !/^(We|They|Our|The|Their)\b/.test(subject)
  ? subject : subject[0].toLowerCase() + subject.slice(1);
const upperFirst = phrase => phrase[0].toUpperCase() + phrase.slice(1);
const negativeBe = {was: 'wasn’t', were: 'weren’t'};

function normalize(value) {
  return value.toLowerCase().trim()
    .replace(/[’‘]/g, "'")
    .replace(/\b(didnt|wasnt|werent)\b/g, word => word.slice(0, -1) + "'t")
    .replace(/\bdid not\b/g, "didn't")
    .replace(/\bwas not\b/g, "wasn't")
    .replace(/\bwere not\b/g, "weren't")
    .replace(/[,.!?]/g, '').replace(/\s+/g, ' ');
}

function taskFor(chapter, level, index, scene) {
  const [subject, base, past, complement, time, meaning] = scene;
  const isBe = base === 'be';
  const statement = `${subject} ${past} ${complement} ${time}`;
  const negative = isBe ? negativeBe[past] : `didn’t ${base}`;
  const questionSubject = lowerSubject(subject);
  const questionCore = isBe ? `${past} ${questionSubject} ${complement}` : `did ${questionSubject} ${base} ${complement}`;
  const affirmative = chapter === 0;
  const negation = chapter === 1;
  const grammar = isBe ? 'Bei to be verwendest du was oder were.' : affirmative
    ? 'Im Aussagesatz brauchst du die Simple-Past-Form des Verbs.'
    : negation ? 'Nach didn’t steht die Grundform.' : 'Nach did steht das Subjekt und dann die Grundform.';
  const help = isBe ? 'I/he/she/it → was · we/you/they → were' : affirmative
    ? `Verb (${meaning}) · ${base} → ${past}`
    : `Grundform (${meaning}) · ${base}\nMuster · ${negation ? 'She didn’t visit the park.' : 'Did she visit the park?'}`;
  const body = affirmative ? `${subject} ${past} ${complement}` : `${subject} ${negative} ${complement}`;
  const bodyWithFrontTime = `${time}, ${lowerSubject(subject)} ${affirmative ? past : negative} ${complement}`;
  const full = chapter === 2
    ? [`${upperFirst(questionCore)} ${time}?`, `${upperFirst(time)}, ${questionCore}?`]
    : [`${body} ${time}.`, `${upperFirst(bodyWithFrontTime)}.`];
  const make = (type, instruction, prompt, answers, extras = {}) => ({
    type, instruction, prompt, answers, help, grammar, base, past, isBe, chapter, ...extras
  });
  const wordTask = (instruction, answers, distractors = []) =>
    make('words', instruction, '', answers, {
      words: answers[0].replace(/[?.!,]/g, '').split(' ').concat(distractors)
    });
  const picks = (instruction, prompt, correct, wrong, extras) =>
    make('choice', instruction, prompt, [correct], {choices: [correct, ...wrong], ...extras});

  if (level === 0) {
    if (chapter === 2 && [3, 6, 8, 9].includes(index)) {
      const yes = index === 3 || index === 9;
      const aux = isBe ? past : 'did';
      const who = index === 8 ? 'she' : 'they';
      const text = index === 8 ? 'Did your guide Emma open the door at nine?' : full[0];
      const short = yes ? `Yes, ${who} ${aux}.` : `No, ${who} ${isBe ? negativeBe[past] : 'didn’t'}.`;
      return picks(`Wähle die passende ${yes ? 'Ja' : 'Nein'}-Kurzantwort.`, text, short,
        [`${yes ? 'Yes' : 'No'}, ${who} ${yes ? 'does' : 'doesn’t'}.`,
          `${yes ? 'Yes' : 'No'}, ${who} ${isBe ? 'was' : 'are'}.`],
        {help: 'Verwende das Hilfsverb aus der Frage und das passende Personalpronomen.',
          grammar: 'Achte auf das Personalpronomen und das Hilfsverb aus der Frage.'});
    }
    if (chapter === 2 || index % 3 === 1) return wordTask('Tippe die Wörter in der richtigen Reihenfolge an.', full);
    if (affirmative) return picks('Wähle die passende Vergangenheitsform.',
      `${subject} ___ ${complement} ${time}.`, past, isBe ? ['was', 'are'] : [base, base.endsWith('y') ? base.slice(0, -1) + 'ies' : base + 's']);
    return picks('Wähle die passende Verneinung.', `${subject} ___ ${complement} ${time}.`, negative,
      isBe ? ['wasn’t', 'didn’t be'] : [`don’t ${base}`, `didn’t ${past}`]);
  }

  if (level === 1) {
    if (affirmative) {
      if (index === 1 || index === 5) return wordTask('Baue den Satz. Zwei Wörter bleiben übrig.', full, [base, base.endsWith('y') ? base.slice(0, -1) + 'ies' : base + 's']);
      return make('text', 'Ergänze die Verbform im Simple Past.', `${subject} ___ ${complement} ${time}. (${base})`, [past]);
    }
    if (negation) {
      if (index === 2 || index === 8) return wordTask('Baue die Verneinung. Zwei Wörter bleiben übrig.', full, [past, 'doesn’t']);
      return make('text', 'Schreibe den ganzen Satz als Verneinung.', statement + '.', full);
    }
    if (index === 1 || index === 5) return wordTask('Baue eine Ja-/Nein-Frage. Zwei Wörter bleiben übrig.', full, [past, 'does']);
    const questionWords = {
      0: ['What', 'did Nina study before lunch', 'The map'],
      3: ['Why', 'did you like the boat trip', 'Because the view was great'],
      4: ['When', 'did Tom write a postcard', 'Last night'],
      9: ['Who', 'planned a trip last week', 'Mia and Ben']
    };
    if (index in questionWords) {
      const [word, rest, reply] = questionWords[index];
      return make('choice', 'Wähle das Fragewort, das zur Antwort passt.',
        `___ ${rest}?\nAntwort · ${reply}.`,
        [word], {choices: ['When', 'What', 'Why', 'Who'], help: 'When = wann · What = was · Why = warum · Who = wer oder wen',
          grammar: `Die Kurzantwort passt zu einer Frage mit ${word}.`});
    }
    return make('text', 'Forme den Satz in eine Ja-/Nein-Frage um.', statement + '.', full);
  }

  if (affirmative || negation) {
    const clues = [
      'Mia kept her camera in her bag.',
      'Ben only used the map on his phone.',
      'They took the bus after lunch.',
      'Mia kept the postcard in her bag.',
      'Ben had a sandwich instead.',
      'Their guide arrived at eleven.',
      'They needed an extra blanket.',
      'There were plenty of seats.',
      'Their guide took them to a museum instead.',
      'They stayed out until eight.'
    ];
    const note = `${negation ? clues[index] + '\n' : ''}${subject} / ${base} / ${complement} / ${time}`;
    return make('text', affirmative ? 'Schreibe einen Aussagesatz aus den Stichpunkten.' : 'Schreibe aus den Stichpunkten, was auf der Reise nicht passiert ist.',
      note, full);
  }

  if ([1, 6, 7].includes(index)) {
    const positive = index === 6;
    const who = index === 1 ? 'he' : index === 6 ? 'it' : 'they';
    const short = positive ? `Yes, ${who} ${past}.` : `No, ${who} ${isBe ? negativeBe[past] : 'didn’t'}.`;
    return make('text', `Schreibe eine ${positive ? 'Ja' : 'Nein'}-Kurzantwort.`, full[0], [short], {
      help: `Beginne mit ${positive ? 'Yes' : 'No'} und verwende ${who}.\nBeispiel · Yes, we did. / No, we didn’t.`,
      grammar: 'Prüfe das Personalpronomen und das Hilfsverb in deiner Kurzantwort.'
    });
  }
  if (index === 2) {
    return make('text', 'Frage mit Where nach dem Ort.', statement + '.',
      [`Where did Mia and Ben walk ${time}?`, 'Where did Mia and Ben walk?',
        `After lunch, where did Mia and Ben walk?`],
      {help: 'Where + did + Subjekt + Grundform.\nGrundform · walk'});
  }
  if ([0, 3, 5, 8].includes(index)) {
    const answers = index === 0 ? [`What did Mia take ${time}?`, `What photos did Mia take ${time}?`]
      : index === 3 ? [`What did Mia send ${time}?`]
      : index === 5 ? [`Who did they meet ${time}?`, `Whom did they meet ${time}?`, `Who did Mia and Ben meet ${time}?`, `Whom did Mia and Ben meet ${time}?`]
      : [`When did their guide show them the park?`];
    if (index !== 8) {
      const originals = [...answers];
      for (const answer of originals) {
        const core = answer.slice(0, -(time.length + 2));
        answers.push(core + '?', `${upperFirst(time)}, ${core[0].toLowerCase() + core.slice(1)}?`);
      }
    }
    const target = index === 0 ? 'was Mia machte (Fragewort What)' : index === 3 ? 'was Mia verschickte'
      : index === 5 ? 'wen Mia und Ben trafen' : 'wann der Guide ihnen den Park zeigte';
    return make('text', `Frage danach, ${target}.`, statement + '.', answers, {
      help: `${index === 5 ? 'Who' : index === 8 ? 'When' : 'What'} + did + Subjekt + Grundform.\nGrundform · ${base}`
    });
  }
  return make('text', 'Schreibe eine Ja-/Nein-Frage zu den Stichpunkten.',
    `${subject} / ${base} / ${complement} / ${time}`, full);
}

const taskSets = chapters.map((chapter, chapterIndex) =>
  scenes.map((level, levelIndex) => level.map((scene, index) => taskFor(chapterIndex, levelIndex, index, scene)))
);

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function mixedWords(task) {
  const correct = task.answers.map(normalize);
  const startsSolved = words => correct.some(answer => {
    const length = answer.split(' ').length;
    // Even a contiguous correct sentence among decoys makes the answer visible.
    return words.some((word, index) => normalize(words.slice(index, index + length).join(' ')) === answer);
  });
  let words;
  do {
    words = shuffle(task.words.map(word => word === 'I' || /^[A-Z][a-z]+$/.test(word) &&
      !/^(Did|Was|Were|We|They|Our|The|Their|Yesterday)$/.test(word) ? word : word.toLowerCase()).map(word => word === 'i' ? 'I' : word));
  } while (startsSolved(words));
  return words;
}
