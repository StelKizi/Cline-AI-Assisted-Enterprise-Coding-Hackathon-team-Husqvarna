FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN npm install --ignore-scripts
ENV NEXT_TELEMETRY_DISABLED=1
ENV KYRA_API_URL=https://kyra-api-1047267022876.us-central1.run.app
ENV COMPLIANCE_API_URL=https://kyra-compliance-1047267022876.us-central1.run.app
RUN npx turbo run build --filter=@kyra/console

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3838
COPY --from=build /app/apps/console/.next/standalone ./
COPY --from=build /app/apps/console/.next/static ./apps/console/.next/static
EXPOSE 3838
CMD ["node", "apps/console/server.js"]
