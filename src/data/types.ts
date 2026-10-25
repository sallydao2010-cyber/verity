export type Genre = "Văn học" | "Tâm lý" | "Kinh điển" | "Lãng mạn";
export type ShelfStatus = "read" | "reading" | "want";
export type Gradient = "amber" | "navy" | "sage" | "peach";

export interface Book {
  id: string;
  title: string;
  author: string;
  genres: Genre[];
  subtype?: string;
  pages: number;
  description: string;
  gradient: Gradient;
  popularity: number;
  trending: boolean;
  baseRating: number;
  baseRatingCount: number;
  baseReviewCount: number;
  moodTags: string[];
  quotes: string[];
}

export interface Review {
  id: string;
  bookId: string;
  userName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // NOTE: Simulation only – not real security
  joinedAt: string;
  yearlyGoal: number;
}

export interface ShelfEntry {
  userId: string;
  bookId: string;
  status: ShelfStatus;
  addedAt: string;
  finishedAt?: string;
}
