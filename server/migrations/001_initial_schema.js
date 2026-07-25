/**
 * Initial DevDuel schema
 * Tables: users, problems, test_cases, matches, submissions
 */
exports.up = function (knex) {
  return knex.schema

    // ─── Users ──────────────────────────────────────
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.string('username', 30).unique().notNullable();
      table.string('email').unique().notNullable();
      table.string('password_hash'); // null for OAuth-only users
      table.string('avatar_url');
      table.enum('oauth_provider', ['local', 'google', 'github']).defaultTo('local');
      table.string('oauth_id');
      table.enum('role', ['user', 'admin']).defaultTo('user');
      table.integer('rating').defaultTo(1200);
      table.integer('wins').defaultTo(0);
      table.integer('losses').defaultTo(0);
      table.integer('draws').defaultTo(0);
      table.timestamps(true, true);
      table.index(['rating']);
      table.index(['oauth_provider', 'oauth_id']);
    })

    // ─── Problems ───────────────────────────────────
    .createTable('problems', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.string('title').notNullable();
      table.text('description').notNullable(); // Markdown
      table.enum('difficulty', ['easy', 'medium', 'hard']).notNullable();
      table.specificType('tags', 'TEXT[]'); // e.g., ['dp', 'arrays', 'graphs']
      table.text('input_format');
      table.text('output_format');
      table.text('constraints');
      table.text('sample_input');
      table.text('sample_output');
      table.integer('time_limit_ms').defaultTo(2000);
      table.integer('memory_limit_kb').defaultTo(256000);
      table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
      table.index(['difficulty']);
      table.index(['is_active']);
    })

    // ─── Test Cases ─────────────────────────────────
    .createTable('test_cases', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('problem_id').references('id').inTable('problems').onDelete('CASCADE').notNullable();
      table.text('input').notNullable();
      table.text('expected_output').notNullable();
      table.boolean('is_sample').defaultTo(false); // Visible to users
      table.integer('order').defaultTo(0);
      table.timestamps(true, true);
      table.index(['problem_id']);
    })

    // ─── Matches ────────────────────────────────────
    .createTable('matches', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('player1_id').references('id').inTable('users').onDelete('SET NULL');
      table.uuid('player2_id').references('id').inTable('users').onDelete('SET NULL');
      table.uuid('problem_id').references('id').inTable('problems').onDelete('SET NULL');
      table.uuid('winner_id').references('id').inTable('users').onDelete('SET NULL');
      table.enum('status', ['waiting', 'active', 'completed', 'cancelled', 'draw']).defaultTo('waiting');
      table.enum('match_type', ['ranked', 'private', 'practice']).defaultTo('ranked');
      table.string('invite_code', 8).unique();
      table.integer('player1_rating_before');
      table.integer('player2_rating_before');
      table.integer('player1_rating_change');
      table.integer('player2_rating_change');
      table.integer('duration_seconds').defaultTo(1800); // 30 min default
      table.timestamp('started_at');
      table.timestamp('ended_at');
      table.timestamps(true, true);
      table.index(['player1_id']);
      table.index(['player2_id']);
      table.index(['status']);
      table.index(['created_at']);
    })

    // ─── Submissions ────────────────────────────────
    .createTable('submissions', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
      table.uuid('match_id').references('id').inTable('matches').onDelete('SET NULL');
      table.uuid('problem_id').references('id').inTable('problems').onDelete('SET NULL');
      table.text('code').notNullable();
      table.string('language', 20).notNullable(); // cpp, python, java, javascript
      table.enum('verdict', ['AC', 'WA', 'TLE', 'RE', 'CE', 'MLE', 'PENDING']).defaultTo('PENDING');
      table.integer('tests_passed').defaultTo(0);
      table.integer('tests_total').defaultTo(0);
      table.integer('execution_time_ms');
      table.integer('memory_used_kb');
      table.jsonb('test_results'); // Per-test-case results
      table.timestamps(true, true);
      table.index(['user_id']);
      table.index(['match_id']);
      table.index(['verdict']);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('submissions')
    .dropTableIfExists('matches')
    .dropTableIfExists('test_cases')
    .dropTableIfExists('problems')
    .dropTableIfExists('users');
};
