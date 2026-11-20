/**
 * ฟังก์ชันช่วยค้นหาพนักงานจาก field ต่าง ๆ
 * ใช้กับข้อมูลพนักงานทั่วไป (EmployeeCardItem) และพนักงานเก่า (FormerEmployeeItem)
 */

export interface EmployeeSearchable {
  name?: string;
  nickname?: string;
  empCode?: string;
  position?: string;
  department?: string;
  email?: string;
  phone?: string;
}

/**
 * ตรวจสอบว่าข้อมูลพนักงานตรงกับคำค้นหาหรือไม่
 * ค้นหาจาก: name, nickname, empCode, position, department, email, phone
 *
 * @param employee - ข้อมูลพนักงาน
 * @param query - คำค้นหา (จะ convert เป็น lowercase อัตโนมัติ)
 * @returns true หากตรงกับคำค้นหา
 */
export function matchesEmployeeSearch(
  employee: EmployeeSearchable,
  query: string
): boolean {
  if (!query || query.trim() === "") return true;

  const q = query.trim().toLowerCase();

  const searchableFields = [
    employee.name,
    employee.nickname,
    employee.empCode,
    employee.position,
    employee.department,
    employee.email,
    employee.phone,
  ].filter((f): f is string => !!f);

  return searchableFields.some((field) =>
    field.toLowerCase().includes(q)
  );
}

/**
 * Filter weekly array ด้วยคำค้นหา
 *
 * @param items - array ของพนักงาน
 * @param query - คำค้นหา
 * @returns array ที่ตรงกับคำค้นหา
 */
export function filterEmployees<T extends EmployeeSearchable>(
  items: T[],
  query: string
): T[] {
  return items.filter((emp) => matchesEmployeeSearch(emp, query));
}