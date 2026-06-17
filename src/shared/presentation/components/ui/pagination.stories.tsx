import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Pagination } from "./pagination";

const meta: Meta = {
  title: "Data/Pagination",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

function ControlledPagination() {
  const [page, setPage] = React.useState(2);
  return <Pagination page={page} totalPages={8} onPageChange={setPage} />;
}

export const Default: Story = { render: () => <ControlledPagination /> };
export const FirstPage: Story = {
  args: { page: 1, totalPages: 5, onPageChange: () => {} },
};
