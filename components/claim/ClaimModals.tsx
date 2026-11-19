"use client";

import { Input } from "@/components/tailgrids/core/input";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { cn } from "@/utils/cn";
import { Dialog, Modal } from "react-aria-components";

export type ClaimModalType =
  | null
  | "unsaved_back"
  | "unsaved_reset"
  | "confirm_save"
  | "confirm_delete";

interface ClaimModalsProps {
  modalType: ClaimModalType;
  deleteConfirmText: string;
  onChangeDeleteConfirmText: (value: string) => void;
  onClose: () => void;
  onConfirmLeaveToDashboard: () => void;
  onConfirmResetForm: () => void;
  onConfirmSaveClaim: () => void;
  onConfirmCancelClaim: () => void;
}

export function ClaimModals({
  modalType,
  deleteConfirmText,
  onChangeDeleteConfirmText,
  onClose,
  onConfirmLeaveToDashboard,
  onConfirmResetForm,
  onConfirmSaveClaim,
  onConfirmCancelClaim,
}: ClaimModalsProps) {
  const canDelete = deleteConfirmText.trim() === "ยืนยัน";

  return (
    <Backdrop
      isOpen={modalType !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      className="flex items-center justify-center p-4"
    >
      <Modal className="w-full max-w-[440px] outline-none">
        <Dialog className="rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-2xl outline-none">
          {/* Popup 1: ข้อมูลยังไม่ถูกบันทึก (กดกลับหน้าภาพรวม หรือ กดยกเลิกฟอร์ม) */}
          {(modalType === "unsaved_back" || modalType === "unsaved_reset") && (
            <>
              <div className="mx-auto mb-5 flex size-16 rotate-45 items-center justify-center rounded-2xl border-[5px] border-[#c5b358]">
                <span className="-rotate-45 text-3xl font-bold text-[#c5b358]">
                  !
                </span>
              </div>
              <h3 className="text-xl font-bold text-black">
                {modalType === "unsaved_back"
                  ? "ข้อมูลยังไม่ถูกบันทึก"
                  : "ยืนยันการล้างข้อมูล"}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {modalType === "unsaved_back" ? (
                  <>
                    ข้อมูลที่คุณกรอกยังไม่ได้ส่งเบิก
                    <br />
                    ต้องการออกจากหน้านี้ใช่หรือไม่?
                  </>
                ) : (
                  <>
                    ข้อมูลที่คุณกรอกในฟอร์มจะถูกล้างทั้งหมด
                    <br />
                    ต้องการดำเนินการต่อใช่หรือไม่?
                  </>
                )}
              </p>
              <div className="mt-7 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-w-28 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  แก้ไขต่อ
                </button>
                <button
                  type="button"
                  onClick={
                    modalType === "unsaved_back"
                      ? onConfirmLeaveToDashboard
                      : onConfirmResetForm
                  }
                  className="min-w-32 rounded-xl bg-[#d94442] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#b93230]"
                >
                  {modalType === "unsaved_back" ? "ใช่" : "ล้างข้อมูล"}
                </button>
              </div>
            </>
          )}

          {/* Popup 2: ยืนยันการยื่นเบิกสวัสดิการ */}
          {modalType === "confirm_save" && (
            <>
              <div className="mx-auto mb-5 flex size-16 rotate-45 items-center justify-center rounded-2xl border-[5px] border-[#c5b358]">
                <span className="-rotate-45 text-3xl font-bold text-[#c5b358]">
                  !
                </span>
              </div>
              <h3 className="text-xl font-bold text-black">
                ยืนยันการยื่นเบิกสวัสดิการ
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                คุณต้องการส่งคำขอเบิกสวัสดิการนี้ใช่หรือไม่?
                <br />
                โปรดตรวจสอบความถูกต้องก่อนกดยืนยัน
              </p>
              <div className="mt-7 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-w-28 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={onConfirmSaveClaim}
                  className="min-w-32 rounded-xl bg-anyprimary-green-700 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#0c4337]"
                >
                  ยืนยันการเบิก
                </button>
              </div>
            </>
          )}

          {/* Popup 3: ยืนยันการยกเลิกคำขอเบิก */}
          {modalType === "confirm_delete" && (
            <>
              <div className="mx-auto mb-5 flex size-16 rotate-45 items-center justify-center rounded-2xl border-[5px] border-[#d94442]">
                <span className="-rotate-45 text-3xl font-bold text-[#d94442]">
                  !
                </span>
              </div>
              <h3 className="text-xl font-bold text-black">
                ยืนยันการยกเลิกคำขอ
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำขอเบิกนี้?
                <br />
                การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>

              <div className="mt-5 text-left">
                <label className="mb-1.5 block pl-2 text-xs text-gray-500">
                  กรุณาพิมพ์ “ยืนยัน” เพื่อยกเลิกคำขอ
                </label>
                <Input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => onChangeDeleteConfirmText(e.target.value)}
                  placeholder="พิมพ์คำว่า  ยืนยัน  ที่นี่"
                  className="w-full rounded-full border-[#d94442] bg-white px-4 py-2 text-center text-sm text-black placeholder:text-gray-400 focus:border-[#d94442] focus:ring-[#d94442]/15"
                />
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-w-28 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  disabled={!canDelete}
                  onClick={onConfirmCancelClaim}
                  className={cn(
                    "min-w-32 rounded-xl px-6 py-2.5 text-sm font-medium text-white transition",
                    canDelete
                      ? "bg-[#d94442] hover:bg-[#b93230]"
                      : "cursor-not-allowed bg-gray-400 opacity-85"
                  )}
                >
                  ยกเลิกคำขอ
                </button>
              </div>
            </>
          )}
        </Dialog>
      </Modal>
    </Backdrop>
  );
}
