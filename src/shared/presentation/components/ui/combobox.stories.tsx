import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Combobox } from "./combobox";

const options = [
  { value: "monstera", label: "Monstera deliciosa" },
  { value: "pothos", label: "Golden Pothos" },
  { value: "snake", label: "Snake Plant" },
  { value: "fern", label: "Boston Fern" },
];

const meta: Meta = {
  title: "Forms/Combobox",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

function ControlledCombobox() {
  const [value, setValue] = React.useState("monstera");
  return <Combobox options={options} value={value} onChange={setValue} className="w-72" />;
}

export const Default: Story = { args: { options, className: "w-72" } };
export const Controlled: Story = { render: () => <ControlledCombobox /> };
