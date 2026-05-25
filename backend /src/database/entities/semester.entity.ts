export class SemesterEntity {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  han_sv_tu_cham: Date; // Deadline for student self-grading
  han_bcs_cham: Date;   // Deadline for class monitor
  han_cvht_cham: Date;  // Deadline for class advisor
  createdAt: Date;
  updatedAt: Date;
}
