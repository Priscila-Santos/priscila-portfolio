import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ToolInvocation } from "@/features/chat/components/tool-invocation";

const input = { company: "Acme", employees: 500 };

describe("ToolInvocation", () => {
  it("shows a busy skeleton while input is streaming", () => {
    render(<ToolInvocation state="input-streaming" input={input} />);

    const region = screen.getByRole("region", { name: /preparing lead score/i });
    expect(region).toHaveAttribute("aria-busy", "true");
    expect(region).toHaveTextContent("Acme");
    expect(region).toHaveTextContent("500");
  });

  it("keeps showing the skeleton once input is available but not yet executed", () => {
    render(<ToolInvocation state="input-available" input={input} />);

    expect(
      screen.getByRole("region", { name: /preparing lead score/i })
    ).toBeInTheDocument();
  });

  it("renders the lead score card when output is available", () => {
    render(
      <ToolInvocation
        state="output-available"
        input={input}
        output={{
          company: "Acme",
          score: 92,
          priority: "High",
          recommendation: "Contact within 24 hours.",
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "Acme" })).toBeInTheDocument();
    expect(screen.getByText("92")).toBeInTheDocument();
    expect(screen.getByText(/high priority/i)).toBeInTheDocument();
  });

  it("shows an alert when the tool output does not match the expected shape", () => {
    render(
      <ToolInvocation state="output-available" input={input} output={{ unexpected: true }} />
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/unexpected result/i);
  });

  it("shows a dedicated error state without crashing when scoring fails", () => {
    render(<ToolInvocation state="output-error" input={input} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      /lead scoring could not be completed/i
    );
  });
});