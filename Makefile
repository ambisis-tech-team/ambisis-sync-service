make:
	@docker compose up -d --build

stop:
	@docker compose down -v

logs:
	@docker compose logs sync_service -f