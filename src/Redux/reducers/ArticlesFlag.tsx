import { ArticleFlagOn } from "./constant";

export const ArticleFlag = (Onflag:any) => {
    return {
      type: ArticleFlagOn,
      data: Onflag,
    };
  };

// Reducer function to handle login actions
const articleFlagReducer = (_state:any, action: { type: string; data: any }) => {
  switch (action.type) {
 
    case ArticleFlagOn:
      return action.data;

    default:
      return false;
  }
};

export default articleFlagReducer;
