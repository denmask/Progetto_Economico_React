import React, { createContext, useReducer, useEffect } from 'react';

const FinancialContext = createContext();

const financialReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_CE':
      return { ...state, contoEconomico: { ...state.contoEconomico, ...action.payload } };
    case 'UPDATE_SP':
      return { ...state, statoPatrimoniale: { ...state.statoPatrimoniale, ...action.payload } };
    default:
      return state;
  }
};

export const FinancialProvider = ({ children }) => {
  const [state, dispatch] = useReducer(financialReducer, {}, () => {
    const localData = localStorage.getItem('fin_data');
    return localData ? JSON.parse(localData) : {
      contoEconomico: {
        ricaviVendita: 0, canoniLocazione: 0, interessiAttivi: 0, rimanenzeFinali: 0, plusvalenze: 0,
        acquistiMerci: 0, personale: 0, ammortamenti: 0, serviziTecnici: 0, oneriFinanziari: 0, imposte: 0
      },
      statoPatrimoniale: {
        cassa: 0, creditiComm: 0, rimanenze: 0, immobilizzazioni: 0,
        debitiBreve: 0, debitiLungo: 0, fondoTFR: 0, capitaleSociale: 0, riserve: 0
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('fin_data', JSON.stringify(state));
  }, [state]);

  return (
    <FinancialContext.Provider value={{ state, dispatch }}>
      {children}
    </FinancialContext.Provider>
  );
};

export default FinancialContext;