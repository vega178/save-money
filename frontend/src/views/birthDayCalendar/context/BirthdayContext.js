import React, { createContext, useContext, useReducer } from 'react';
import birthdayReducer, { initialState } from './birthdayReducer';

const BirthdayContext = createContext(null);

export const BirthdayProvider = ({ children }) => {
  const [state, dispatch] = useReducer(birthdayReducer, initialState);
  return (
    <BirthdayContext.Provider value={{ state, dispatch }}>
      {children}
    </BirthdayContext.Provider>
  );
};

export const useBirthdayContext = () => {
  const ctx = useContext(BirthdayContext);
  if (!ctx) throw new Error('useBirthdayContext must be used inside BirthdayProvider');
  return ctx;
};