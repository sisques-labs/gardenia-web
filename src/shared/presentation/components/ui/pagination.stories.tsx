import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Pagination } from "./pagination";

const meta = {
  title: "Data/Pagination",
  component: Pagination,
  tags: ["autodocs"],
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledPagination() {
  const [page, setPage] = React.useState(2);
  return <Pagination page={page} totalPages={8} onPageChange={setPage} />;
}

export const Default: Story = {
  args: { page: 2, totalPages: 8, onPageChange: () => {} },
  render: () => <ControlledPagination />,
};
export const FirstPage: Story = {
  args: { page: 1, totalPages: 5, onPageChange: () => {} },
};
