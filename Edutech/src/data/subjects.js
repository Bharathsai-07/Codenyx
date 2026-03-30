/**
 * Learning content: Subjects → Topics (by level) → Lessons
 */
export const SUBJECTS = [
  {
    id: 'math',
    name: 'Mathematics',
    icon: '📐',
    color: '#6366f1',
    description: 'Numbers, algebra, geometry, and beyond',
    levels: [
      {
        level: 1,
        name: 'Foundations',
        topics: [
          {
            id: 'math-101',
            title: 'Number Systems',
            duration: '15 min',
            lesson: `# Number Systems\n\nNumbers are the building blocks of mathematics. Let's explore the different types:\n\n## Natural Numbers (ℕ)\nThese are counting numbers: 1, 2, 3, 4, 5...\nThey do not include 0 or negative numbers.\n\n## Whole Numbers (W)\nNatural numbers plus zero: 0, 1, 2, 3, 4...\n\n## Integers (ℤ)\nWhole numbers plus negatives: ...-3, -2, -1, 0, 1, 2, 3...\n\n## Rational Numbers (ℚ)\nNumbers that can be expressed as a fraction p/q where q ≠ 0.\nExamples: 1/2, 3/4, 0.75, -2/3\n\n## Irrational Numbers\nNumbers that cannot be expressed as fractions.\nExamples: √2 = 1.414..., π = 3.14159...\n\n## Real Numbers (ℝ)\nAll rational and irrational numbers together form the real number system.\n\n### Key Properties:\n- **Closure**: a + b is always a real number if a, b are real\n- **Commutative**: a + b = b + a\n- **Associative**: (a + b) + c = a + (b + c)\n- **Distributive**: a(b + c) = ab + ac`,
          },
          {
            id: 'math-102',
            title: 'Basic Algebra',
            duration: '20 min',
            lesson: `# Basic Algebra\n\nAlgebra uses letters (variables) to represent unknown values.\n\n## Variables and Expressions\nA **variable** is a symbol (like x, y) that holds a value.\nAn **expression** combines variables, numbers, and operators: 3x + 5\n\n## Equations\nAn equation states two expressions are equal:\n2x + 3 = 11\n\n### Solving:\n1. Subtract 3 from both sides: 2x = 8\n2. Divide by 2: x = 4\n\n## Types of Expressions\n- **Monomial**: 5x (one term)\n- **Binomial**: 3x + 2 (two terms)\n- **Polynomial**: x² + 3x + 2 (multiple terms)\n\n## Key Rules\n- Like terms can be combined: 3x + 5x = 8x\n- Unlike terms cannot: 3x + 5y stays as is\n- Multiply: (2x)(3x) = 6x²\n\n## Word Problems Strategy\n1. Read carefully\n2. Identify unknowns → assign variables\n3. Form equation\n4. Solve\n5. Verify answer`,
          },
          {
            id: 'math-103',
            title: 'Fractions & Decimals',
            duration: '18 min',
            lesson: `# Fractions & Decimals\n\n## What is a Fraction?\nA fraction represents a part of a whole: numerator/denominator\nExample: 3/4 means 3 parts out of 4\n\n## Types of Fractions\n- **Proper**: numerator < denominator (3/4)\n- **Improper**: numerator ≥ denominator (7/4)\n- **Mixed**: whole number + fraction (1 3/4)\n\n## Operations\n\n### Addition/Subtraction\nNeed common denominators:\n1/3 + 1/4 = 4/12 + 3/12 = 7/12\n\n### Multiplication\nMultiply straight across:\n2/3 × 4/5 = 8/15\n\n### Division\nFlip the second fraction and multiply:\n2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6\n\n## Converting to Decimals\nDivide numerator by denominator:\n3/4 = 0.75\n1/3 = 0.333...\n\n## Decimal Places\n- 0.1 = one tenth\n- 0.01 = one hundredth\n- 0.001 = one thousandth`,
          },
        ],
      },
      {
        level: 2,
        name: 'Intermediate',
        topics: [
          {
            id: 'math-201',
            title: 'Linear Equations',
            duration: '25 min',
            lesson: `# Linear Equations\n\nA linear equation forms a straight line when graphed.\n\n## Standard Form\nax + by = c, where a, b, c are constants\n\n## Slope-Intercept Form\ny = mx + b\n- m = slope (rise/run)\n- b = y-intercept\n\n## Finding Slope\nGiven two points (x₁, y₁) and (x₂, y₂):\nm = (y₂ - y₁) / (x₂ - x₁)\n\n## Solving Systems of Equations\n### Substitution Method\n1. Solve one equation for one variable\n2. Substitute into the other equation\n\n### Elimination Method\n1. Multiply equations to align coefficients\n2. Add/subtract to eliminate a variable\n\n## Example\nx + y = 10\n2x - y = 5\n\nAdding both: 3x = 15, so x = 5\nThen y = 10 - 5 = 5`,
          },
          {
            id: 'math-202',
            title: 'Quadratic Equations',
            duration: '30 min',
            lesson: `# Quadratic Equations\n\nForm: ax² + bx + c = 0\n\n## Solving Methods\n\n### 1. Factoring\nx² + 5x + 6 = 0\n(x + 2)(x + 3) = 0\nx = -2 or x = -3\n\n### 2. Quadratic Formula\nx = (-b ± √(b² - 4ac)) / 2a\n\n### 3. Completing the Square\nx² + 6x + 5 = 0\n(x + 3)² - 4 = 0\n(x + 3)² = 4\nx + 3 = ±2\nx = -1 or x = -5\n\n## Discriminant (Δ = b² - 4ac)\n- Δ > 0: Two real solutions\n- Δ = 0: One real solution (repeated)\n- Δ < 0: No real solutions (complex)\n\n## Graph\nParabola shape:\n- a > 0: opens upward (U shape)\n- a < 0: opens downward (∩ shape)\n- Vertex: x = -b/2a`,
          },
        ],
      },
      {
        level: 3,
        name: 'Advanced',
        topics: [
          {
            id: 'math-301',
            title: 'Calculus: Differentiation',
            duration: '35 min',
            lesson: `# Differentiation\n\nDifferentiation finds the rate of change of a function.\n\n## The Derivative\nf'(x) = lim(h→0) [f(x+h) - f(x)] / h\n\n## Basic Rules\n\n### Power Rule\nd/dx(xⁿ) = nxⁿ⁻¹\nExample: d/dx(x³) = 3x²\n\n### Constant Rule\nd/dx(c) = 0\n\n### Sum Rule\nd/dx(f + g) = f' + g'\n\n### Product Rule\nd/dx(fg) = f'g + fg'\n\n### Quotient Rule\nd/dx(f/g) = (f'g - fg') / g²\n\n### Chain Rule\nd/dx(f(g(x))) = f'(g(x)) · g'(x)\n\n## Common Derivatives\n- d/dx(sin x) = cos x\n- d/dx(cos x) = -sin x\n- d/dx(eˣ) = eˣ\n- d/dx(ln x) = 1/x\n\n## Applications\n- Finding slopes of tangent lines\n- Velocity from position\n- Maximum and minimum values`,
          },
        ],
      },
    ],
  },
  {
    id: 'english',
    name: 'English',
    icon: '📝',
    color: '#10b981',
    description: 'Grammar, comprehension, and writing skills',
    levels: [
      {
        level: 1,
        name: 'Foundations',
        topics: [
          {
            id: 'eng-101',
            title: 'Parts of Speech',
            duration: '15 min',
            lesson: `# Parts of Speech\n\nEvery word in English belongs to a category called a "part of speech."\n\n## 1. Nouns\nNames of people, places, things, or ideas.\n- Proper: London, Maria (capitalized)\n- Common: city, girl\n- Abstract: love, freedom\n\n## 2. Pronouns\nReplace nouns: he, she, it, they, we, I, you\n\n## 3. Verbs\nAction or state of being: run, think, is, have\n- Action verbs: jump, write, speak\n- Linking verbs: is, am, are, was, were\n- Helping verbs: can, will, should, have\n\n## 4. Adjectives\nDescribe nouns: big, beautiful, three, red\n\n## 5. Adverbs\nModify verbs, adjectives, or other adverbs: quickly, very, well\n\n## 6. Prepositions\nShow relationships: in, on, at, under, between, during\n\n## 7. Conjunctions\nConnect words/clauses: and, but, or, because, although\n\n## 8. Interjections\nExpress emotion: Wow! Oh! Ouch!`,
          },
          {
            id: 'eng-102',
            title: 'Tenses Overview',
            duration: '20 min',
            lesson: `# Tenses Overview\n\nTenses show when an action happens.\n\n## Present Tenses\n- **Simple Present**: I study every day.\n- **Present Continuous**: I am studying now.\n- **Present Perfect**: I have studied this chapter.\n- **Present Perfect Continuous**: I have been studying for 2 hours.\n\n## Past Tenses\n- **Simple Past**: I studied yesterday.\n- **Past Continuous**: I was studying when you called.\n- **Past Perfect**: I had studied before the test.\n- **Past Perfect Continuous**: I had been studying for hours.\n\n## Future Tenses\n- **Simple Future**: I will study tomorrow.\n- **Future Continuous**: I will be studying at 8 PM.\n- **Future Perfect**: I will have studied by then.\n\n## Tips\n- Use present simple for habits and facts\n- Use present continuous for actions happening now\n- Use past simple for completed actions\n- Use present perfect to connect past to present`,
          },
        ],
      },
      {
        level: 2,
        name: 'Intermediate',
        topics: [
          {
            id: 'eng-201',
            title: 'Active & Passive Voice',
            duration: '20 min',
            lesson: `# Active & Passive Voice\n\n## Active Voice\nThe subject performs the action.\n"The cat chased the mouse."\n- Subject: The cat\n- Verb: chased\n- Object: the mouse\n\n## Passive Voice\nThe subject receives the action.\n"The mouse was chased by the cat."\n\n## Conversion Rules\n1. Object → Subject\n2. Verb → be + past participle\n3. Subject → by + agent (optional)\n\n## Tense-wise Examples\n| Tense | Active | Passive |\n|-------|--------|----------|\n| Simple Present | She writes a letter | A letter is written by her |\n| Simple Past | She wrote a letter | A letter was written by her |\n| Present Perfect | She has written | A letter has been written |\n| Future | She will write | A letter will be written |\n\n## When to use Passive\n- When the doer is unknown: "The window was broken."\n- When the action is more important than the doer\n- In formal/scientific writing`,
          },
          {
            id: 'eng-202',
            title: 'Essay Writing',
            duration: '25 min',
            lesson: `# Essay Writing\n\n## Structure\n\n### 1. Introduction\n- Hook: Grab attention\n- Background: Brief context\n- Thesis: Your main argument\n\n### 2. Body Paragraphs (2-3)\nEach paragraph should have:\n- **Topic sentence**: Main idea\n- **Evidence**: Facts, examples, quotes\n- **Explanation**: How evidence supports your point\n- **Transition**: Connect to next paragraph\n\n### 3. Conclusion\n- Restate thesis (different words)\n- Summarize key points\n- End with a strong closing thought\n\n## Tips\n- Plan before you write\n- Use varied sentence structures\n- Avoid repetition\n- Proofread for grammar and spelling\n- Use transition words: however, moreover, consequently\n\n## Types of Essays\n- **Argumentative**: Take a position and defend it\n- **Descriptive**: Paint a picture with words\n- **Narrative**: Tell a story\n- **Expository**: Explain a topic objectively`,
          },
        ],
      },
    ],
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    color: '#f59e0b',
    description: 'Physics, chemistry, and the natural world',
    levels: [
      {
        level: 1,
        name: 'Foundations',
        topics: [
          {
            id: 'sci-101',
            title: 'Introduction to Physics',
            duration: '20 min',
            lesson: `# Introduction to Physics\n\nPhysics is the study of matter, energy, and the fundamental forces of nature.\n\n## What is Physics?\nPhysics explains how the universe works — from tiny atoms to massive galaxies.\n\n## Key Branches\n- **Mechanics**: Motion and forces\n- **Thermodynamics**: Heat and energy\n- **Optics**: Light and vision\n- **Electromagnetism**: Electricity and magnetism\n- **Quantum Physics**: Subatomic particles\n\n## Fundamental Quantities\n| Quantity | SI Unit | Symbol |\n|----------|---------|--------|\n| Length | Meter | m |\n| Mass | Kilogram | kg |\n| Time | Second | s |\n| Temperature | Kelvin | K |\n| Current | Ampere | A |\n\n## Newton's Laws of Motion\n1. **First Law**: An object at rest stays at rest (inertia)\n2. **Second Law**: F = ma (force equals mass times acceleration)\n3. **Third Law**: Every action has an equal and opposite reaction\n\n## Scientific Method\n1. Observe → 2. Hypothesize → 3. Experiment → 4. Analyze → 5. Conclude`,
          },
          {
            id: 'sci-102',
            title: 'Basic Chemistry',
            duration: '20 min',
            lesson: `# Basic Chemistry\n\nChemistry studies the composition, structure, and properties of matter.\n\n## Atoms\nThe smallest unit of an element.\n- **Protons** (+): In the nucleus\n- **Neutrons** (0): In the nucleus\n- **Electrons** (-): Orbit the nucleus\n\n## Elements\nPure substances made of one type of atom.\nExamples: Hydrogen (H), Oxygen (O), Carbon (C)\n\n## Compounds\nTwo or more elements chemically bonded.\n- Water: H₂O\n- Carbon dioxide: CO₂\n- Salt: NaCl\n\n## Chemical Bonds\n- **Ionic**: Electron transfer (Na⁺ + Cl⁻ → NaCl)\n- **Covalent**: Electron sharing (H-H)\n- **Metallic**: Sea of shared electrons\n\n## States of Matter\n- **Solid**: Fixed shape, fixed volume\n- **Liquid**: Variable shape, fixed volume\n- **Gas**: Variable shape, variable volume\n\n## Chemical Reactions\nReactants → Products\nTypes: Combination, Decomposition, Displacement, Redox`,
          },
        ],
      },
      {
        level: 2,
        name: 'Intermediate',
        topics: [
          {
            id: 'sci-201',
            title: 'Thermodynamics',
            duration: '30 min',
            lesson: `# Thermodynamics\n\nThe study of heat, energy, and work.\n\n## Key Concepts\n- **System**: The part we study\n- **Surroundings**: Everything outside the system\n- **Universe**: System + Surroundings\n\n## Laws of Thermodynamics\n\n### Zeroth Law\nIf A is in thermal equilibrium with B, and B with C, then A is with C.\n\n### First Law (Conservation of Energy)\nEnergy cannot be created or destroyed, only transformed.\nΔU = Q - W\n- ΔU = change in internal energy\n- Q = heat added\n- W = work done by system\n\n### Second Law\nEntropy (disorder) of an isolated system always increases.\nHeat flows from hot to cold naturally.\n\n### Third Law\nAs temperature approaches absolute zero, entropy approaches a minimum.\n\n## Processes\n- **Isothermal**: Constant temperature\n- **Adiabatic**: No heat exchange\n- **Isobaric**: Constant pressure\n- **Isochoric**: Constant volume`,
          },
        ],
      },
    ],
  },
]

/**
 * Helper: Get all topics flat
 */
export function getAllTopics() {
  const topics = []
  SUBJECTS.forEach(subject => {
    subject.levels.forEach(level => {
      level.topics.forEach(topic => {
        topics.push({
          ...topic,
          subjectId: subject.id,
          subjectName: subject.name,
          subjectIcon: subject.icon,
          level: level.level,
          levelName: level.name,
        })
      })
    })
  })
  return topics
}

export function getTopicById(topicId) {
  return getAllTopics().find(t => t.id === topicId)
}

export function getSubjectById(subjectId) {
  return SUBJECTS.find(s => s.id === subjectId)
}
