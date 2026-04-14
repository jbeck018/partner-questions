import { FORM_SCHEMA } from './schema-data.js';

const STORAGE_KEY = 'partnership-worksheet-answers-v1';

const app = document.getElementById('app');
const sectionNav = document.getElementById('sectionNav');
const saveStatus = document.getElementById('saveStatus');
const exportCsvButton = document.getElementById('exportCsvButton');
const exportJsonButton = document.getElementById('exportJsonButton');
const importJsonInput = document.getElementById('importJsonInput');
const clearDataButton = document.getElementById('clearDataButton');

const state = {
  schema: FORM_SCHEMA,
  answers: {},
  timers: new Map()
};

function setStatus(message, className = '') {
  saveStatus.textContent = message;
  saveStatus.className = className;
}

function loadAnswers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error(error);
    return {};
  }
}

function persistAnswers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.answers));
}

function isVisible(rule) {
  if (!rule) return true;
  return (state.answers[rule.key] ?? '') === rule.equals;
}

function affectsVisibility(changedKey) {
  return state.schema.some((section) =>
    section.questions.some((question) =>
      (question.showWhen && question.showWhen.key === changedKey) ||
      question.fields.some((field) => field.showWhen && field.showWhen.key === changedKey)
    )
  );
}

function createInput(field) {
  const wrapper = document.createElement('div');
  wrapper.className = field.type === 'textarea' ? 'field-full' : 'field';
  if (!isVisible(field.showWhen)) wrapper.style.display = 'none';

  const label = document.createElement('label');
  label.textContent = field.label;
  label.htmlFor = field.key;
  wrapper.appendChild(label);

  const currentValue = state.answers[field.key] ?? '';

  if (field.type === 'radio') {
    const radioRow = document.createElement('div');
    radioRow.className = 'radio-row';

    field.options.forEach((option) => {
      const optionLabel = document.createElement('label');
      optionLabel.className = 'radio-option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = field.key;
      input.value = option;
      input.checked = currentValue === option;
      input.addEventListener('change', () => queueSave(field.key, option));

      const text = document.createElement('span');
      text.textContent = option;

      optionLabel.append(input, text);
      radioRow.appendChild(optionLabel);
    });

    wrapper.appendChild(radioRow);
    return wrapper;
  }

  const input = field.type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
  if (field.type !== 'textarea') input.type = field.type === 'currency' ? 'number' : field.type;

  input.id = field.key;
  input.name = field.key;
  input.value = currentValue;
  input.placeholder = field.placeholder || '';
  if (field.step) input.step = field.step;
  if (field.type === 'currency') input.inputMode = 'decimal';

  const eventName = field.type === 'date' ? 'change' : 'input';
  input.addEventListener(eventName, () => queueSave(field.key, input.value));

  wrapper.appendChild(input);
  return wrapper;
}

function render() {
  app.innerHTML = '';
  sectionNav.innerHTML = '';

  state.schema.forEach((section) => {
    const navLink = document.createElement('a');
    navLink.href = `#${section.id}`;
    navLink.textContent = section.title;
    sectionNav.appendChild(navLink);

    const block = document.createElement('section');
    block.className = 'section-block';
    block.id = section.id;

    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `<h2>${section.title}</h2>`;
    block.appendChild(header);

    section.questions.forEach((question) => {
      if (!isVisible(question.showWhen)) return;

      const card = document.createElement('article');
      card.className = 'question-card';

      const label = document.createElement('div');
      label.className = 'question-label';
      label.textContent = question.number;

      const title = document.createElement('h3');
      title.className = 'question-title';
      title.textContent = question.prompt;

      const fieldsGrid = document.createElement('div');
      fieldsGrid.className = 'fields-grid';
      question.fields.forEach((field) => fieldsGrid.appendChild(createInput(field)));

      card.append(label, title, fieldsGrid);
      block.appendChild(card);
    });

    app.appendChild(block);
  });
}

function queueSave(key, value) {
  state.answers[key] = value;
  if (affectsVisibility(key)) render();
  setStatus('Saving…', 'saving');

  if (state.timers.has(key)) clearTimeout(state.timers.get(key));

  const timer = setTimeout(() => {
    try {
      persistAnswers();
      setStatus(`Saved ${new Date().toLocaleTimeString()}`, 'saved');
    } catch (error) {
      console.error(error);
      setStatus('Save failed', 'error');
    }
  }, 200);

  state.timers.set(key, timer);
}

function flattenFields() {
  return state.schema.flatMap((section) =>
    section.questions.flatMap((question) =>
      question.fields.map((field) => ({
        section: section.title,
        questionNumber: question.number,
        prompt: question.prompt,
        key: field.key,
        label: field.label,
        value: state.answers[field.key] ?? ''
      }))
    )
  );
}

function csvEscape(value) {
  const stringValue = value == null ? '' : String(value);
  return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
}

function buildCsv() {
  const rows = [['section', 'question_number', 'prompt', 'field_key', 'field_label', 'value']];
  for (const field of flattenFields()) {
    rows.push([
      field.section,
      field.questionNumber,
      field.prompt,
      field.key,
      field.label,
      typeof field.value === 'object' ? JSON.stringify(field.value) : field.value
    ]);
  }
  return rows.map((row) => row.map(csvEscape).join(',')).join('\n');
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportCsv() {
  downloadFile('partnership-worksheet-export.csv', buildCsv(), 'text/csv;charset=utf-8');
  setStatus('CSV exported', 'saved');
}

function exportJson() {
  const payload = {
    exportedAt: new Date().toISOString(),
    answers: state.answers,
    rows: flattenFields()
  };
  downloadFile('partnership-worksheet-export.json', JSON.stringify(payload, null, 2), 'application/json');
  setStatus('JSON exported', 'saved');
}

function importJsonFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const importedAnswers = parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : parsed;
      state.answers = importedAnswers;
      persistAnswers();
      render();
      setStatus('JSON imported', 'saved');
    } catch (error) {
      console.error(error);
      setStatus('Import failed', 'error');
    }
  };
  reader.readAsText(file);
}

function clearSavedData() {
  if (!window.confirm('Clear all saved answers in this browser?')) return;
  state.answers = {};
  localStorage.removeItem(STORAGE_KEY);
  render();
  setStatus('Saved data cleared', 'saved');
}

function bindActions() {
  exportCsvButton.addEventListener('click', exportCsv);
  exportJsonButton.addEventListener('click', exportJson);
  importJsonInput.addEventListener('change', (event) => importJsonFile(event.target.files?.[0]));
  clearDataButton.addEventListener('click', clearSavedData);
}

function init() {
  setStatus('Loading…');
  state.answers = loadAnswers();
  render();
  bindActions();
  setStatus('Ready');
}

init();
