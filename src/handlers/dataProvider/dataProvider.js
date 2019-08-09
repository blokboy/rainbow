import { isNil } from 'lodash';
import io from 'socket.io-client';
import { DATA_API_KEY, DATA_ORIGIN } from 'react-native-dotenv';
import { addressPayload, compoundPayload } from './payloadTypes';

export const createSocket = endpoint => io(
  `wss://api.zerion.io/${endpoint}?api_token=${DATA_API_KEY}`,
  {
    extraHeaders: { Origin: DATA_ORIGIN },
    transports: ['websocket'],
  },
);

const unsubscribe = (socket, payloadData) => {
  if (isNil(socket)) return;
  socket.emit(...payloadData);
  socket.close();
};

export const unsubscribeAddressData = (addressSocket, accountAddress, nativeCurrency) => unsubscribe(
  addressSocket,
  addressPayload(accountAddress, nativeCurrency, 'unsubscribe')
);

export const unsubscribeCompound = (compoundSocket, accountAddress) => unsubscribe(compoundSocket, compoundPayload(accountAddress, 'unsubscribe'));
