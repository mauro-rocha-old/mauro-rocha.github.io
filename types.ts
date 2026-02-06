export type Language = 'pt-BR' | 'en';

export interface LocalizedString {
  'pt-BR': string;
  'en': string;
}

export interface Service {
  id: number;
  title: LocalizedString;
  description: LocalizedString;
}

export interface Project {
  id: number;
  title: string;
  category: LocalizedString;
  year: string;
  description: LocalizedString;
  fullDescription: LocalizedString;
  image: string;
  gallery?: string[];
  link: string;
  client?: string;
  stack?: string[];
}

export interface SiteContent {
  hero: {
    role: LocalizedString;
    title: LocalizedString;
    subtitle: LocalizedString;
    cta: LocalizedString;
  };
  about: {
    title: LocalizedString;
    p1: LocalizedString;
    p2: LocalizedString;
    skillsTitle: LocalizedString;
    profileImage: string;
  };
  contact: {
    title: LocalizedString;
    email: string;
    footerText: LocalizedString;
  };
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  isTyping?: boolean;
}