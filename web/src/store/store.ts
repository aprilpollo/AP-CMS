import {
  type Action,
  type Middleware,
  type ThunkAction,
  configureStore,
  createSelector,
} from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import rootReducer from "./rootReducer";
import apiService from "./apiService";
import { dynamicMiddleware } from "./middleware";

export type RootState = ReturnType<typeof rootReducer>;

const middlewares: Middleware[] = [apiService.middleware, dynamicMiddleware];

export const makeStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(middlewares),
    preloadedState,
  });
  // configure listeners using the provided defaults
  // optional, but required for `refetchOnFocus`/`refetchOnReconnect` behaviors
  setupListeners(store.dispatch);
  return store;
};

export const store = makeStore();

export type AppStore = typeof store;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
export type AppAction<R = Promise<void>> =
  | Action<string>
  | ThunkAction<R, RootState, unknown, Action<string>>;

export const createAppSelector = createSelector.withTypes<RootState>();

export default store;
