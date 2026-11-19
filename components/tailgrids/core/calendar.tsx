"use client";

import { buttonStyles } from "@/components/tailgrids/core/button";
import { cn } from "@/utils/cn";
import { ChevronDown, ChevronLeft, ChevronRight } from "@tailgrids/icons";
import { cva } from "class-variance-authority";
import {
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps
} from "react";
import {
  Button as AriaButton,
  Calendar as AriaCalendar,
  CalendarCell as AriaCalendarCell,
  CalendarGrid as AriaCalendarGrid,
  CalendarGridBody as AriaCalendarGridBody,
  CalendarGridHeader as AriaCalendarGridHeader,
  Heading as AriaHeading,
  CalendarCellRenderProps,
  CalendarHeaderCell,
  CalendarStateContext,
  ListBox,
  ListBoxItem,
  Popover,
  useLocale,
  type CalendarCellProps as AriaCalendarCellProps,
  type CalendarGridHeaderProps as AriaCalendarGridHeaderProps,
  type CalendarProps as AriaCalendarProps,
  type HeadingProps as AriaHeadingProps,
  type DateValue
} from "react-aria-components";

const calendarStyles = cva(
  "flex w-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-xl sm:p-5"
);

export interface CalendarProps<T extends DateValue> extends Omit<
  AriaCalendarProps<T>,
  "visibleDuration" | "isDisabled" | "isReadOnly"
> {
  className?: string;
  disabled?: boolean;
  readonly?: boolean;
}

export function Calendar<T extends DateValue>({
  className,
  children,
  disabled,
  readonly,
  ...props
}: CalendarProps<T>) {
  return (
    <AriaCalendar
      {...props}
      className={cn(calendarStyles(), className)}
      isDisabled={disabled}
      isReadOnly={readonly}
    >
      {children}
    </AriaCalendar>
  );
}

const calendarHeaderStyles = cva("mb-4 flex items-center gap-2 px-1");

export type CalendarHeaderProps = ComponentProps<"header">;

export function CalendarHeader({ className, ...props }: CalendarHeaderProps) {
  return (
    <header className={cn(calendarHeaderStyles(), className)} {...props}>
      {props.children}
    </header>
  );
}

export interface NavButtonProps extends ComponentProps<typeof AriaButton> {
  slot: "previous" | "next";
}

export function NavButton({ slot, className, ...props }: NavButtonProps) {
  const { direction } = useLocale();

  return (
    <AriaButton
      slot={slot}
      type="button"
      className={cn(
        buttonStyles({
          variant: "ghost",
          iconOnly: true,
          size: "sm"
        }),
        "size-9 shrink-0 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        className
      )}
      aria-label={slot === "previous" ? "Previous month" : "Next month"}
      {...props}
    >
      {slot === "previous" ? (
        direction === "rtl" ? (
          <ChevronRight aria-hidden />
        ) : (
          <ChevronLeft aria-hidden />
        )
      ) : direction === "rtl" ? (
        <ChevronLeft aria-hidden />
      ) : (
        <ChevronRight aria-hidden />
      )}
    </AriaButton>
  );
}

export interface MonthPickerProps {
  className?: string;
}

