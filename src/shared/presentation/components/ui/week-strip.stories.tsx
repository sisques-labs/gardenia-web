import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { WeekStrip } from "./week-strip";

const meta: Meta = {
  title: "Forms/WeekStrip",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

function ControlledWeekStrip() {
  const [active, setActive] = React.useState("2026-06-17");
  return (
    <WeekStrip weekStartDate="2026-06-16" activeDate={active} onDateClick={setActive} />
  );
}

export const Default: Story = { args: { weekStartDate: "2026-06-16", activeDate: "2026-06-17" } };
export const Controlled: Story = { render: () => <ControlledWeekStrip /> };
