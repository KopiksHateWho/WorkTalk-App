/**
 * Career speaking curriculum for Veritass.
 *
 * Shared by the Convex coach (scripted practice conversations) and the frontend
 * (topic library, hints, key vocabulary). These prompts are the honest
 * fallback used when no AI provider is configured — the UI always labels them
 * as "Practice mode", never as AI output.
 */

export type EnglishLevel = "basic" | "intermediate";

export interface CoachPrompt {
  /** Opening line or follow-up question from the coach. */
  ai: string;
  /** Short hint shown to the learner while they prepare. */
  hint: string;
  /** Example phrase the learner can borrow. */
  example: string;
}

export interface CareerTopic {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
  difficulty: "Easy" | "Medium" | "Challenging";
  /** Estimated minutes for one full conversation. */
  minutes: number;
  /** XP awarded for finishing the conversation. */
  xp: number;
  /** Suggested speaking time for a single answer, in seconds. */
  targetSeconds: number;
  /** Career vocabulary checked against the learner's transcript. */
  keyWords: string[];
  levels: Record<EnglishLevel, CoachPrompt[]>;
}

export const SPEAKING_TOPICS: CareerTopic[] = [
  {
    id: "self-introduction",
    title: "Self introduction",
    emoji: "👋",
    blurb: "Introduce yourself the way you would to a new team or interviewer.",
    difficulty: "Easy",
    minutes: 5,
    xp: 120,
    targetSeconds: 20,
    keyWords: [
      "student",
      "university",
      "skills",
      "interested",
      "communication",
      "career",
    ],
    levels: {
      basic: [
        {
          ai: "Hi! Nice to meet you. Can you introduce yourself?",
          hint: "Say your name, what you study, and one thing you like.",
          example: "My name is Rina. I am a student at the university.",
        },
        {
          ai: "Nice to meet you! What are you studying?",
          hint: "Name your major and one subject you enjoy.",
          example: "I am studying business, and I enjoy marketing class.",
        },
        {
          ai: "That sounds interesting. What are your hobbies?",
          hint: "Share one or two hobbies and why you like them.",
          example: "I like reading and playing badminton after class.",
        },
        {
          ai: "Good answer! What job would you like in the future?",
          hint: "Say the job and one reason you want it.",
          example: "I would like to be a marketing staff because I like talking to people.",
        },
      ],
      intermediate: [
        {
          ai: "Welcome! Please introduce yourself — name, background, and what you are working towards.",
          hint: "Aim for three or four sentences and mention one strength.",
          example: "I am Andi, a final-year management student who is passionate about digital marketing.",
        },
        {
          ai: "Thanks. Which skills are you currently developing for your career?",
          hint: "Use 'I am developing…' or 'I am improving…'.",
          example: "I am improving my public speaking and my data analysis skills.",
        },
        {
          ai: "Tell me about a project or experience you are proud of.",
          hint: "Use past tense: organized, led, handled, presented.",
          example: "I organized a campus event for 200 students and handled the sponsor communication.",
        },
        {
          ai: "Where do you see yourself in three years, and why?",
          hint: "Connect your goal to a skill you want to grow.",
          example: "In three years I want to lead a small marketing team, because I enjoy mentoring others.",
        },
        {
          ai: "Last one: what makes you a good fit for the companies you are applying to?",
          hint: "Name one strength and back it up with a quick example.",
          example: "I am good at communication, and I have experience explaining reports to non-technical colleagues.",
        },
      ],
    },
  },
  {
    id: "job-application",
    title: "Job application",
    emoji: "📄",
    blurb: "Talk about your CV, motivation letters, and why you applied.",
    difficulty: "Easy",
    minutes: 6,
    xp: 130,
    targetSeconds: 20,
    keyWords: [
      "application",
      "resume",
      "position",
      "experience",
      "qualification",
      "requirement",
    ],
    levels: {
      basic: [
        {
          ai: "Hello! Are you applying for a job at the moment?",
          hint: "Answer yes or no, then say the position.",
          example: "Yes, I am applying for a marketing position.",
        },
        {
          ai: "What documents do you usually send with an application?",
          hint: "Mention a resume or a cover letter.",
          example: "I send my resume and a short cover letter.",
        },
        {
          ai: "Why did you choose this position?",
          hint: "Use 'because' to give one reason.",
          example: "I chose it because I want to learn about digital marketing.",
        },
        {
          ai: "Great. Where can the company see your experience?",
          hint: "Say where your experience is listed.",
          example: "You can see my experience in my resume.",
        },
      ],
      intermediate: [
        {
          ai: "You are applying for a marketing role. Tell me why you are a strong candidate.",
          hint: "One clear claim plus one piece of evidence.",
          example: "I am a strong candidate because I have run two social media campaigns for a campus organization.",
        },
        {
          ai: "How do you make sure your application matches the job requirements?",
          hint: "Describe a concrete step you take.",
          example: "I highlight the requirements in the job post and mirror the matching keywords in my CV.",
        },
        {
          ai: "Describe a time you had to meet a strict deadline.",
          hint: "Use the order: situation, what you did, result.",
          example: "I had to submit a group report in three days, so I split the tasks and we finished a day early.",
        },
        {
          ai: "What would you say is the weakest part of your application?",
          hint: "Be honest, then show how you are improving it.",
          example: "I do not have much office experience yet, so I am finishing an online business writing course.",
        },
        {
          ai: "Finally, what do you know about our company?",
          hint: "Mention one value or product of the company.",
          example: "I know your team focuses on helping small businesses grow, which matches my interest in marketing.",
        },
      ],
    },
  },
  {
    id: "job-interview",
    title: "Job interview",
    emoji: "🧑‍💼",
    blurb: "Practice the interview questions that actually decide an offer.",
    difficulty: "Challenging",
    minutes: 8,
    xp: 160,
    targetSeconds: 25,
    keyWords: [
      "strength",
      "weakness",
      "responsibility",
      "team",
      "challenge",
      "opportunity",
    ],
    levels: {
      basic: [
        {
          ai: "Thanks for coming in. Tell me about yourself.",
          hint: "Name, study, one strength.",
          example: "I am Sari, an accounting student, and I am good at organizing data.",
        },
        {
          ai: "What are your strengths?",
          hint: "Give one strength with a small example.",
          example: "I am good at teamwork because I always help my group.",
        },
        {
          ai: "What do you like most about working in a team?",
          hint: "Use 'I like … because …'.",
          example: "I like teamwork because I can learn from my friends.",
        },
        {
          ai: "Why do you want to work here?",
          hint: "One reason is enough.",
          example: "Because your company helps young people find good jobs.",
        },
      ],
      intermediate: [
        {
          ai: "Let's begin. Walk me through your background and your career goal.",
          hint: "Keep it to 60 seconds and end with your goal.",
          example: "I am a final-year student in information systems, aiming to work as a business analyst.",
        },
        {
          ai: "Tell me about your strengths and how they helped a team.",
          hint: "Claim, example, result.",
          example: "My strength is communication; I coordinated our group project and we delivered it on time.",
        },
        {
          ai: "What is a weakness you are working on?",
          hint: "Do not say 'I have no weaknesses'. Show progress.",
          example: "I used to take on too many tasks myself, so now I plan the work and share it with the team.",
        },
        {
          ai: "Describe how you would handle an angry customer on the phone.",
          hint: "Listen, apologize, act, follow up.",
          example: "First I would listen without interrupting, apologize for the issue, then confirm the fix and follow up by email.",
        },
        {
          ai: "Why should we hire you instead of another candidate?",
          hint: "Be specific about what you bring.",
          example: "I combine strong data skills with the ability to explain results clearly to clients.",
        },
      ],
    },
  },
  {
    id: "workplace-conversation",
    title: "Workplace conversation",
    emoji: "🏢",
    blurb: "Small talk, updates, and everyday office communication.",
    difficulty: "Medium",
    minutes: 6,
    xp: 130,
    targetSeconds: 22,
    keyWords: [
      "task",
      "report",
      "deadline",
      "schedule",
      "colleague",
      "progress",
    ],
    levels: {
      basic: [
        {
          ai: "Good morning! How is your work today?",
          hint: "Say how you are and what you are doing.",
          example: "Good morning! I am busy, I am finishing a report.",
        },
        {
          ai: "What task are you working on this week?",
          hint: "Name the task and when it is due.",
          example: "I am working on a report, and it is due on Friday.",
        },
        {
          ai: "Do you need any help from your colleague?",
          hint: "Ask for help politely.",
          example: "Yes, can you help me check this data please?",
        },
        {
          ai: "When is your deadline?",
          hint: "Use 'The deadline is …'.",
          example: "The deadline is next Monday.",
        },
      ],
      intermediate: [
        {
          ai: "Could you give me a quick update on your progress this week?",
          hint: "Done, doing, blocked.",
          example: "I finished the draft report, I am now checking the numbers, and I am waiting for the client's feedback.",
        },
        {
          ai: "A colleague missed a deadline that affects your task. How do you handle it?",
          hint: "Stay professional: ask, clarify, agree on a fix.",
          example: "I would ask what happened, then agree on a new schedule and tell my manager if it affects the client.",
        },
        {
          ai: "How do you usually ask for help when you are stuck?",
          hint: "Be specific about the blocker.",
          example: "I explain what I already tried and ask for advice on the specific step I am stuck on.",
        },
        {
          ai: "Describe how you organize your tasks when you have many deadlines.",
          hint: "Mention a real method: priority, calendar, checklist.",
          example: "I list everything by priority, block time in my calendar, and review the list every morning.",
        },
      ],
    },
  },
  {
    id: "teamwork",
    title: "Teamwork",
    emoji: "🤝",
    blurb: "Collaborate, give opinions, and handle disagreements politely.",
    difficulty: "Medium",
    minutes: 6,
    xp: 130,
    targetSeconds: 22,
    keyWords: [
      "team",
      "agree",
      "opinion",
      "support",
      "responsibility",
      "feedback",
    ],
    levels: {
      basic: [
        {
          ai: "Hi! Do you like working in a team? Why?",
          hint: "Answer and give one reason.",
          example: "Yes, I like working in a team because we can share ideas.",
        },
        {
          ai: "What is your job in your group project?",
          hint: "Name your role.",
          example: "I am the one who writes the report.",
        },
        {
          ai: "What do you do if you disagree with your friend in the group?",
          hint: "Talk about listening first.",
          example: "I listen to my friend and then I explain my idea.",
        },
        {
          ai: "How do you help your team finish on time?",
          hint: "One simple action.",
          example: "I remind the team about the deadline and I do my part early.",
        },
      ],
      intermediate: [
        {
          ai: "Tell me about a time you worked in a team and faced a problem.",
          hint: "Situation, action, result.",
          example: "Our group disagreed about the design, so I organized a short meeting and we agreed on one solution.",
        },
        {
          ai: "How do you give feedback to a teammate without sounding harsh?",
          hint: "Start with the positive, then be specific.",
          example: "I mention what works well, then suggest one specific improvement and offer to help.",
        },
        {
          ai: "Someone in your team is not doing their part. What do you do?",
          hint: "Ask privately, then escalate if needed.",
          example: "I would talk to them privately to understand the issue, and inform the coordinator if it continues.",
        },
        {
          ai: "How do you make sure quiet teammates share their ideas?",
          hint: "Describe one inclusive habit.",
          example: "I ask everyone for one idea in turn, so people who are less confident still get a chance.",
        },
      ],
    },
  },
  {
    id: "customer-service",
    title: "Customer service",
    emoji: "☎️",
    blurb: "Greet, help, and calm customers with professional English.",
    difficulty: "Medium",
    minutes: 6,
    xp: 140,
    targetSeconds: 22,
    keyWords: [
      "customer",
      "assist",
      "complaint",
      "solution",
      "refund",
      "apologize",
    ],
    levels: {
      basic: [
        {
          ai: "Hello, this is customer service. How can I help you today?",
          hint: "Greet, then offer help.",
          example: "Good morning, how can I help you?",
        },
        {
          ai: "I ordered a product but it arrived late. What can you do?",
          hint: "Apologise and offer a solution.",
          example: "I am sorry about that. I will check your order and update you today.",
        },
        {
          ai: "I am not happy with your service.",
          hint: "Stay calm and show you understand.",
          example: "I understand your feeling, and I will try my best to help you.",
        },
        {
          ai: "Can I get a refund?",
          hint: "Explain the process politely.",
          example: "Yes, you can get a refund. I will send you the steps by email.",
        },
      ],
      intermediate: [
        {
          ai: "A client calls and is upset because their order is two weeks late. Handle the call.",
          hint: "Listen, apologize, confirm facts, offer options.",
          example: "Thank you for letting me know, and I apologize for the delay. I have checked your order and I can offer express delivery or a full refund.",
        },
        {
          ai: "The customer asks for something your company cannot provide. What do you say?",
          hint: "Be honest, then offer an alternative.",
          example: "Unfortunately we cannot do that, but I can offer a discount on your next order as an alternative.",
        },
        {
          ai: "How do you end a difficult customer call?",
          hint: "Confirm the agreement and thank them.",
          example: "I summarize what we agreed, confirm the timeline, and thank them for their patience.",
        },
        {
          ai: "A customer complains publicly on social media. How do you respond?",
          hint: "Public answer, private solution.",
          example: "I reply publicly with a short apology and ask them to message us privately so we can solve it quickly.",
        },
      ],
    },
  },
  {
    id: "meetings",
    title: "Meetings",
    emoji: "📅",
    blurb: "Share updates, agree on next steps, and speak up confidently.",
    difficulty: "Medium",
    minutes: 6,
    xp: 140,
    targetSeconds: 22,
    keyWords: [
      "agenda",
      "update",
      "minutes",
      "decision",
      "action",
      "follow-up",
    ],
    levels: {
      basic: [
        {
          ai: "Welcome to the meeting. Can you give a short update?",
          hint: "Say what you finished and what is next.",
          example: "I finished the report and next I will call the supplier.",
        },
        {
          ai: "Do you have any questions about this task?",
          hint: "Ask one clear question.",
          example: "Yes, when is the deadline for this task?",
        },
        {
          ai: "Can you agree to send the file by Thursday?",
          hint: "Accept politely.",
          example: "Yes, I can send it by Thursday.",
        },
        {
          ai: "Thank you. What will you do after the meeting?",
          hint: "One action.",
          example: "After the meeting I will write the summary.",
        },
      ],
      intermediate: [
        {
          ai: "You are invited to give your department's update. Please go ahead.",
          hint: "Highlights, numbers, next action.",
          example: "This week we closed three client requests, two are still pending, and next week we start the training session.",
        },
        {
          ai: "A decision was made that you disagree with. How do you raise it in the meeting?",
          hint: "Respectful, evidence-based.",
          example: "I understand the decision; may I share one concern about the timeline before we finalize it?",
        },
        {
          ai: "How do you make sure everyone leaves the meeting with clear actions?",
          hint: "Mention owner and deadline.",
          example: "I summarize each action with a name and a date, then I share the minutes in the group chat.",
        },
        {
          ai: "Your manager asks you to take on an extra task during the meeting.",
          hint: "Accept conditionally and prioritize.",
          example: "I can take that on, but I would need to move the client report to next week — is that acceptable?",
        },
      ],
    },
  },
  {
    id: "professional-communication",
    title: "Professional communication",
    emoji: "📧",
    blurb: "Emails, phone calls, and polite professional requests.",
    difficulty: "Medium",
    minutes: 6,
    xp: 140,
    targetSeconds: 22,
    keyWords: [
      "regards",
      "attach",
      "request",
      "confirm",
      "professional",
      "response",
    ],
    levels: {
      basic: [
        {
          ai: "You need to ask your manager for two days off. What do you say?",
          hint: "Be polite and give a reason.",
          example: "Excuse me, may I take two days off next week? I have a family event.",
        },
        {
          ai: "How do you start a professional email?",
          hint: "Greeting plus purpose.",
          example: "Dear Mr. Budi, I am writing to ask about the project report.",
        },
        {
          ai: "How do you close an email politely?",
          hint: "Thank them and sign off.",
          example: "Thank you for your time. Best regards, Rina.",
        },
        {
          ai: "You did not understand what your manager said. What do you ask?",
          hint: "Ask politely for repetition.",
          example: "I am sorry, could you repeat that more slowly, please?",
        },
      ],
      intermediate: [
        {
          ai: "Write and say the opening of an email following up on an unanswered request.",
          hint: "Remind, stay friendly, keep it short.",
          example: "I am following up on my previous email about the budget approval; I would appreciate an update when you have a moment.",
        },
        {
          ai: "You must tell a colleague their work needs changes. How do you phrase it?",
          hint: "Focus on the work, not the person.",
          example: "The structure is strong; I think the figures in section two need updating before we send it to the client.",
        },
        {
          ai: "How do you politely decline a request you cannot handle?",
          hint: "No, reason, alternative.",
          example: "Unfortunately I cannot take this on this week, but I can review it on Monday if that works for you.",
        },
        {
          ai: "You made a mistake in a client email. How do you handle it?",
          hint: "Own it, correct it, prevent it.",
          example: "I would send a short correction immediately, apologize for the confusion, and double-check attachments before sending in future.",
        },
      ],
    },
  },
];

export const CAREER_TOPIC_IDS = SPEAKING_TOPICS.map((topic) => topic.id);

export function topicById(id: string): CareerTopic | undefined {
  return SPEAKING_TOPICS.find((topic) => topic.id === id);
}

export function topicTitle(id: string): string {
  return topicById(id)?.title ?? "Speaking Practice";
}

export const DEFAULT_TOPIC_ID = "self-introduction";
