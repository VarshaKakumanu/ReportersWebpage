import { articels } from "./constant";

export const articelsData = (_state:any, action: any) => {
  switch (action.type) {
    case articels:
      return 1 + 1;
    default:
      return "no data ";
  }
};
