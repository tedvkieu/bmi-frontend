export interface MachineDetails {
  machineId: string | number;
  registrationNo: string;
  itemName: string;
  brand: string;
  model: string;
  serialNumber: string;
  manufactureCountry: string;
  manufacturerName: string;
  manufactureYear: string | number | null;
  quantity: string | number | null;
  usage: string;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MachineRequest {
  dossierId: string | number;
  registrationNo: string;
  itemName: string;
  brand: string;
  model: string;
  serialNumber: string;
  manufactureCountry: string;
  manufacturerName: string;
  manufactureYear: string | number | null;
  quantity: string | number | null;
  usage: string;
  note?: string | null;
}


