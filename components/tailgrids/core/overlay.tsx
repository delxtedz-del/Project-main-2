"use client";

import React from "react";
import { cn } from "@/utils/cn";
import {
  DialogTrigger as AriaDialogTrigger,
  Modal as AriaModal,
  Dialog as AriaDialog,
  ModalOverlay as AriaModalOverlay,
  type DialogTriggerProps as AriaDialogTriggerProps,
  type ModalOverlayProps as AriaModalOverlayProps,
  type ModalRenderProps as AriaModalRenderProps,
} from "react-aria-components";

export interface OverlayWrapperProps extends AriaDialogTriggerProps {}

export function OverlayWrapper({ ...props }: OverlayWrapperProps) {
  return <AriaDialogTrigger {...props} />;
}

export interface BackdropProps extends AriaModalOverlayProps {}

export function Backdrop({
  className,
  isDismissable = true,
  ...props
}: BackdropProps) {
  return (
    <AriaModalOverlay
      isDismissable={isDismissable}
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-200",
        "data-[entering]:opacity-0 data-[exiting]:opacity-0",
        className
      )}
      {...props}
    />
  );
}

export interface ModalContainerProps
  extends Omit<AriaModalOverlayProps, "children"> {
  children:
    | React.ReactNode
    | ((renderProps: AriaModalRenderProps) => React.ReactNode);
  modalClassName?: string;
  dialogClassName?: string;
}

export function ModalContainer({
  children,
  className,
  modalClassName,
  dialogClassName,
  isDismissable = true,
  ...props
}: ModalContainerProps) {
  return (
    <Backdrop isDismissable={isDismissable} className={className} {...props}>
      <AriaModal
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto",
          modalClassName
        )}
      >
        <AriaDialog
          className={cn(
            "w-full max-w-2xl rounded-[32px] bg-white p-7 md:p-8 shadow-2xl outline-none",
            "data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95",
            "data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
            dialogClassName
          )}
        >
          {children}
        </AriaDialog>
      </AriaModal>
    </Backdrop>
  );
}