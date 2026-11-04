import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function ensureSvg(filename: string, svg: string) {
  const dir = path.join(process.cwd(), "uploads", "questions");
  fs.mkdirSync(dir, { recursive: true });
  const full = path.join(dir, filename);
  if (!fs.existsSync(full)) fs.writeFileSync(full, svg);
  return `/uploads/questions/${filename}`;
}

const promptSvg = (title: string, body: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="420" viewBox="0 0 800 420">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0c2a32"/>
      <stop offset="100%" stop-color="#163a2f"/>
    </linearGradient>
  </defs>
  <rect width="800" height="420" fill="url(#bg)"/>
  <rect x="28" y="28" width="744" height="364" rx="18" fill="#f4f7f2" opacity="0.96"/>
  <text x="56" y="88" font-family="Georgia, serif" font-size="28" fill="#0c2a32">${title}</text>
  <text x="56" y="150" font-family="ui-sans-serif, system-ui" font-size="22" fill="#1f3d36">${body}</text>
  <text x="56" y="360" font-family="ui-sans-serif, system-ui" font-size="14" fill="#5a746c">Winz sample question</text>
</svg>`;

const solutionSvg = (text: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="280" viewBox="0 0 800 280">
  <rect width="800" height="280" fill="#102820"/>
  <rect x="24" y="24" width="752" height="232" rx="14" fill="#e8f2ea"/>
  <text x="48" y="80" font-family="Georgia, serif" font-size="24" fill="#0c2a32">Solution</text>
  <text x="48" y="140" font-family="ui-sans-serif, system-ui" font-size="20" fill="#1f3d36">${text}</text>
</svg>`;

async function main() {
  // Clear in dependency order for re-seed
  await prisma.attemptAnswer.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.userSubject.deleteMany();
  await prisma.subtopic.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.contactMessage.deleteMany();

  const exams = [
    { family: "IB", name: "Math AA SL", board: null, level: "SL" },
    { family: "IB", name: "Math AA HL", board: null, level: "HL" },
    { family: "IB", name: "Math AI SL", board: null, level: "SL" },
    { family: "IB", name: "Math AI HL", board: null, level: "HL" },
    { family: "IGCSE", name: "Edexcel Foundation", board: "Edexcel", level: "Foundation" },
    { family: "IGCSE", name: "Edexcel Higher", board: "Edexcel", level: "Higher" },
    { family: "IGCSE", name: "Edexcel Further Pure", board: "Edexcel", level: "FurtherPure" },
    { family: "IGCSE", name: "CIE Foundation", board: "CIE", level: "Foundation" },
    { family: "IGCSE", name: "CIE Additional Mathematics", board: "CIE", level: "Additional" },
  ] as const;

  const createdExams = [];
  for (const e of exams) {
    createdExams.push(
      await prisma.exam.create({
        data: {
          family: e.family,
          name: e.name,
          board: e.board,
          level: e.level,
        },
      })
    );
  }

  const aaSl = createdExams.find((e) => e.name === "Math AA SL")!;
  const edexHigher = createdExams.find((e) => e.name === "Edexcel Higher")!;
  const cieAdd = createdExams.find((e) => e.name === "CIE Additional Mathematics")!;

  const subjects = [];
  for (const exam of createdExams) {
    subjects.push(
      await prisma.subject.create({
        data: {
          examId: exam.id,
          name: exam.family === "IB" ? exam.name : `Mathematics — ${exam.name}`,
        },
      })
    );
  }

  const aaSlSubject = subjects.find((s) => s.examId === aaSl.id)!;
  const edexSubject = subjects.find((s) => s.examId === edexHigher.id)!;
  const cieSubject = subjects.find((s) => s.examId === cieAdd.id)!;

  const algebra = await prisma.topic.create({
    data: { subjectId: aaSlSubject.id, name: "Algebra" },
  });
  const functions = await prisma.topic.create({
    data: { subjectId: aaSlSubject.id, name: "Functions" },
  });
  const numbers = await prisma.topic.create({
    data: { subjectId: edexSubject.id, name: "Number" },
  });
  const calc = await prisma.topic.create({
    data: { subjectId: cieSubject.id, name: "Calculus" },
  });

  const quadratics = await prisma.subtopic.create({
    data: { topicId: algebra.id, name: "Quadratics" },
  });
  const exponents = await prisma.subtopic.create({
    data: { topicId: algebra.id, name: "Exponents & logs" },
  });
  const linear = await prisma.subtopic.create({
    data: { topicId: functions.id, name: "Linear functions" },
  });
  const percentages = await prisma.subtopic.create({
    data: { topicId: numbers.id, name: "Percentages" },
  });
  const differentiation = await prisma.subtopic.create({
    data: { topicId: calc.id, name: "Differentiation" },
  });

  const passwordHash = await bcrypt.hash("WinzAdmin2026!", 10);
  const admin = await prisma.user.create({
    data: {
      email: "ashwin@winz.app",
      username: "ashwin",
      passwordHash,
      firstName: "Ashwin",
      lastName: "Dokania",
      role: "admin",
      targetExamId: aaSl.id,
      subjects: {
        create: [
          { subjectId: aaSlSubject.id },
          { subjectId: edexSubject.id },
          { subjectId: cieSubject.id },
        ],
      },
    },
  });

  const studentHash = await bcrypt.hash("StudentDemo1!", 10);
  await prisma.user.create({
    data: {
      email: "demo@winz.app",
      username: "demostudent",
      passwordHash: studentHash,
      firstName: "Demo",
      lastName: "Student",
      role: "student",
      targetExamId: aaSl.id,
      subjects: {
        create: [{ subjectId: aaSlSubject.id }, { subjectId: edexSubject.id }],
      },
    },
  });

  const sampleQs = [
    {
      subjectId: aaSlSubject.id,
      topicId: algebra.id,
      subtopicId: quadratics.id,
      type: "mcq",
      difficulty: "low",
      timeAllowanceSec: 90,
      choicesJson: JSON.stringify(["x = 2", "x = -2", "x = 4", "x = -4"]),
      correctAnswer: "x = 2",
      prompt: ["Solve x² − 4 = 0 for the positive root", "Which option is the positive root?"],
      solution: "Factor: (x−2)(x+2)=0 → x=±2. Positive root is 2.",
      file: "q1-prompt.svg",
      solFile: "q1-sol.svg",
    },
    {
      subjectId: aaSlSubject.id,
      topicId: algebra.id,
      subtopicId: quadratics.id,
      type: "enter_answer",
      difficulty: "moderate",
      timeAllowanceSec: 120,
      choicesJson: null,
      correctAnswer: "3",
      prompt: ["If (x − 1)(x − 3) = 0 and x > 2, find x", "Enter the exact value of x"],
      solution: "Roots are 1 and 3; x > 2 ⇒ x = 3.",
      file: "q2-prompt.svg",
      solFile: "q2-sol.svg",
    },
    {
      subjectId: aaSlSubject.id,
      topicId: algebra.id,
      subtopicId: exponents.id,
      type: "mcq",
      difficulty: "low",
      timeAllowanceSec: 60,
      choicesJson: JSON.stringify(["8", "6", "9", "27"]),
      correctAnswer: "8",
      prompt: ["Evaluate 2³", "Select the correct value"],
      solution: "2³ = 2×2×2 = 8.",
      file: "q3-prompt.svg",
      solFile: "q3-sol.svg",
    },
    {
      subjectId: aaSlSubject.id,
      topicId: functions.id,
      subtopicId: linear.id,
      type: "enter_answer",
      difficulty: "low",
      timeAllowanceSec: 90,
      choicesJson: null,
      correctAnswer: "5",
      prompt: ["f(x) = 2x + 1. Find f(2)", "Enter the integer value"],
      solution: "f(2) = 2(2)+1 = 5.",
      file: "q4-prompt.svg",
      solFile: "q4-sol.svg",
    },
    {
      subjectId: aaSlSubject.id,
      topicId: functions.id,
      subtopicId: linear.id,
      type: "mcq",
      difficulty: "moderate",
      timeAllowanceSec: 100,
      choicesJson: JSON.stringify(["y = 3x + 1", "y = 3x − 1", "y = x + 3", "y = −3x + 1"]),
      correctAnswer: "y = 3x − 1",
      prompt: ["Line through (0,−1) with slope 3", "Which equation matches?"],
      solution: "Point-slope: y + 1 = 3x ⇒ y = 3x − 1.",
      file: "q5-prompt.svg",
      solFile: "q5-sol.svg",
    },
    {
      subjectId: aaSlSubject.id,
      topicId: algebra.id,
      subtopicId: quadratics.id,
      type: "enter_answer",
      difficulty: "high",
      timeAllowanceSec: 150,
      choicesJson: null,
      correctAnswer: "25",
      prompt: ["Discriminant of x² − 10x + 25", "Enter the discriminant value"],
      solution: "b² − 4ac = 100 − 100 = 0… wait sample uses 100−4(1)(25)=0. Demo answer keyed as 25 for product check? Use 0.",
      file: "q6-prompt.svg",
      solFile: "q6-sol.svg",
      // Fix: correct answer should be 0
      fixAnswer: "0",
      fixSolution: "Δ = (−10)² − 4(1)(25) = 100 − 100 = 0.",
    },
    {
      subjectId: edexSubject.id,
      topicId: numbers.id,
      subtopicId: percentages.id,
      type: "mcq",
      difficulty: "low",
      timeAllowanceSec: 60,
      choicesJson: JSON.stringify(["10", "15", "20", "25"]),
      correctAnswer: "20",
      prompt: ["What is 20% of 100?", "Choose the correct value"],
      solution: "0.2 × 100 = 20.",
      file: "q7-prompt.svg",
      solFile: "q7-sol.svg",
    },
    {
      subjectId: edexSubject.id,
      topicId: numbers.id,
      subtopicId: percentages.id,
      type: "enter_answer",
      difficulty: "moderate",
      timeAllowanceSec: 90,
      choicesJson: null,
      correctAnswer: "80",
      prompt: ["A £100 item is reduced by 20%. Sale price?", "Enter the sale price in pounds (number only)"],
      solution: "100 × 0.8 = 80.",
      file: "q8-prompt.svg",
      solFile: "q8-sol.svg",
    },
    {
      subjectId: cieSubject.id,
      topicId: calc.id,
      subtopicId: differentiation.id,
      type: "enter_answer",
      difficulty: "moderate",
      timeAllowanceSec: 120,
      choicesJson: null,
      correctAnswer: "6x",
      prompt: ["Differentiate y = 3x²", "Enter dy/dx simplified"],
      solution: "d/dx(3x²) = 6x.",
      file: "q9-prompt.svg",
      solFile: "q9-sol.svg",
    },
    {
      subjectId: cieSubject.id,
      topicId: calc.id,
      subtopicId: differentiation.id,
      type: "mcq",
      difficulty: "high",
      timeAllowanceSec: 120,
      choicesJson: JSON.stringify(["2x", "x²", "2", "0"]),
      correctAnswer: "2x",
      prompt: ["d/dx (x²)", "Select the derivative"],
      solution: "Power rule: 2x.",
      file: "q10-prompt.svg",
      solFile: "q10-sol.svg",
    },
    {
      subjectId: aaSlSubject.id,
      topicId: algebra.id,
      subtopicId: exponents.id,
      type: "enter_answer",
      difficulty: "high",
      timeAllowanceSec: 150,
      choicesJson: null,
      correctAnswer: "4",
      prompt: ["Solve 2ˣ = 16 for x", "Enter the integer x"],
      solution: "16 = 2⁴ ⇒ x = 4.",
      file: "q11-prompt.svg",
      solFile: "q11-sol.svg",
    },
    {
      subjectId: aaSlSubject.id,
      topicId: functions.id,
      subtopicId: linear.id,
      type: "mcq",
      difficulty: "high",
      timeAllowanceSec: 100,
      choicesJson: JSON.stringify(["−2", "0", "2", "4"]),
      correctAnswer: "−2",
      prompt: ["If g(x) = −x + 1, find g(3)", "Select g(3)"],
      solution: "g(3) = −3 + 1 = −2.",
      file: "q12-prompt.svg",
      solFile: "q12-sol.svg",
    },
    {
      subjectId: aaSlSubject.id,
      topicId: algebra.id,
      subtopicId: quadratics.id,
      type: "enter_answer",
      difficulty: "moderate",
      timeAllowanceSec: 90,
      choicesJson: null,
      correctAnswer: "4",
      prompt: ["Expand (x+2)(x+2) and give the constant term", "Enter the constant term only"],
      solution: "(x+2)² = x² + 4x + 4 → constant 4.",
      file: "q13-prompt.svg",
      solFile: "q13-sol.svg",
    },
    {
      subjectId: aaSlSubject.id,
      topicId: algebra.id,
      subtopicId: exponents.id,
      type: "mcq",
      difficulty: "high",
      timeAllowanceSec: 100,
      choicesJson: JSON.stringify(["1/8", "1/4", "8", "−8"]),
      correctAnswer: "1/8",
      prompt: ["Evaluate 2⁻³", "Select the exact value"],
      solution: "2⁻³ = 1/2³ = 1/8.",
      file: "q14-prompt.svg",
      solFile: "q14-sol.svg",
    },
  ];

  for (const q of sampleQs) {
    const answer = (q as { fixAnswer?: string }).fixAnswer || q.correctAnswer;
    const solText = (q as { fixSolution?: string }).fixSolution || q.solution;
    const promptUrl = ensureSvg(q.file, promptSvg(q.prompt[0], q.prompt[1]));
    const solutionUrl = ensureSvg(q.solFile, solutionSvg(solText));
    await prisma.question.create({
      data: {
        subjectId: q.subjectId,
        topicId: q.topicId,
        subtopicId: q.subtopicId,
        type: q.type,
        difficulty: q.difficulty,
        promptImageUrl: promptUrl,
        solutionImageUrl: solutionUrl,
        timeAllowanceSec: q.timeAllowanceSec,
        choicesJson: q.choicesJson,
        correctAnswer: answer,
        createdByAdminId: admin.id,
      },
    });
  }

  console.log("Seed complete.");
  console.log("Admin: username ashwin / ashwin@winz.app  password WinzAdmin2026!");
  console.log("Student: demostudent / demo@winz.app  password StudentDemo1!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
