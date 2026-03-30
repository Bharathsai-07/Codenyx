/**
 * Quiz questions mapped by topic ID.
 * Each quiz has 5 multiple-choice questions.
 */
export const QUIZZES = {
  'math-101': {
    title: 'Number Systems Quiz',
    questions: [
      { id: 1, question: 'Which of the following is an irrational number?', options: ['3/4', '0.5', '√2', '7'], answer: 2 },
      { id: 2, question: 'Natural numbers start from:', options: ['0', '1', '-1', 'None'], answer: 1 },
      { id: 3, question: 'Which property states a + b = b + a?', options: ['Associative', 'Distributive', 'Commutative', 'Closure'], answer: 2 },
      { id: 4, question: 'Integers include:', options: ['Only positive numbers', 'Only negative numbers', 'Positive, negative and zero', 'Only fractions'], answer: 2 },
      { id: 5, question: 'π is a:', options: ['Rational number', 'Irrational number', 'Integer', 'Whole number'], answer: 1 },
    ],
  },
  'math-102': {
    title: 'Basic Algebra Quiz',
    questions: [
      { id: 1, question: 'Solve: 2x + 3 = 11', options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'], answer: 1 },
      { id: 2, question: 'What is 3x + 5x?', options: ['8x²', '15x', '8x', '8'], answer: 2 },
      { id: 3, question: 'A binomial has how many terms?', options: ['1', '2', '3', '4'], answer: 1 },
      { id: 4, question: '(2x)(3x) equals:', options: ['5x', '6x', '6x²', '5x²'], answer: 2 },
      { id: 5, question: 'In the expression 5y + 7, which is the variable?', options: ['5', '7', 'y', '+'], answer: 2 },
    ],
  },
  'math-103': {
    title: 'Fractions & Decimals Quiz',
    questions: [
      { id: 1, question: '1/3 + 1/4 = ?', options: ['2/7', '7/12', '1/7', '4/7'], answer: 1 },
      { id: 2, question: '2/3 × 3/4 = ?', options: ['6/7', '1/2', '5/12', '6/12'], answer: 1 },
      { id: 3, question: 'Convert 3/4 to decimal:', options: ['0.34', '0.75', '0.25', '0.50'], answer: 1 },
      { id: 4, question: '7/4 is a(n) ___ fraction:', options: ['Proper', 'Improper', 'Mixed', 'Decimal'], answer: 1 },
      { id: 5, question: '2/3 ÷ 4/5 = ?', options: ['8/15', '5/6', '10/12', '6/20'], answer: 1 },
    ],
  },
  'math-201': {
    title: 'Linear Equations Quiz',
    questions: [
      { id: 1, question: 'In y = mx + b, what does m represent?', options: ['y-intercept', 'Slope', 'Variable', 'Constant'], answer: 1 },
      { id: 2, question: 'Find the slope between (1,2) and (3,6):', options: ['1', '2', '3', '4'], answer: 1 },
      { id: 3, question: 'The standard form of a linear equation is:', options: ['y = mx + b', 'ax + by = c', 'ax² + bx + c = 0', 'y = ax²'], answer: 1 },
      { id: 4, question: 'Solve: x + y = 10, x - y = 4. Find x:', options: ['5', '6', '7', '8'], answer: 2 },
      { id: 5, question: 'A vertical line has:', options: ['Zero slope', 'Undefined slope', 'Positive slope', 'Negative slope'], answer: 1 },
    ],
  },
  'math-202': {
    title: 'Quadratic Equations Quiz',
    questions: [
      { id: 1, question: 'The quadratic formula is used for equations of form:', options: ['ax + b = 0', 'ax² + bx + c = 0', 'a/x = b', 'ax³ = b'], answer: 1 },
      { id: 2, question: 'If discriminant < 0, the equation has:', options: ['Two real roots', 'One real root', 'No real roots', 'Infinite roots'], answer: 2 },
      { id: 3, question: 'Factor x² + 5x + 6:', options: ['(x+1)(x+6)', '(x+2)(x+3)', '(x+3)(x+3)', '(x+1)(x+5)'], answer: 1 },
      { id: 4, question: 'The shape of a quadratic graph is a:', options: ['Line', 'Circle', 'Parabola', 'Hyperbola'], answer: 2 },
      { id: 5, question: 'Vertex x-coordinate = ?', options: ['b/2a', '-b/2a', 'b/a', '-b/a'], answer: 1 },
    ],
  },
  'math-301': {
    title: 'Differentiation Quiz',
    questions: [
      { id: 1, question: 'd/dx(x³) = ?', options: ['x²', '3x²', '3x³', 'x³'], answer: 1 },
      { id: 2, question: 'd/dx(constant) = ?', options: ['1', 'constant', '0', 'undefined'], answer: 2 },
      { id: 3, question: 'The derivative of sin(x) is:', options: ['-cos(x)', 'cos(x)', 'tan(x)', '-sin(x)'], answer: 1 },
      { id: 4, question: 'The product rule is:', options: ["f'g + fg'", "f'g - fg'", "f'g'", "f/g'"], answer: 0 },
      { id: 5, question: 'd/dx(eˣ) = ?', options: ['xeˣ', 'eˣ', 'e', '1/eˣ'], answer: 1 },
    ],
  },
  'eng-101': {
    title: 'Parts of Speech Quiz',
    questions: [
      { id: 1, question: '"London" is a ___ noun:', options: ['Common', 'Proper', 'Abstract', 'Collective'], answer: 1 },
      { id: 2, question: 'Which is an adverb?', options: ['Beautiful', 'Quickly', 'Running', 'Chair'], answer: 1 },
      { id: 3, question: '"He", "She", "It" are examples of:', options: ['Nouns', 'Verbs', 'Pronouns', 'Adjectives'], answer: 2 },
      { id: 4, question: 'Which word is a conjunction?', options: ['Under', 'Beautiful', 'Because', 'Wow'], answer: 2 },
      { id: 5, question: '"In", "on", "at" are:', options: ['Adverbs', 'Prepositions', 'Conjunctions', 'Nouns'], answer: 1 },
    ],
  },
  'eng-102': {
    title: 'Tenses Quiz',
    questions: [
      { id: 1, question: '"I am studying now" is in which tense?', options: ['Simple Present', 'Present Continuous', 'Past Continuous', 'Future'], answer: 1 },
      { id: 2, question: '"She wrote a letter" is:', options: ['Simple Present', 'Simple Past', 'Past Perfect', 'Present Perfect'], answer: 1 },
      { id: 3, question: 'Which tense uses "will"?', options: ['Past', 'Present', 'Future', 'All'], answer: 2 },
      { id: 4, question: '"I have been studying for 2 hours" is:', options: ['Present Perfect', 'Present Perfect Continuous', 'Past Perfect', 'Simple Present'], answer: 1 },
      { id: 5, question: 'Simple present is used for:', options: ['Past events', 'Habits and facts', 'Future plans only', 'None'], answer: 1 },
    ],
  },
  'eng-201': {
    title: 'Active & Passive Voice Quiz',
    questions: [
      { id: 1, question: '"The cat chased the mouse" is:', options: ['Active', 'Passive', 'Neither', 'Both'], answer: 0 },
      { id: 2, question: 'In passive, the verb becomes:', options: ['Base form', 'be + past participle', 'ing form', 'Infinitive'], answer: 1 },
      { id: 3, question: 'Convert: "She writes a letter" →', options: ['A letter is written by her', 'A letter was written', 'She is writing', 'Letter writes'], answer: 0 },
      { id: 4, question: 'When is passive preferred?', options: ['Always', 'Never', 'When doer is unknown', 'In informal writing'], answer: 2 },
      { id: 5, question: '"The window was broken" — who broke it?', options: ['The window', 'Unknown', 'Was', 'Broken'], answer: 1 },
    ],
  },
  'eng-202': {
    title: 'Essay Writing Quiz',
    questions: [
      { id: 1, question: 'An essay introduction should include:', options: ['Conclusion', 'Hook and thesis', 'Only facts', 'Bibliography'], answer: 1 },
      { id: 2, question: 'A topic sentence appears in:', options: ['Introduction', 'Each body paragraph', 'Conclusion only', 'Title'], answer: 1 },
      { id: 3, question: 'Which is a transition word?', options: ['Dog', 'However', 'Blue', 'Running'], answer: 1 },
      { id: 4, question: 'An argumentative essay requires:', options: ['A story', 'A position to defend', 'Only description', 'No evidence'], answer: 1 },
      { id: 5, question: 'The conclusion should:', options: ['Introduce new ideas', 'Restate thesis differently', 'Be the longest part', 'Include questions'], answer: 1 },
    ],
  },
  'sci-101': {
    title: 'Introduction to Physics Quiz',
    questions: [
      { id: 1, question: "Newton's Second Law states:", options: ['F = ma', 'E = mc²', 'V = IR', 'P = mv'], answer: 0 },
      { id: 2, question: 'The SI unit of mass is:', options: ['Gram', 'Kilogram', 'Pound', 'Newton'], answer: 1 },
      { id: 3, question: "Newton's First Law is about:", options: ['Force', 'Energy', 'Inertia', 'Gravity'], answer: 2 },
      { id: 4, question: 'Which branch studies heat?', options: ['Optics', 'Mechanics', 'Thermodynamics', 'Electromagnetism'], answer: 2 },
      { id: 5, question: 'The scientific method starts with:', options: ['Experiment', 'Conclusion', 'Observation', 'Theory'], answer: 2 },
    ],
  },
  'sci-102': {
    title: 'Basic Chemistry Quiz',
    questions: [
      { id: 1, question: 'An atom consists of:', options: ['Only protons', 'Protons, neutrons, electrons', 'Only electrons', 'Molecules'], answer: 1 },
      { id: 2, question: 'H₂O is a:', options: ['Element', 'Compound', 'Mixture', 'Atom'], answer: 1 },
      { id: 3, question: 'In ionic bonding, electrons are:', options: ['Shared', 'Transferred', 'Destroyed', 'Created'], answer: 1 },
      { id: 4, question: 'Which state has a fixed shape?', options: ['Gas', 'Liquid', 'Solid', 'Plasma'], answer: 2 },
      { id: 5, question: 'NaCl is commonly known as:', options: ['Sugar', 'Water', 'Salt', 'Acid'], answer: 2 },
    ],
  },
  'sci-201': {
    title: 'Thermodynamics Quiz',
    questions: [
      { id: 1, question: 'The First Law of Thermodynamics is about:', options: ['Entropy', 'Conservation of energy', 'Heat death', 'Motion'], answer: 1 },
      { id: 2, question: 'ΔU = Q - W. What is Q?', options: ['Work done', 'Heat added', 'Internal energy', 'Entropy'], answer: 1 },
      { id: 3, question: 'Entropy always ___ in isolated systems:', options: ['Decreases', 'Stays same', 'Increases', 'Is zero'], answer: 2 },
      { id: 4, question: 'An isothermal process has constant:', options: ['Pressure', 'Volume', 'Temperature', 'Entropy'], answer: 2 },
      { id: 5, question: 'Heat naturally flows from:', options: ['Cold to hot', 'Hot to cold', 'Equal temps', 'Random'], answer: 1 },
    ],
  },
}

export function getQuizByTopicId(topicId) {
  return QUIZZES[topicId] || null
}
