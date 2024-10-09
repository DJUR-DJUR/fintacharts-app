import {WSSubscriptionMessage} from '../interfaces/ws-interfaces';

export const WS_MESSAGE_RETRY_COUNT = 3;
export const WS_MESSAGE_RETRY_DELAY = 1000;
export const WS_SUBSCRIPTION_MESSAGE : WSSubscriptionMessage = {
  type: 'l1-subscription',
  id: '1',
  instrumentId: '',
  provider: 'simulation',
  subscribe: null,
  kinds: ['last'],
};
