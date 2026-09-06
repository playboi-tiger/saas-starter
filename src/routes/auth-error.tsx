import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AuthPageCard, AuthPageShell } from "@/client/features/auth/AuthPage";

const authErrorSearchSchema = z.object({
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export const Route = createFileRoute("/auth-error")({
  validateSearch: authErrorSearchSchema,
  component: AuthErrorPage,
});

function getAuthErrorCopy(error?: string) {
  switch (error) {
    case "access_denied":
      return {
        title: "Sign-in canceled",
        description:
          "You canceled the sign-in request. You can try again whenever you're ready.",
      };
    default:
      return {
        title: "Authentication failed",
        description:
          "We couldn't complete the sign-in request. Please try again.",
      };
  }
}

function AuthErrorPage() {
  const { error } = Route.useSearch();
  const copy = getAuthErrorCopy(error);

  return (
    <AuthPageShell>
      <AuthPageCard
        title={copy.title}
        helperText={copy.description}
        footer={
          error ? (
            <p className="font-mono text-xs text-base-content/40">
              Code: {error}
            </p>
          ) : undefined
        }
      >
        <Link to="/" className="btn btn-soft w-full">
          Back to home
        </Link>
      </AuthPageCard>
    </AuthPageShell>
  );
}
