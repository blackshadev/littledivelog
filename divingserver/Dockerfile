FROM node:lts-alpine
# ENV HTTP-PORT 80
# ENV HTTP-CORS 0

# ENV DB-HOST localhost
# ENV DB-DATABASE postgres
# ENV DB-USERNAME postgres
# ENV DB-PASSWORD 
# ENV DB-PORT 5432

# ENV JWT-SECRET
# ENV JWT-ISSUER

WORKDIR /app
COPY node_modules /app/
COPY build /app/

EXPOSE 80
CMD ["node" "build/app.js"]