.PHONY: fresh test lint analyse format

## Wipe the database, re-run all migrations, and seed
fresh:
	php artisan migrate:fresh --seed

## Run all Pest tests with coverage (requires Xdebug)
test:
	php artisan test --coverage --min=80

## Check code style without making changes
lint:
	./vendor/bin/pint --test

## Apply code style fixes
format:
	./vendor/bin/pint

## Run Larastan static analysis at level 8
analyse:
	./vendor/bin/phpstan analyse --memory-limit=512M
