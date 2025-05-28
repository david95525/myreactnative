export interface TokenData {
  accessToken: string;
  refreshToken: string;
  accessTokenExpirationDate: string;
  idToken?: string;
  tokenType?: string;
}
