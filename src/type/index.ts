export type ModalTab = 'boats' | 'captains';

export type Boat = {
  id: string;
  boatName: string;
  boatCompany: string;
  boatCapacity: number;
  boatModel: string;
  status: 'Active' | 'UnActive';
  imageUrl?: string;
};

export type Captain = {
  id: string;
  name: string;
  rating: number;
  verified: boolean;
  imageUrl: string;
  licenseNumber?: string;
  language: string;
};

export type ModalState = {
    modalOpen: boolean;
    tab: ModalTab;
    boats: Boat[];
    captains: Captain[];
    editingBoat: Boat | null;
    editingCaptain: Captain | null;
    boatImage: any | null;
    captainImage: any | null;
};

export type OperatorProfileData = {
    companyName: string;
    tradeLicense: string;
    taxId: string;
    address: string;
    payoutBalance: number;
    fleetSize: number;
    activeCaptains: number;
    complianceStatus: string;
};