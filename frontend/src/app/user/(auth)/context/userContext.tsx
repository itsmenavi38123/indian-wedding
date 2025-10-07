'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  userName: string;
  email: string;
  setUserName: (name: string) => void;
  setEmail: (email: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <UserContext.Provider value={{ userName, email, setUserName, setEmail }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
