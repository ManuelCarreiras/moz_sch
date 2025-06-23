FROM python:3.10-slim
WORKDIR /app/api
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh
ENV PYTHONPATH=/app
EXPOSE 5000
CMD ["python", "app.py"] 