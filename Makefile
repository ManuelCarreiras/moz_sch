deploy:
	sh deploy.sh

dev-api-container:
	docker compose stop api || true
	docker compose rm -f api || true
	@echo "Running dev-api for IDE=$(IDE)"
	@if [ "$(IDE)" = "cursor" ]; then \
		echo "Opening in Cursor..."; \
		cursor api; \
	elif [ "$(IDE)" = "vscode" ]; then \
		echo "Opening in VS Code..."; \
		code ./api; \
	else \
		echo "No IDE specified (IDE=$(IDE))"; \
		echo "Please run with: make dev-api IDE=cursor  or  make dev-api IDE=vscode"; \
		exit 1; \
	fi

test-unittests:
	sh .scripts/test-unittest.sh