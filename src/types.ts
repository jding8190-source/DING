export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  year: string;
  client?: string;
  overview: string;
  goals: string[];
  role: string;
  process: {
    title: string;
    description: string;
    imageUrl?: string;
  }[];
  outcomes: string[];
  learnings: string;
  embedUrl?: string;
}
