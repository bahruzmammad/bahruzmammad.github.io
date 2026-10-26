export interface BlogPost {
  title: string;
  description: string;
  date: string;
  slug: string;
  tags: string[];
  readingTimeMinutes: number;
  markdown: string;
}

export interface Repository {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  homepage: string | null;
  html_url: string;
  visibility?: string;
  private?: boolean;
}

export interface EducationItem {
  image: string;
  name: string;
  program: string;
  period: string;
  description: string;
  url?: string;
  badge?: string;
  tech: string[];
}
