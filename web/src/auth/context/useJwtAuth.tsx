import { useContext } from "react";
import AuthContext, { type AuthContextType } from "./JwtAuthContext";

function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within a JwtAuthProvider");
  }

  return context;
}

export default useAuth;
