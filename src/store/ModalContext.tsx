import React, { createContext, useContext, useState, useCallback } from 'react';

type ModalType = 'login' | 'register' | null;

interface ModalContextType {
  modal: ModalType;
  pendingAction: (() => void) | null;
  openLogin: (onSuccess?: () => void) => void;
  openRegister: () => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalType>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const openLogin = useCallback((onSuccess?: () => void) => {
    setModal('login');
    if (onSuccess) setPendingAction(() => onSuccess);
  }, []);

  const openRegister = useCallback(() => {
    setModal('register');
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    setPendingAction(null);
  }, []);

  return (
    <ModalContext.Provider value={{ modal, pendingAction, openLogin, openRegister, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}
