import React, { createContext, useReducer, useEffect } from 'react';

const FinancialContext = createContext();

const defaultState = {
  contoEconomico: {
    ricaviVendite: 0,
    variazioneProdotti: 0,
    variazioneWIP: 0,
    incrementoImmobilizzazioni: 0,
    altriRicavi: 0,
    contributiConto: 0,
    plusvalenzeAlienazioni: 0,
    canoniLocazione: 0,
    interessiAttivi: 0,
    dividendi: 0,
    proventiFinanziari: 0,

    acquistiMerci: 0,
    acquistMateriePrime: 0,
    variazioneRimanenzeMerci: 0,
    serviziEsterniAmm: 0,
    utenzeTel: 0,
    consulenze: 0,
    assicurazioni: 0,
    manutRiparazioni: 0,
    serviziMarketing: 0,
    godimentoBeniTerzi: 0,
    fittiBeni: 0,
    leasing: 0,
    salariStipendi: 0,
    oneriSociali: 0,
    tfr: 0,
    altriCostPersonale: 0,
    ammortImmMateriali: 0,
    ammortImmImmateriali: 0,
    svalutazioniCrediti: 0,
    altriAccantonamenti: 0,
    oneriDiversiGestione: 0,

    oneriInteressi: 0,
    oneriMutui: 0,
    oneriLeasing: 0,
    perditeValori: 0,
    rivalutazioni: 0,
    svalutazioni: 0,

    irap: 0,
    ires: 0,
    altreImposte: 0,
  },
  statoPatrimoniale: {
    immMateriali: 0,
    immImmateriali: 0,
    immFinanziarie: 0,
    avviamento: 0,
    brevetti: 0,
    fabbricati: 0,
    impianti: 0,
    attrezzature: 0,
    macchinari: 0,
    autoveicoli: 0,
    partecipazioni: 0,
    creditiFinanzLungo: 0,

    cassa: 0,
    bancaCC: 0,
    altreDisponibilita: 0,
    creditiClienti: 0,
    creditiAltri: 0,
    creditiTributo: 0,
    creditiPrevidenziali: 0,
    rimanenzeMerci: 0,
    rimanenzeMP: 0,
    rimanenzeSemilavorati: 0,
    rimanenzeProdotti: 0,
    risconiAttivi: 0,
    rateiAttivi: 0,
    titoliQuotati: 0,

    capitaleSociale: 0,
    riservaLegale: 0,
    riserveStatutarie: 0,
    riserveStraodinarie: 0,
    utiliPrecedenti: 0,
    perditePrecedenti: 0,

    debitiBanche: 0,
    mutui: 0,
    debitiLeasing: 0,
    debitiFornitori: 0,
    debitiTributari: 0,
    debitiPrevidenziali: 0,
    debitiVsDipendenti: 0,
    altriDebitiBreve: 0,
    obbligazioni: 0,
    debitiLungo: 0,
    rateiPassivi: 0,
    riscontiPassivi: 0,

    fondoTFR: 0,
    fondoRischi: 0,
    fondoImposte: 0,
    fondoSvalutazione: 0,
  },
  preventivo: {
    budget: 0,
    consuntivo: 0,
  },
};

const financialReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_CE':
      return { ...state, contoEconomico: { ...state.contoEconomico, ...action.payload } };
    case 'UPDATE_SP':
      return { ...state, statoPatrimoniale: { ...state.statoPatrimoniale, ...action.payload } };
    case 'UPDATE_PREV':
      return { ...state, preventivo: { ...state.preventivo, ...action.payload } };
    case 'RESET_CE':
      return { ...state, contoEconomico: { ...defaultState.contoEconomico } };
    case 'RESET_SP':
      return { ...state, statoPatrimoniale: { ...defaultState.statoPatrimoniale } };
    case 'RESET_ALL':
      return { ...defaultState };
    default:
      return state;
  }
};

export const FinancialProvider = ({ children }) => {
  const [state, dispatch] = useReducer(financialReducer, defaultState, () => {
    try {
      const saved = localStorage.getItem('findash_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          contoEconomico: { ...defaultState.contoEconomico, ...parsed.contoEconomico },
          statoPatrimoniale: { ...defaultState.statoPatrimoniale, ...parsed.statoPatrimoniale },
          preventivo: { ...defaultState.preventivo, ...parsed.preventivo },
        };
      }
    } catch {}
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem('findash_v2', JSON.stringify(state));
  }, [state]);

  return (
    <FinancialContext.Provider value={{ state, dispatch }}>
      {children}
    </FinancialContext.Provider>
  );
};

export default FinancialContext;