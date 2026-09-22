import type { EnglishLevel } from "@/types/learner";

export type QuizType =
  | "best-response"
  | "complete-sentence"
  | "workplace-scenario"
  | "word-usage";

export interface QuizQuestion {
  id: string;
  type: QuizType;
  level: EnglishLevel;
  topicId: string;
  /** Short situation, e.g. "You're talking to your manager." */
  context?: string;
  /** The line another person says. */
  quote?: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const QUIZ_TOPICS = [
  { id: "workplace-english", title: "Workplace English", emoji: "💼" },
  { id: "job-interview", title: "Job interview", emoji: "🧑‍💼" },
  { id: "customer-service", title: "Customer service", emoji: "☎️" },
  { id: "teamwork", title: "Teamwork", emoji: "🤝" },
  { id: "professional-email", title: "Professional Email", emoji: "📧" },
] as const;

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q-work-1",
    type: "best-response",
    level: "basic",
    topicId: "workplace-english",
    context: "You're talking to your manager.",
    quote: "Can you finish this report by Friday?",
    prompt: "What is the best response?",
    options: [
      "Yes, I can.",
      "Yes, I am report.",
      "Friday is a report.",
      "I finish yesterday.",
    ],
    correctIndex: 0,
    explanation:
      "“Yes, I can.” is the natural way to agree to a task in English. The other options mix the words of the question instead of answering it.",
  },
  {
    id: "q-work-2",
    type: "complete-sentence",
    level: "basic",
    topicId: "workplace-english",
    prompt: "Complete the sentence: “I am good ___ teamwork.”",
    options: ["at", "in", "on", "for"],
    correctIndex: 0,
    explanation:
      "Use “good at” before a skill or activity: “I am good at teamwork.”",
  },
  {
    id: "q-work-3",
    type: "word-usage",
    level: "basic",
    topicId: "workplace-english",
    prompt: "What does “deadline” mean?",
    options: [
      "The final time something must be finished",
      "A meeting with your manager",
      "A payment you receive",
      "A person you work with",
    ],
    correctIndex: 0,
    explanation:
      "A deadline is the time limit. Example: “I must finish this before the deadline.”",
  },
  {
    id: "q-work-4",
    type: "best-response",
    level: "basic",
    topicId: "workplace-english",
    context: "A colleague asks for help.",
    quote: "Could you help me with this data?",
    prompt: "Which answer sounds polite and clear?",
    options: [
      "Sure, I can help you now.",
      "No, I am busy so no.",
      "Help is data yes.",
      "You help yourself.",
    ],
    correctIndex: 0,
    explanation:
      "“Sure, I can help you now.” accepts politely and gives a clear answer.",
  },
  {
    id: "q-work-5",
    type: "complete-sentence",
    level: "basic",
    topicId: "workplace-english",
    prompt: "Complete the sentence: “I have worked at this company ___ three years.”",
    options: ["for", "since", "during", "from"],
    correctIndex: 0,
    explanation:
      "Use “for” with a length of time (three years). Use “since” with a starting point (since 2023).",
  },
  {
    id: "q-work-6",
    type: "word-usage",
    level: "basic",
    topicId: "teamwork",
    prompt: "Choose the correct sentence.",
    options: [
      "My teammate gave me useful feedback.",
      "My teammate gave me useful feed.",
      "My teammate gave feedback I am useful.",
      "My teammate useful feedback gave.",
    ],
    correctIndex: 0,
    explanation:
      "English word order is subject + verb + object: “gave me useful feedback.”",
  },
  {
    id: "q-work-7",
    type: "best-response",
    level: "basic",
    topicId: "customer-service",
    context: "A customer is unhappy.",
    quote: "My order arrived two days late!",
    prompt: "What is the best first response?",
    options: [
      "I'm sorry about that. Let me check your order right away.",
      "That is not my problem.",
      "You ordered it late.",
      "Late is normal here.",
    ],
    correctIndex: 0,
    explanation:
      "Good customer service starts with a short apology and an action.",
  },
  {
    id: "q-work-8",
    type: "complete-sentence",
    level: "basic",
    topicId: "job-interview",
    prompt: "Complete the sentence: “My main strength is ___ to clients.”",
    options: ["communicating", "communicate", "communication to", "communicated"],
    correctIndex: 0,
    explanation:
      "After “is”, use the -ing form when describing an activity: “communicating with clients.”",
  },
  {
    id: "q-work-9",
    type: "word-usage",
    level: "basic",
    topicId: "job-interview",
    prompt: "“Tell me about yourself.” What should you do first?",
    options: [
      "Say your name, what you study, and one strength",
      "Read your whole CV line by line",
      "Ask the interviewer about the salary",
      "Say you have no experience",
    ],
    correctIndex: 0,
    explanation:
      "Interviewers want a short, confident summary: name, background, one strength.",
  },
  {
    id: "q-work-10",
    type: "best-response",
    level: "basic",
    topicId: "professional-email",
    context: "You are writing an email to a new client.",
    prompt: "Which greeting is the most professional?",
    options: [
      "Dear Mr. Tanaka, I hope you are well.",
      "Hey buddy,",
      "Hi hi,",
      "To the person,",
    ],
    correctIndex: 0,
    explanation:
      "“Dear + title + family name” is the standard professional greeting in English.",
  },
  {
    id: "q-work-11",
    type: "workplace-scenario",
    level: "intermediate",
    topicId: "workplace-english",
    context: "Your manager gives you an urgent task while you are already busy.",
    quote: "I need this by the end of the day.",
    prompt: "What is the most professional response?",
    options: [
      "I can do it, but I'll need to move the client report to tomorrow — is that okay?",
      "No, I am too busy.",
      "Okay, whatever you say.",
      "You should ask someone else, not me.",
    ],
    correctIndex: 0,
    explanation:
      "Accepting with a clear trade-off shows you manage your priorities and communicate early.",
  },
  {
    id: "q-work-12",
    type: "workplace-scenario",
    level: "intermediate",
    topicId: "customer-service",
    context: "A client calls and is angry about a delay.",
    prompt: "Which sequence handles the situation best?",
    options: [
      "Listen, apologize, confirm the facts, offer a solution, follow up",
      "Interrupt, explain that delays happen, end the call",
      "Promise anything to make them stop talking",
      "Transfer the call without explanation",
    ],
    correctIndex: 0,
    explanation:
      "Listen → apologize → confirm → solve → follow up is the standard service flow.",
  },
  {
    id: "q-work-13",
    type: "complete-sentence",
    level: "intermediate",
    topicId: "professional-email",
    prompt:
      "Complete the sentence: “I am following up ___ my previous email about the invoice.”",
    options: ["on", "in", "at", "about"],
    correctIndex: 0,
    explanation:
      "The fixed expression is “follow up on” something. “Following up about” is common in speech, but “follow up on” is the standard written form.",
  },
  {
    id: "q-work-14",
    type: "best-response",
    level: "intermediate",
    topicId: "teamwork",
    context: "A teammate's work needs changes.",
    quote: "Here is my part of the report.",
    prompt: "How do you give feedback without sounding harsh?",
    options: [
      "The structure is strong; I think the numbers in section two need updating.",
      "This is wrong.",
      "You always make mistakes.",
      "I will rewrite everything myself.",
    ],
    correctIndex: 0,
    explanation:
      "Start with what works, then name one specific improvement. It keeps the conversation about the work, not the person.",
  },
  {
    id: "q-work-15",
    type: "workplace-scenario",
    level: "intermediate",
    topicId: "teamwork",
    prompt:
      "A team member is not delivering their part. What is the most professional first step?",
    options: [
      "Talk with them privately to understand the problem",
      "Report them to the manager immediately",
      "Do their work silently and say nothing",
      "Complain about them in the group chat",
    ],
    correctIndex: 0,
    explanation:
      "A private conversation first is professional and usually solves the issue fastest.",
  },
  {
    id: "q-work-16",
    type: "workplace-scenario",
    level: "intermediate",
    topicId: "job-interview",
    prompt:
      "“What is your weakness?” Which answer is strongest?",
    options: [
      "I used to take on too many tasks, so now I plan the work and share it with the team.",
      "I don't have any weaknesses.",
      "I am bad at everything.",
      "I hate working with people.",
    ],
    correctIndex: 0,
    explanation:
      "Name a real weakness and show the concrete step you are taking — that is what interviewers look for.",
  },
  {
    id: "q-work-17",
    type: "workplace-scenario",
    level: "intermediate",
    topicId: "job-interview",
    context: "The interviewer asks about your motivation.",
    quote: "Why do you want this position?",
    prompt: "Which answer is the most convincing?",
    options: [
      "Your team helps small businesses grow, and I want to use my marketing skills there.",
      "Because I need money.",
      "Because my friend works here.",
      "I applied everywhere, so here too.",
    ],
    correctIndex: 0,
    explanation:
      "Connect the company's work to your own skills and goals — that shows preparation.",
  },
  {
    id: "q-work-18",
    type: "complete-sentence",
    level: "intermediate",
    topicId: "professional-email",
    prompt:
      "Complete the sentence: “Unfortunately I cannot attend, ___ I will send my notes.”",
    options: ["but", "so that", "because of", "although"],
    correctIndex: 0,
    explanation:
      "“but” contrasts the two clauses: you cannot attend, however you will still contribute.",
  },
  {
    id: "q-work-19",
    type: "workplace-scenario",
    level: "intermediate",
    topicId: "workplace-english",
    prompt:
      "You made a mistake in an email that already went to a client. What is the best action?",
    options: [
      "Send a short correction immediately, apologize for the confusion, and check attachments twice in future",
      "Ignore it and hope nobody noticed",
      "Blame the email software",
      "Wait until the client complains",
    ],
    correctIndex: 0,
    explanation:
      "Fast, calm correction protects your credibility. Follow up with a change to your process.",
  },
  {
    id: "q-work-20",
    type: "workplace-scenario",
    level: "intermediate",
    topicId: "customer-service",
    prompt:
      "A customer asks for something your company cannot offer. What do you say?",
    options: [
      "Unfortunately we cannot do that, but I can offer an alternative.",
      "We never do that, sorry.",
      "Yes of course, we can do anything.",
      "I don't know, ask someone else.",
    ],
    correctIndex: 0,
    explanation:
      "Be honest about the limit, then immediately offer what you can do — that keeps trust.",
  },
];

export function pickQuizQuestions({
  level,
  topicId,
  limit = 8,
}: {
  level?: EnglishLevel;
  topicId?: string;
  limit?: number;
}): QuizQuestion[] {
  const filtered = QUIZ_QUESTIONS.filter(
    (question) =>
      (!level || question.level === level) &&
      (!topicId || topicId === "all" || question.topicId === topicId),
  );
  const pool = filtered.length >= limit ? filtered : QUIZ_QUESTIONS;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, limit);
}
