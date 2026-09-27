.PHONY: dev infra seed test reset logs config

# Full stack (Postgres + Redis + api + web) in Docker.
dev:
	docker compose -f docker-compose.dev.yml up -d

# Infrastructure only (Postgres + Redis) - pair with `npm run dev` on the host.
infra:
	docker compose -f docker-compose.yml up -d

seed:
	docker compose -f docker-compose.dev.yml exec -T api sh -c "npx ts-node scripts/seed.ts"

test:
	npm run test

# Validate both compose files without starting anything. Runs in CI too.
config:
	docker compose -f docker-compose.yml config -q
	docker compose -f docker-compose.dev.yml config -q

reset:
	docker compose -f docker-compose.dev.yml down -v --remove-orphans
	docker compose -f docker-compose.dev.yml rm -f -v

logs:
	docker compose -f docker-compose.dev.yml logs -f
