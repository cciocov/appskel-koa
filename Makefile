DATETIME = `date +%Y%m%d%H%M%S`

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  keys                generate new security keys"
	@echo "  migration-<name>    create a new (generic) migration file"
	@echo "  table-<name>        create a new (table) migration file"
	@echo "  dbup                run pending migrations"
	@echo "  dbundo              revert the last migrations"
	@echo ""

# generate a new key for the autoupdate route and insert a new key in the keys
# ring used for cookie signing (max number of keys is 2, so older keys will be
# removed)
keys:
	@node -e "\
		var random = require('randomstring'), security = require('./config/security'); \
		security.autoupdateKey = random.generate(32); \
		security.keys.unshift(random.generate(32)); \
		security.keys.length = 2; \
		require('fs').writeFileSync('./config/security.json', JSON.stringify(security, null, 2)); \
		console.log('autoupdate key:', security.autoupdateKey); \
		console.log('security key:', security.keys[0]); \
		"

# similar to `sequelize migration:create --name ...`, but uses our own template
# migration file
migration-%:
	@mkdir -p database/migrations
	$(eval FILE := database/migrations/$(DATETIME)-$*.js)
	@cp database/skel-migration.js $(FILE)
	@vim $(FILE)

# similar to `sequelize migration:create --create=table ...`, but uses our own
# template migration file
table-%:
	@mkdir -p database/migrations
	$(eval FILE := database/migrations/$(DATETIME)-create_$*_table.js)
	@cp database/skel-table.js $(FILE)
	@sed -i '' 's/TABLE/$*/' $(FILE)
	@vim $(FILE)

# run pending migrations:
dbup:
	@node_modules/.bin/sequelize db:migrate

# revert the last migrations:
dbundo:
	@node_modules/.bin/sequelize db:migrate:undo
