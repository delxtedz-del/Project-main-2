"use client";

import {
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeader,
  CalendarHeading,
  CalendarMonthPicker,
  CalendarYearPicker,
  NavButton,
} from "@/components/tailgrids/core/calendar";
import { cn } from "@/utils/cn";
import { CalendarDate, parseDate } from "@internationalized/date";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import {
  Button as AriaButton,
  Dialog,
  DialogTrigger,
  I18nProvider,
  Popover,
} from "react-aria-components";

export function formatIsoToThaiSlashDate(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${Number(y) + 543}`;
}

export interface DatePickerFieldProps {
  value: string;
  onChange: (isoDate: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  maxValue?: CalendarDate;
  minValue?: CalendarDate;
  isInvalid?: boolean;
  allowClear?: boolean;
  formatDisplay?: (isoDate: string) => string;
  className?: string;
  placement?: "bottom start" | "bottom end";
}

export function DatePickerField({
  value,
  onChange,
  placeholder = "dd / mm / yy",
  ariaLabel = "เลือกวันที่",
  maxValue,
  minValue,
  isInvalid = false,
  allowClear = false,
  formatDisplay = formatIsoToThaiSlashDate,
  className,
  placement = "bottom start",
}: DatePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  const parsedValue = (() => {
    if (!value) return undefined;
    try {
      return parseDate(value);
    } catch {
      return undefined;
    }
  })();

  return (
    <div className="relative flex w-full items-center">
      <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
        <AriaButton
          aria-label={ariaLabel}
          className={cn(
            "flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-gray-400 bg-white px-3.5 py-2.5 text-left text-sm transition outline-none",
            "hover:border-anyprimary-green-700 hover:bg-emerald-50/20",
            "focus:border-anyprimary-green-700 focus:ring-4 focus:ring-anyprimary-green-700/15",
            isInvalid &&
              "border-red-500 ring-2 ring-red-500/20 focus:border-red-500 focus:ring-red-500/20",
            allowClear && value && "pr-9",
            className
          )}
        >
          <span
            className={cn(
              "truncate",
              value ? "text-black" : "text-gray-400"
            )}
          >
            {value ? formatDisplay(value) : placeholder}
          </span>
          <CalendarIcon className="size-4 shrink-0 text-gray-500" />
        </AriaButton>

        <Popover placement={placement} offset={6} className="z-50 outline-none">
          <Dialog className="outline-none">
            <I18nProvider locale="th-TH-u-ca-gregory">
              <Calendar
                aria-label={ariaLabel}
                maxValue={maxValue}
                minValue={minValue}
                value={parsedValue}
                onChange={(dateValue) => {
                  onChange(dateValue.toString());
                  setIsOpen(false);
                }}
                className="w-[330px] sm:w-[350px]"
              >
                <CalendarHeader className="justify-between gap-1.5">
                  <NavButton slot="previous" />
                  <div className="flex flex-1 items-center justify-center gap-2">
                    <CalendarMonthPicker />
                    <CalendarYearPicker />
                  </div>
                  <NavButton slot="next" />
                  <CalendarHeading className="sr-only" />
                </CalendarHeader>
                <CalendarGrid>
                  <CalendarGridHeader />
                  <CalendarGridBody>
                    {(date) => <CalendarCell date={date} />}
                  </CalendarGridBody>
                </CalendarGrid>
              </Calendar>
            </I18nProvider>
          </Dialog>
        </Popover>
      </DialogTrigger>

      {allowClear && value && (
        <button
          type="button"
          aria-label="ล้างวันที่"
          onClick={(e) => {
            e.stopPropagation();
            onChange("");
          }}
          className="absolute right-8 flex size-5 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
