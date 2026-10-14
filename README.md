# 과천외고 2학년 화법과 언어 실력 측정 사이트

이 저장소는 사용자가 첨부한 **「음운단원 수업자료 수정.pdf」**만을 바탕으로 구성한 226문항 시험 사이트입니다. 경기외고의 다른 문서는 사용하지 않았습니다.

## 화면 주소 (GitHub Pages가 활성화된 후)
- 학생용 시험: https://trier442.github.io/gch/
- 교사용 성적 관리: https://trier442.github.io/gch/teacher.html
- 소스 코드: https://github.com/trier442/gch

## GitHub Pages 공개 설정
1. GitHub에서 이 저장소의 **Settings → Pages**를 엽니다.
2. **Build and deployment → Source: Deploy from a branch**로 지정합니다.
3. **Branch: main / (root)**를 선택하고 **Save**를 누릅니다.
4. 발행이 완료되면 위 주소로 접속합니다.

## 파일 구성
- `index.html`: 학생 이름/반 입력, 단원별 응시, 자동채점, 오답 확인, 성적 제출
- `teacher.html`: 선생님 로그인, 학생별 점수/오답 목록, 검색 및 CSV
- `data.js`: 첨부 PDF 기반 226문항과 자료 데이터
- `questions.json`, `sources.json`: 문제은행 및 근거 자료
- `config.js`: Supabase 연결 설정
- `setup.sql`: 결과 저장 테이블 및 기본 RLS 정책

## 교사용 성적 자동 수집 — 추가 설정 필요
**GitHub Pages에 업로드하는 것만으로 학생들의 성적이 선생님에게 모이지는 않습니다.** 서로 다른 기기의 성적을 수집하려면 별도의 데이터베이스를 연결해야 합니다.

1. Supabase 프로젝트를 생성하고 SQL Editor에서 `setup.sql`을 실행합니다.
2. Supabase Authentication에서 선생님 이메일 계정을 생성합니다.
3. 아래의 `TEACHER_EMAIL@example.com`을 선생님 이메일로 바꾸어 SQL Editor에서 실행합니다.
   ```sql
   create policy "teacher_reads_results" on public.exam_results for select to authenticated
   using (auth.jwt() ->> 'email' = 'TEACHER_EMAIL@example.com');
   ```
4. `config.js`에 Supabase Project URL과 **publishable/anon key**를 입력합니다. **service_role/secret 키는 절대 업로드하지 마세요.**
5. 시험 제출 후 선생님 계정으로 `teacher.html`에 로그인하여 성적과 오답을 확인합니다.

**주의:** 설정 전에는 학생 결과가 서버로 자동 전송되지 않습니다. 학생 이름·반·성적은 개인정보에 해당하므로 동의 안내, 보존 기간 및 접근 통제를 먼저 마련하세요. 현재 익명 제출 API는 신원 확인·스팸 방지가 없어 실제 운영 시 CAPTCHA, 사용량 제한 및 학생 인증이 필요합니다.
