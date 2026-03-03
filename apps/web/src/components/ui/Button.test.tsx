import { fireEvent, render, screen } from "@testing-library/react";

import { Button } from "./Button";

describe("Button", () => {
  it("renders text and handles click", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click Me</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Click Me" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
