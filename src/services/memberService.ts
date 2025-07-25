import {api_url} from '../constants/authConfig';
import {MemberData} from '../types/member';
import {ApiService} from './apiService';
export const MemberService = {
    getBaseMemberData: async (
        setError: (msg: string | null) => void
    ): Promise<MemberData | null> => {
        const response = await ApiService.authorizedFetch(api_url.member_base_data, {method: 'GET'}, setError);
        if (response) {
            const json = await response.json();
            if (json && json.data) {
                return json.data as MemberData;
            }
            return null;
        }
        return null;
    },
    // 可擴充
    // updateMemberData: async (...) => { ... }
};
