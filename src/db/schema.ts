import { getDatabaseProvider } from "./provider";
import * as sqliteApp from "./app.schema";
import * as sqliteProjectContext from "./project-context.schema";
import * as sqliteSam from "./sam.schema";
import * as sqliteAuth from "./better-auth-schema";
import * as sqliteBilling from "./billing.schema";
import * as sqliteTelemetry from "./telemetry.schema";
import * as pgApp from "./pg/app.schema";
import * as pgProjectContext from "./pg/project-context.schema";
import * as pgSam from "./pg/sam.schema";
import * as pgAuth from "./pg/better-auth-schema";
import * as pgBilling from "./pg/billing.schema";
import * as pgTelemetry from "./pg/telemetry.schema";

// Canonical schema barrel. Repositories import their tables from here and the
// provider-aware `db` from "@/db", so each repository is written ONCE for both
// backends.
type AppSchema = typeof sqliteApp &
  typeof sqliteProjectContext &
  typeof sqliteSam &
  typeof sqliteAuth &
  typeof sqliteBilling &
  typeof sqliteTelemetry;

const runtimeSchema =
  getDatabaseProvider() === "postgres"
    ? {
        ...pgApp,
        ...pgProjectContext,
        ...pgSam,
        ...pgAuth,
        ...pgBilling,
        ...pgTelemetry,
      }
    : {
        ...sqliteApp,
        ...sqliteProjectContext,
        ...sqliteSam,
        ...sqliteAuth,
        ...sqliteBilling,
        ...sqliteTelemetry,
      };

// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- guarded by schema-parity.test.ts
const schema = runtimeSchema as unknown as AppSchema;

export const {
  userOnboardingAnswers,
  projects,
  items,
  organizationActivationState,
  projectContextSections,
  samSessions,
  user,
  session,
  account,
  apikey,
  verification,
  organization,
  member,
  invitation,
  billingCustomerStatus,
  telemetryState,
} = schema;
