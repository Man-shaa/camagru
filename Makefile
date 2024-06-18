all: run

re: clean run

setup:
	@echo "setup config files"
	cd config && npm install

run : down
	@echo "Building and running the app"
	docker-compose up --build

down :
	@echo "Stopping the app"
	docker compose down --rmi all --volumes

clean: down
	@echo "Cleaning up"
	docker system prune -af

.PHONY: all setup run down