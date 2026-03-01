export type ModalTab = 'boats' | 'captains';
export type ActiveStatus = 'SCHEDULE' | 'REQUESTS';

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

export type TimeFilter = 'NOW' | 'TOMORROW' | 'THIS_WEEK';

export enum SESSION_STATUS {
  OPEN = "open",
  MIN_REACHED = "min_reached",
  FULL = "full",
  CLAIMED = "claimed",
  CANCELLED = "cancelled",
}

