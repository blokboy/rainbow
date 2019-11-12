import {
    getAccountLocal,
    getGlobal,
    removeAccountLocalMulti,
    saveAccountLocal,
    saveAccountGlobal
} from  './common';

const CDPIDS = 'makercdps';
const CDP_INFO = 'makerliquidity';

const makerAccountLocalKeys  = [
    CDPIDS,
    CDP_INFO,
];

export const saveMakerCDPIDs = (cdpIds, accountAddress, network) => 
    saveAccountLocal(CDPIDS, accountAddress, network, []);

export const saveMakerCDPs = (cdpInfo, accountAddress, network) =>
    saveAccountLocal(CDP_INFO, accountAddress, network, {});

export const getMakerCDPs = (accountAddress, network) =>
    getAccountLocal(CDP_INFO, accountAddress, network, {});

export const getMakerCDPIDs = (accountAddress, network) =>
    getAccountLocal(CDPIDS, accountAddress,  network, []);