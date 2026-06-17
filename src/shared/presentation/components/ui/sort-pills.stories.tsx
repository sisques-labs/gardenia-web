import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SortPills } from "./sort-pills";

const options = [
  { value: "name", label: "Name" },
  { value: "date", label: "Date added" },
  { value: "health", label: "Health" },
];

const meta: Meta = {
  title: "Data/SortPills",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

function ControlledSort() {
  const [value, setValue] = React.useState("name");
  return <SortPills options={options} value={value} onSort={setValue} />;
}

export const Default: Story = { args: { options, value: "name" } };
export const Controlled: Story = { render: () => <ControlledSort /> };
