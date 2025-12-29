import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CurrentTaskContextType {
  unitTitle: string | null;
  taskQuestion: string | null;
  setCurrentTask: (unitTitle: string | null, taskQuestion: string | null) => void;
}

const CurrentTaskContext = createContext<CurrentTaskContextType | undefined>(undefined);

export const CurrentTaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [unitTitle, setUnitTitle] = useState<string | null>(null);
  const [taskQuestion, setTaskQuestion] = useState<string | null>(null);

  const setCurrentTask = (newUnitTitle: string | null, newTaskQuestion: string | null) => {
    setUnitTitle(newUnitTitle);
    setTaskQuestion(newTaskQuestion);
  };

  return (
    <CurrentTaskContext.Provider value={{ unitTitle, taskQuestion, setCurrentTask }}>
      {children}
    </CurrentTaskContext.Provider>
  );
};

export const useCurrentTask = () => {
  const context = useContext(CurrentTaskContext);
  if (context === undefined) {
    throw new Error('useCurrentTask must be used within a CurrentTaskProvider');
  }
  return context;
};

