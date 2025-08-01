export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  content: ResumeContent;
  template: 'modern' | 'minimalist' | 'creative';
  created_at: string;
  updated_at: string;
}

export interface ResumeContent {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  duration: string;
  achievements: string[];
}

export interface Education {
  degree: string;
  school: string;
  location: string;
  year: string;
}

export interface JobDescription {
  title: string;
  company?: string;
  description: string;
  requirements?: string[];
}