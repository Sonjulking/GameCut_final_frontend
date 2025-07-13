# 생성됨 - 2025-07-11 생성됨
FROM node:20.18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사 (캐시 최적화)
COPY package*.json ./

# 의존성 설치 (peer dependency 충돌 해결)
RUN npm install --legacy-peer-deps

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 5173

# 개발 서버 실행 (호스트를 0.0.0.0으로 설정해야 컨테이너 외부에서 접근 가능)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
