FROM python:3.12-alpine

ENV PORT=8080

WORKDIR /app

COPY index.html ./
COPY css ./css
COPY js ./js
COPY assets ./assets

EXPOSE 8080

CMD ["sh", "-c", "[ -n \"$TECNICOS_JSON\" ] && printf '%s' \"$TECNICOS_JSON\" > /app/assets/tecnicos.json; [ -n \"$EMPRESAS_JSON\" ] && printf '%s' \"$EMPRESAS_JSON\" > /app/assets/empresas.json; [ -n \"$EQUIPAMENTOS_JSON\" ] && printf '%s' \"$EQUIPAMENTOS_JSON\" > /app/assets/equipamentos.json; exec python -m http.server ${PORT:-8080} --directory /app"]
