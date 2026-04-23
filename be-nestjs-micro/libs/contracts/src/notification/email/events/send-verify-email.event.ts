export interface SendVerifyEmailEvent {
  requestId: string;
  email: string;
  fullName: string;
  code: string;
}
