export type ClassOption = {
  id: string;
  name: string;
};

export type SectionOption = {
  id: string;
  name: string;
};

export type SessionOption = {
  id: string;
  name: string;
};

export interface AcademicData {
  sessionId: string;
  studentClass: string;
  section: string;
  date: string;
}
