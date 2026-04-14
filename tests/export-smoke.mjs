import assert from 'node:assert/strict';
import { FORM_SCHEMA } from '../public/schema-data.js';
import { buildCsv, flattenFields } from '../public/export-utils.js';

const answers = {
  a1_has_initial_capital_contributions: 'No',
  a2_personal_guarantee_loans: 'No',
  a3_personal_equity_support_loans: 'No',
  a4_interest_paid: 'No',
  a5_partner_loans_exist: 'Yes',
  a5_partner_1_name: 'Jordan Lee',
  a5_partner_1_amount: '25000',
  a5_partner_1_term_years: '5',
  a5_partner_1_interest_rate: '6.5',
  b1a_additional_capital_required: 'Yes',
  b1a_i_partner_1_name: 'Jordan Lee',
  b1a_i_partner_1_percent: '100',
  b1a_ii_has_cap: 'No',
  b1b_personal_guarantee_additional_loans: 'No',
  b1c_personal_equity_additional_loans: 'No',
  b2_withdrawal_circumstances: 'Only by unanimous written approval.',
  b3_profit_loss_allocation: 'Allocated based on ownership percentages.',
  b4_profit_distribution_timing: 'Quarterly when cash flow permits.',
  b5_distribution_decider: 'Managing partners decide quarterly.',
  b6_retained_profits: 'Yes, retain 20% for reserves.',
  b7_business_management: 'Managed jointly with one lead operating partner.',
  b8_partners_performing_work: 'Yes',
  b9_roles_time_commitments: 'Jordan leads operations full time.',
  b10a_hire_fire_authority: 'Any hiring requires both partners.',
  b10b_purchase_authority: 'Routine purchases under approved budget only.',
  b10c_authorization_cap: '5000',
  b10d_fund_access: 'Both partners and bookkeeper.',
  b10e_financial_management: 'Bookkeeper prepares reports; partners review monthly.',
  b10f_pricing_discounts: 'Pricing reviewed monthly against margin targets.',
  b10g_expense_report_approval: 'Yes',
  b10h_no_majority_consent_acts: 'Normal day-to-day operational decisions.',
  b10i_unanimous_consent_acts: 'Debt, equity changes, and major contracts.',
  b11_restricted_outside_activities: 'Competing directly with the partnership.',
  b12_has_partner_salary: 'No',
  b13_other_salary_considerations: 'Bonuses only when profits exceed threshold.',
  b14_salary_shortfall_decision: 'Pause salary payments by mutual agreement.',
  b15_standard_communications: 'Weekly meeting and monthly reporting.',
  b16_new_partners_added: 'Only by unanimous written approval.',
  c1_non_compete: 'Yes',
  c2a_sell_entire_business: 'No',
  c2b_buyout_process: 'Yes',
  c2c_i_health_income_insurance: 'No',
  c2c_ii_health_loss_insurance: 'Yes',
  c2d_protected_rights: 'Remaining partner may buy out over 24 months.',
  c3a_value_to_estate: 'Yes',
  c3b_transfer_authority: 'Yes',
  c3c_new_owner_work_responsibility: 'No',
  c3d_authority_stays_with_stock_owner: 'No',
  c3e_buyout_option_procedure: 'Appraisal plus installment payments.',
  c3f_death_insurance: 'Yes',
  c4a_nonperformance_options: 'Mediation, cure period, then buyout.',
  c4b_nonperformance_steps: 'Written notice, meeting, mediation, then vote.',
  c5_selling_price_formula: '3x average EBITDA over trailing 24 months.',
  c6_payment_structure: '20% down, balance over 36 months.',
  d1_additional_considerations: 'Review the agreement annually.',
  d2_partner_1_name: 'Jordan Lee',
  d2_partner_1_signature: 'Jordan Lee',
  d2_partner_1_date: '2026-04-14',
  d2_partner_1_ownership: '100',
  d3_witness_name: 'Pat Morgan',
  d3_witness_date: '2026-04-14'
};

const rows = flattenFields(FORM_SCHEMA, answers);
const csv = buildCsv(FORM_SCHEMA, answers);

assert.ok(rows.length > 50, 'expected many flattened rows');
assert.ok(csv.includes('a1_has_initial_capital_contributions'), 'expected short-circuit field in CSV');
assert.ok(csv.includes('Jordan Lee'), 'expected dummy name in CSV');
assert.ok(csv.includes('3x average EBITDA over trailing 24 months.'), 'expected exit formula in CSV');
assert.ok(csv.startsWith('section,question_number,prompt,field_key,field_label,value'), 'expected CSV header row');

const a1RadioRow = rows.find((row) => row.key === 'a1_has_initial_capital_contributions');
assert.equal(a1RadioRow.value, 'No');

const salaryRow = rows.find((row) => row.key === 'b12_has_partner_salary');
assert.equal(salaryRow.value, 'No');

console.log('Export smoke test passed.');
