.PHONY: $(MAKECMDGOALS)

all: build format lint test

build:
	cd client && pnpm install && pnpm run build
	cd server && pnpm install
	make prisma

format:
	cd client && pnpm format && cd .. && cd server && pnpm format && \
	pnpm prisma format

lint:
	cd server && pnpm tsc

prisma:
	cd server && pnpm prisma migrate deploy && pnpm prisma generate
