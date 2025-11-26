-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.ai_mentor_logs (
  log_id integer NOT NULL DEFAULT nextval('ai_mentor_logs_log_id_seq'::regclass),
  user_id integer NOT NULL,
  query text NOT NULL,
  ai_response text,
  context_type character varying,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_mentor_logs_pkey PRIMARY KEY (log_id),
  CONSTRAINT ai_mentor_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.applications (
  app_id integer NOT NULL DEFAULT nextval('applications_app_id_seq'::regclass),
  job_id integer NOT NULL,
  student_id integer NOT NULL,
  resume_id integer,
  status USER-DEFINED DEFAULT 'pending'::application_status,
  cover_letter text,
  applied_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT applications_pkey PRIMARY KEY (app_id),
  CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.recruiter_jobs(job_id),
  CONSTRAINT applications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(user_id),
  CONSTRAINT applications_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.resumes(resume_id)
);
CREATE TABLE public.ats_analysis_history (
  id integer NOT NULL DEFAULT nextval('ats_analysis_history_id_seq'::regclass),
  user_id integer NOT NULL,
  resume_text text NOT NULL,
  job_description text NOT NULL,
  overall_score integer NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  analysis_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  suggestions jsonb NOT NULL DEFAULT '{}'::jsonb,
  detailed_feedback text,
  model_version character varying DEFAULT 'girishwangikar/ResumeATS'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ats_analysis_history_pkey PRIMARY KEY (id),
  CONSTRAINT ats_analysis_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.ats_results (
  ats_id integer NOT NULL DEFAULT nextval('ats_results_ats_id_seq'::regclass),
  resume_id integer NOT NULL,
  job_description text,
  matching_keywords ARRAY,
  missing_keywords ARRAY,
  overall_score numeric DEFAULT 0.00,
  suggestions text,
  analysis_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ats_results_pkey PRIMARY KEY (ats_id),
  CONSTRAINT ats_results_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.resumes(resume_id)
);
CREATE TABLE public.attempt_answers (
  answer_id integer NOT NULL DEFAULT nextval('attempt_answers_answer_id_seq'::regclass),
  attempt_id integer,
  question_id integer,
  user_answer text,
  correct boolean,
  CONSTRAINT attempt_answers_pkey PRIMARY KEY (answer_id),
  CONSTRAINT attempt_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.attempts(attempt_id),
  CONSTRAINT attempt_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id)
);
CREATE TABLE public.attempts (
  attempt_id integer NOT NULL DEFAULT nextval('attempts_attempt_id_seq'::regclass),
  quiz_id integer,
  user_id integer,
  score integer,
  max_score integer,
  duration_sec integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT attempts_pkey PRIMARY KEY (attempt_id),
  CONSTRAINT attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id),
  CONSTRAINT attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.code_ide (
  ide_id integer NOT NULL DEFAULT nextval('code_ide_ide_id_seq'::regclass),
  user_id integer NOT NULL,
  project_name character varying NOT NULL,
  language character varying,
  code_snippet text,
  last_run_output text,
  project_data jsonb,
  last_updated timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT code_ide_pkey PRIMARY KEY (ide_id),
  CONSTRAINT code_ide_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.leaderboard (
  id integer NOT NULL DEFAULT nextval('leaderboard_id_seq'::regclass),
  quiz_id integer,
  user_id integer,
  score integer,
  time_taken_sec integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT leaderboard_pkey PRIMARY KEY (id),
  CONSTRAINT leaderboard_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id),
  CONSTRAINT leaderboard_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.mock_interviews (
  interview_id integer NOT NULL DEFAULT nextval('mock_interviews_interview_id_seq'::regclass),
  student_id integer NOT NULL,
  mentor_id integer,
  scheduled_date timestamp with time zone,
  feedback text,
  rating numeric NOT NULL DEFAULT 0 CHECK (rating >= 0::numeric AND rating <= 5::numeric),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mock_interviews_pkey PRIMARY KEY (interview_id),
  CONSTRAINT mock_interviews_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(user_id),
  CONSTRAINT mock_interviews_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.placement_prep (
  prep_id integer NOT NULL DEFAULT nextval('placement_prep_prep_id_seq'::regclass),
  user_id integer NOT NULL,
  topic character varying NOT NULL,
  progress_percentage numeric DEFAULT 0.00,
  mentor_id integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT placement_prep_pkey PRIMARY KEY (prep_id),
  CONSTRAINT placement_prep_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT placement_prep_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.questions (
  question_id integer NOT NULL DEFAULT nextval('questions_question_id_seq'::regclass),
  source character varying,
  type character varying DEFAULT 'mcq'::character varying,
  category character varying,
  difficulty character varying,
  question text NOT NULL,
  choices ARRAY,
  correct_answer text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT questions_pkey PRIMARY KEY (question_id)
);
CREATE TABLE public.quiz_assignments (
  assignment_id integer NOT NULL DEFAULT nextval('quiz_assignments_assignment_id_seq'::regclass),
  quiz_id integer NOT NULL,
  user_id integer NOT NULL,
  assigned_at timestamp with time zone DEFAULT now(),
  status character varying DEFAULT 'assigned'::character varying,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quiz_assignments_pkey PRIMARY KEY (assignment_id),
  CONSTRAINT quiz_assignments_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id),
  CONSTRAINT quiz_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.quiz_questions (
  id integer NOT NULL DEFAULT nextval('quiz_questions_id_seq'::regclass),
  quiz_id integer,
  question_id integer,
  position integer DEFAULT 1,
  CONSTRAINT quiz_questions_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id),
  CONSTRAINT quiz_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id)
);
CREATE TABLE public.quizzes (
  quiz_id integer NOT NULL DEFAULT nextval('quizzes_quiz_id_seq'::regclass),
  title character varying NOT NULL,
  description text,
  time_limit_sec integer,
  passing_score_percent integer,
  created_by integer,
  visibility character varying DEFAULT 'private'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quizzes_pkey PRIMARY KEY (quiz_id),
  CONSTRAINT quizzes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id)
);
CREATE TABLE public.recruiter_jobs (
  job_id integer NOT NULL DEFAULT nextval('recruiter_jobs_job_id_seq'::regclass),
  recruiter_id integer NOT NULL,
  title character varying NOT NULL,
  description text,
  requirements text,
  location character varying,
  salary_range character varying,
  job_type character varying,
  posted_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  job_tsv tsvector,
  CONSTRAINT recruiter_jobs_pkey PRIMARY KEY (job_id),
  CONSTRAINT recruiter_jobs_recruiter_id_fkey FOREIGN KEY (recruiter_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.resumes (
  resume_id integer NOT NULL DEFAULT nextval('resumes_resume_id_seq'::regclass),
  user_id integer NOT NULL,
  resume_name character varying NOT NULL,
  resume_file_path text,
  resume_data jsonb,
  ats_score numeric DEFAULT 0.00,
  last_updated timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  resume_tsv tsvector,
  template_id integer DEFAULT 0,
  color_scheme jsonb,
  CONSTRAINT resumes_pkey PRIMARY KEY (resume_id),
  CONSTRAINT resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.time_planner (
  planner_id integer NOT NULL DEFAULT nextval('time_planner_planner_id_seq'::regclass),
  user_id integer NOT NULL,
  task_name character varying NOT NULL,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  category USER-DEFINED DEFAULT 'other'::task_category,
  status USER-DEFINED DEFAULT 'pending'::task_status,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT time_planner_pkey PRIMARY KEY (planner_id),
  CONSTRAINT time_planner_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.users (
  user_id integer NOT NULL DEFAULT nextval('users_user_id_seq'::regclass),
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  role USER-DEFINED DEFAULT 'student'::user_role,
  password_hash character varying,
  user_uid character varying,
  CONSTRAINT users_pkey PRIMARY KEY (user_id)
);