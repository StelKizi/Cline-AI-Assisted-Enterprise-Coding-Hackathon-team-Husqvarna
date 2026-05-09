FROM node:20-slim AS build
WORKDIR /app
COPY package.json tsconfig.json tsconfig.base.json ./
COPY apps/mcp-server/package.json apps/mcp-server/
COPY packages/ packages/
RUN npm install --workspace=apps/mcp-server --include-workspace-root
COPY apps/mcp-server/ apps/mcp-server/
RUN cd apps/mcp-server && npx tsc

FROM node:20-slim
WORKDIR /app
COPY --from=build /app/apps/mcp-server/dist ./dist
COPY --from=build /app/apps/mcp-server/package.json ./
COPY --from=build /app/node_modules ./node_modules
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/sse.js"]
