import { loginData } from "./constant";

// Action creator for updating user details
export const loginDataDetails = (userDetails: any[]) => {
  return {
    type: loginData,
    data: userDetails,
  };
};

// Reducer function to handle user details actions
const LoginDetailsReducer = (state: any[] = [], action: { type: string; data: any[] }) => {
  switch (action.type) {
    case loginData:
      return action.data;

    default:
      return state;
  }
};

export default LoginDetailsReducer;