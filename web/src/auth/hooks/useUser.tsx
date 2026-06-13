import { useMemo } from "react";
import { type User } from "@/auth/user";
import useAuth from "../context/useAuth";
import _ from "lodash";
import setIn from "@/utils/setIn";

type useUser = {
  data: User | null;
  isGuest: boolean;
  updateUser: (updates: Partial<User>) => Promise<User | undefined>;
  updateUserSettings: (
    newSettings: User["settings"]
  ) => Promise<User["settings"] | undefined>;
  signOut: () => void;
};

function useUser(): useUser {
  const { authState, signOut, updateUser } = useAuth();
  const user = authState?.user as User;
  const isGuest = useMemo(() => !user?.role?.slug, [user]);

  async function handleUpdateUser(_data: Partial<User>) {
    if (!updateUser) {
      throw new Error("updateUser is not available");
    }

    const response = await updateUser(_data);

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    const updatedUser = (await response.json()) as User;

    return updatedUser;
  }

  async function handleUpdateUserSettings(newSettings: User["settings"]) {
    const newUser = setIn(user, "settings", newSettings) as User;

    if (_.isEqual(user, newUser)) {
      return undefined;
    }

    const updatedUser = await handleUpdateUser(newUser);

    return updatedUser?.settings;
  }

  async function handleSignOut() {
    if (!signOut) {
      throw new Error("signOut is not available");
    }
    return signOut();
  }

  return {
    data: user,
    isGuest,
    signOut: handleSignOut,
    updateUser: handleUpdateUser,
    updateUserSettings: handleUpdateUserSettings,
  };
}

export default useUser;
