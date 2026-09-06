import { organization } from "better-auth/plugins";
import { baseAuthOptions } from "@/lib/auth-options";
import { orgAccessControl, orgRoles } from "@/lib/org-permissions";

type OrganizationOptions = NonNullable<Parameters<typeof organization>[0]>;

const INVITATION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

export function createBaseAuthConfig(options?: {
  organization?: Pick<OrganizationOptions, "organizationHooks">;
}) {
  return {
    ...baseAuthOptions,
    advanced: {
      ipAddress: {
        // On Cloudflare Workers the client IP arrives in CF-Connecting-IP;
        // x-forwarded-for (better-auth's default) is absent, so without this
        // getIp() returns null and rate limiting is silently skipped on every
        // /api/auth endpoint. Header lookup is case-insensitive.
        ipAddressHeaders: ["cf-connecting-ip"],
      },
      cookies: { state: { attributes: { maxAge: 600 } } },
    },
    account: {
      // Encrypt OAuth access/refresh tokens at rest in D1. The key derives from BETTER_AUTH_SECRET.
      encryptOAuthTokens: true,
      accountLinking: {
        allowDifferentEmails: true,
      },
    },
    plugins: [
      // Block user-initiated org creation: each org is its own Autumn customer
      // with its own onboarding-plan credit grant, so an authenticated user
      // hitting POST /api/auth/organization/create could mint unlimited fresh
      // grants. The app gives every user exactly one workspace, created
      // server-side at signup via `auth.api.createOrganization({ body: { userId }})`
      // — that's a "system action" (no session + userId in body) which better-auth
      // exempts from this flag, so the bootstrap keeps working.
      organization({
        allowUserToCreateOrganization: false,
        ac: orgAccessControl,
        roles: orgRoles,
        // No self-serve delete: it would cascade projects/members/activation
        // state, strand the org's Autumn customer, and (with the signup
        // bootstrap re-minting a fresh org + free grant on next login) act as
        // a credit-farming loop. Deletion stays a support action.
        disableOrganizationDeletion: true,
        invitationExpiresIn: INVITATION_EXPIRES_IN_SECONDS,
        // DB-backed bound on outstanding pending invitations per org — the
        // only rate control that actually holds on Workers (in-memory rate
        // limiting is per-isolate).
        invitationLimit: 20,
        ...options?.organization,
      }),
    ],
  };
}
