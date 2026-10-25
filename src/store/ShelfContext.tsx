import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { ShelfEntry, ShelfStatus } from '../data/types';
import {
  getUserShelf,
  getShelfEntry,
  saveShelfEntry,
  removeShelfEntry,
} from '../data/storage';
import { useAuth } from './AuthContext';

interface ShelfContextType {
  shelf: ShelfEntry[];
  getEntry: (bookId: string) => ShelfEntry | undefined;
  addToShelf: (bookId: string, status: ShelfStatus) => void;
  changeStatus: (bookId: string, status: ShelfStatus) => void;
  removeFromShelf: (bookId: string) => void;
  refresh: () => void;
}

const ShelfContext = createContext<ShelfContextType | null>(null);

export function ShelfProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [shelf, setShelf] = useState<ShelfEntry[]>([]);

  const refresh = useCallback(() => {
    if (user) {
      setShelf(getUserShelf(user.id));
    } else {
      setShelf([]);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getEntry = useCallback(
    (bookId: string) => {
      if (!user) return undefined;
      return getShelfEntry(user.id, bookId);
    },
    [user]
  );

  const addToShelf = useCallback(
    (bookId: string, status: ShelfStatus) => {
      if (!user) return;
      const entry: ShelfEntry = {
        userId: user.id,
        bookId,
        status,
        addedAt: new Date().toISOString(),
        finishedAt: status === 'read' ? new Date().toISOString() : undefined,
      };
      saveShelfEntry(entry);
      refresh();
    },
    [user, refresh]
  );

  const changeStatus = useCallback(
    (bookId: string, status: ShelfStatus) => {
      if (!user) return;
      const existing = getShelfEntry(user.id, bookId);
      const entry: ShelfEntry = {
        userId: user.id,
        bookId,
        status,
        addedAt: existing?.addedAt ?? new Date().toISOString(),
        finishedAt:
          status === 'read'
            ? new Date().toISOString()
            : status === 'reading'
            ? undefined
            : existing?.finishedAt,
      };
      saveShelfEntry(entry);
      refresh();
    },
    [user, refresh]
  );

  const removeFromShelf = useCallback(
    (bookId: string) => {
      if (!user) return;
      removeShelfEntry(user.id, bookId);
      refresh();
    },
    [user, refresh]
  );

  return (
    <ShelfContext.Provider value={{ shelf, getEntry, addToShelf, changeStatus, removeFromShelf, refresh }}>
      {children}
    </ShelfContext.Provider>
  );
}

export function useShelf() {
  const ctx = useContext(ShelfContext);
  if (!ctx) throw new Error('useShelf must be used within ShelfProvider');
  return ctx;
}
