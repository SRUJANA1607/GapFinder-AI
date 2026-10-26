import { StudyDocument, Topic, QuizQuestion, RevisionPlan, UserProfile } from './types';

export const DEMO_USER: UserProfile = {
  id: 'user_judge_01',
  name: 'Prof. Alex Mercer (Demo Evaluator)',
  email: 'judge@gapfinder.ai',
  role: 'judge',
  streakDays: 4,
  lastActiveDate: new Date().toISOString(),
  xp: 420,
  level: 3,
  badges: [
    {
      id: 'badge_1',
      title: 'First Diagnosis',
      description: 'Completed your first diagnostic knowledge scan',
      icon: '🎯',
      unlockedAt: '2026-10-22T10:00:00Z',
    },
    {
      id: 'badge_2',
      title: 'Past Paper Scholar',
      description: 'Indexed and cross-referenced 3 years of past papers',
      icon: '📜',
      unlockedAt: '2026-10-23T14:30:00Z',
    },
    {
      id: 'badge_3',
      title: 'Streak Master',
      description: 'Maintained a revision streak for 4 consecutive days',
      icon: '🔥',
      unlockedAt: '2026-10-25T09:15:00Z',
    },
    {
      id: 'badge_4',
      title: 'Gap Crusher',
      description: 'Turned a Weak topic into Strong after targeted revision',
      icon: '🛡️',
      unlockedAt: undefined,
    },
  ],
};

