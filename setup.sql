-- Supabase SQL Editor에서 실행합니다. 교사는 Supabase Authentication에서 계정을 생성해야 합니다.
create table if not exists public.exam_results (
  id uuid primary key default gen_random_uuid(),
  student_name text not null check (char_length(student_name) between 1 and 30),
  student_group text not null default '' check (char_length(student_group) <= 30),
  exam_mode text not null,
  topic text not null,
  score integer not null check (score between 0 and 100),
  correct_count integer not null,
  total_count integer not null,
  elapsed_seconds integer not null,
  answers jsonb not null,
  submitted_at timestamptz not null default now()
);
create index if not exists exam_results_submitted_at_idx on public.exam_results (submitted_at desc);
alter table public.exam_results enable row level security;
-- 학생은 성적 제출(INSERT)만 허용, 열람/수정/삭제 불가
create policy "students_submit_only" on public.exam_results for insert to anon with check (true);
-- 교사용 이메일을 실제 계정 이메일로 바꾸세요. 이 정책 없이 교사도 조회할 수 없습니다.
-- create policy "teacher_reads_results" on public.exam_results for select to authenticated
-- using (auth.jwt() ->> 'email' = 'TEACHER_EMAIL@example.com');
-- 운영 시 스팸 방지(Edge Function/CAPTCHA), 학생 식별 검증, 보존 기간·삭제 정책 추가 권장.
