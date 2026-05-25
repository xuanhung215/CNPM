export enum GradingStatus {
  BAN_NHAP = 'BAN_NHAP', // Draft (Student)
  CHO_BCS = 'CHO_BCS',   // Pending Class Monitor/Officer approval
  CHO_CVHT = 'CHO_CVHT', // Pending Class Advisor approval
  HOAN_THANH = 'HOAN_THANH', // Approved and Finalized
}

export enum UserRole {
  ADMIN = 'admin',
  CVHT = 'cvht',       // Cố vấn học tập
  BCS = 'bcs',         // Ban cán sự
  SINHVIEN = 'sinhvien'
}