export const DEMO_DOCUMENTS: StudyDocument[] = [
  {
    id: 'doc_syl_01',
    name: 'CS301_Operating_Systems_Official_Syllabus.pdf',
    category: 'syllabus',
    uploadedAt: '2026-10-20T08:00:00Z',
    fileSize: '480 KB',
    pageCount: 6,
    chunksCount: 8,
    content: `COURSE SYLLABUS: CS301 - Operating Systems and Concurrency
Department of Computer Science & Engineering.

UNIT 1: PROCESS MANAGEMENT & THREADS
1.1 Process Concepts: Process state machine, PCB (Process Control Block), Context Switching overheads.
1.2 Threading Models: User-level vs Kernel-level threads, Many-to-One, One-to-One, Many-to-Many models.
1.3 CPU Scheduling: FCFS, SJF (Preemptive vs Non-Preemptive), Priority Scheduling, Multi-Level Feedback Queues (MLFQ).

UNIT 2: PROCESS SYNCHRONIZATION & DEADLOCKS
2.1 Critical Section Problem: Mutual exclusion, Progress, Bounded Waiting conditions.
2.2 Hardware and Software Solutions: Peterson's algorithm, Test-and-Set, Compare-and-Swap primitives.
2.3 Semaphores and Mutexes: Counting vs Binary Semaphores, Classic synchronization problems (Dining Philosophers, Producer-Consumer).
2.4 Deadlock Characterization: Coffman four conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait).
2.5 Deadlock Handling: Deadlock Prevention vs Avoidance (Banker's Algorithm with Safety and Resource-Request states), Deadlock Detection and Recovery.

UNIT 3: MEMORY MANAGEMENT & VIRTUAL MEMORY
3.1 Memory Allocation: Contiguous allocation, Internal and External Fragmentation, Paging, TLB (Translation Lookaside Buffer).
3.2 Virtual Memory: Demand Paging, Page Fault Handling sequence, Thrashing and Working-Set model.
3.3 Page Replacement Algorithms: FIFO, Optimal Page Replacement (Belady's Anomaly), LRU (Least Recently Used) and Clock algorithm.

UNIT 4: STORAGE & FILE SYSTEMS
4.1 File Allocation Methods: Contiguous, Linked, and Indexed allocation. Inode structures in UNIX.
4.2 Disk Scheduling: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK algorithms.`,
  },
  {
    id: 'doc_txt_02',
    name: 'Modern_Operating_Systems_Chapter4_and_7_Excerpts.pdf',
    category: 'textbook',
    uploadedAt: '2026-10-21T11:20:00Z',
    fileSize: '3.4 MB',
    pageCount: 42,
    chunksCount: 24,
    content: `CHAPTER 4: SYNCHRONIZATION AND DEADLOCK PREVENTION
Section 4.2: Peterson's Solution
Peterson's solution is a software-based solution to the critical-section problem for two processes. It relies on two variables: int turn and boolean flag[2]. The flag array indicates whether a process is ready to enter its critical section (flag[i] = true), while the turn variable indicates whose turn it is to enter. A process sets its own flag to true and hands turn to the other process (turn = j). It then loops while (flag[j] && turn == j). Peterson's algorithm guarantees Mutual Exclusion, Progress, and Bounded Waiting on architectures where memory loads and stores are atomic.

Section 4.4: The Banker's Algorithm for Deadlock Avoidance
The Banker's Algorithm is developed for systems with multiple instances of each resource type. It uses the following data structures:
- Available[m]: vector of length m indicating available instances of each resource.
- Max[n][m]: maximum demand of each process.
- Allocation[n][m]: amount currently allocated to each process.
- Need[n][m]: remaining need of each process, calculated strictly as Need[i][j] = Max[i][j] - Allocation[i][j].
A state is safe if there exists a safe sequence <P0, P1, ..., Pn-1> such that for each Pi, the resources that Pi can still request can be satisfied by currently available resources plus resources held by all preceding processes.

Section 7.3: Virtual Memory and Belady's Anomaly
In demand paging, increasing the number of allocated page frames generally decreases the page-fault rate. However, with First-In-First-Out (FIFO) replacement, increasing frames can unexpectedly cause an INCREASE in page faults. This phenomenon is known as Belady's Anomaly. It occurs because FIFO ignores the recency or locality of memory references, displacing frequently needed pages simply because they entered earliest. Stack algorithms, such as LRU (Least Recently Used) and Optimal, never suffer from Belady's Anomaly because the set of pages in a memory of n frames is always a subset of the pages in a memory of n+1 frames.`,
  },
  {
    id: 'doc_notes_03',
    name: 'Prof_Mercer_Lecture_Notes_Unit2_and_3.txt',
    category: 'notes',
    uploadedAt: '2026-10-22T09:10:00Z',
    fileSize: '180 KB',
    pageCount: 14,
    chunksCount: 12,
    content: `CLASS NOTES: UNIT 2 & 3 RAPID REVISION HIGHLIGHTS
Prof. Mercer's Special Examination Notes:

1. Critical Distinction in Deadlock:
- Prevention: Deny one of the 4 Coffman conditions at system design time. Circular wait is eliminated by imposing a strict linear ordering on resource types. Hold-and-wait is prevented by requiring a process to request all resources at once.
- Avoidance: Dynamically evaluates every single request using Banker's Algorithm. If granting a request leads to an UNSAFE state, the process MUST wait, even if resources are currently free!
Notice: An unsafe state is NOT deadlocked; it is merely a state from which the system cannot prevent a potential future deadlock.

2. Paging and TLB Calculation Formula:
Effective Memory Access Time (EMAT) = Hit_Ratio * (TLB_Access_Time + Memory_Access_Time) + (1 - Hit_Ratio) * (TLB_Access_Time + 2 * Memory_Access_Time).
Always remember: When a page fault occurs, disk I/O occurs, increasing latency by several orders of magnitude (milliseconds vs nanoseconds).

3. Thrashing Core Cause:
A process enters Thrashing when the sum of working-set sizes of all active processes exceeds the total available physical memory (sum(WSS_i) > D). The CPU scheduler sees low CPU utilization and mistakenly increases the degree of multiprogramming, causing total system collapse.`,
  },
  {
    id: 'doc_qp_04',
    name: 'University_Past_Exam_Papers_2023_2024_2025.pdf',
    category: 'past_paper',
    uploadedAt: '2026-10-23T16:00:00Z',
    fileSize: '820 KB',
    pageCount: 10,
    chunksCount: 16,
    content: `MIDTERM & FINAL EXAMINATIONS (2023 - 2025):
FREQUENCY ANALYSIS:
[2025 End-Sem Question 3, 10 Marks]: Given processes P0-P4 with Max matrix and Allocation matrix, evaluate if the current system is in a safe state using Banker's Algorithm. Derive the safe sequence. (Appeared in 2023, 2024, 2025 - HIGH EXAM FREQUENCY).

[2024 End-Sem Question 2b, 6 Marks]: Explain Belady's Anomaly. Prove mathematically whether LRU can ever suffer from Belady's Anomaly. Compare with FIFO page replacement. (Appeared in 2024, 2023 - HIGH EXAM FREQUENCY).

[2025 Mid-Sem Question 4, 8 Marks]: Describe Peterson's Algorithm. Show how Mutual Exclusion, Progress, and Bounded Waiting are satisfied with clear step-by-step logic. (Appeared in 2025, 2024 - HIGH EXAM FREQUENCY).

[2024 Mid-Sem Question 1, 5 Marks]: Distinguish between User-Level Threads and Kernel-Level Threads in terms of context-switch overhead and blocking system calls. (MEDIUM EXAM FREQUENCY).

[2023 End-Sem Question 6, 7 Marks]: Explain Disk Scheduling algorithms: Compare SCAN vs C-SCAN for high disk load scenarios. (LOW EXAM FREQUENCY).`,
  },
];

