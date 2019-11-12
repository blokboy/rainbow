import produce from 'immer';
import {
    getAccountLocal,
    getGlobal,
    removeAccountLocal,
    saveAccountLocal,
    saveGlobal
} from '../handlers/localstorage/common';
import { contractUtils } from '../utils';

// -- Constants -------------------------------------------------------
const MAKER_LOAD_REQUEST = 'makerCDPInfo/MAKER_LOAD_REQUEST';
const MAKER_LOAD_SUCCESS = 'makerCDPInfo/MAKER_LOAD_SUCCESS';
const MAKER_LOAD_FAILURE = 'makerCDPInfo/MAKER_LOAD_FAILURE';

const MAKER_UPDATE_REQUEST = 'makerCDPInfo/MAKER_UPDATE_REQUEST';
const MAKER_UPDATE_SUCCESS = 'makerCDPInfo/MAKER_UPDATE_SUCCESS';
const MAKER_UPDATE_FAILURE = 'makerCDPInfo/MAKER_UPDATE_FAILURE';

const MAKER_ASSET_REQUEST = 'makerCDPInfo/MAKER_ASSET_REQUEST';
const MAKER_ASSET_SUCCESS = 'makerCDPInfo/MAKER_ASSET_SUCCESS';
const MAKER_ASSET_FAILURE = 'makerCDPInfo/MAKER_ASSET_FAILURE';

// Localstorage keys
export const CDPIDS = 'makercdps';
export const CDP_INFO = 'makerliquidity';

// -- Actions ----------------------------------------------------------
export const makerLoadState = () => async (dispatch, getState) => {
  const { accountAddress, network } = getState().settings;
  dispatch({ type: MAKER_LOAD_REQUEST });
  try {
    const makerCDPInfo = await getAccountLocal(
        CDP_INFO,
        accountAddress,
        network,
        {}
    );
    const makerCDPs = await getAccountLocal(
        CDPIDS,
        accountAddress,
        network,
        []
    );
    dispatch({
      payload: {
        makerCDPInfo,
        makerCDPs,
      },
      type: MAKER_LOAD_SUCCESS
    }),
  } catch(error) {
        dispatch({ type: MAKER_LOAD_FAILURE });
  }
}

//  -- Reducer  --------------------------------------------------
export const INITIAL_MAKER_STATE = {
    makerCDPInfo: {},
    makerCDPIDs: [],
    loadingMaker: false,
}

export default(state = INITIAL_MAKER_STATE, action)  =>
  produce(state, draft) => {
      switch (action.type)  {
        case MAKER_LOAD_REQUEST:
          draft.loadingMaker = true;
          break;
        case MAKER_LOAD_SUCCESS: 
          draft.loadingMaker = false;
          draft.makerCDPInfo = action.payload.makerCDPInfo;
          draft.makerCDPIDs = action.payload.makerCDPIDs;
          break;
      }
  }