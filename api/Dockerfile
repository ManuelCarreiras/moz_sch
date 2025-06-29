FROM python:3.11
WORKDIR /api

# Install Doppler CLI
RUN apt-get update && apt-get install -y apt-transport-https ca-certificates curl gnupg && \
    curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | apt-key add - && \
    echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list && \
    apt-get update && \
    apt-get -y install doppler

COPY requirements.txt ./
RUN python -m venv venv
RUN . venv/bin/activate
RUN pip install --no-cache-dir -r requirements.txt


COPY . .
RUN mkdir -p model/ecp/inspection_files

EXPOSE 5000
CMD ["doppler", "run", "--", \
     "gunicorn", \
     "-t 6000", "--workers=4", "-b 0.0.0.0:5000", \
     "--log-level=debug", \
     "wsgi:app"]
ENV PYTHONUNBUFFERED=1