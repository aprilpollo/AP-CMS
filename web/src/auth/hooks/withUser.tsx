import { type ComponentType } from "react";
import useUser from "./useUser";

function withUser<P extends object>(Component: ComponentType<P>) {
  return function WrappedComponent(
    props: Omit<P, keyof ReturnType<typeof useUser>>
  ) {
    const userProps = useUser();
    return <Component {...(props as P)} {...userProps} />;
  };
}

export default withUser;
