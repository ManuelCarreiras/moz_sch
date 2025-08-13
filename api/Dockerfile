# syntax=docker/dockerfile:1

FROM python:3.10

 

WORKDIR /app

 

# Install Doppler CLI (sem apt-key, usando signed-by)

RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
 && curl -sLf --retry 3 --tlsv1.2 --proto "=https" \
    'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' \
    | gpg --dearmor -o /usr/share/keyrings/doppler.gpg \
 && echo "deb [signed-by=/usr/share/keyrings/doppler.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" \
    > /etc/apt/sources.list.d/doppler-cli.list \
 && apt-get update \
 && apt-get -y install doppler \
 && rm -rf /var/lib/apt/lists/*


# Copiar dependências e instalar

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt


# Copiar resto do código

COPY . .

EXPOSE 5000

CMD ["doppler", "run", "--", \
     "gunicorn", "-t", "30", "--workers=4", "-b", "0.0.0.0:5000", \
     "--log-level=debug", \
     "wsgi:app"]

