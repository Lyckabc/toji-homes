# Troubleshooting: toji.homes와 gopedia.toji.homes가 같은 화면 표시

**발생일**: 2026-05-08  
**증상**: `https://toji.homes` 접속 시 메인 홈페이지 대신 `gopedia.toji.homes`와 동일한 gopedia 화면이 표시됨. 동시에 `https://toji.homes/histories/lyckabc` 접속 시 404 응답.

---

## 증상 요약

| URL | 기대 결과 | 실제 결과 |
|-----|-----------|-----------|
| `toji.homes` | 메인 홈페이지 | gopedia 화면 |
| `gopedia.toji.homes` | gopedia 화면 | gopedia 화면 (정상) |
| `toji.homes/histories/lyckabc` | 디지털 명함 | 404 |

---

## 근본 원인

### nginx `default_server` 미지정 — 첫 번째 server block이 암묵적 default

nginx는 요청의 `Host` 헤더와 일치하는 `server_name`이 없을 때 **`default_server`로 지정된 블록**으로 요청을 보낸다.  
`default_server`가 명시된 블록이 없으면 **설정 파일에서 가장 먼저 선언된 server block**이 암묵적 default가 된다.

```
# 문제가 된 nginx/default.conf 구조

server {
    listen 80;
    server_name gopedia.toji.homes;   # ← 첫 번째 블록
    root /usr/share/nginx/html/gopedia-site;
    ...
}

server {
    listen 80;
    server_name _;                    # ← catch-all 의도였으나
    root /usr/share/nginx/html;       #   default_server 미지정
    ...
}
```

`toji.homes`로 들어오는 요청의 `Host: toji.homes`는 두 번째 블록의 `server_name _`와 매칭되어야 하지만, nginx는 `_`를 "아무것도 매칭되지 않을 때의 fallback"이 아닌 **단순 문자열 패턴**으로 취급한다.

`default_server`가 없는 상태에서 nginx가 요청을 처리하는 순서:

```
1. Host 헤더로 server_name 매칭 시도
   - gopedia.toji.homes → server_name gopedia.toji.homes 일치 → gopedia 블록 처리
   - toji.homes         → 어느 server_name과도 일치하지 않음
                          ↓
2. default_server 블록으로 폴백
   - default_server 미지정 → 첫 번째 블록(gopedia)이 암묵적 default
                          ↓
3. toji.homes 요청이 gopedia 블록에서 처리됨 → gopedia 화면 응답
```

---

## 진단 방법

```bash
# 실행 중인 nginx pod의 실제 설정 확인
kubectl exec -n homepage <homepage-pod-name> -- \
  cat /etc/nginx/conf.d/default.conf

# server 블록 listen 지시어만 빠르게 확인
kubectl exec -n homepage <homepage-pod-name> -- \
  nginx -T | grep -E "listen|server_name"

# nginx 설정 문법 검사
kubectl exec -n homepage <homepage-pod-name> -- nginx -t
```

---

## 수정

`server_name _` 블록에 `default_server` 지시어를 추가한다.

```nginx
# 수정 전
server {
    listen 80;
    server_name _;
    ...
}

# 수정 후
server {
    listen 80 default_server;   # ← default_server 추가
    server_name _;
    ...
}
```

이후 ConfigMap 동기화 및 롤아웃 재시작으로 반영:

```bash
kubectl create configmap homepage-nginx-conf \
  --from-file=default.conf=nginx/default.conf \
  -n homepage --dry-run=client -o yaml | kubectl apply -f -

kubectl rollout restart deployment/homepage -n homepage
```

---

## nginx server block 선택 규칙 정리

| 우선순위 | 조건 | 설명 |
|----------|------|------|
| 1 | `listen IP:port` + `server_name` 정확 일치 | IP까지 지정된 블록 |
| 2 | `server_name` 정확 일치 | Host 헤더와 완전히 일치 |
| 3 | `server_name *.example.com` 와일드카드 앞 일치 | |
| 4 | `server_name mail.*` 와일드카드 뒤 일치 | |
| 5 | `server_name ~^regex$` 정규식 일치 | 선언 순서대로 평가 |
| 6 | **`default_server`** | 위 중 아무것도 매칭 안 될 때 |
| 7 | 미지정 시 **첫 번째 server block** | 암묵적 fallback — 함정 |

`server_name _`는 특수 패턴이 아니라 단순히 "절대 매칭될 수 없는 이름"으로 관용적으로 사용되는 것이며, 실제 fallback 동작은 `default_server`가 보장한다.

---

## 재발 방지

1. **여러 server block을 사용할 때는 반드시 catch-all 블록에 `default_server` 명시** — `server_name _`만으로는 실제 default 동작이 보장되지 않음.
2. **nginx 설정 변경 후 `nginx -t`로 문법 검사**, 그리고 각 도메인에 `curl -H "Host: ..."` 로 실제 응답 확인.
3. **ConfigMap으로 nginx 설정을 관리하는 경우 파이프라인에서 ConfigMap 동기화**를 배포 스텝에 포함(`.woodpecker.yml` 참고).
