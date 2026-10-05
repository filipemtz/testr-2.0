import { computed, Injectable, signal } from '@angular/core';

export type Role = 'student' | 'professor';
export type ActivityType = 'video' | 'reading' | 'quiz' | 'assignment';

export interface Activity { id: string; title: string; type: ActivityType; minutes: number; }
export interface Section { id: string; title: string; activities: Activity[]; }
export interface Course {
  id: string;
  title: string;
  description: string;
  program: string;   // undergraduate course, e.g. "Computer Science" ('' when not set)
  semester: string;  // e.g. "2026/2" ('' when not set)
  sections: Section[];
}
export type CourseData = Omit<Course, 'id' | 'sections'>;

const uid = () => crypto.randomUUID().slice(0, 8);

const SEED: Course[] = [
  {
    id: 'c1', program: 'Computer Science', semester: '2026/2',
    title: 'Databases Fundamentals',
    description: 'Relational model, SQL and normalization from scratch.',
    sections: [
      { id: 's1', title: '1. Relational Model', activities: [
        { id: 'a1', title: 'Welcome to the course', type: 'video', minutes: 8 },
        { id: 'a2', title: 'Tables, keys and relations', type: 'reading', minutes: 20 },
        { id: 'a3', title: 'Quiz: Relational concepts', type: 'quiz', minutes: 10 } ] },
      { id: 's2', title: '2. SQL Basics', activities: [
        { id: 'a4', title: 'SELECT, WHERE and ORDER BY', type: 'video', minutes: 15 },
        { id: 'a5', title: 'Practice: Joins', type: 'assignment', minutes: 45 } ] },
    ],
  },
  {
    id: 'c2', program: 'Statistics', semester: '2026/2',
    title: 'Data Structures in Python',
    description: 'Lists, stacks, queues, trees and complexity analysis.',
    sections: [
      { id: 's3', title: '1. Linear Structures', activities: [
        { id: 'a6', title: 'Lists and linked lists', type: 'video', minutes: 18 },
        { id: 'a7', title: 'Implement a stack', type: 'assignment', minutes: 40 } ] },
      { id: 's4', title: '2. Trees', activities: [
        { id: 'a8', title: 'Binary search trees', type: 'reading', minutes: 25 } ] },
    ],
  },
];

/**
 * In-memory store (signals). Swap the bodies for HttpClient calls when integrating with the
 * real backend; the public API used by the components can stay the same.
 */
@Injectable({ providedIn: 'root' })
export class MoocStore {
  /** Prototype only: in the real site derive the role from your auth/session. */
  readonly role = signal<Role>('student');
  readonly isProfessor = computed(() => this.role() === 'professor');

  readonly courses = signal<Course[]>(SEED);
  private readonly completed = signal<ReadonlySet<string>>(new Set(['a1', 'a2', 'a4']));

  // ---- student progress -------------------------------------------------
  isDone(activityId: string): boolean { return this.completed().has(activityId); }

  toggleDone(activityId: string): void {
    this.completed.update(set => {
      const next = new Set(set);
      next.has(activityId) ? next.delete(activityId) : next.add(activityId);
      return next;
    });
  }

  /** Percentage (0-100) of the course's activities completed by the current student. */
  progress(course: Course): number {
    const all = course.sections.flatMap(s => s.activities);
    if (!all.length) return 0;
    return Math.round((all.filter(a => this.completed().has(a.id)).length / all.length) * 100);
  }

  // ---- professor edits ----------------------------------------------------
  addCourse(data: CourseData) { this.courses.update(l => [...l, { ...data, id: uid(), sections: [] }]); }
  updateCourse(id: string, patch: Partial<CourseData>) { this.patchCourse(id, c => ({ ...c, ...patch })); }
  removeCourse(id: string) { this.courses.update(l => l.filter(c => c.id !== id)); }

  addSection(courseId: string, title: string) {
    this.patchCourse(courseId, c => ({ ...c, sections: [...c.sections, { id: uid(), title, activities: [] }] }));
  }
  renameSection(courseId: string, sectionId: string, title: string) {
    this.patchSection(courseId, sectionId, s => ({ ...s, title }));
  }
  removeSection(courseId: string, sectionId: string) {
    this.patchCourse(courseId, c => ({ ...c, sections: c.sections.filter(s => s.id !== sectionId) }));
  }

  addActivity(courseId: string, sectionId: string, data: Omit<Activity, 'id'>) {
    this.patchSection(courseId, sectionId, s => ({ ...s, activities: [...s.activities, { ...data, id: uid() }] }));
  }
  updateActivity(courseId: string, sectionId: string, activityId: string, patch: Partial<Omit<Activity, 'id'>>) {
    this.patchSection(courseId, sectionId, s => ({
      ...s, activities: s.activities.map(a => (a.id === activityId ? { ...a, ...patch } : a)),
    }));
  }
  removeActivity(courseId: string, sectionId: string, activityId: string) {
    this.patchSection(courseId, sectionId, s => ({ ...s, activities: s.activities.filter(a => a.id !== activityId) }));
  }

  private patchCourse(id: string, fn: (c: Course) => Course) {
    this.courses.update(l => l.map(c => (c.id === id ? fn(c) : c)));
  }
  private patchSection(courseId: string, sectionId: string, fn: (s: Section) => Section) {
    this.patchCourse(courseId, c => ({ ...c, sections: c.sections.map(s => (s.id === sectionId ? fn(s) : s)) }));
  }
}