export const DEMO_TOPICS: Topic[] = [
  {
    id: 'topic_bankers_algo',
    title: "Deadlock Avoidance & Banker's Algorithm",
    unit: 'Unit 2: Concurrency & Deadlocks',
    description: "Safe state determination, resource allocation graphs, Need Matrix calculation, and safe execution sequence derivation.",
    subtopics: ["Need Matrix Computation", "Safety Algorithm Sequence", "Resource-Request Verification", "Unsafe vs Deadlocked States"],
    examFrequency: 'High',
    pastPaperQuestionsCount: 4,
    masteryScore: 32, // Student is WEAK here!
    status: 'weak',
    diagnosisReason: "Failed 2 out of 3 diagnostic questions on Need Matrix calculation and safe state conditions. 10 marks assigned in 2025, 2024 past papers.",
    citationSources: [
      { docName: 'Modern_Operating_Systems_Chapter4_and_7_Excerpts.pdf', section: 'Section 4.4: Banker\'s Algorithm' },
      { docName: 'Prof_Mercer_Lecture_Notes_Unit2_and_3.txt', section: '1. Critical Distinction in Deadlock' },
      { docName: 'University_Past_Exam_Papers_2023_2024_2025.pdf', section: '2025 End-Sem Question 3 (10 Marks)' },
    ],
  },
  {
    id: 'topic_belady_fifo',
    title: "Virtual Memory, Paging & Belady's Anomaly",
    unit: 'Unit 3: Memory Management',
    description: "Demand paging mechanisms, page fault handling, FIFO anomaly, stack algorithm properties of LRU and Optimal.",
    subtopics: ["FIFO vs LRU Page Replacement", "Belady's Anomaly Proof", "Page Fault Frequency", "Working-Set Thrashing"],
    examFrequency: 'High',
    pastPaperQuestionsCount: 3,
    masteryScore: 45, // Student is WEAK here!
    status: 'weak',
    diagnosisReason: "Confused Belady's anomaly vulnerability in FIFO versus LRU stack algorithms. Appeared in 2 consecutive past exam papers (6 marks).",
    citationSources: [
      { docName: 'Modern_Operating_Systems_Chapter4_and_7_Excerpts.pdf', section: 'Section 7.3: Belady\'s Anomaly' },
      { docName: 'University_Past_Exam_Papers_2023_2024_2025.pdf', section: '2024 End-Sem Question 2b' },
    ],
  },
  {
    id: 'topic_petersons_algo',
    title: "Peterson's Algorithm & Critical Section Problem",
    unit: 'Unit 2: Concurrency & Deadlocks',
    description: "Two-process software synchronization, mutual exclusion proof, progress requirement, and bounded waiting verification.",
    subtopics: ["Turn and Flag Variables", "Mutual Exclusion Proof", "Atomic Store Guarantees", "Modern Memory Barriers"],
    examFrequency: 'High',
    pastPaperQuestionsCount: 3,
    masteryScore: 68, // Student is MEDIUM
    status: 'medium',
    diagnosisReason: "Understands mutual exclusion correctness, but missed modern out-of-order execution memory barrier implications.",
    citationSources: [
      { docName: 'Modern_Operating_Systems_Chapter4_and_7_Excerpts.pdf', section: 'Section 4.2: Peterson\'s Solution' },
      { docName: 'University_Past_Exam_Papers_2023_2024_2025.pdf', section: '2025 Mid-Sem Question 4' },
    ],
  },
  {
    id: 'topic_threads_models',
    title: 'Process Management & Threading Models',
    unit: 'Unit 1: Process Management',
    description: 'PCB lifecycle, User-level vs Kernel-level threads, context switching overheads, and multi-core mapping.',
    subtopics: ['PCB Components', 'Many-to-One vs One-to-One Models', 'Kernel Traps and Context Switch', 'Blocking I/O in User Threads'],
    examFrequency: 'Medium',
    pastPaperQuestionsCount: 2,
    masteryScore: 84, // Student is STRONG
    status: 'strong',
    diagnosisReason: "Solid conceptual mastery demonstrated. Correctly answered all thread architecture questions with clear reasoning.",
    citationSources: [
      { docName: 'CS301_Operating_Systems_Official_Syllabus.pdf', section: 'UNIT 1: PROCESS MANAGEMENT & THREADS' },
      { docName: 'University_Past_Exam_Papers_2023_2024_2025.pdf', section: '2024 Mid-Sem Question 1' },
    ],
  },
  {
    id: 'topic_disk_scheduling',
    title: 'Storage & Disk Scheduling Algorithms',
    unit: 'Unit 4: Storage & File Systems',
    description: 'Head movement minimization, SCAN, C-SCAN, LOOK algorithms, and rotational latency optimization.',
    subtopics: ['SSTF Starvation Risk', 'SCAN vs C-SCAN Cylinders', 'LOOK vs C-LOOK Boundaries'],
    examFrequency: 'Low',
    pastPaperQuestionsCount: 1,
    masteryScore: 78, // Student is STRONG
    status: 'strong',
    diagnosisReason: "Competent understanding of disk head movements and boundary turnaround logic.",
    citationSources: [
      { docName: 'CS301_Operating_Systems_Official_Syllabus.pdf', section: 'UNIT 4: STORAGE & FILE SYSTEMS' },
      { docName: 'University_Past_Exam_Papers_2023_2024_2025.pdf', section: '2023 End-Sem Question 6' },
    ],
  },
];

