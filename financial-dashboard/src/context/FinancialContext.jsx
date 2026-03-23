import React, { createContext, useReducer, useEffect } from 'react';

const FinancialContext = createContext();

const financialReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const FinancialProvider = ({ children }) => {
  const [state, dispatch] = useReducer(financialReducer, {}, () => {
    const localData = localStorage.getItem('financialData');
    return localData ? JSON.parse(localData) : {
      contoEconomico: { ricavi: 0, costi: 0, ammortamenti: 0 },
      statoPatrimoniale: { attivo: 0, passivo: 0, patrimonio: 0 },
      preventivo: { budget: 0, consuntivo: 0 }
    };
  });

  useEffect(() => {
    localStorage.setItem('financialData', JSON.stringify(state));
  }, [state]);

  return (
    <FinancialContext.Provider value={{ state, dispatch }}>
      {children}
    </FinancialContext.Provider>
  );
};

export default FinancialContext;