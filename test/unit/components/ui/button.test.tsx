import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("supports disabled state", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText("Disabled")).toBeDisabled();
  });

  it('renders default variant class', () => {
    render(<Button variant="default">Default</Button>);
    const btn = screen.getByText("Default");
    expect(btn.className).toContain("bg-primary");
  });

  it('renders destructive variant class', () => {
    render(<Button variant="destructive">Delete</Button>);
    const btn = screen.getByText("Delete");
    expect(btn.className).toContain("bg-destructive");
  });

  it('renders outline variant class', () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByText("Outline");
    expect(btn.className).toContain("border");
  });

  it('renders secondary variant class', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByText("Secondary");
    expect(btn.className).toContain("bg-secondary");
  });

  it('renders ghost variant class', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByText("Ghost");
    expect(btn.className).toContain("hover:bg-accent");
  });

  it('renders link variant class', () => {
    render(<Button variant="link">Link</Button>);
    const btn = screen.getByText("Link");
    expect(btn.className).toContain("underline-offset-4");
  });

  it('renders default size class', () => {
    render(<Button size="default">Default size</Button>);
    const btn = screen.getByText("Default size");
    expect(btn.className).toContain("h-9");
  });

  it('renders sm size class', () => {
    render(<Button size="sm">Small</Button>);
    const btn = screen.getByText("Small");
    expect(btn.className).toContain("h-8");
  });

  it('renders lg size class', () => {
    render(<Button size="lg">Large</Button>);
    const btn = screen.getByText("Large");
    expect(btn.className).toContain("h-10");
  });

  it('renders icon size class', () => {
    render(<Button size="icon">Icon</Button>);
    const btn = screen.getByText("Icon");
    expect(btn.className).toContain("size-9");
  });

  it("renders as child when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link button</a>
      </Button>
    );
    const link = screen.getByText("Link button");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/test");
  });

  it("fires click handler", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    await userEvent.click(screen.getByText("Clickable"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("merges className with variant classes", () => {
    render(<Button className="my-custom">Custom</Button>);
    const btn = screen.getByText("Custom");
    expect(btn.className).toContain("my-custom");
    expect(btn.className).toContain("bg-primary");
  });

  it('renders data-variant and data-size attributes', () => {
    render(<Button variant="destructive" size="lg">Attrs</Button>);
    const btn = screen.getByText("Attrs");
    expect(btn.getAttribute("data-variant")).toBe("destructive");
    expect(btn.getAttribute("data-size")).toBe("lg");
  });
});