export const DEMO_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q_bankers_01',
    topicId: 'topic_bankers_algo',
    topicTitle: "Deadlock Avoidance & Banker's Algorithm",
    question: "In the Banker's Algorithm, if Need[i][j] is the remaining resource demand for process Pi and resource j, how is Need strictly defined using system matrices?",
    options: [
      "Need[i][j] = Available[j] - Allocation[i][j]",
      "Need[i][j] = Max[i][j] - Allocation[i][j]",
      "Need[i][j] = Max[i][j] + Allocation[i][j]",
      "Need[i][j] = Total_Resources[j] - Max[i][j]"
    ],
    correctAnswerIndex: 1,
    explanation: "According to the textbook chapter on Banker's Algorithm, the remaining need matrix is strictly defined as Need[i][j] = Max[i][j] - Allocation[i][j]. This ensures the operating system knows exactly how many additional instances of each resource a process may still request.",
    difficulty: 'Medium',
    citation: {
      docName: 'Modern_Operating_Systems_Chapter4_and_7_Excerpts.pdf',
      section: 'Section 4.4: Banker\'s Algorithm',
      snippet: 'Need[n][m]: remaining need of each process, calculated strictly as Need[i][j] = Max[i][j] - Allocation[i][j].'
    }
  },
  {
    id: 'q_bankers_02',
    topicId: 'topic_bankers_algo',
    topicTitle: "Deadlock Avoidance & Banker's Algorithm",
    question: "Which of the following statements about an 'Unsafe State' in deadlock avoidance is strictly accurate based on your course materials?",
    options: [
      "An unsafe state is always deadlocked already.",
      "An unsafe state is NOT necessarily deadlocked; it is merely a state from which the OS cannot prevent a potential deadlock.",
      "An unsafe state guarantees that all processes will terminate within finite time.",
      "An unsafe state occurs only when physical memory is exhausted."
    ],
    correctAnswerIndex: 1,
    explanation: "Lecture Notes explicitly emphasize: 'An unsafe state is NOT deadlocked; it is merely a state from which the system cannot prevent a potential future deadlock.' If processes request maximum resources unpredictably, deadlock can occur.",
    difficulty: 'Hard',
    citation: {
      docName: 'Prof_Mercer_Lecture_Notes_Unit2_and_3.txt',
      section: '1. Critical Distinction in Deadlock',
      snippet: 'Notice: An unsafe state is NOT deadlocked; it is merely a state from which the system cannot prevent a potential future deadlock.'
    }
  },
  {
    id: 'q_belady_01',
    topicId: 'topic_belady_fifo',
    topicTitle: "Virtual Memory, Paging & Belady's Anomaly",
    question: "Why can the Least Recently Used (LRU) page replacement algorithm NEVER suffer from Belady's Anomaly?",
    options: [
      "Because LRU uses hardware timers that reset memory bus frequency.",
      "Because LRU is a stack algorithm where pages in n frames are always a strict subset of pages in n+1 frames.",
      "Because LRU only operates on contiguous memory segments.",
      "Because LRU forces all pages to be swapped to disk immediately."
    ],
    correctAnswerIndex: 1,
    explanation: "As stated in Chapter 7 excerpts: Stack algorithms, such as LRU and Optimal, never suffer from Belady's Anomaly because the set of pages in memory of n frames is always a subset of pages in memory of n+1 frames.",
    difficulty: 'Hard',
    citation: {
      docName: 'Modern_Operating_Systems_Chapter4_and_7_Excerpts.pdf',
      section: 'Section 7.3: Virtual Memory and Belady\'s Anomaly',
      snippet: 'Stack algorithms, such as LRU and Optimal, never suffer from Belady\'s Anomaly because the set of pages in a memory of n frames is always a subset of the pages in a memory of n+1 frames.'
    }
  },
  {
    id: 'q_petersons_01',
    topicId: 'topic_petersons_algo',
    topicTitle: "Peterson's Algorithm & Critical Section Problem",
    question: "In Peterson's Solution for 2 processes (P0 and P1), what action does Process 0 execute immediately after declaring its interest via flag[0] = true?",
    options: [
      "It acquires the semaphore mutex lock.",
      "It sets turn = 1, giving the other process the priority to enter.",
      "It disables CPU interrupts until completion.",
      "It resets flag[1] to false."
    ],
    correctAnswerIndex: 1,
    explanation: "Peterson's algorithm specifies that after setting flag[i] = true, process i sets turn = j (yielding priority to the opposite process). It then enters the busy-wait condition while (flag[j] && turn == j).",
    difficulty: 'Medium',
    citation: {
      docName: 'Modern_Operating_Systems_Chapter4_and_7_Excerpts.pdf',
      section: 'Section 4.2: Peterson\'s Solution',
      snippet: 'A process sets its own flag to true and hands turn to the other process (turn = j). It then loops while (flag[j] && turn == j).'
    }
  },
  {
    id: 'q_threads_01',
    topicId: 'topic_threads_models',
    topicTitle: 'Process Management & Threading Models',
    question: "What is the primary drawback of a pure Many-to-One user-level threading model when a thread makes a system call?",
    options: [
      "Kernel memory is permanently corrupted.",
      "If one user thread issues a blocking system call, the entire process and all other user threads are blocked.",
      "Context switching time increases by 500%.",
      "The thread cannot execute any arithmetic instructions."
    ],
    correctAnswerIndex: 1,
    explanation: "In Many-to-One threading, multiple user threads map to a single kernel thread. If a user thread performs a blocking I/O call, the kernel sees the entire process as blocked.",
    difficulty: 'Easy',
    citation: {
      docName: 'CS301_Operating_Systems_Official_Syllabus.pdf',
      section: 'UNIT 1: PROCESS MANAGEMENT & THREADS',
      snippet: '1.2 Threading Models: User-level vs Kernel-level threads, Many-to-One, One-to-One, Many-to-Many models.'
    }
  }
];

