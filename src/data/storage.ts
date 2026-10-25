// NOTE: This is a browser-only simulation for educational purposes.
// No real security – passwords stored in plain text in localStorage.
import { User, ShelfEntry, Review } from './types';

const KEYS = {
  users: 'verity.users',
  session: 'verity.session',
  shelf: 'verity.shelf',
  reviews: 'verity.reviews',
} as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked – silently ignore
  }
}

// ── Users ────────────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  return readJSON<User[]>(KEYS.users) ?? [];
}

export function saveUsers(users: User[]): void {
  writeJSON(KEYS.users, users);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function createUser(data: Omit<User, 'id' | 'joinedAt' | 'yearlyGoal'>): User {
  const users = getUsers();
  const user: User = {
    id: `user-${Date.now()}`,
    joinedAt: new Date().toISOString(),
    yearlyGoal: 12,
    ...data,
  };
  saveUsers([...users, user]);
  return user;
}

export function updateUser(updated: User): void {
  const users = getUsers().map((u) => (u.id === updated.id ? updated : u));
  saveUsers(users);
}

// ── Session ──────────────────────────────────────────────────────────────────

export function getSession(): string | null {
  return readJSON<string>(KEYS.session);
}

export function setSession(userId: string): void {
  writeJSON(KEYS.session, userId);
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEYS.session);
  } catch {
    // ignore
  }
}

export function getCurrentUser(): User | undefined {
  const id = getSession();
  return id ? getUserById(id) : undefined;
}

// ── Shelf ────────────────────────────────────────────────────────────────────

export function getAllShelfEntries(): ShelfEntry[] {
  return readJSON<ShelfEntry[]>(KEYS.shelf) ?? [];
}

export function getUserShelf(userId: string): ShelfEntry[] {
  return getAllShelfEntries().filter((e) => e.userId === userId);
}

export function getShelfEntry(userId: string, bookId: string): ShelfEntry | undefined {
  return getAllShelfEntries().find((e) => e.userId === userId && e.bookId === bookId);
}

export function saveShelfEntry(entry: ShelfEntry): void {
  const all = getAllShelfEntries().filter(
    (e) => !(e.userId === entry.userId && e.bookId === entry.bookId)
  );
  writeJSON(KEYS.shelf, [...all, entry]);
}

export function removeShelfEntry(userId: string, bookId: string): void {
  const all = getAllShelfEntries().filter(
    (e) => !(e.userId === userId && e.bookId === bookId)
  );
  writeJSON(KEYS.shelf, all);
}

// ── Reviews ──────────────────────────────────────────────────────────────────

export function getAllReviews(): Review[] {
  return readJSON<Review[]>(KEYS.reviews) ?? [];
}

export function getBookReviews(bookId: string): Review[] {
  return getAllReviews()
    .filter((r) => r.bookId === bookId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUserReviewForBook(userId: string, bookId: string): Review | undefined {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return undefined;
  return getAllReviews().find((r) => r.bookId === bookId && r.userName === user.name);
}

export function saveReview(review: Review): void {
  const all = getAllReviews().filter((r) => r.id !== review.id);
  writeJSON(KEYS.reviews, [...all, review]);
}

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_USER_ID = 'demo-an-nguyen';

export function initializeDemoData(): void {
  const users = getUsers();
  const alreadyExists = users.some((u) => u.id === DEMO_USER_ID);

  if (!alreadyExists) {
    const demoUser: User = {
      id: DEMO_USER_ID,
      name: 'An Nguyễn',
      email: 'an@verity.demo',
      password: 'demo123',
      joinedAt: '2025-03-01T00:00:00.000Z',
      yearlyGoal: 30,
    };
    saveUsers([...users, demoUser]);

    const now = new Date();
    const thisYear = now.getFullYear();

    const demoShelf: ShelfEntry[] = [
      // Đã đọc – 18 cuốn trong năm hiện tại
      { userId: DEMO_USER_ID, bookId: 'cay-cam-ngot-cua-toi', status: 'read', addedAt: `${thisYear}-01-10T10:00:00.000Z`, finishedAt: `${thisYear}-01-15T10:00:00.000Z` },
      { userId: DEMO_USER_ID, bookId: 'hoang-tu-be', status: 'read', addedAt: `${thisYear}-01-20T10:00:00.000Z`, finishedAt: `${thisYear}-01-25T10:00:00.000Z` },
      { userId: DEMO_USER_ID, bookId: 'nhung-nguoi-khon-kho', status: 'read', addedAt: `${thisYear}-02-01T10:00:00.000Z`, finishedAt: `${thisYear}-02-20T10:00:00.000Z` },
      { userId: DEMO_USER_ID, bookId: 'lao-dai-thanh-pho', status: 'read', addedAt: `${thisYear}-02-25T10:00:00.000Z`, finishedAt: `${thisYear}-03-05T10:00:00.000Z` },
      { userId: DEMO_USER_ID, bookId: 'dac-nhan-tam', status: 'read', addedAt: `${thisYear}-03-10T10:00:00.000Z`, finishedAt: `${thisYear}-03-20T10:00:00.000Z` },
      { userId: DEMO_USER_ID, bookId: 'mat-biec', status: 'read', addedAt: `${thisYear}-03-25T10:00:00.000Z`, finishedAt: `${thisYear}-04-05T10:00:00.000Z` },
      { userId: DEMO_USER_ID, bookId: 'to-kill-a-mockingbird', status: 'read', addedAt: `${thisYear}-04-10T10:00:00.000Z`, finishedAt: `${thisYear}-04-25T10:00:00.000Z` },
      { userId: DEMO_USER_ID, bookId: 'tinh-yeu-thoi-ta-loan', status: 'read', addedAt: `${thisYear}-05-01T10:00:00.000Z`, finishedAt: `${thisYear}-05-15T10:00:00.000Z` },
      // Đang đọc – 4 cuốn
      { userId: DEMO_USER_ID, bookId: 'rung-na-uy', status: 'reading', addedAt: `${thisYear}-05-20T10:00:00.000Z` },
      { userId: DEMO_USER_ID, bookId: 'buoc-cham-lai-giua-the-gian-voi-va', status: 'reading', addedAt: `${thisYear}-06-01T10:00:00.000Z` },
      // Muốn đọc – 12 cuốn
      { userId: DEMO_USER_ID, bookId: 'thuong-nho-nhung-nguoi-tinh-cu', status: 'want', addedAt: `${thisYear}-06-10T10:00:00.000Z` },
    ];

    const allShelf = getAllShelfEntries();
    writeJSON(KEYS.shelf, [...allShelf, ...demoShelf]);
  }
}

export function loginWithDemo(): User {
  const user = getUserById(DEMO_USER_ID);
  if (user) {
    setSession(DEMO_USER_ID);
    return user;
  }
  // create if somehow missing
  initializeDemoData();
  const u = getUserById(DEMO_USER_ID)!;
  setSession(DEMO_USER_ID);
  return u;
}

export function resetDemoData(): void {
  try {
    // Remove demo user and their data
    const users = getUsers().filter((u) => u.id !== DEMO_USER_ID);
    saveUsers(users);

    const shelf = getAllShelfEntries().filter((e) => e.userId !== DEMO_USER_ID);
    writeJSON(KEYS.shelf, shelf);

    clearSession();
  } catch {
    // ignore
  }
  initializeDemoData();
}
