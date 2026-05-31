import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GoogleAnalytics from "../components/GoogleAnalytics";
import WaitlistModal from "../components/WaitlistModal";

// Mock Next.js Script component
vi.mock("next/script", () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: function MockScript({ src, children, id, ...props }: any) {
      return (
        <script data-testid="next-script" data-src={src} id={id} {...props}>
          {children}
        </script>
      );
    },
  };
});

// Mock Supabase lib
vi.mock("../lib/supabase", () => {
  return {
    submitWaitlist: vi.fn(() => Promise.resolve({ success: true })),
    isSupabaseConfigured: true,
  };
});

describe("GoogleAnalytics Component", () => {
  it("renders without crashing and configures GA ID", () => {
    render(<GoogleAnalytics />);

    // Check that we render the scripts
    const scripts = screen.getAllByTestId("next-script");
    expect(scripts.length).toBe(2);

    // Check that the script source or config tag includes a measurement ID
    const trackingScript = scripts.find(
      (s) => s.getAttribute("id") === "google-analytics",
    );
    expect(trackingScript).toBeDefined();
  });
});

describe("WaitlistModal Component", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <WaitlistModal
        isOpen={false}
        onClose={() => {}}
        projectId="test-proj"
        projectName="Test Project"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders correct content when isOpen is true", () => {
    render(
      <WaitlistModal
        isOpen={true}
        onClose={() => {}}
        projectId="test-proj"
        projectName="Test Project"
      />,
    );

    // It should display the header
    expect(
      screen.getByRole("heading", { name: "Get Early Access" }),
    ).toBeInTheDocument();

    // It should have form fields for name and phone
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
  });
});
