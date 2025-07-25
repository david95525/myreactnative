import {API_BASE_URL, AUTH_URL, CLIENT_ID, CLIENT_SECRET, TOKEN_URL} from '@env';
import {AuthConfiguration} from 'react-native-app-auth';
export const config: AuthConfiguration = {
  clientId: CLIENT_ID,
  redirectUrl: 'myreactnative://oauth2redirect',
  scopes: [''],
  serviceConfiguration: {
    authorizationEndpoint:
      AUTH_URL,
    tokenEndpoint: TOKEN_URL,
  },
  clientSecret: CLIENT_SECRET,
  usePKCE: true,
};
export const api_url = {
  member_base_data: `${API_BASE_URL}/get_member_base_data`,
};
