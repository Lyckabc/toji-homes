
npm run dev
# 브라우저에서 http://localhost:4321/about/ 등

npm run build && npm run preview
# 정적 결과와 동일하게 확인

docker build -t toji-homes:local .
docker run --rm -p 8080:80 toji-homes:local
# http://localhost:8080/ , /about/ , /ko/ …