import "@testing-library/jest-dom";
import { screen, within } from "@testing-library/react";
import { setupUser, render } from "../util";
import ScheduleErrorNotification from "../../components/ScheduleErrorNotifications";

test("Default Error Notification Behavior", () => {
  const index = render(
    <ScheduleErrorNotification
      errors={[]}
    />
  );
  expect(index).toMatchSnapshot();
  expect(screen.getByTestId("notificationButton")).toBeDisabled();
});

const errorsMock = [
  ["error 2", "error"],
  ["error 1", "warning"],
  ["error 3", "error"]
];

test("Error Notification - Badge Number", () => {
  const index = render(
    <ScheduleErrorNotification
      errors={errorsMock}
    />
  );
  expect(index).toMatchSnapshot();
  const notificationButton = screen.getByTestId("notificationButton");
  expect(notificationButton).not.toBeDisabled();
  const errorBell = screen.getByTestId("errorBellTooltip");
  expect(errorBell).toContainHTML(`You Have ${errorsMock.length} Errors`);
});

test("Error Notification - Open Popover", async () => {
  const user = setupUser();
  const index = render(
    <ScheduleErrorNotification
      errors={errorsMock}
    />
  );
  expect(index).toMatchSnapshot();
  const notificationButton = screen.getByTestId("notificationButton");
  await user.click(notificationButton);

  const popover = screen.getByTestId("notificationPopover");

  // Display all the errors, plus the heading
  expect(popover.children.length).toBe(errorsMock.length + 1);
});

test("Error Notification - Errors Displayed", async () => {
  const user = setupUser();
  const index = render(
    <ScheduleErrorNotification
      errors={errorsMock}
    />
  );
  expect(index).toMatchSnapshot();
  const notificationButton = screen.getByTestId("notificationButton");
  await user.click(notificationButton);

  const popover = screen.getByTestId("notificationPopover");

  // Ensure each error is displayed
  errorsMock.forEach((error) => {
    expect(within(popover).queryByText(error[0])).not.toBeNull();
  });
});

test("Error Notification - Close Popover", async () => {
  const user = setupUser();
  const index = render(
    <ScheduleErrorNotification
      errors={errorsMock}
    />
  );
  expect(index).toMatchSnapshot();
  const notificationButton = screen.getByTestId("notificationButton");
  await user.click(notificationButton);

  const popoverClose = screen.getByTestId("notificationPopoverClose");

  // Close via the "Close" button on the popover
  await user.click(popoverClose);

  expect(screen.queryByTestId("notificationPopover")).toBeNull();
});
