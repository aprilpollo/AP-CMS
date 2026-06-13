import { combineSlices } from "@reduxjs/toolkit"
import apiService from "./apiService"

export interface LazyLoadedSlices {}

// Register the RTK Query api reducer (state.apiService) alongside any lazy slices.
export const rootReducer = combineSlices(
  apiService
).withLazyLoadedSlices<LazyLoadedSlices>()

export default rootReducer
