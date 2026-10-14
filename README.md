# 과천외고 2학년 화법과 언어 온라인 시험

학생용 시험 세 탭과 교사용 성적 관리를 제공합니다.

| 메뉴 | 접속 주소 | 현행 문항 수 |
|---|---|---:|
| 음운 수업자료 핵심 응용 | https://trier442.github.io/gch/ | 73 |
| 박시언 교과서 핵심·응용 | https://trier442.github.io/gch/textbook.html | 180 |
| 최종 파이널 원문 시험 | https://trier442.github.io/gch/final62.html | 62 |
| 교사용 성적 조회 | https://trier442.github.io/gch/teacher.html | 누적 응시 결과 |

## 학생 화면
- 배곧고 시험 사이트를 참고한 **좌측 단원 메뉴 + 우측 문제 카드** 구성입니다.
- 각 보기 클릭 **즉시 정오답/정답/상세 해설** 표시, 오답노트 자동 누적, 재시험, 진행률 기록 기능이 있습니다.
- 교과서는 기존 1,070개 문항 중 기본 정의·동일 유형 반복을 배제하고 **기존 문항 자체를 변경하지 않은 180개 응용·적용 문항**만 노출합니다.
- 음운 수업자료는 기존 문제은행에서 73개를 선별합니다.
- 최종 파이널 시험은 사용자가 첨부한 원본 62문항을 생략·변형하지 않고 **원본 문제 이미지 62개/해설 이미지 62개/제시문 원본 전체 페이지 21개**를 사용합니다. 정답 번호는 원본 교사용 정답표를 따릅니다.
- 학생 브라우저에 오답이 보관되며, 시험 전체 완료 후 성적 제출 버튼으로 서버에 교사용 보고서를 전송할 수 있습니다.

## 파일
- `index.html`, `textbook.html`, `final62.html`: 학생 세 탭
- `quiz-ui.css`, `quiz-core.js`: 공통 화면/즉시 채점/오답노트
- `curated_phonology.js`, `curated_textbook.js`: 선별 문제 ID (원 데이터 그대로)
- `data.js`, `textbook_q1.js`~`textbook_q12.js`: 기존 원 데이터
- `final_data.js`, `final_media1.js`~`final_media23.js`: 원문 파이널 문제·정답·원본 해설
- `config.js`, `teacher.html`, `setup.sql`: Supabase 연결 및 교사용 성적 관리

## 공개 및 성적 수집
GitHub Pages가 꺼져 있다면 GitHub 저장소의 **Settings → Pages → Deploy from a branch → main / (root) → Save**에서 먼저 켜야 위 공개 URL이 열립니다.

Supabase 프로젝트에는 `exam_results` 및 `teacher_allowlist`가 이미 구성되어 있습니다. 교사용 로그인을 위해 인증 계정 등록 및 허용 이메일 검증이 필요합니다. 공개 설정 파일에 service_role/secret 키는 절대로 넣지 마세요.

## 검수
- 텍스트 180문항: 12개 단원, 정답 번호 범위 및 선택지 검증.
- 음운 73문항: 7개 단원, 원 문제은행 정답 인덱스 유지.
- 원문 파이널 62문항: 원본 페이지 매핑 및 145개 이미지 디코딩 확인.
- 세 탭 모두 클릭 즉시 정오답·해설·오답 재풀이 브라우저 렌더링 테스트 수행.
