import type { RouteObject } from "react-router";
import type { DeepPartial } from "react-hook-form";
import type { PartialDeep } from "type-fest";
import type { SettingsConfigType } from "@/settings/context/SettingsContext";

export type RouteItemType = RouteObject & {
  auth?: string[] | [] | null;
  children?: RouteItemType[];
  settings?: DeepPartial<SettingsConfigType>;
};

export type RoutesType = RouteItemType[];

export type RouteConfigType = {
  routes: RoutesType;
  settings?: PartialDeep<SettingsConfigType>;
  auth?: string[] | [] | null;
};

export type RouteConfigsType = RouteConfigType[] | [];
