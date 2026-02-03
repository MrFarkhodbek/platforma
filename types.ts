
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type AppLanguage = 'uz' | 'en' | 'ru';
export type AcademicLevel = 'bachelor' | 'master';

export interface SyllabusTopic {
  id: string;
  title: string;
  description: string;
  week: number;
}

export interface SyllabusSource {
  university: string;
  url: string;
  title: string;
}

export interface SyllabusResult {
  subject: string;
  difficulty: DifficultyLevel;
  topics: SyllabusTopic[];
  sources: SyllabusSource[];
}

export interface DetailedProblemStructure {
  title: string;
  problem: string;
  essence: string;
  scale: string;
  questions: string[];
  steps: string[];
  recommendations: string[];
}

export interface TestItem {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Lecture {
  id: string;
  topicId: string;
  title: string;
  htmlContent: string;
  educationalCases: DetailedProblemStructure[];
  kazus: DetailedProblemStructure[];
  questions: string[];
  tests: TestItem[];
  glossary: { term: string; definition: string }[];
  version: number;
  lastSaved: string;
  academicLevel: AcademicLevel;
}

export interface GeneratedContent {
  lectureNote: string;
  educationalCases: DetailedProblemStructure[];
  kazus: DetailedProblemStructure[];
  questions: string[];
  tests: TestItem[];
  glossary: { term: string; definition: string }[];
}

export type ViewState = 'dashboard' | 'create-syllabus' | 'view-syllabus' | 'generating-content' | 'content-viewer' | 'lecture-editor';
