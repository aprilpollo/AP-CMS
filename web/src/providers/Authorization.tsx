import React, { Component } from "react";
import withRouter, { type WithRouterProps } from "@/shared/withRouter";
import {
  getSessionRedirectUrl,
  resetSessionRedirectUrl,
  setSessionRedirectUrl,
} from "./sessionRedirectUrl";
import { getRouteParamUtil } from "@/hooks/useRouteParameter";
import { hasPermission } from "@/lib/permissions";
import { type RouteObjectType } from "@/layouts/Layout";
import Loading from "@/shared/Loading";

type AuthorizationProps = {
  children: React.ReactNode;
  location: Location;
  userRole: string[] | string;
  loginRedirectUrl?: string;
} & WithRouterProps;

type State = {
  accessGranted: boolean;
};

function isUserGuest(role: string[] | string) {
  return !role || (Array.isArray(role) && role?.length === 0);
}

class Authorization extends Component<AuthorizationProps, State> {
  constructor(props: AuthorizationProps) {
    super(props);

    this.state = {
      accessGranted: true,
    };
  }

  componentDidMount() {
    const { accessGranted } = this.state;

    if (!accessGranted) {
      this.redirectRoute();
    }
  }

  shouldComponentUpdate(_nextProps: AuthorizationProps, nextState: State) {
    const { accessGranted } = this.state;

    return nextState.accessGranted !== accessGranted;
  }

  componentDidUpdate() {
    const { accessGranted } = this.state;

    if (!accessGranted) {
      this.redirectRoute();
    }
  }

  static getDerivedStateFromProps(props: AuthorizationProps) {
    const { location, userRole } = props;
    const { pathname } = location;

    const auth = getRouteParamUtil<RouteObjectType["auth"]>(
      pathname,
      "auth",
      false
    );
    const authForPermission = auth ?? undefined; // Convert null to undefined
    const ignoredPaths = [
      "/",
      "/auth",
      "/invite",
      "/auth/callback/google",
      "/auth/sign-in",
      "/sign-out",
      "/logout",
      "/401",
      "/404",
    ];

    // is auth is empy array
    const isOnlyGuestAllowed = Array.isArray(auth) && auth.length === 0;
    const isGuest = isUserGuest(userRole);
    const userHasPermission = hasPermission(authForPermission, userRole);

    if (auth && !userHasPermission && !ignoredPaths.includes(pathname)) {
      setSessionRedirectUrl(pathname);
    }

    /**
     * If user is member but don't have permission to view the route
     * redirected to main route '/'
     */
    if (!userHasPermission && !isGuest && !ignoredPaths.includes(pathname)) {
      if (isOnlyGuestAllowed) {
        setSessionRedirectUrl("/");
      } else {
        setSessionRedirectUrl("401");
      }
    }

    return {
      accessGranted: auth ? userHasPermission : true,
    };
  }

  redirectRoute() {
    const { userRole, navigate, loginRedirectUrl = "/" } = this.props;
    const redirectUrl = getSessionRedirectUrl() || loginRedirectUrl;

    /*
		User is guest
		Redirect to Login Page
		*/
    if (isUserGuest(userRole)) {
      setTimeout(() => navigate("/auth/sign-in"), 0);
    } else {
      /*
		  User is member
		  User must be on unAuthorized page or just logged in
		  Redirect to dashboard or loginRedirectUrl
			*/
      setTimeout(() => navigate(redirectUrl), 0);
      resetSessionRedirectUrl();
    }
  }

  render() {
    const { accessGranted } = this.state;
    const { children } = this.props;
    return accessGranted ? children : <Loading />;
  }
}

const AuthorizationWIthRouter = withRouter(Authorization);

export default AuthorizationWIthRouter;
