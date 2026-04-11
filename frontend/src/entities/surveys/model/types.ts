export type SurveyTarget = 'MENTOR' | 'INTERN';

export type SurveyQuestion = {
  id: string;
  title: string;
  order: number;
};

export type SurveyListItem = {
  id: string;
  title: string;
  target: SurveyTarget;
  createdAt: string;
  questionCount: number;
  responseCount: number;
};

export type MySurvey = {
  id: string;
  title: string;
  target: SurveyTarget;
  questions: SurveyQuestion[];
  isCompleted: boolean;
  createdAt: string;
};

export type SurveyAnswerView = {
  questionId: string;
  questionTitle: string;
  score?: number | null;
  comment?: string | null;
};

export type SurveyRespondent = {
  id: string;
  fullName: string;
  email: string;
};

export type SurveyResponseView = {
  id: string;
  respondent: SurveyRespondent;
  comment?: string | null;
  mentorName?: string | null;
  answers: SurveyAnswerView[];
  createdAt: string;
};

export type CreateSurveyPayload = {
  title: string;
  target: SurveyTarget;
  questions?: { title: string; order: number }[];
};

export type SurveyAnswerInput = {
  questionId: string;
  score: number;
  comment?: string;
};

export type SubmitSurveyPayload = {
  answers?: SurveyAnswerInput[];
  comment?: string;
};
