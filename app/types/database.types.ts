export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
            id: string // UUID
            email: string | null
            full_name: string | null
            role: string | null
            credits: number | null
            avatar_url: string | null
            created_at: string | null
            updated_at: string | null
        }
        Insert: {
            id: string // UUID
            email?: string | null
            full_name?: string | null
            role?: string | null
            credits?: number | null
            avatar_url?: string | null
            created_at?: string | null
            updated_at?: string | null
        }
        Update: {
            id?: string // UUID
            email?: string | null
            full_name?: string | null
            role?: string | null
            credits?: number | null
            avatar_url?: string | null
            created_at?: string | null
            updated_at?: string | null
        }
      }
      users: {
        Row: {
            user_id: number // Integer
            user_uid: string | null // UUID
            email: string
            name: string | null
            role: string | null
            credits: number | null
            created_at: string
        }
      }
      resumes: {
        Row: {
            resume_id: number
            user_id: number
            user_id_uuid?: string // UUID from migration
            resume_name: string
            resume_data: Json
            created_at: string
        }
      }
      quiz_assignments: {
          Row: {
              assignment_id: number
              user_id: number
              user_id_uuid?: string // UUID from migration
              quiz_id: number
              status: string
              assigned_at: string
          }
      },
      mock_interviews: {
          Row: {
              interview_id: number
              student_id: number
              student_id_uuid?: string // UUID from migration
              job_role: string
              scheduled_date: string
              status: string
              feedback_data: Json
          }
      },
      drive_applications: {
          Row: {
              id: number
              drive_id: number
              user_id: number
              user_id_uuid?: string
              resume_link: string
              cover_letter: string
              status: string
          }
      },
      parent_student_links: {
          Row: {
              id: string // UUID
              parent_id: string
              student_id: string
              created_at: string
              updated_at: string
          }
          Insert: {
              id?: string
              parent_id: string
              student_id: string
              created_at?: string
              updated_at?: string
          }
          Update: {
              id?: string
              parent_id?: string
              student_id?: string
              created_at?: string
              updated_at?: string
          }
      }
      // Add other tables as needed
    }
  }
}
