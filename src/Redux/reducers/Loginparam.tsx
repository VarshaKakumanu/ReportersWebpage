import { LoginParam } from "./constant";

// Action creator for updating user details
export const loginPram = (paramDetails:any) => {
  return {
    type: LoginParam,
    data: Object.fromEntries(paramDetails), // Convert array to object
  };
};

// Reducer function to handle user details actions
const LoginParamsReducer = (state = {}, action:any) => {
  switch (action.type) {
    case LoginParam:
      console.log(action.data); // Log the data before returning
      return {
        ...state,
        ...action.data,
      };

    default:
      return state;
  }
};

export default LoginParamsReducer;