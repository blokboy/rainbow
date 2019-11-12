import produce from 'immer';
import {
    getAccountLocal,
    getGlobal,
    removeAccountLocal,
    saveAccountLocal,
    saveGlobal
} from '../handlers/localstorage/common';
import {  
    isEmpty
} from 'lodash';
import { contractUtils } from '../utils';
import { saveMakerCDPIDs } from '../handlers/localstorage/maker';
import Maker from '@makerdao/dai';
import { REACT_APP_INFURA_PROJECT_ID } from 'react-native-dotenv';

// -- Constants -------------------------------------------------------
const MAKER_LOAD_REQUEST = 'makerCDPInfo/MAKER_LOAD_REQUEST';
const MAKER_LOAD_SUCCESS = 'makerCDPInfo/MAKER_LOAD_SUCCESS';
const MAKER_LOAD_FAILURE = 'makerCDPInfo/MAKER_LOAD_FAILURE';

const MAKER_UPDATE_CDP_IDS = 'makerCDPInfo/MAKER_UPDATE_REQUEST';
const MAKER_UPDATE_CDP_IDS_SUCCESS = 'makerCDPInfo/MAKER_UPDATE_SUCCESS';
const MAKER_UPDATE_CDP_IDS_FAILURE = 'makerCDPInfo/MAKER_UPDATE_FAILURE';

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
      type: MAKER_LOAD_SUCCESS,
    });
  } catch(error) {
        dispatch({ type: MAKER_LOAD_FAILURE });
  }
};

export const makerCDPInfoInit = () => async (dispatch, getState) => {
  const maker = await Maker.create('http', {
      url: `https://network.infura.io/v3/${REACT_APP_INFURA_PROJECT_ID}`, 
  });
  console.log('maker  obj ', maker);
  await maker.authenticate()

  new Promise((resolve, reject) => {
    const getCDPInfo = () =>
      new Promise((fetchResolve, fetchReject) => {
        const { cdpIds } = getState().maker;

        const parsedCDPs = cdpIds.map(id => {
            return  maker.getCdp(id)
        })
      });
    return getGasPrices()
      .then(() => {
        clearInterval(getGasPricesInterval);
        getGasPricesInterval = setInterval(getGasPrices, 60000); // 15 secs
        resolve(true);
      })
      .catch(error => {
        clearInterval(getGasPricesInterval);
        getGasPricesInterval = setInterval(getGasPrices, 60000); // 15 secs
        reject(error);
      });
  });
}

export const makerUpdateCDPIDs = (cdpIds) => async (dispatch, getState) => {
    const  { accountAddress, network } =  getState().settings;
    //const { cdpInfo } = getState().maker;
    dispatch({ payload: cdpIds, type: MAKER_UPDATE_CDP_IDS });
    saveMakerCDPIDs(cdpIds, accountAddress, network);
    // TODO store to local storage create saveMakerCDPIDs
    try {
        dispatch({ type:  MAKER_UPDATE_CDP_IDS_SUCCESS});
    } catch(error) {
        dispatch({ type: MAKER_UPDATE_CDP_IDS_FAILURE });
    }
}

//  -- Reducer  --------------------------------------------------
export const INITIAL_MAKER_STATE = {
    makerCDPInfo: {},
    makerCDPIDs: [],
    loadingMaker: false,
}

export default(state = INITIAL_MAKER_STATE, action)  => 
  produce(state, draft => {
      switch (action.type)  {
        case MAKER_LOAD_REQUEST:
          draft.loadingMaker = true;
          break;
        case MAKER_LOAD_SUCCESS: 
          draft.loadingMaker = false;
          draft.makerCDPInfo = action.payload.makerCDPInfo;
          draft.makerCDPIDs = action.payload.makerCDPIDs;
          break;
         case MAKER_UPDATE_CDP_IDS:
           draft.makerCDPIDs = action.payload;
           break;
      }
  })
