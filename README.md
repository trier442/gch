# 과천외고 화법과 언어 — 학생 시험 + 교사용 성적 관리

- `index.html`: 학생 응시 페이지 (이름/반 입력, 시험, 오답 확인, 결과 제출)
- `teacher.html`: 교사 전용 로그인, 성적 목록, 검색/단원 필터, 학생별 오답 상세, CSV 저장
- `data.js`, `questions.json`, `sources.json`: 기존 과천외고 음운단원 사이트의 문제은행 및 원문 자료 유지. 다른 경기외고 파일을 추가하지 않음.
- `config.js`: Supabase 프로젝트 URL 및 공개 anon key 설정
- `setup.sql`: Supabase 성적 테이블 및 학생 제출 정책

## 실제로 선생님에게 결과가 전달되게 설정하기
1. Supabase 프로젝트를 만들고 SQL Editor에서 `setup.sql` 실행.
2. Authentication > Users에 교사 이메일 계정 생성.
3. SQL Editor에서 아래 문장의 이메일을 실제 교사 이메일로 바꿔 실행:

```sql
create policy "teacher_reads_results" on public.exam_results for select to authenticated
using (auth.jwt() ->> 'email' = '교사이메일@example.com');
```

4. Supabase Project Settings의 URL과 **publishable/anon 키**를 `config.js`에 입력. `service_role` 또는 `secret` 키는 절대 넣지 마세요.
5. 이 폴더의 모든 파일을 같은 GitHub Pages 경로에 올립니다. 학생에게 `index.html`, 교사에게 `teacher.html` URL을 안내합니다.

## 주의
- 연동 설정 전에는 **자동 전송되지 않으며**, 학생 브라우저의 학습 기록과 CSV 저장만 가능합니다.
- 교사용 페이지는 단순히 URL을 숨기는 방식이 아니라 Supabase RLS와 교사 로그인으로 조회를 제한합니다.
- 현재 공개 학생 제출 API에는 별도의 스팸 방지/학생 신원 검증이 없습니다. 실제 운영 시 Edge Function, CAPTCHA, 요청 제한, 학생 인증을 추가해야 합니다.
- 학생 개인정보 수집 안내와 동의, 보관 기간·삭제 정책, 접근 권한 관리를 정한 뒤 운영하세요.
- 서버 기록은 최근 1,000건 조회 기준입니다. 대규모 사용 시 페이지네이션을 추가해야 합니다.
