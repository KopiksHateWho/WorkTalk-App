export interface VocabWord {
  id: string;
  word: string;
  /** English definition shown after answering. */
  meaning: string;
  /** Short Indonesian gloss — helps first-time learners. */
  translation: string;
  example: string;
}

export interface VocabTopic {
  id: string;
  title: string;
  emoji: string;
  description: string;
  words: VocabWord[];
}

export const VOCAB_TOPICS: VocabTopic[] = [
  {
    id: "workplace",
    title: "Workplace",
    emoji: "💼",
    description: "The words you hear every day in an office.",
    words: [
      {
        id: "workplace-deadline",
        word: "deadline",
        meaning: "the final time when something must be finished",
        translation: "batas waktu",
        example: "I have to finish this report before the deadline.",
      },
      {
        id: "workplace-colleague",
        word: "colleague",
        meaning: "a person you work with",
        translation: "rekan kerja",
        example: "My colleague helped me check the numbers.",
      },
      {
        id: "workplace-schedule",
        word: "schedule",
        meaning: "a plan of times and dates for activities",
        translation: "jadwal",
        example: "Our schedule changes every Monday morning.",
      },
      {
        id: "workplace-task",
        word: "task",
        meaning: "a piece of work you have to do",
        translation: "tugas",
        example: "I finished the most difficult task first.",
      },
      {
        id: "workplace-manager",
        word: "manager",
        meaning: "the person in charge of a team",
        translation: "manajer",
        example: "My manager asked for a progress update.",
      },
      {
        id: "workplace-promotion",
        word: "promotion",
        meaning: "a move to a higher position at work",
        translation: "kenaikan jabatan",
        example: "She earned a promotion after two years.",
      },
      {
        id: "workplace-overtime",
        word: "overtime",
        meaning: "extra hours worked beyond normal working time",
        translation: "lembur",
        example: "We worked overtime to finish the project.",
      },
      {
        id: "workplace-workload",
        word: "workload",
        meaning: "the amount of work a person has to do",
        translation: "beban kerja",
        example: "My workload is lighter this week.",
      },
      {
        id: "workplace-salary",
        word: "salary",
        meaning: "the money you receive every month for your work",
        translation: "gaji",
        example: "The salary is discussed in the final interview.",
      },
      {
        id: "workplace-attendance",
        word: "attendance",
        meaning: "being present at work or class",
        translation: "kehadiran",
        example: "Good attendance is important for the internship.",
      },
    ],
  },
  {
    id: "job-interview",
    title: "Job Interview",
    emoji: "🧑‍💼",
    description: "Words that make you sound ready for the interview.",
    words: [
      {
        id: "interview-strength",
        word: "strength",
        meaning: "something you are good at",
        translation: "kekuatan",
        example: "My main strength is clear communication.",
      },
      {
        id: "interview-weakness",
        word: "weakness",
        meaning: "something you still need to improve",
        translation: "kelemahan",
        example: "My weakness is public speaking, so I practise weekly.",
      },
      {
        id: "interview-experience",
        word: "experience",
        meaning: "knowledge or skill gained by doing something",
        translation: "pengalaman",
        example: "I have experience organising campus events.",
      },
      {
        id: "interview-qualification",
        word: "qualification",
        meaning: "a skill, degree or certificate needed for a job",
        translation: "kualifikasi",
        example: "The qualification for this role is a bachelor degree.",
      },
      {
        id: "interview-candidate",
        word: "candidate",
        meaning: "a person who is applying for a job",
        translation: "kandidat",
        example: "There are five candidates for this position.",
      },
      {
        id: "interview-reference",
        word: "reference",
        meaning: "a person who can describe your work to an employer",
        translation: "referensi",
        example: "My lecturer agreed to be my reference.",
      },
      {
        id: "interview-achievement",
        word: "achievement",
        meaning: "something good that you succeeded in doing",
        translation: "pencapaian",
        example: "Winning the case competition was my biggest achievement.",
      },
      {
        id: "interview-reliable",
        word: "reliable",
        meaning: "someone others can trust to do the work well",
        translation: "dapat diandalkan",
        example: "My supervisor says I am reliable with deadlines.",
      },
      {
        id: "interview-motivation",
        word: "motivation",
        meaning: "the reason you want to do something",
        translation: "motivasi",
        example: "My motivation is to support my family.",
      },
      {
        id: "interview-skill",
        word: "skill",
        meaning: "an ability you learn and practise",
        translation: "keterampilan",
        example: "Data analysis is a very useful skill.",
      },
    ],
  },
  {
    id: "office",
    title: "Office",
    emoji: "🏢",
    description: "Objects and routines inside a real office.",
    words: [
      {
        id: "office-desk",
        word: "desk",
        meaning: "the table where you do your work",
        translation: "meja kerja",
        example: "My desk is next to the window.",
      },
      {
        id: "office-printer",
        word: "printer",
        meaning: "a machine that prints documents on paper",
        translation: "mesin cetak",
        example: "The printer is out of paper again.",
      },
      {
        id: "office-receipt",
        word: "receipt",
        meaning: "a paper that proves you paid for something",
        translation: "kwitansi",
        example: "Please keep the receipt for the reimbursement.",
      },
      {
        id: "office-form",
        word: "form",
        meaning: "a document you fill in with your information",
        translation: "formulir",
        example: "Fill in this form and give it to HR.",
      },
      {
        id: "office-badge",
        word: "badge",
        meaning: "a card you wear that shows who you are",
        translation: "kartu identitas",
        example: "You need your badge to enter the building.",
      },
      {
        id: "office-supplies",
        word: "supplies",
        meaning: "things the office needs, like paper and pens",
        translation: "perlengkapan",
        example: "We ordered new office supplies yesterday.",
      },
      {
        id: "office-agenda",
        word: "agenda",
        meaning: "a list of things to discuss in a meeting",
        translation: "agenda",
        example: "The agenda has four items today.",
      },
      {
        id: "office-shift",
        word: "shift",
        meaning: "the hours you work in a day",
        translation: "jam kerja",
        example: "My shift starts at eight in the morning.",
      },
      {
        id: "office-supervisor",
        word: "supervisor",
        meaning: "a person who checks and guides your work",
        translation: "supervisor",
        example: "Ask your supervisor before changing the plan.",
      },
      {
        id: "office-backup",
        word: "backup",
        meaning: "an extra copy kept in case something is lost",
        translation: "cadangan",
        example: "Always keep a backup of the file.",
      },
    ],
  },
  {
    id: "teamwork",
    title: "Teamwork",
    emoji: "🤝",
    description: "Talk about working with other people.",
    words: [
      {
        id: "teamwork-support",
        word: "support",
        meaning: "help you give to someone",
        translation: "dukungan",
        example: "Thanks for your support during the presentation.",
      },
      {
        id: "teamwork-contribution",
        word: "contribution",
        meaning: "the part you add to a shared result",
        translation: "kontribusi",
        example: "Everyone's contribution made the project stronger.",
      },
      {
        id: "teamwork-feedback",
        word: "feedback",
        meaning: "opinions about how you can improve",
        translation: "masukan",
        example: "My teammate gave useful feedback on my report.",
      },
      {
        id: "teamwork-responsibility",
        word: "responsibility",
        meaning: "a duty that you must take care of",
        translation: "tanggung jawab",
        example: "Managing the budget is my responsibility.",
      },
      {
        id: "teamwork-cooperation",
        word: "cooperation",
        meaning: "working together towards the same goal",
        translation: "kerja sama",
        example: "Good cooperation made the deadline possible.",
      },
      {
        id: "teamwork-conflict",
        word: "conflict",
        meaning: "a disagreement between people",
        translation: "konflik",
        example: "We solved the conflict with an open discussion.",
      },
      {
        id: "teamwork-compromise",
        word: "compromise",
        meaning: "an agreement where both sides give up something",
        translation: "kompromi",
        example: "We reached a compromise about the schedule.",
      },
      {
        id: "teamwork-delegate",
        word: "delegate",
        meaning: "to give a task to another person",
        translation: "mendelegasikan",
        example: "A good leader knows how to delegate.",
      },
      {
        id: "teamwork-goal",
        word: "goal",
        meaning: "something you want to achieve",
        translation: "tujuan",
        example: "Our goal is to finish before Friday.",
      },
      {
        id: "teamwork-trust",
        word: "trust",
        meaning: "believing someone will do the right thing",
        translation: "kepercayaan",
        example: "Trust grows when everyone keeps their promises.",
      },
    ],
  },
  {
    id: "customer-service",
    title: "Customer Service",
    emoji: "☎️",
    description: "Help customers politely and clearly.",
    words: [
      {
        id: "cs-customer",
        word: "customer",
        meaning: "a person who buys or uses your product",
        translation: "pelanggan",
        example: "The customer asked for a faster delivery.",
      },
      {
        id: "cs-complaint",
        word: "complaint",
        meaning: "a statement that something is not satisfactory",
        translation: "keluhan",
        example: "We received a complaint about the late order.",
      },
      {
        id: "cs-refund",
        word: "refund",
        meaning: "money returned to a customer",
        translation: "pengembalian dana",
        example: "The store gave a full refund.",
      },
      {
        id: "cs-assistance",
        word: "assistance",
        meaning: "help you offer to someone",
        translation: "bantuan",
        example: "May I offer you some assistance?",
      },
      {
        id: "cs-apology",
        word: "apology",
        meaning: "words that say you are sorry",
        translation: "permintaan maaf",
        example: "We sent a written apology to the client.",
      },
      {
        id: "cs-inquiry",
        word: "inquiry",
        meaning: "a question asking for information",
        translation: "pertanyaan",
        example: "Your inquiry has been forwarded to our team.",
      },
      {
        id: "cs-warranty",
        word: "warranty",
        meaning: "a promise to repair or replace a product",
        translation: "garansi",
        example: "The laptop still has a two-year warranty.",
      },
      {
        id: "cs-patience",
        word: "patience",
        meaning: "the ability to stay calm while waiting",
        translation: "kesabaran",
        example: "Thank you for your patience during the delay.",
      },
      {
        id: "cs-satisfaction",
        word: "satisfaction",
        meaning: "the feeling of being pleased with something",
        translation: "kepuasan",
        example: "Customer satisfaction is our main target.",
      },
      {
        id: "cs-solution",
        word: "solution",
        meaning: "the answer to a problem",
        translation: "solusi",
        example: "We found a quick solution for the damaged item.",
      },
    ],
  },
  {
    id: "professional-english",
    title: "Professional English",
    emoji: "📧",
    description: "Polite language for emails and phone calls.",
    words: [
      {
        id: "pe-sincerely",
        word: "sincerely",
        meaning: "a polite way to end a formal letter",
        translation: "hormat saya",
        example: "Thank you for your time. Sincerely, Rina.",
      },
      {
        id: "pe-regards",
        word: "regards",
        meaning: "a friendly, professional closing word",
        translation: "salam",
        example: "Best regards, Andi.",
      },
      {
        id: "pe-attach",
        word: "attach",
        meaning: "to add a file to a message",
        translation: "melampirkan",
        example: "I attach the report you requested.",
      },
      {
        id: "pe-confirm",
        word: "confirm",
        meaning: "to say that something is definitely true",
        translation: "mengonfirmasi",
        example: "Please confirm your attendance by Friday.",
      },
      {
        id: "pe-request",
        word: "request",
        meaning: "to ask for something politely",
        translation: "permintaan",
        example: "I would like to request two days off.",
      },
      {
        id: "pe-regarding",
        word: "regarding",
        meaning: "about a certain topic",
        translation: "perihal",
        example: "I am writing regarding the new schedule.",
      },
      {
        id: "pe-appreciate",
        word: "appreciate",
        meaning: "to be grateful for something",
        translation: "menghargai",
        example: "I really appreciate your quick reply.",
      },
      {
        id: "pe-follow-up",
        word: "follow up",
        meaning: "to check again after some time",
        translation: "menindaklanjuti",
        example: "I will follow up with the supplier tomorrow.",
      },
      {
        id: "pe-notify",
        word: "notify",
        meaning: "to tell someone officially",
        translation: "memberitahukan",
        example: "Please notify the team if the plan changes.",
      },
      {
        id: "pe-available",
        word: "available",
        meaning: "free and able to be used or met",
        translation: "tersedia",
        example: "I am available for a call after 3 p.m.",
      },
    ],
  },
];

export function getVocabTopic(id: string): VocabTopic | undefined {
  return VOCAB_TOPICS.find((topic) => topic.id === id);
}

export function allWords(): VocabWord[] {
  return VOCAB_TOPICS.flatMap((topic) => topic.words);
}

/**
 * Builds one multiple-choice question: the correct meaning plus three
 * distractors taken from other words in the same topic.
 */
export function buildMeaningOptions(
  word: VocabWord,
  topic: VocabTopic,
): { options: string[]; correctIndex: number } {
  const distractors = topic.words
    .filter((candidate) => candidate.id !== word.id)
    .map((candidate) => candidate.meaning);

  const pool =
    distractors.length >= 3 ? distractors : allWords().map((w) => w.meaning);

  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [...shuffled, word.meaning].sort(() => Math.random() - 0.5);
  return { options, correctIndex: options.indexOf(word.meaning) };
}
