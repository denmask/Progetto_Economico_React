import React, { createContext, useReducer, useEffect } from 'react';

const FinancialContext = createContext();

export const ANNI = ['2022-23', '2023-24', '2024-25', '2025-26'];
export const ANNO_CORRENTE = '2025-26';

const defaultCE = {
  ricaviVendite: 0, variazioneProdotti: 0, variazioneWIP: 0,
  incrementoImmobilizzazioni: 0, altriRicavi: 0, contributiConto: 0,
  plusvalenzeAlienazioni: 0, canoniLocazione: 0, interessiAttivi: 0,
  dividendi: 0, proventiFinanziari: 0,
  acquistiMerci: 0, acquistMateriePrime: 0, variazioneRimanenzeMerci: 0,
  serviziEsterniAmm: 0, utenzeTel: 0, consulenze: 0, assicurazioni: 0,
  manutRiparazioni: 0, serviziMarketing: 0, godimentoBeniTerzi: 0,
  fittiBeni: 0, leasing: 0, salariStipendi: 0, oneriSociali: 0,
  tfr: 0, altriCostPersonale: 0, ammortImmMateriali: 0,
  ammortImmImmateriali: 0, svalutazioniCrediti: 0, altriAccantonamenti: 0,
  oneriDiversiGestione: 0, oneriInteressi: 0, oneriMutui: 0,
  oneriLeasing: 0, perditeValori: 0, rivalutazioni: 0, svalutazioni: 0,
  irap: 0, ires: 0, altreImposte: 0,
};

const defaultSP = {
  immMateriali: 0, immImmateriali: 0, immFinanziarie: 0, avviamento: 0,
  brevetti: 0, fabbricati: 0, impianti: 0, attrezzature: 0, macchinari: 0,
  autoveicoli: 0, partecipazioni: 0, creditiFinanzLungo: 0,
  cassa: 0, bancaCC: 0, altreDisponibilita: 0, creditiClienti: 0,
  creditiAltri: 0, creditiTributo: 0, creditiPrevidenziali: 0,
  rimanenzeMerci: 0, rimanenzeMP: 0, rimanenzeSemilavorati: 0,
  rimanenzeProdotti: 0, risconiAttivi: 0, rateiAttivi: 0, titoliQuotati: 0,
  capitaleSociale: 0, riservaLegale: 0, riserveStatutarie: 0,
  riserveStraodinarie: 0, utiliPrecedenti: 0, perditePrecedenti: 0,
  debitiBanche: 0, mutui: 0, debitiLeasing: 0, debitiFornitori: 0,
  debitiTributari: 0, debitiPrevidenziali: 0, debitiVsDipendenti: 0,
  altriDebitiBreve: 0, obbligazioni: 0, debitiLungo: 0,
  rateiPassivi: 0, riscontiPassivi: 0, fondoTFR: 0, fondoRischi: 0,
  fondoImposte: 0, fondoSvalutazione: 0,
};

const defaultPreventivo = {
  budget: 0,
  consuntivo: 0,
  categorie: [
    { id: 1, nome: 'Ricavi Vendite',       budget: 0, consuntivo: 0 },
    { id: 2, nome: 'Costi del Personale',  budget: 0, consuntivo: 0 },
    { id: 3, nome: 'Acquisti e Forniture', budget: 0, consuntivo: 0 },
    { id: 4, nome: 'Servizi Esterni',      budget: 0, consuntivo: 0 },
    { id: 5, nome: 'Ammortamenti',         budget: 0, consuntivo: 0 },
    { id: 6, nome: 'Oneri Finanziari',     budget: 0, consuntivo: 0 },
  ],
};

const buildDefaultState = () => {
  const anni = {};
  ANNI.forEach(a => {
    anni[a] = {
      contoEconomico:    { ...defaultCE },
      statoPatrimoniale: { ...defaultSP },
      preventivo:        {
        ...defaultPreventivo,
        categorie: defaultPreventivo.categorie.map(c => ({ ...c })),
      },
    };
  });
  return { anni, annoSelezionato: ANNO_CORRENTE };
};

