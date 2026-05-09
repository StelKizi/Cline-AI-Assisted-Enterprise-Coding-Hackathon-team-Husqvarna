FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN npm install --ignore-scripts
RUN npx turbo run build --filter=@kyra/api

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/ ./packages/
COPY --from=build /app/kyra-mcp/design_system/ ./kyra-mcp/design_system/
COPY --from=build /app/turbo.json ./turbo.json
COPY --from=build /app/apps/api/public ./public
EXPOSE 3737
CMD ["node", "dist/server.js"]
