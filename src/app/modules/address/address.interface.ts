export interface ICreateAddressPayload {
  label?: string;
  recipientName: string;
  phone: string;
  district: string;
  thana: string;
  streetAddress: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface IUpdateAddressPayload {
  label?: string;
  recipientName?: string;
  phone?: string;
  district?: string;
  thana?: string;
  streetAddress?: string;
  postalCode?: string | null;
  isDefault?: boolean;
}