export function CalendarMonthPicker({ className }: MonthPickerProps) {
  const state = useContext(CalendarStateContext);
  const { locale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const currentMonth = state?.focusedDate.month ?? new Date().getMonth() + 1;
  const currentYear = state?.focusedDate.year ?? new Date().getFullYear();

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long" }),
    [locale]
  );

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const monthNum = index + 1;
        return {
          month: monthNum,
          label: monthFormatter.format(new Date(Date.UTC(2000, index, 1)))
        };
      }),
    [monthFormatter]
  );

  const currentMonthLabel =
    months.find(m => m.month === currentMonth)?.label ?? "";

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const listboxElement = listboxRef.current;
      const selectedItem = listboxElement?.querySelector<HTMLElement>(
        "[data-selected='true']"
      );

      if (!listboxElement || !selectedItem) {
        return;
      }

      const targetScrollTop =
        selectedItem.offsetTop -
        listboxElement.clientHeight / 2 +
        selectedItem.clientHeight / 2;

      listboxElement.scrollTop = Math.max(0, targetScrollTop);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isOpen, currentMonth]);

  if (!state) {
    return null;
  }

  const focusedDate = state.focusedDate;
  const maxMonthForYear =
    state.maxValue && currentYear === state.maxValue.year
      ? state.maxValue.month
      : 12;

  const clampFocusedDateToMonth = (month: number) => {
    const safeDate = focusedDate.set({ day: 1, month });
    const maxDay = safeDate.calendar.getDaysInMonth(safeDate);
    let targetDay = Math.min(focusedDate.day, maxDay);
    if (
      state.maxValue &&
      currentYear === state.maxValue.year &&
      month === state.maxValue.month
    ) {
      targetDay = Math.min(targetDay, state.maxValue.day);
    }
    return safeDate.set({ day: targetDay });
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Select month"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(open => !open);
        }}
        className={cn(
          buttonStyles({
            variant: "ghost",
            iconOnly: false,
            size: "sm"
          }),
          "h-9 min-w-28 justify-between rounded-full border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:ring-anyprimary-green-700/20",
          className
        )}
      >
        <span className="truncate">{currentMonthLabel}</span>
        <ChevronDown aria-hidden className="size-4 shrink-0 text-gray-500" />
      </button>

      <Popover
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        triggerRef={triggerRef}
        placement="bottom"
        offset={8}
        className="w-44 overflow-hidden rounded-xl border border-gray-200 bg-white p-0 shadow-lg"
      >
        <ListBox
          ref={listboxRef}
          aria-label="Select month"
          autoFocus
          selectionMode="single"
          selectedKeys={[String(currentMonth)]}
          disallowEmptySelection
          shouldFocusWrap
          onSelectionChange={keys => {
            if (keys === "all") {
              return;
            }

            const selectedMonth = Number([...keys][0]);
            if (Number.isNaN(selectedMonth)) {
              return;
            }

            state.setFocusedDate(clampFocusedDateToMonth(selectedMonth));
            setIsOpen(false);
          }}
          className="max-h-60 overflow-y-auto p-1.5 outline-none"
        >
          {months.map(({ month, label }) => (
            <ListBoxItem
              key={month}
              id={String(month)}
              textValue={label}
              isDisabled={month > maxMonthForYear}
              className={cn(
                "flex w-full cursor-pointer justify-between rounded-md px-3 py-2 text-left text-sm text-gray-700 outline-hidden",
                "data-[selected=true]:bg-emerald-50 data-[selected=true]:font-semibold data-[selected=true]:text-anyprimary-green-700",
                "data-[focused=true]:bg-gray-100 data-[focused=true]:text-gray-900",
                "data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-gray-300"
              )}
            >
              {label}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </>
  );
}

export interface YearPickerProps {
  className?: string;
}

export function CalendarYearPicker({ className }: YearPickerProps) {
  const state = useContext(CalendarStateContext);
  const { locale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const currentYear = state?.focusedDate.year ?? new Date().getFullYear();
  const maxYear = state?.maxValue?.year ?? currentYear + 10;
  const isThaiLocale = locale.toLowerCase().startsWith("th");
  const isBuddhistCalendar =
    state?.focusedDate.calendar.identifier === "buddhist";

  const years = useMemo(() => {
    const yearStart = maxYear - 25;
    return Array.from({ length: 26 }, (_, index) => yearStart + index).reverse();
  }, [maxYear]);

  const formatDisplayYear = (year: number) =>
    String(isThaiLocale && !isBuddhistCalendar ? year + 543 : year);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const listboxElement = listboxRef.current;
      const selectedItem = listboxElement?.querySelector<HTMLElement>(
        "[data-selected='true']"
      );

      if (!listboxElement || !selectedItem) {
        return;
      }

      const targetScrollTop =
        selectedItem.offsetTop -
        listboxElement.clientHeight / 2 +
        selectedItem.clientHeight / 2;

      listboxElement.scrollTop = Math.max(0, targetScrollTop);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isOpen, currentYear]);

  if (!state) {
    return null;
  }

  const focusedDate = state.focusedDate;
  const currentDay = focusedDate.day;
  const clampFocusedDateToYear = (year: number) => {
    let targetMonth = focusedDate.month;
    if (state.maxValue && year === state.maxValue.year) {
      targetMonth = Math.min(targetMonth, state.maxValue.month);
    }
    const safeDate = focusedDate.set({ day: 1, month: targetMonth, year });
    const maxDay = safeDate.calendar.getDaysInMonth(safeDate);
    let targetDay = Math.min(currentDay, maxDay);
    if (
      state.maxValue &&
      year === state.maxValue.year &&
      targetMonth === state.maxValue.month
    ) {
      targetDay = Math.min(targetDay, state.maxValue.day);
    }
    return safeDate.set({ day: targetDay });
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Select year"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(open => !open);
        }}
        className={cn(
          buttonStyles({
            variant: "ghost",
            iconOnly: false,
            size: "sm"
          }),
          "h-9 min-w-20 justify-between rounded-full border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:ring-anyprimary-green-700/20",
          className
        )}
      >
        <span>{formatDisplayYear(currentYear)}</span>
        <ChevronDown aria-hidden className="size-4 shrink-0 text-gray-500" />
      </button>

      <Popover
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        triggerRef={triggerRef}
        placement="bottom"
        offset={8}
        className="w-32 overflow-hidden rounded-xl border border-gray-200 bg-white p-0 shadow-lg"
      >
        <ListBox
          ref={listboxRef}
          aria-label="Select year"
          autoFocus
          selectionMode="single"
          selectedKeys={[String(currentYear)]}
          disallowEmptySelection
          shouldFocusWrap
          onSelectionChange={keys => {
            if (keys === "all") {
              return;
            }

            const selectedYear = Number([...keys][0]);
            if (Number.isNaN(selectedYear)) {
              return;
            }

            state.setFocusedDate(clampFocusedDateToYear(selectedYear));
            setIsOpen(false);
          }}
          className="max-h-60 overflow-y-auto p-1.5 outline-none"
        >
          {years.map(year => (
            <ListBoxItem
              key={year}
              id={String(year)}
              textValue={formatDisplayYear(year)}
              className={cn(
                "flex w-full cursor-pointer justify-between rounded-md px-3 py-2 text-left text-sm text-gray-700 outline-hidden",
                "data-[selected=true]:bg-emerald-50 data-[selected=true]:font-semibold data-[selected=true]:text-anyprimary-green-700",
                "data-[focused=true]:bg-gray-100 data-[focused=true]:text-gray-900"
              )}
            >
              {formatDisplayYear(year)}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </>
  );
}

const calendarGridStyles = cva("w-full border-collapse border-spacing-0");

export type CalendarGridProps = ComponentProps<typeof AriaCalendarGrid>;

export function CalendarGrid({ className, ...props }: CalendarGridProps) {
  return (
    <AriaCalendarGrid
      className={cn(calendarGridStyles(), className)}
      {...props}
    />
  );
}

export type CalendarGridBodyProps = ComponentProps<
  typeof AriaCalendarGridBody
>;

export function CalendarGridBody({ ...props }: CalendarGridBodyProps) {
  return <AriaCalendarGridBody {...props} />;
}

export type CalendarHeadingProps = AriaHeadingProps;

export function CalendarHeading({ className, ...props }: CalendarHeadingProps) {
  return (
    <AriaHeading
      {...props}
      className={cn("flex-1 text-center text-sm font-semibold text-gray-900", className)}
    />
  );
}

const calendarGridHeaderCellStyles = cva(
  "table-grid-header-cell bg-white pb-2 text-center text-[0.7rem] font-medium uppercase tracking-[0.12em] text-gray-500 sm:text-xs"
);

export type CalendarGridHeaderProps = AriaCalendarGridHeaderProps;

export function CalendarGridHeader({ className }: { className?: string }) {
  return (
    <AriaCalendarGridHeader>
      {(day: string) => (
        <CalendarHeaderCell
          className={cn(calendarGridHeaderCellStyles(), className)}
        >
          {day}
        </CalendarHeaderCell>
      )}
    </AriaCalendarGridHeader>
  );
}

const calendarCellButtonStyles = cva(
  "flex size-9 items-center justify-center rounded-full text-sm font-medium text-gray-800 outline-none transition forced-color-adjust-none [-webkit-tap-highlight-color:transparent] hover:bg-emerald-50 hover:text-anyprimary-green-700 group-data-[outside-month=true]:pointer-events-none group-data-[outside-month=true]:text-gray-300 group-data-[disabled=true]:cursor-not-allowed group-[&[data-disabled=true]:not([data-outside-month]):not([data-today])]:text-gray-300 group-[[data-unavailable=true]:not([data-today=true])]:text-gray-300 group-data-[today=true]:border group-data-[today=true]:border-anyprimary-green-700 group-data-[today=true]:text-anyprimary-green-700 data-[selected=true]:bg-anyprimary-green-700 data-[selected=true]:text-white group-data-[pressed=true]:scale-95 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-anyprimary-green-700/30 sm:size-10 [&[data-disabled=true]:not([data-outside-month])]:line-through data-[selected=true]:hover:bg-[#0c4337]"
);

interface CalendarCellProps extends Omit<
  AriaCalendarCellProps,
  | "isDisabled"
  | "isFocusVisible"
  | "isOutsideMonth"
  | "isPressed"
  | "isSelected"
> {
  className?: string;
  disabled?: boolean;
  focusVisible?: boolean;
  outsideMonth?: boolean;
  pressed?: boolean;
  selected?: boolean;
}

export function CalendarCell({
  className,
  disabled,
  focusVisible,
  outsideMonth,
  pressed,
  selected,
  ...props
}: CalendarCellProps) {
  return (
    <AriaCalendarCell
      {...props}
      className="group bg-white p-0 outline-none"
    >
      {({
        formattedDate,
        isDisabled,
        isFocusVisible,
        isOutsideMonth,
        isPressed,
        isSelected
      }: CalendarCellRenderProps) => (
        <span
          data-disabled={(disabled ?? isDisabled) || undefined}
          data-focus-visible={(focusVisible ?? isFocusVisible) || undefined}
          data-outside-month={(outsideMonth ?? isOutsideMonth) || undefined}
          data-pressed={(pressed ?? isPressed) || undefined}
          data-selected={(selected ?? isSelected) || undefined}
          className={cn(calendarCellButtonStyles(), className)}
        >
          {formattedDate}
        </span>
      )}
    </AriaCalendarCell>
  );
}

export type { DateValue };
