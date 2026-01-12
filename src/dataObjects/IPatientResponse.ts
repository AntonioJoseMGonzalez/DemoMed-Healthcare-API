import type { Patient } from './IPatient'
import type { Pagination } from './IPagination'
import type { Metadata } from './IMetadata'
export interface PatientResponse {
  total_records: number
  patients: Patient[]
  data: Patient[]
  pagination: Pagination
  metadata: Metadata
}
