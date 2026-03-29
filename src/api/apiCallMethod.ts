import { instance } from './index';
import { onBoarding, paymentIntent, moneyTransaction } from './endpoint';

export const apiCallMethod = {
  createConnectAccount: (payload: { operatorUid: string; email: string }) => {
    return instance.post(onBoarding.createConnectAccount, payload);
  },
  createAccountLink: (payload: { operatorUid: string }) => {
    return instance.post(onBoarding.createAccountLink, payload);
  },
  checkOnboardingStatus: (operatorID: string) => {
    return instance.get(`${onBoarding.checkOnboardingStatus}/${operatorID}`);
  },
  //Payment Intent
  createPaymentIntent: (payload: {
    sessionId: string;
    operatorUid: string;
    riderUid: string;
    operatorStripeAccountId: string;
  }) => {
    return instance.post(paymentIntent.createPaymentIntent, payload);
  },

  //Money Transaction
  captureAll: (payload: { sessionId: string }) => {
    return instance.post(moneyTransaction.captureAll, payload);
  },
};
