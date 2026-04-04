export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
  Legal: { doc: 'privacy' | 'terms' };
};

export type AppStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Contacts: undefined;
  Settings: undefined;
  WhatsApp: undefined;
};