const financialReducer = (state, action) => {
  const anno = action.anno || state.annoSelezionato;

  switch (action.type) {

    case 'SET_ANNO':
      return { ...state, annoSelezionato: action.anno };

    case 'UPDATE_CE':
      return {
        ...state,
        anni: {
          ...state.anni,
          [anno]: {
            ...state.anni[anno],
            contoEconomico: { ...state.anni[anno].contoEconomico, ...action.payload },
          },
        },
      };

    case 'UPDATE_SP':
      return {
        ...state,
        anni: {
          ...state.anni,
          [anno]: {
            ...state.anni[anno],
            statoPatrimoniale: { ...state.anni[anno].statoPatrimoniale, ...action.payload },
          },
        },
      };

    case 'UPDATE_PREV':
      return {
        ...state,
        anni: {
          ...state.anni,
          [anno]: {
            ...state.anni[anno],
            preventivo: { ...state.anni[anno].preventivo, ...action.payload },
          },
        },
      };

    case 'UPDATE_PREV_CATEGORIE':
      return {
        ...state,
        anni: {
          ...state.anni,
          [anno]: {
            ...state.anni[anno],
            preventivo: {
              ...state.anni[anno].preventivo,
              categorie: action.categorie,
            },
          },
        },
      };

    case 'RESET_CE':
      return {
        ...state,
        anni: {
          ...state.anni,
          [anno]: { ...state.anni[anno], contoEconomico: { ...defaultCE } },
        },
      };

    case 'RESET_SP':
      return {
        ...state,
        anni: {
          ...state.anni,
          [anno]: { ...state.anni[anno], statoPatrimoniale: { ...defaultSP } },
        },
      };

    case 'RESET_ALL':
      return buildDefaultState();

    default:
      return state;
  }
};

const migrateFromV2 = (saved) => {
  try {
    const parsed = JSON.parse(saved);
    if (!parsed.anni) {
      const stato = buildDefaultState();
      stato.anni[ANNO_CORRENTE] = {
        contoEconomico:    { ...defaultCE,        ...parsed.contoEconomico },
        statoPatrimoniale: { ...defaultSP,         ...parsed.statoPatrimoniale },
        preventivo:        { ...defaultPreventivo, ...parsed.preventivo },
      };
      return stato;
    }
    ANNI.forEach(a => {
      if (!parsed.anni[a]) {
        parsed.anni[a] = {
          contoEconomico:    { ...defaultCE },
          statoPatrimoniale: { ...defaultSP },
          preventivo: {
            ...defaultPreventivo,
            categorie: defaultPreventivo.categorie.map(c => ({ ...c })),
          },
        };
      } else if (!parsed.anni[a].preventivo?.categorie) {
        parsed.anni[a].preventivo = {
          ...defaultPreventivo,
          ...parsed.anni[a].preventivo,
          categorie: defaultPreventivo.categorie.map(c => ({ ...c })),
        };
      }
    });
    return parsed;
  } catch {
    return null;
  }
};

export const FinancialProvider = ({ children }) => {
  const [state, dispatch] = useReducer(financialReducer, null, () => {
    const saved = localStorage.getItem('findash_v3') || localStorage.getItem('findash_v2');
    if (saved) {
      const migrated = migrateFromV2(saved);
      if (migrated) return migrated;
    }
    return buildDefaultState();
  });

  useEffect(() => {
    localStorage.setItem('findash_v3', JSON.stringify(state));
  }, [state]);

  const annoData = state.anni[state.annoSelezionato];

  return (
    <FinancialContext.Provider value={{
      state: {
        ...annoData,
        annoSelezionato: state.annoSelezionato,
        anni: state.anni,
      },
      dispatch,
    }}>
      {children}
    </FinancialContext.Provider>
  );
};

export default FinancialContext;