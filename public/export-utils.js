export function flattenFields(schema, answers) {
  return schema.flatMap((section) =>
    section.questions.flatMap((question) =>
      question.fields.map((field) => ({
        section: section.title,
        questionNumber: question.number,
        prompt: question.prompt,
        key: field.key,
        label: field.label,
        value: answers[field.key] ?? ''
      }))
    )
  );
}

export function csvEscape(value) {
  const stringValue = value == null ? '' : String(value);
  return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
}

export function buildCsv(schema, answers) {
  const rows = [['section', 'question_number', 'prompt', 'field_key', 'field_label', 'value']];
  for (const field of flattenFields(schema, answers)) {
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
