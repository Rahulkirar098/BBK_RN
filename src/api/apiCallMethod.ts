import { instance } from './index';
import { onBoarding, paymentIntent, moneyTransaction, allEndpoints, uploadImage, captain, boat } from './endpoint';

import { Captain } from '../types';

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
    seatsCount: number;
  }) => {
    return instance.post(paymentIntent.createPaymentIntent, payload);
  },

  //Money Transaction
  captureAll: (payload: { sessionId: string }) => {
    return instance.post(moneyTransaction.captureAll, payload);
  },

  //All Method
  finalizeBooking: (payload: {
    sessionId: string;
    operatorUid: string;
    riderUid: string;
    paymentIntentId: string;
    seatsCount: number;
  }) => {
    return instance.post(allEndpoints.finalizeBooking, payload);
  },

  // Upload Image
  uploadImage: (formData: any) => {
    return instance.post(uploadImage.upload, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Caption
  createCaptain: (payload: Captain) => {
    return instance.post(captain.createCaptain, payload);
  },
  editCaptain: (id: string, payload: Captain) => {
    return instance.put(`${captain.editCaptain}/${id}`, payload);
  },
  deleteCaptain: (id: string) => {
    return instance.delete(`${captain.deleteCaptain}/${id}`);
  },
  
  // Boat
  createBoat: (payload: any) => {
    return instance.post(boat.createBoat, payload);
  },
  editBoat: (id: string, payload: any) => {
    return instance.put(`${boat.editBoat}/${id}`, payload);
  },
  deleteBoat: (id: string) => {
    return instance.delete(`${boat.deleteBoat}/${id}`);
  },
};
