all: run

re-dev: clean run-dev

re: clean run

run: down
	@echo "Building and running the app"
	COMMAND="npm run start" docker-compose up --build

run-dev: down
	@echo "Building and running the app in development mode"
	COMMAND="npm run start:dev" docker-compose up --build
down :
	@echo "Stopping the app"
	docker compose down --rmi all --volumes

clean: down
	@echo "Cleaning up"
	docker system prune -af

.PHONY: all setup run down