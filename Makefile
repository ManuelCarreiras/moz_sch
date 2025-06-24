deploy:
	sh deploy.sh

dev-api-container:
	docker compose stop api && \
	docker compose rm api && \
	code ./api