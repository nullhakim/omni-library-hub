import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">Error 404</p>
        <h1 className="font-display text-6xl md:text-7xl mb-6">Lost in the stacks.</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for isn't on this shelf.
        </p>
        <Link to="/" className="text-sm underline underline-offset-4 hover:no-underline">
          Return home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
