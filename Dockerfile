# Node 18 환경
FROM node:18-alpine

WORKDIR /app

# 패키지 설치
COPY package.json package-lock.json* ./
RUN npm install

# 소스코드 복사 및 Next.js 운영(Production) 빌드
COPY . .
RUN npm run build

# 포트 개방 및 서버 실행
EXPOSE 3000
CMD ["npm", "start"]