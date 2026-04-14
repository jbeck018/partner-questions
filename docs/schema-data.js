export const FORM_SCHEMA = [
  {
    id: 'section-a',
    title: 'A. Entering the Partnership',
    questions: [
      {
        id: 'a1',
        number: 'A1',
        prompt: 'What will be the initial capital contributions of the partners?',
        fields: [1, 2, 3].flatMap((i) => ([
          { key: `a1_partner_${i}_name`, label: `Partner ${i} name`, type: 'text' },
          { key: `a1_partner_${i}_amount`, label: `Partner ${i} contribution amount`, type: 'currency' },
          { key: `a1_partner_${i}_ownership`, label: `Partner ${i} ownership %`, type: 'number', step: '0.01' },
        ]))
      },
      {
        id: 'a2',
        number: 'A2',
        prompt: 'Are partners obligated to personally guarantee loans?',
        fields: [{ key: 'a2_personal_guarantee_loans', label: 'Answer', type: 'radio', options: ['Yes', 'No'] }]
      },
      {
        id: 'a3',
        number: 'A3',
        prompt: 'Are partners obligated to sign over personal equity in support of loans?',
        fields: [{ key: 'a3_personal_equity_support_loans', label: 'Answer', type: 'radio', options: ['Yes', 'No'] }]
      },
      {
        id: 'a4',
        number: 'A4',
        prompt: 'Is interest paid on capital contributions by partners?',
        fields: [
          { key: 'a4_interest_paid', label: 'Answer', type: 'radio', options: ['Yes', 'No'] },
          { key: 'a4_interest_rate', label: 'Interest rate %', type: 'number', step: '0.01', showWhen: { key: 'a4_interest_paid', equals: 'Yes' } }
        ]
      },
      {
        id: 'a5',
        number: 'A5',
        prompt: 'Will there be loans made by the partners to the partnership?',
        fields: [
          { key: 'a5_partner_loans_exist', label: 'Answer', type: 'radio', options: ['Yes', 'No'] },
          ...[1, 2, 3].flatMap((i) => ([
            { key: `a5_partner_${i}_name`, label: `Lender ${i} name`, type: 'text', showWhen: { key: 'a5_partner_loans_exist', equals: 'Yes' } },
            { key: `a5_partner_${i}_amount`, label: `Lender ${i} amount`, type: 'currency', showWhen: { key: 'a5_partner_loans_exist', equals: 'Yes' } },
            { key: `a5_partner_${i}_term_years`, label: `Lender ${i} term (years)`, type: 'number', step: '1', showWhen: { key: 'a5_partner_loans_exist', equals: 'Yes' } },
            { key: `a5_partner_${i}_interest_rate`, label: `Lender ${i} interest rate %`, type: 'number', step: '0.01', showWhen: { key: 'a5_partner_loans_exist', equals: 'Yes' } },
          ]))
        ]
      }
    ]
  },
  {
    id: 'section-b',
    title: 'B. Expectations and Compensation of the Partners',
    questions: [
      {
        id: 'b1a',
        number: 'B1a',
        prompt: 'If the partnership needs additional capital in the future, will the partners be obligated to contribute personally?',
        fields: [{ key: 'b1a_additional_capital_required', label: 'Answer', type: 'radio', options: ['Yes', 'No'] }]
      },
      {
        id: 'b1a_i',
        number: 'B1a.i',
        prompt: 'If yes, in what proportion?',
        showWhen: { key: 'b1a_additional_capital_required', equals: 'Yes' },
        fields: [1, 2, 3].flatMap((i) => ([
          { key: `b1a_i_partner_${i}_name`, label: `Partner ${i} name`, type: 'text' },
          { key: `b1a_i_partner_${i}_percent`, label: `Partner ${i} percent`, type: 'number', step: '0.01' },
        ]))
      },
      {
        id: 'b1a_ii',
        number: 'B1a.ii',
        prompt: 'If yes, is it subject to a cap?',
        showWhen: { key: 'b1a_additional_capital_required', equals: 'Yes' },
        fields: [1, 2, 3].flatMap((i) => ([
          { key: `b1a_ii_partner_${i}_name`, label: `Partner ${i} name`, type: 'text' },
          { key: `b1a_ii_partner_${i}_cap_amount`, label: `Partner ${i} cap amount`, type: 'currency' },
        ]))
      },
      {
        id: 'b1b',
        number: 'B1b',
        prompt: 'Are partners obligated to personally guarantee additional loans?',
        fields: [{ key: 'b1b_personal_guarantee_additional_loans', label: 'Answer', type: 'radio', options: ['Yes', 'No'] }]
      },
      {
        id: 'b1c',
        number: 'B1c',
        prompt: 'Are partners obligated to sign over additional personal equity in support of loan requirements?',
        fields: [{ key: 'b1c_personal_equity_additional_loans', label: 'Answer', type: 'radio', options: ['Yes', 'No'] }]
      },
      {
        id: 'b2',
        number: 'B2',
        prompt: 'Under what circumstances can capital contributions be withdrawn from the partnership?',
        fields: [{ key: 'b2_withdrawal_circumstances', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'b3',
        number: 'B3',
        prompt: 'How are profits and losses allocated among the partners?',
        fields: [{ key: 'b3_profit_loss_allocation', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'b4',
        number: 'B4',
        prompt: 'When are distributions of profits to be made?',
        fields: [{ key: 'b4_profit_distribution_timing', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'b5',
        number: 'B5',
        prompt: 'Who decides profit distributions and when?',
        fields: [{ key: 'b5_distribution_decider', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'b6',
        number: 'B6',
        prompt: 'Are there profits that will be retained in the business and not distributed?',
        fields: [{ key: 'b6_retained_profits', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'b7',
        number: 'B7',
        prompt: 'Describe how the business will be managed. Will there be a managing partner?',
        fields: [{ key: 'b7_business_management', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'b8',
        number: 'B8',
        prompt: 'Will there be partners performing work in the partnership?',
        fields: [{ key: 'b8_partners_performing_work', label: 'Answer', type: 'radio', options: ['Yes', 'No'] }]
      },
      {
        id: 'b9',
        number: 'B9',
        prompt: 'What are the specific roles and time commitments for the partners?',
        fields: [{ key: 'b9_roles_time_commitments', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'b10a',
        number: 'B10a',
        prompt: 'Who can hire, fire, etc.?',
        fields: [{ key: 'b10a_hire_fire_authority', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'b10b',
        number: 'B10b',
        prompt: 'Who can purchase what without getting approval?',
        fields: [{ key: 'b10b_purchase_authority', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'b10c',
        number: 'B10c',
        prompt: 'Is there an authorization cap?',
        fields: [{ key: 'b10c_authorization_cap', label: 'Authorization cap amount', type: 'currency' }]
      },
      {
        id: 'b10d',
        number: 'B10d',
        prompt: 'Who has access to the funds?',
        fields: [{ key: 'b10d_fund_access', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'b10e',
        number: 'B10e',
        prompt: 'Who is responsible for financial management, record keeping, and reporting?',
        fields: [{ key: 'b10e_financial_management', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'b10f',
        number: 'B10f',
        prompt: 'How do you determine selling price, discounts, etc.?',
        fields: [{ key: 'b10f_pricing_discounts', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'b10g',
        number: 'B10g',
        prompt: 'Do you require a partner to approve expense report payments for the other?',
        fields: [{ key: 'b10g_expense_report_approval', label: 'Answer', type: 'radio', options: ['Yes', 'No'] }]
      },
      {
        id: 'b10h',
        number: 'B10h',
        prompt: 'What acts will not require the majority consent of the partners?',
        fields: [{ key: 'b10h_no_majority_consent_acts', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'b10i',
        number: 'B10i',
        prompt: 'What acts will require the unanimous consent of the partners? (Contractual? Purchases over $x? etc.)',
        fields: [{ key: 'b10i_unanimous_consent_acts', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'b11',
        number: 'B11',
        prompt: 'What outside activities of the partners are considered unfair and therefore restricted?',
        fields: [{ key: 'b11_restricted_outside_activities', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'b12',
        number: 'B12',
        prompt: 'Is any partner entitled to a salary?',
        fields: [1, 2, 3].flatMap((i) => ([
          { key: `b12_partner_${i}_name`, label: `Partner ${i} name`, type: 'text' },
          { key: `b12_partner_${i}_salary_amount`, label: `Partner ${i} salary amount`, type: 'currency' },
          { key: `b12_partner_${i}_salary_period`, label: `Partner ${i} salary period`, type: 'text', placeholder: 'month, year, week...' },
        ]))
      },
      {
        id: 'b13',
        number: 'B13',
        prompt: 'Other salary or pay considerations?',
        fields: [{ key: 'b13_other_salary_considerations', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'b14',
        number: 'B14',
        prompt: 'If the business does not have the cash to pay the partners’ salaries, how will that decision be made?',
        fields: [{ key: 'b14_salary_shortfall_decision', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'b15',
        number: 'B15',
        prompt: 'What standard communications are required of the partners?',
        fields: [{ key: 'b15_standard_communications', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'b16',
        number: 'B16',
        prompt: 'How can new partners be added?',
        fields: [{ key: 'b16_new_partners_added', label: 'Response', type: 'textarea' }]
      }
    ]
  },
  {
    id: 'section-c',
    title: 'C. Exiting the Partnership',
    questions: [
      {
        id: 'c1',
        number: 'C1',
        prompt: 'Is there a non-compete clause for exiting partner(s)?',
        fields: [{ key: 'c1_non_compete', label: 'Answer', type: 'radio', options: ['Yes', 'No'] }]
      },
      {
        id: 'c2a',
        number: 'C2a',
        prompt: 'If life-changing events or relationship issues cause a partner to lose focus, reduce hours, or withdraw completely, should this trigger selling the entire business?',
        fields: [{ key: 'c2a_sell_entire_business', label: 'Answer', type: 'radio', options: ['Yes', 'No'] }]
      },
      {
        id: 'c2b',
        number: 'C2b',
        prompt: 'Should this trigger a buyout process for the remaining partner(s)?',
        fields: [{ key: 'c2b_buyout_process', label: 'Answer', type: 'radio', options: ['Yes', 'No'] }]
      },
      {
        id: 'c2c_i',
        number: 'C2c.i',
        prompt: 'If health related, does the partnership provide insurance so the partner continues to receive income?',
        fields: [{ key: 'c2c_i_health_income_insurance', label: 'Answer', type: 'radio', options: ['Yes', 'No'] }]
      },
      {
        id: 'c2c_ii',
        number: 'C2c.ii',
        prompt: 'If health related, does the business require insurance to provide a means to compensate for the loss?',
        fields: [{ key: 'c2c_ii_health_loss_insurance', label: 'Answer', type: 'radio', options: ['Yes', 'No'] }]
      },
      {
        id: 'c2d',
        number: 'C2d',
        prompt: 'Are there protected rights for the remaining partner(s) so the business can continue and they can continue to receive income? Describe.',
        fields: [{ key: 'c2d_protected_rights', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'c3a',
        number: 'C3a',
        prompt: 'Does the value get distributed to the estate?',
        fields: [{ key: 'c3a_value_to_estate', label: 'Answer', type: 'radio', options: ['Yes', 'No'] }]
      },
      {
        id: 'c3b',
        number: 'C3b',
        prompt: 'Does the authority and responsibility of the business activities transfer to the remaining partner(s)?',
        fields: [{ key: 'c3b_transfer_authority', label: 'Answer', type: 'radio', options: ['Yes', 'No'] }]
      },
      {
        id: 'c3c',
        number: 'C3c',
        prompt: 'Do the new owners have the responsibility to perform the work of the partner who died?',
        fields: [{ key: 'c3c_new_owner_work_responsibility', label: 'Answer', type: 'radio', options: ['Yes', 'No'] }]
      },
      {
        id: 'c3d',
        number: 'C3d',
        prompt: 'Or does that authority and responsibility stay with the owner of the stock?',
        fields: [{ key: 'c3d_authority_stays_with_stock_owner', label: 'Answer', type: 'radio', options: ['Yes', 'No'] }]
      },
      {
        id: 'c3e',
        number: 'C3e',
        prompt: 'What is the buyout option and procedure for the remaining partner?',
        fields: [{ key: 'c3e_buyout_option_procedure', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'c3f',
        number: 'C3f',
        prompt: 'Does the business require appropriate insurance to ensure it can continue after such a death?',
        fields: [{ key: 'c3f_death_insurance', label: 'Answer', type: 'radio', options: ['Yes', 'No'] }]
      },
      {
        id: 'c4a',
        number: 'C4a',
        prompt: 'If a partner finds another is not performing according to the spirit of the partnership agreement, what options can be exercised?',
        fields: [{ key: 'c4a_nonperformance_options', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'c4b',
        number: 'C4b',
        prompt: 'What are the steps required by the concerned partner(s)?',
        fields: [{ key: 'c4b_nonperformance_steps', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'c5',
        number: 'C5',
        prompt: 'What is the formula used in establishing the selling price?',
        fields: [{ key: 'c5_selling_price_formula', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'c6',
        number: 'C6',
        prompt: 'Describe the agreed payment structure (or options) and criteria that are fair for the remaining partner(s) and allow the business to survive the change.',
        fields: [{ key: 'c6_payment_structure', label: 'Response', type: 'textarea' }]
      }
    ]
  },
  {
    id: 'section-d',
    title: 'Additional Considerations and Signatures',
    questions: [
      {
        id: 'd1',
        number: 'D1',
        prompt: 'Additional considerations',
        fields: [{ key: 'd1_additional_considerations', label: 'Response', type: 'textarea' }]
      },
      {
        id: 'd2',
        number: 'D2',
        prompt: 'Agreement signatures',
        fields: [1, 2, 3].flatMap((i) => ([
          { key: `d2_partner_${i}_name`, label: `Signer ${i} name`, type: 'text' },
          { key: `d2_partner_${i}_signature`, label: `Signer ${i} signature`, type: 'text' },
          { key: `d2_partner_${i}_date`, label: `Signer ${i} date`, type: 'date' },
          { key: `d2_partner_${i}_ownership`, label: `Signer ${i} ownership %`, type: 'number', step: '0.01' },
        ]))
      },
      {
        id: 'd3',
        number: 'D3',
        prompt: 'Witness',
        fields: [
          { key: 'd3_witness_name', label: 'Witness name', type: 'text' },
          { key: 'd3_witness_date', label: 'Witness date', type: 'date' }
        ]
      }
    ]
  }
];
