import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils";

describe("Button", () => {
  it("renders children", () => {
    render(<button className="bg-primary">Click me</button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("supports disabled state", () => {
    render(<button disabled>Disabled</button>);
    expect(screen.getByText("Disabled")).toBeDisabled();
  });
});
