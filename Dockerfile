FROM node:18 AS build

WORKDIR /app
COPY . .
COPY .env .env

# 의존성 설치 (peer 문제 우회)
RUN npm install --legacy-peer-deps

# 빌드
RUN npm run build

# 정식 Nginx 이미지로 배포
FROM nginx:alpine

# dist를 Nginx가 제공할 수 있도록 복사
COPY --from=build /app/dist /usr/share/nginx/html

# 필요시 nginx 설정도
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
