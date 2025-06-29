enviroment=dev
export DOPPLER_TOKEN_TEMP="${DOPPLER_TOKEN:-$(doppler configs tokens create temp_dev --project moz_school --config dev --plain --max-age 20m)}"

doppler run -- docker compose build --parallel && \
doppler run -- docker compose up