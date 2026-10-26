import { NextRequest, NextResponse } from 'next/server';
import { Topic, RevisionPlan, RevisionDayPlan } from '@/lib/types';
import { DEMO_TOPICS } from '@/lib/demo-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topics: inputTopics = [],
      daysRemaining = 7,
      dailyHours = 2,
      targetExamDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    } = body;

    const topics: Topic[] = inputTopics && inputTopics.length > 0 ? inputTopics : DEMO_TOPICS;

    // Sorting algorithm:
    // 1. Weak + High Exam Frequency (Top Priority)
    // 2. Weak + Medium Exam Frequency
    // 3. Medium + High Exam Frequency
    // 4. Weak + Low Exam Frequency
    // 5. Medium + Medium Exam Frequency
    // 6. Strong topics (quick consolidation)
    const sortedTopics: Topic[] = [...topics].sort((a, b) => {
      const getPriorityWeight = (t: Topic) => {
        let weight = 0;
        if (t.status === 'weak' || t.masteryScore < 50) weight += 100;
        else if (t.status === 'medium' || t.masteryScore < 75) weight += 50;
        else weight += 10;

        if (t.examFrequency === 'High') weight += 40;
        else if (t.examFrequency === 'Medium') weight += 20;
        else weight += 5;

        weight += t.pastPaperQuestionsCount * 5;
        return weight;
      };

      return getPriorityWeight(b) - getPriorityWeight(a);
    });

    const daysCount = Math.max(1, Math.min(30, Number(daysRemaining) || 7));
    const hoursPerDay = Math.max(0.5, Math.min(10, Number(dailyHours) || 2));
    const dailyMinutes = Math.round(hoursPerDay * 60);

    const days: RevisionDayPlan[] = [];

    // Distribute sorted topics across days
    for (let dayIdx = 1; dayIdx <= daysCount; dayIdx++) {
      const isLastDay = dayIdx === daysCount;
      const isPreExam = dayIdx === daysCount - 1 && daysCount > 2;

      let focusTitle = '';
      const tasks: RevisionDayPlan['tasks'] = [];

      if (isLastDay) {
        focusTitle = 'Final Formulae & Mind Map Review';
        tasks.push(
          {
            id: `task_d${dayIdx}_1`,
            topicId: 'all',
            topicTitle: 'High-Yield Formulae Rapid Memory Drill',
            actionType: 'Deep Dive Flashcards',
            sourceReference: 'Lecture Notes Summary Highlights',
            durationMinutes: Math.round(dailyMinutes * 0.4),
            completed: false,
            priority: 'High',
          },
          {
            id: `task_d${dayIdx}_2`,
            topicId: 'all',
            topicTitle: 'Full Course Concept Sanity Check',
            actionType: 'Review Notes',
            sourceReference: 'GapFinder Topic Map',
            durationMinutes: Math.round(dailyMinutes * 0.6),
            completed: false,
            priority: 'Medium',
          }
        );
      } else if (isPreExam) {
        focusTitle = 'Full Diagnostic Mock Re-Test';
        tasks.push(
          {
            id: `task_d${dayIdx}_1`,
            topicId: 'all',
            topicTitle: 'Timed Mock Diagnostic Assessment',
            actionType: 'Re-test Quiz',
            sourceReference: 'GapFinder Adaptive Quiz',
            durationMinutes: Math.round(dailyMinutes * 0.7),
            completed: false,
            priority: 'Urgent',
          },
          {
            id: `task_d${dayIdx}_2`,
            topicId: 'all',
            topicTitle: 'Review Any Persistent Diagnostic Gaps',
            actionType: 'Review Notes',
            sourceReference: 'Grounded Assistant Insights',
            durationMinutes: Math.round(dailyMinutes * 0.3),
            completed: false,
            priority: 'High',
          }
        );
      } else {
        // Select topic for today
        const topicIndex = (dayIdx - 1) % (sortedTopics.length || 1);
        const targetTopic = sortedTopics[topicIndex];

        if (targetTopic) {
          const isUrgent = targetTopic.status === 'weak' && targetTopic.examFrequency === 'High';
          focusTitle = `${isUrgent ? 'Urgent Gap' : 'Target Topic'}: ${targetTopic.title}`;

          tasks.push(
            {
              id: `task_d${dayIdx}_1`,
              topicId: targetTopic.id,
              topicTitle: `${targetTopic.title} - Grounded Notes Review`,
              actionType: 'Review Notes',
              sourceReference: targetTopic.citationSources[0]?.docName || 'Uploaded Course Material',
              durationMinutes: Math.round(dailyMinutes * 0.4),
              completed: false,
              priority: isUrgent ? 'Urgent' : 'High',
            },
            {
              id: `task_d${dayIdx}_2`,
              topicId: targetTopic.id,
              topicTitle: `Past Exam Questions Drill (${targetTopic.pastPaperQuestionsCount} past papers)`,
              actionType: 'Solve Past Paper Questions',
              sourceReference: 'University Past Question Papers',
              durationMinutes: Math.round(dailyMinutes * 0.35),
              completed: false,
              priority: isUrgent ? 'Urgent' : 'High',
            },
            {
              id: `task_d${dayIdx}_3`,
              topicId: targetTopic.id,
              topicTitle: `Diagnostic Mini-Quiz on ${targetTopic.title}`,
              actionType: 'Re-test Quiz',
              sourceReference: 'GapFinder Diagnostic Engine',
              durationMinutes: Math.round(dailyMinutes * 0.25),
              completed: false,
              priority: 'Medium',
            }
          );
        }
      }

      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() + (dayIdx - 1));
      const dateStr = dayIdx === 1 ? 'Today - Day 1' : dayIdx === 2 ? 'Tomorrow - Day 2' : `Day ${dayIdx} (${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;

      days.push({
        dayNumber: dayIdx,
        dateStr,
        focusTitle,
        estimatedMinutes: dailyMinutes,
        completed: false,
        tasks,
      });
    }

    const plan: RevisionPlan = {
      id: `plan_${Date.now()}`,
      createdAt: new Date().toISOString(),
      targetExamDate,
      daysRemaining: daysCount,
      dailyHoursAvailable: hoursPerDay,
      totalStudyHours: Math.round(daysCount * hoursPerDay * 10) / 10,
      days,
    };

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error: any) {
    console.error('Plan Generation API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate revision plan' },
      { status: 500 }
    );
  }
}
