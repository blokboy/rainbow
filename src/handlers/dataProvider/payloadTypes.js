/* eslint-disable camelcase */
export const addressPayload = (address, nativeCurrency, action = 'subscribe') => [
  action,
  {
    payload: {
      address,
      currency: nativeCurrency.toLowerCase(),
      transactions_limit: 1000,
    },
    scope: ['assets', 'transactions'],
  },
];

export const compoundPayload = (address, action = 'subscribe') => [
  action,
  {
    payload: {
      address,
    },
    scope: ['earned_interest'],
  },
];

export const assetDataPayload = (assetCodes, currency, action = 'subscribe') => [
  action,
  {
    payload: {
      asset_codes: assetCodes,
      currency,
    },
  },
];
/* eslint-disable camelcase */

