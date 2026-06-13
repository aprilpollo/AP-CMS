import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ArrowBigLeft, ArrowBigRight, CloudAlert } from "lucide-react";
import Link from "@/shared/Link";
import useUser from "@/auth/hooks/useUser";

/**
 * The Error404Page component renders a custom 404 error page.
 */
function Error404Page() {
  const { isGuest } = useUser();

  return (
      <Empty className="z-50 h-screen">
        <EmptyHeader>
          <EmptyMedia variant="default" className=" size-28">
            <CloudAlert className="size-28" />
          </EmptyMedia>
          <EmptyTitle>Oops! Page not found</EmptyTitle>
          <EmptyDescription>
            The page you are looking for does not exist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {isGuest ? (
            <Link to="/auth/sign-in">
              <Button variant="outline" size="sm">
                Sign In
                <ArrowBigRight />
              </Button>
            </Link>
          ) : (
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowBigLeft />
                Go Home
              </Button>
            </Link>
          )}
        </EmptyContent>
      </Empty>
  );
}

export default Error404Page;
