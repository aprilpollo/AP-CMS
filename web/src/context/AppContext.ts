import { createContext } from "react";
import { type RoutesType } from "@/types";

export type AppContextType = {
  /**
   * The routes to be used in the app.
   */
  routes?: RoutesType;
};

const AppContext = createContext<AppContextType>({ routes: [] });

export default AppContext;
