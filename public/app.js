import { FORM_SCHEMA } from './schema-data.js';

const STORAGE_KEY = 'partnership-worksheet-answers-v2';

const app = document.getElementById('app');
const sectionNav = document.getElementById('sectionNav');
const saveStatus = document.getElementById('saveStatus');
const progressCount = document.getElementById('progressCount');
const progressFill = document.getElementById('progressFill');
const progressNote = document.getElementById('progressNote');
const currentSectionSummary = document.getElementById('currentSectionSummary');
const prevSectionButton = document.getElementById('prevSectionButton');
const nextSectionButton = document.getElementById('nextSectionButton');
const completionPanel = document.getElementById('completionPanel');
const reviewGrid = document.getElementById('reviewGrid');
const backToFormButton = document.getElementById('backToFormButton');
const exportCsvButton = document.getElementById('exportCsvButton');
const exportJsonButton = document.getElementById('exportJsonButton');
const importJsonInput = document.getElementById('importJsonInput');
const clearDataButton = document.getElementById('clearDataButton');

const state = {
  schema: FORM_SCHEMA,
  answers: {},
  timers: new Map(),
  currentSectionIndex: 0,
  reviewMode: false
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

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
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

function getVisibleQuestions(section) {
  return section.questions.filter((question) => isVisible(question.showWhen));
}

function getVisibleFields(question) {
  return question.fields.filter((field) => isVisible(field.showWhen));
}

function questionHasRepeatedRows(fields) {
  return fields.some((field) => /_\d+_/.test(field.key));
}

function groupFieldsByRow(fields) {
  const groups = new Map();
  for (const field of fields) {
    const match = field.key.match(/_(\d+)_/);
    const rowKey = match ? match[1] : '__single';
    if (!groups.has(rowKey)) groups.set(rowKey, []);
    groups.get(rowKey).push(field);
  }
  return [...groups.values()];
}

function getExpectedSignerRows() {
  const candidateKeys = [
    'a1_partner_1_name', 'a1_partner_2_name', 'a1_partner_3_name',
    'a5_partner_1_name', 'a5_partner_2_name', 'a5_partner_3_name',
    'b1a_i_partner_1_name', 'b1a_i_partner_2_name', 'b1a_i_partner_3_name',
    'b1a_ii_partner_1_name', 'b1a_ii_partner_2_name', 'b1a_ii_partner_3_name',
    'b12_partner_1_name', 'b12_partner_2_name', 'b12_partner_3_name',
    'd2_partner_1_name', 'd2_partner_2_name', 'd2_partner_3_name'
  ];
  const uniqueNames = new Set(
    candidateKeys
      .map((key) => String(state.answers[key] ?? '').trim())
      .filter(Boolean)
  );
  return Math.max(1, uniqueNames.size || 0);
}

function isQuestionComplete(question) {
  const visibleFields = getVisibleFields(question);
  if (!visibleFields.length) return true;

  if (question.id === 'd2') {
    const expectedRows = getExpectedSignerRows();
    const rowGroups = groupFieldsByRow(visibleFields).filter((group) => group[0]?.key.includes('partner_'));
    let completeRows = 0;

    for (const rowFields of rowGroups) {
      const answeredCount = rowFields.filter((field) => hasValue(state.answers[field.key])).length;
      if (answeredCount === 0) continue;
      if (answeredCount !== rowFields.length) return false;
      completeRows += 1;
    }

    return completeRows >= expectedRows;
  }

  if (questionHasRepeatedRows(visibleFields)) {
    const rowGroups = groupFieldsByRow(visibleFields);
    let hasCompleteRow = false;

    for (const rowFields of rowGroups) {
      const answeredCount = rowFields.filter((field) => hasValue(state.answers[field.key])).length;
      if (answeredCount === 0) continue;
      if (answeredCount !== rowFields.length) return false;
      hasCompleteRow = true;
    }

    return hasCompleteRow;
  }

  return visibleFields.every((field) => hasValue(state.answers[field.key]));
}

function getAllVisibleQuestions() {
  return state.schema.flatMap((section) =>
    getVisibleQuestions(section).map((question) => ({ section, question }))
  );
}

function getProgress() {
  const visibleQuestions = getAllVisibleQuestions();
  const complete = visibleQuestions.filter(({ question }) => isQuestionComplete(question)).length;
  const total = visibleQuestions.length;
  return {
    complete,
    total,
    percent: total ? Math.round((complete / total) * 100) : 0,
    allComplete: total > 0 && complete === total
  };
}

function getSectionProgress(section) {
  const visibleQuestions = getVisibleQuestions(section);
  const complete = visibleQuestions.filter((question) => isQuestionComplete(question)).length;
  const total = visibleQuestions.length;
  return {
    complete,
    total,
    percent: total ? Math.round((complete / total) * 100) : 0,
    allComplete: total > 0 && complete === total
  };
}

function getQuestionHelp(question) {
  const visibleFields = getVisibleFields(question);
  if (!visibleFields.length) return '';
  if (question.id === 'd2') {
    return `Complete signatures for the partners you listed earlier. Currently expecting ${getExpectedSignerRows()} completed signer row${getExpectedSignerRows() === 1 ? '' : 's'}.`;
  }
  if (question.id === 'a1') {
    return 'If nobody is contributing initial capital, choose No and continue. If Yes, complete at least one full row.';
  }
  if (question.id === 'b1a_ii') {
    return 'If there is no cap on additional contributions, choose No and continue.';
  }
  if (question.id === 'b12') {
    return 'If no partner receives a salary, choose No and continue. If Yes, complete at least one full row.';
  }
  if (questionHasRepeatedRows(visibleFields)) {
    return 'Complete at least one full row. Leave unused rows entirely blank.';
  }
  if (visibleFields.some((field) => field.type === 'radio')) {
    return 'Choose the response that best reflects your agreement.';
  }
  if (visibleFields.some((field) => field.type === 'textarea')) {
    return 'Keep the response concise so exports stay easy to compare.';
  }
  return '';
}

function getSectionDescription(section) {
  const descriptions = {
    'section-a': 'Define the initial structure of the partnership: ownership, contributions, and financing expectations.',
    'section-b': 'Clarify management, authority, compensation, and operational expectations for each partner.',
    'section-c': 'Plan for change, conflict, exit, death, disability, and buyout procedures before they happen.',
    'section-d': 'Capture any final considerations, signatures, and witness details.'
  };
  return descriptions[section.id] || 'Complete each question in this section before moving on.';
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

function renderReviewSummary() {
  reviewGrid.innerHTML = '';

  state.schema.forEach((section, index) => {
    const visibleQuestions = getVisibleQuestions(section);
    const sectionProgress = getSectionProgress(section);
    const card = document.createElement('article');
    card.className = 'review-card';

    const topQuestions = visibleQuestions.slice(0, 4).map((question) => {
      const complete = isQuestionComplete(question);
      return `<li><strong>${question.number}</strong> — ${question.prompt} <span class="review-count">${complete ? 'Complete' : 'Needs review'}</span></li>`;
    }).join('');

    card.innerHTML = `
      <div class="review-card-head">
        <h3>${section.title}</h3>
        <span class="review-count">${sectionProgress.complete}/${sectionProgress.total} complete</span>
      </div>
      <ol class="review-list">${topQuestions}</ol>
    `;

    card.addEventListener('click', () => {
      state.reviewMode = false;
      state.currentSectionIndex = index;
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    reviewGrid.appendChild(card);
  });
}

function updateProgressUi() {
  const progress = getProgress();
  progressCount.textContent = `${progress.complete} / ${progress.total} questions`;
  progressFill.style.width = `${progress.percent}%`;
  progressNote.textContent = progress.allComplete
    ? 'All visible questions are complete.'
    : `${progress.total - progress.complete} questions remaining.`;
  completionPanel.classList.toggle('hidden', !(progress.allComplete && state.reviewMode));

  if (progress.allComplete && state.reviewMode) {
    currentSectionSummary.textContent = 'Final review is ready. Jump back into any section if you want to make changes before exporting.';
    renderReviewSummary();
  } else {
    const currentSection = state.schema[state.currentSectionIndex];
    const sectionProgress = getSectionProgress(currentSection);
    currentSectionSummary.textContent = `${currentSection.title} · ${sectionProgress.complete} of ${sectionProgress.total} questions complete`;
  }

  prevSectionButton.disabled = state.reviewMode || state.currentSectionIndex === 0;
  nextSectionButton.disabled = state.reviewMode;
  nextSectionButton.textContent = progress.allComplete && state.currentSectionIndex === state.schema.length - 1
    ? 'Review & export'
    : state.currentSectionIndex === state.schema.length - 1
      ? 'Last section'
      : 'Next section';
}

function renderSectionNav() {
  sectionNav.innerHTML = '';

  state.schema.forEach((section, index) => {
    const navLink = document.createElement('a');
    navLink.href = `#${section.id}`;
    if (index === state.currentSectionIndex) navLink.classList.add('active');

    const sectionProgress = getSectionProgress(section);
    navLink.innerHTML = `
      <div class="section-link-top">
        <strong>${section.title}</strong>
        <span class="section-count">${sectionProgress.complete}/${sectionProgress.total}</span>
      </div>
      <div class="section-link-bottom">
        <div class="section-mini-track"><div class="section-mini-fill" style="width:${sectionProgress.percent}%"></div></div>
        <span class="section-percent">${sectionProgress.percent}%</span>
      </div>
    `;

    navLink.addEventListener('click', (event) => {
      event.preventDefault();
      state.reviewMode = false;
      state.currentSectionIndex = index;
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    sectionNav.appendChild(navLink);
  });
}

function renderCurrentSection() {
  app.innerHTML = '';
  if (state.reviewMode) return;

  const section = state.schema[state.currentSectionIndex];
  const visibleQuestions = getVisibleQuestions(section);

  const stage = document.createElement('section');
  stage.className = 'section-stage';
  stage.id = section.id;

  const heading = document.createElement('div');
  heading.className = 'section-heading';
  heading.innerHTML = `
    <div class="section-kicker">Now reviewing</div>
    <h2 class="section-title">${section.title}</h2>
    <p class="section-description">${getSectionDescription(section)}</p>
  `;
  stage.appendChild(heading);

  const questionList = document.createElement('div');
  questionList.className = 'question-list';

  visibleQuestions.forEach((question) => {
    const card = document.createElement('article');
    card.className = 'question-card';

    const meta = document.createElement('div');
    meta.className = 'question-meta';

    const label = document.createElement('div');
    label.className = 'question-label';
    label.textContent = question.number;

    const badge = document.createElement('div');
    const complete = isQuestionComplete(question);
    badge.className = `question-badge${complete ? ' complete' : ''}`;
    badge.textContent = complete ? 'Complete' : 'Needs attention';

    meta.append(label, badge);

    const title = document.createElement('h3');
    title.className = 'question-title';
    title.textContent = question.prompt;

    const helpText = getQuestionHelp(question);
    const help = document.createElement('p');
    help.className = 'question-help';
    help.textContent = helpText;

    const fieldsGrid = document.createElement('div');
    fieldsGrid.className = 'fields-grid';
    question.fields.forEach((field) => fieldsGrid.appendChild(createInput(field)));

    card.append(meta, title);
    if (helpText) card.appendChild(help);
    card.appendChild(fieldsGrid);
    questionList.appendChild(card);
  });

  stage.appendChild(questionList);

  const footer = document.createElement('div');
  footer.className = 'section-footer';
  footer.innerHTML = `<p class="note">Finish this section, then move to the next one when you’re ready.</p>`;

  const actions = document.createElement('div');
  actions.className = 'section-controls';
  const prevClone = prevSectionButton.cloneNode(true);
  const nextClone = nextSectionButton.cloneNode(true);
  prevClone.id = 'prevSectionButtonInline';
  nextClone.id = 'nextSectionButtonInline';
  prevClone.disabled = state.currentSectionIndex === 0;
  nextClone.disabled = state.currentSectionIndex === state.schema.length - 1;
  nextClone.textContent = state.currentSectionIndex === state.schema.length - 1 ? 'Last section' : 'Next section';
  prevClone.addEventListener('click', goToPreviousSection);
  nextClone.addEventListener('click', goToNextSection);
  actions.append(prevClone, nextClone);
  footer.appendChild(actions);
  stage.appendChild(footer);

  app.appendChild(stage);
}

function render() {
  renderSectionNav();
  updateProgressUi();
  renderCurrentSection();
}

function queueSave(key, value) {
  state.answers[key] = value;
  state.reviewMode = false;
  if (affectsVisibility(key) || key.startsWith('a1_partner_') || key.startsWith('d2_partner_')) {
    render();
  } else {
    updateProgressUi();
    renderSectionNav();
    renderCurrentSection();
  }
  setStatus('Saving…', 'saving');

  if (state.timers.has(key)) clearTimeout(state.timers.get(key));

  const timer = setTimeout(() => {
    try {
      persistAnswers();
      updateProgressUi();
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
  if (!getProgress().allComplete) return;
  downloadFile('partnership-worksheet-export.csv', buildCsv(), 'text/csv;charset=utf-8');
  setStatus('CSV exported', 'saved');
}

function exportJson() {
  if (!getProgress().allComplete) return;
  const payload = {
    exportedAt: new Date().toISOString(),
    progress: getProgress(),
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
  state.reviewMode = false;
  state.currentSectionIndex = 0;
  localStorage.removeItem(STORAGE_KEY);
  render();
  setStatus('Saved data cleared', 'saved');
}

function goToPreviousSection() {
  state.reviewMode = false;
  if (state.currentSectionIndex === 0) return;
  state.currentSectionIndex -= 1;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToNextSection() {
  const progress = getProgress();
  if (state.currentSectionIndex >= state.schema.length - 1) {
    if (progress.allComplete) {
      state.reviewMode = true;
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return;
  }
  state.reviewMode = false;
  state.currentSectionIndex += 1;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindActions() {
  exportCsvButton.addEventListener('click', exportCsv);
  exportJsonButton.addEventListener('click', exportJson);
  importJsonInput.addEventListener('change', (event) => importJsonFile(event.target.files?.[0]));
  clearDataButton.addEventListener('click', clearSavedData);
  prevSectionButton.addEventListener('click', goToPreviousSection);
  nextSectionButton.addEventListener('click', goToNextSection);
  backToFormButton.addEventListener('click', () => {
    state.reviewMode = false;
    render();
  });
}

function init() {
  setStatus('Loading…');
  state.answers = loadAnswers();
  bindActions();
  render();
  setStatus('Ready');
}

init();
