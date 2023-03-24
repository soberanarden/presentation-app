export interface Question {
  hash?: string;
  question: string;
  answer: string;
  type: QuestionType;
  partialPoints: number;
  maxPoints: number;
  imageUrl?: string;
  done?: boolean;
}

export enum QuestionType {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  VERY_HARD = 'VERY_HARD',
  FRENZY = 'FRENZY',
}

export enum QuestionTypeColor {
  EASY = '22C707',
  MEDIUM = 'C2C707',
  HARD = 'C75907',
  VERY_HARD = 'C70707',
  FRENZY = 'C507C7',
}

export const QuestionTypeKeys = [
  { value: QuestionType.EASY, key: 'easy' },
  { value: QuestionType.MEDIUM, key: 'medium' },
  { value: QuestionType.HARD, key: 'hard' },
  { value: QuestionType.VERY_HARD, key: 'veryHard' },
  { value: QuestionType.FRENZY, key: 'frenzy' },
];

export interface SlidesData extends SlideCategories {
  welcome: WelcomeSlide;
  intermission: IntermissionSlide;
}

export interface IntermissionSlide {
  title: string;
  pictureUrl: string;
}

export interface WelcomeSlide {
  title: string;
  subTitle: string;
}

export interface SlideCategories {
  easy: Question[];
  medium: Question[];
  hard: Question[];
  veryHard: Question[];
  frenzy: Question[];
}
