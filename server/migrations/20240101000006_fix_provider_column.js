export function up(knex) {
  return knex.schema.alterTable('users', (table) => {
    table.text('provider').alter();
  });
}

export function down(knex) {
  return knex.schema.alterTable('users', (table) => {
    table.enu('provider', ['local', 'google']).defaultTo('local').alter();
  });
}