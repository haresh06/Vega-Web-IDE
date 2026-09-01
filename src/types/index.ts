// ===== SHARED TYPES =====

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar?: string;
  streak: number;
  totalPoints: number;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface LearningPath {
  id: string;
  name: string;
  order: number;
  description: string;
  modules: Module[];
  progress?: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  category: 'protocol' | 'sensor' | 'peripheral' | 'fundamentals';
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
  points: number;
  estimatedTime: number;
  learningPathId: string;
  videoUrl?: string;
  videoTitle?: string;
  lessons: Lesson[];
  experiments?: Experiment[];
  quizzes?: Quiz[];
  challenges?: Challenge[];
  progress?: number;
  completed?: boolean;
  locked?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  moduleId: string;
  videoUrl?: string;
  videoTitle?: string;
  completed?: boolean;
  type?: 'concept' | 'hardware' | 'configuration' | 'code' | 'experiment';
}

export interface Experiment {
  id: string;
  title: string;
  objective: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMin: number;
  hardware: string[];
  steps: ExperimentStep[];
  starterCode?: string;
  moduleId: string;
  completed?: boolean;
}

export interface ExperimentStep {
  order: number;
  title: string;
  description: string;
  completed?: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  moduleId: string;
  questions: Question[];
}

export interface Question {
  id: string;
  type: 'mcq' | 'truefalse' | 'code_output' | 'debug' | 'hardware';
  question: string;
  options: string[];
  correctAns: string;
  explanation: string;
  points: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  requirements: string[];
  hints: string[];
  starterCode: string;
  testCases: TestCase[];
  moduleId: string;
  completed?: boolean;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description: string;
  passed?: boolean;
}

export interface Project {
  id: string;
  name: string;
  board: string;
  language: string;
  files: ProjectFile[];
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

export interface BuildResult {
  id: string;
  status: 'pending' | 'building' | 'success' | 'failed';
  log: string[];
  firmwareSize?: number;
  maxSize: number;
  firmwareFile?: string;
  duration?: number;
  errors?: BuildError[];
}

export interface BuildError {
  file: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface FirmwareInfo {
  id: string;
  version: string;
  buildNum: number;
  size: number;
  checksum: string;
  board: string;
  createdAt: string;
}

export interface FlashSession {
  id: string;
  status: 'idle' | 'connecting' | 'detecting' | 'bootloader' | 'flashing' | 'verifying' | 'success' | 'failed';
  mode: 'real' | 'simulation';
  progress: number;
  currentPacket: number;
  totalPackets: number;
  log: FlashLogEntry[];
  firmware: FirmwareInfo;
}

export interface FlashLogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export interface DeviceInfo {
  id: string;
  name: string;
  board: string;
  connected: boolean;
  serial?: string;
  firmware?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
  criteria: string;
}

export interface ProgressData {
  lessonsCompleted: number;
  totalLessons: number;
  experimentsCompleted: number;
  totalExperiments: number;
  quizzesCompleted: number;
  totalQuizzes: number;
  averageQuizScore: number;
  challengesCompleted: number;
  totalChallenges: number;
  codingScore: number;
  level: string;
  totalPoints: number;
  badges: Badge[];
  streak: number;
  beginnerProgress: number;
  intermediateProgress: number;
  advancedProgress: number;
}

export interface BoardProfile {
  id: string;
  name: string;
  processor: string;
  architecture: string;
  clockSpeed: string;
  sram: string;
  flash: string;
  peripherals: BoardPeripheral[];
  pinout: PinInfo[];
}

export interface BoardPeripheral {
  name: string;
  type: string;
  count: number;
  description: string;
  moduleId?: string;
}

export interface PinInfo {
  pin: number;
  name: string;
  functions: string[];
  x: number;
  y: number;
}

export interface SerialMessage {
  timestamp: string;
  data: string;
  type: 'rx' | 'tx';
}

export interface TroubleshootGuide {
  id: string;
  title: string;
  category: string;
  symptoms: string[];
  solutions: TroubleshootStep[];
}

export interface TroubleshootStep {
  order: number;
  instruction: string;
  detail?: string;
}
