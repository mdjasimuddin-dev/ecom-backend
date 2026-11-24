export interface IRegisterUserPayload {
  name?: string;
  email: string;
  password: string;
  id?: string;
  role?: string;
}

export interface IVerifyUserEmailPayload {
  email: string;
  otp: string;
}

export interface IForgetPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  email: string;
  newPassword: string;
  otp: string;
}