export const DEMO_REVISION_PLAN: RevisionPlan = {
  id: 'plan_os_7days',
  createdAt: '2026-10-24T12:00:00Z',
  targetExamDate: '2026-11-02',
  daysRemaining: 7,
  dailyHoursAvailable: 2,
  totalStudyHours: 14,
  days: [
    {
      dayNumber: 1,
      dateStr: 'Today - Day 1',
      focusTitle: "Urgent Gap #1: Banker's Algorithm & Safe Sequences",
      estimatedMinutes: 120,
      completed: false,
      tasks: [
        {
          id: 'task_1_1',
          topicId: 'topic_bankers_algo',
          topicTitle: "Banker's Algorithm Core Foundations",
          actionType: 'Review Notes',
          sourceReference: 'Modern_Operating_Systems: Section 4.4 & Notes p.2',
          durationMinutes: 45,
          completed: true,
          priority: 'Urgent',
        },
        {
          id: 'task_1_2',
          topicId: 'topic_bankers_algo',
          topicTitle: "Past Paper 2025 10-Mark Safe State Problem",
          actionType: 'Solve Past Paper Questions',
          sourceReference: 'University Past Papers 2025: Q3',
          durationMinutes: 45,
          completed: false,
          priority: 'Urgent',
        },
        {
          id: 'task_1_3',
          topicId: 'topic_bankers_algo',
          topicTitle: "Re-test Banker's Algorithm Diagnostic Quiz",
          actionType: 'Re-test Quiz',
          sourceReference: 'GapFinder Diagnostic Engine',
          durationMinutes: 30,
          completed: false,
          priority: 'Urgent',
        },
      ],
    },
    {
      dayNumber: 2,
      dateStr: 'Tomorrow - Day 2',
      focusTitle: "Urgent Gap #2: Belady's Anomaly & LRU Stack Proof",
      estimatedMinutes: 120,
      completed: false,
      tasks: [
        {
          id: 'task_2_1',
          topicId: 'topic_belady_fifo',
          topicTitle: "Belady's Anomaly Counterexample and Proof",
          actionType: 'Review Notes',
          sourceReference: 'Modern Operating Systems: Section 7.3',
          durationMinutes: 40,
          completed: false,
          priority: 'Urgent',
        },
        {
          id: 'task_2_2',
          topicId: 'topic_belady_fifo',
          topicTitle: "Past Paper 2024 Question 2b (6 Marks)",
          actionType: 'Solve Past Paper Questions',
          sourceReference: 'Past Exam Papers 2024: Q2b',
          durationMinutes: 50,
          completed: false,
          priority: 'Urgent',
        },
        {
          id: 'task_2_3',
          topicId: 'topic_belady_fifo',
          topicTitle: "Working Set Thrashing Concept Check",
          actionType: 'Deep Dive Flashcards',
          sourceReference: 'Lecture Notes Unit 3: Point 3',
          durationMinutes: 30,
          completed: false,
          priority: 'High',
        },
      ],
    },
    {
      dayNumber: 3,
      dateStr: 'Day 3',
      focusTitle: "Medium Gap: Peterson's Algorithm & Synchronization",
      estimatedMinutes: 90,
      completed: false,
      tasks: [
        {
          id: 'task_3_1',
          topicId: 'topic_petersons_algo',
          topicTitle: "3 Critical Section Criteria Verification",
          actionType: 'Review Notes',
          sourceReference: 'Modern Operating Systems: Section 4.2',
          durationMinutes: 45,
          completed: false,
          priority: 'High',
        },
        {
          id: 'task_3_2',
          topicId: 'topic_petersons_algo',
          topicTitle: "Mid-Term 2025 8-Mark Proof Exercise",
          actionType: 'Solve Past Paper Questions',
          sourceReference: 'Mid-Sem 2025: Q4',
          durationMinutes: 45,
          completed: false,
          priority: 'High',
        },
      ],
    },
    {
      dayNumber: 4,
      dateStr: 'Day 4',
      focusTitle: "Consolidation & Strong Topics Rapid Sprint",
      estimatedMinutes: 90,
      completed: false,
      tasks: [
        {
          id: 'task_4_1',
          topicId: 'topic_threads_models',
          topicTitle: "Threading Architectures Quick Check",
          actionType: 'Deep Dive Flashcards',
          sourceReference: 'Official Syllabus Unit 1.2',
          durationMinutes: 30,
          completed: false,
          priority: 'Medium',
        },
        {
          id: 'task_4_2',
          topicId: 'topic_disk_scheduling',
          topicTitle: "SCAN vs C-SCAN Disk Head Traversal",
          actionType: 'Solve Past Paper Questions',
          sourceReference: 'Past Papers 2023: Q6',
          durationMinutes: 60,
          completed: false,
          priority: 'Medium',
        },
      ],
    },
    {
      dayNumber: 5,
      dateStr: 'Day 5',
      focusTitle: "Full Comprehensive Diagnostic Mock Test",
      estimatedMinutes: 120,
      completed: false,
      tasks: [
        {
          id: 'task_5_1',
          topicId: 'all',
          topicTitle: "Full 25-Question Grounded Diagnostic Exam",
          actionType: 'Re-test Quiz',
          sourceReference: 'All Uploaded Materials',
          durationMinutes: 90,
          completed: false,
          priority: 'Urgent',
        },
        {
          id: 'task_5_2',
          topicId: 'all',
          topicTitle: "Updated Gap Diagnosis & Weak Area Re-calibration",
          actionType: 'Review Notes',
          sourceReference: 'GapFinder Diagnostic Engine',
          durationMinutes: 30,
          completed: false,
          priority: 'High',
        },
      ],
    },
    {
      dayNumber: 6,
      dateStr: 'Day 6',
      focusTitle: "High-Yield Formulae & Misconceptions Review",
      estimatedMinutes: 90,
      completed: false,
      tasks: [
        {
          id: 'task_6_1',
          topicId: 'topic_belady_fifo',
          topicTitle: "EMAT TLB Access Formulas Rapid Drill",
          actionType: 'Deep Dive Flashcards',
          sourceReference: 'Prof Mercer Lecture Notes Point 2',
          durationMinutes: 45,
          completed: false,
          priority: 'High',
        },
        {
          id: 'task_6_2',
          topicId: 'topic_bankers_algo',
          topicTitle: "Circular Wait Linear Ordering Protocol Check",
          actionType: 'Review Notes',
          sourceReference: 'Lecture Notes Unit 2',
          durationMinutes: 45,
          completed: false,
          priority: 'High',
        },
      ],
    },
    {
      dayNumber: 7,
      dateStr: 'Day 7 - Pre-Exam Confidence Sprint',
      focusTitle: "Final Readiness Check & Mind Map Overview",
      estimatedMinutes: 60,
      completed: false,
      tasks: [
        {
          id: 'task_7_1',
          topicId: 'all',
          topicTitle: "High-Yield Exam Points Final Scan",
          actionType: 'Review Notes',
          sourceReference: 'GapFinder Topic Map',
          durationMinutes: 40,
          completed: false,
          priority: 'Medium',
        },
        {
          id: 'task_7_2',
          topicId: 'all',
          topicTitle: "Confidence Meditation & Exam Strategy",
          actionType: 'Deep Dive Flashcards',
          sourceReference: 'GapFinder AI Plan',
          durationMinutes: 20,
          completed: false,
          priority: 'Medium',
        },
      ],
    },
  ],
};
