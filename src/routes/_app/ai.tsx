import { createFileRoute, Link } from "@tanstack/react-router";
import { isHostedClientAuthMode } from "@/lib/auth-mode";
import { ClaudeIcon, CodexIcon } from "@/client/features/ai-mcp/AgentIcons";
import { AvailableTools } from "@/client/features/ai-mcp/AvailableTools";
import {
  CodeBlock,
  Collapsible,
  CopyButton,
} from "@/client/features/ai-mcp/SetupControls";

export const Route = createFileRoute("/_app/ai")({
  component: AiPage,
});

function AiPage() {
  const mcpUrl =
    typeof window === "undefined"
      ? "http://localhost:3000/mcp"
      : `${window.location.origin}/mcp`;

  return (
    <div className="h-full overflow-auto bg-base-100 px-4 py-12 md:px-6 md:py-16 pb-24 md:pb-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">AI & Model Context Protocol (MCP)</h1>
        <p className="mt-2 text-sm text-base-content/70 leading-relaxed">
          Connect your AI agents and coding assistants (Claude Code, Cursor, Windsurf, Codex)
          directly to your application backend over Model Context Protocol (MCP).
        </p>

        <section className="mt-8">
          <div className="rounded-lg border border-base-300 bg-base-200 px-4 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                MCP server URL
              </p>
              <CopyButton
                value={mcpUrl}
                successMessage="MCP URL copied"
              />
            </div>
            <code className="mt-2 block break-all font-mono text-sm text-base-content">
              {mcpUrl}
            </code>
          </div>
          <p className="mt-2.5 text-xs text-base-content/55 leading-relaxed">
            Paste this URL into any MCP client. It connects directly to your active instance.
            Sign in with your account credentials when prompted.
          </p>
          {isHostedClientAuthMode() ? (
            <p className="mt-2 text-xs text-base-content/55">
              For headless or CI setups, generate an API key from{" "}
              <Link className="link link-primary" to="/settings">
                Settings
              </Link>{" "}
              instead of the OAuth login flow.
            </p>
          ) : null}
        </section>

        <section className="mt-10">
          <h2 className="text-base font-semibold">Client Setup Guides</h2>
          <p className="mt-1.5 text-sm text-base-content/70">
            Configure your preferred agent or IDE:
          </p>
          <div className="mt-4 divide-y divide-base-300 overflow-hidden rounded-lg border border-base-300 bg-base-200">
            <Collapsible
              id="claude-code"
              title="Claude Code"
              subtitle="Add with CLI command"
              icon={<ClaudeIcon className="size-5" />}
            >
              <p className="text-sm text-base-content/70">
                Run this command in your terminal:
              </p>
              <CodeBlock
                code={`claude mcp add --transport http --scope user starter-app ${mcpUrl}`}
              />
              <p className="text-sm text-base-content/70">
                Approve authentication when the browser window opens.
              </p>
            </Collapsible>

            <Collapsible
              id="cursor-windsurf"
              title="Cursor & Windsurf"
              subtitle="Add as custom SSE/HTTP MCP server"
            >
              <ol className="ml-5 list-decimal space-y-1.5 text-sm text-base-content/70 leading-relaxed">
                <li>
                  Open <span className="font-medium text-base-content">Settings → Features → MCP</span>.
                </li>
                <li>
                  Click <span className="font-medium text-base-content">Add New MCP Server</span>.
                </li>
                <li>Set type to <span className="font-mono text-xs">SSE</span> or <span className="font-mono text-xs">HTTP</span>.</li>
                <li>Paste the URL: <span className="font-mono text-xs">{mcpUrl}</span>.</li>
                <li>Save and connect.</li>
              </ol>
            </Collapsible>

            <Collapsible
              id="claude-desktop"
              title="Claude Desktop"
              subtitle="Add custom connector"
              icon={<ClaudeIcon className="size-5" />}
            >
              <ol className="ml-5 list-decimal space-y-1.5 text-sm text-base-content/70 leading-relaxed">
                <li>
                  Open <span className="text-base-content">Settings</span> →{" "}
                  <span className="text-base-content">Connectors</span>.
                </li>
                <li>
                  Click{" "}
                  <span className="font-medium text-base-content">
                    Add custom connector
                  </span>
                  .
                </li>
                <li>Paste the MCP URL above and click Add.</li>
                <li>Complete login when prompted.</li>
              </ol>
            </Collapsible>

            <Collapsible
              id="codex"
              title="Codex"
              subtitle="Add with CLI"
              icon={<CodexIcon className="size-5" />}
            >
              <p className="text-sm text-base-content/70">
                Run this in your terminal:
              </p>
              <CodeBlock
                code={`codex mcp add starter-app --url ${mcpUrl}`}
              />
            </Collapsible>
          </div>
        </section>

        <section className="mt-12">
          <AvailableTools />
        </section>
      </div>
    </div>
  );
}
