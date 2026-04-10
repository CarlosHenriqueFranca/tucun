import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial schema migration for Tucun
 * Creates all tables with PostGIS support
 * Note: The init.sql in docker handles the initial dev setup.
 * This migration is for production deployments.
 */
export class InitialSchema1712700000000 implements MigrationInterface {
  name = 'InitialSchema1712700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "postgis"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "unaccent"`);

    // ── Enums ────────────────────────────────────────────────────────────

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'premium');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE spot_type AS ENUM (
          'ponto_de_pesca', 'acampamento', 'marina', 'posto_de_gasolina',
          'mercado', 'hospital', 'policia', 'hotel'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE alert_category AS ENUM (
          'pedra', 'banco_areia', 'furto', 'hospital', 'policia',
          'hotel', 'gasolina', 'cachoeira', 'corredeira', 'outros'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE danger_level AS ENUM ('info', 'low', 'medium', 'high', 'critical');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE badge_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary', 'special');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE conservation_status AS ENUM (
          'least_concern', 'near_threatened', 'vulnerable', 'endangered', 'critically_endangered'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);

    // ── Tables ───────────────────────────────────────────────────────────

    // Users
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE,
        password_hash TEXT,
        whatsapp VARCHAR(20) UNIQUE,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(30) UNIQUE,
        avatar_url TEXT,
        bio TEXT,
        city VARCHAR(100),
        state VARCHAR(2) DEFAULT 'RO',
        subscription_tier subscription_tier NOT NULL DEFAULT 'free',
        subscription_expires_at TIMESTAMPTZ,
        trial_used_at TIMESTAMPTZ,
        is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
        is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
        role user_role NOT NULL DEFAULT 'user',
        last_login_at TIMESTAMPTZ,
        login_count INT NOT NULL DEFAULT 0,
        xp_total INT NOT NULL DEFAULT 0,
        level SMALLINT NOT NULL DEFAULT 1,
        providers_linked JSONB NOT NULL DEFAULT '[]',
        google_id VARCHAR(255) UNIQUE,
        facebook_id VARCHAR(255) UNIQUE,
        asaas_customer_id VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Indexes for users
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_whatsapp ON users(whatsapp)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_xp_total ON users(xp_total DESC)`);

    // Fish Species
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS fish_species (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        scientific_name VARCHAR(150),
        description TEXT,
        habitat TEXT,
        diet TEXT,
        conservation_status conservation_status NOT NULL DEFAULT 'least_concern',
        min_size_cm INT,
        max_size_cm INT,
        min_weight_kg DECIMAL(8,2),
        max_weight_kg DECIMAL(8,2),
        image_url TEXT,
        is_endemic BOOLEAN DEFAULT FALSE,
        is_protected_in_rondonia BOOLEAN DEFAULT FALSE,
        best_season JSONB DEFAULT '[]',
        techniques JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Fishing Spots
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS fishing_spots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(200) NOT NULL,
        description TEXT,
        type spot_type NOT NULL DEFAULT 'ponto_de_pesca',
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        location GEOGRAPHY(POINT, 4326),
        city VARCHAR(100),
        state VARCHAR(2) DEFAULT 'RO',
        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        average_rating DECIMAL(3,2) DEFAULT 0,
        total_ratings INT DEFAULT 0,
        total_checkins INT DEFAULT 0,
        created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_spots_location ON fishing_spots USING GIST(location)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_spots_type ON fishing_spots(type)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_spots_city ON fishing_spots(city)`);

    // Full text search for spots
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_spots_fts ON fishing_spots
      USING GIN(to_tsvector('portuguese', name || ' ' || COALESCE(description, '')))
    `);

    // Spot Checklist
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS spot_checklist (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        spot_id UUID NOT NULL REFERENCES fishing_spots(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        item TEXT NOT NULL,
        is_required BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Route Alerts
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS route_alerts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category alert_category NOT NULL,
        danger_level danger_level NOT NULL DEFAULT 'info',
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        location GEOGRAPHY(POINT, 4326),
        radius INT NOT NULL DEFAULT 100,
        reported_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        expires_at TIMESTAMPTZ,
        upvotes INT DEFAULT 0,
        downvotes INT DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_alerts_location ON route_alerts USING GIST(location)`);

    // Fish Logs
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS fish_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        species_id UUID REFERENCES fish_species(id) ON DELETE SET NULL,
        spot_id UUID REFERENCES fishing_spots(id) ON DELETE SET NULL,
        size_cm INT,
        weight_kg DECIMAL(8,3),
        was_released BOOLEAN DEFAULT TRUE,
        notes TEXT,
        photo_url TEXT,
        caught_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_fish_logs_user_id ON fish_logs(user_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_fish_logs_caught_at ON fish_logs(caught_at DESC)`);

    // Posts
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        caption TEXT,
        media_urls JSONB DEFAULT '[]',
        media_types JSONB DEFAULT '[]',
        spot_id UUID REFERENCES fishing_spots(id) ON DELETE SET NULL,
        fish_species_id UUID REFERENCES fish_species(id) ON DELETE SET NULL,
        is_public BOOLEAN DEFAULT TRUE,
        likes_count INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        shares_count INT DEFAULT 0,
        views_count INT DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_posts_likes ON posts(likes_count DESC)`);

    // Post Likes
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      )
    `);

    // Post Comments
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
        likes_count INT DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_comments_post_id ON post_comments(post_id)`);

    // Stories
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS stories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        media_url TEXT NOT NULL,
        media_type VARCHAR(10) DEFAULT 'image',
        caption TEXT,
        views_count INT DEFAULT 0,
        expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Follows
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS follows (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(follower_id, following_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id)`);

    // Conversations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100),
        is_group BOOLEAN DEFAULT FALSE,
        avatar_url TEXT,
        last_message_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Conversation Participants
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS conversation_participants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_read_at TIMESTAMPTZ,
        is_admin BOOLEAN DEFAULT FALSE,
        UNIQUE(conversation_id, user_id)
      )
    `);

    // Messages
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'text',
        media_url TEXT,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        is_read BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC)`);

    // Badges
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon_url TEXT,
        rarity badge_rarity NOT NULL DEFAULT 'common',
        category VARCHAR(50),
        xp_required INT DEFAULT 0,
        condition_type TEXT,
        condition_value JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // User Badges
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
        awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        is_new BOOLEAN DEFAULT TRUE,
        UNIQUE(user_id, badge_id)
      )
    `);

    // XP Events
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS xp_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_type VARCHAR(100) NOT NULL,
        xp_amount INT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_xp_events_user ON xp_events(user_id, created_at DESC)`);

    // Subscriptions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'trial',
        asaas_id VARCHAR(255),
        start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        end_date TIMESTAMPTZ,
        cancelled_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Payment History
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payment_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
        asaas_payment_id VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'BRL',
        payment_method VARCHAR(50),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        paid_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Suggestions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS suggestions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50),
        status VARCHAR(30) DEFAULT 'open',
        voting_ends_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
        upvotes INT DEFAULT 0,
        is_public BOOLEAN DEFAULT TRUE,
        dev_comment TEXT,
        dev_comment_is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Suggestion Votes
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS suggestion_votes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        suggestion_id UUID NOT NULL REFERENCES suggestions(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(suggestion_id, user_id)
      )
    `);

    // Notifications
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        body TEXT,
        data JSONB,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE`);

    // Push Tokens
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS push_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        platform VARCHAR(10) NOT NULL,
        device_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Eco Reports
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS eco_reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        location GEOGRAPHY(POINT, 4326),
        media_urls JSONB DEFAULT '[]',
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_eco_reports_location ON eco_reports USING GIST(location)`);

    // Piracema Periods
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS piracema_periods (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        year INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        state VARCHAR(2) DEFAULT 'RO',
        regulations TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Spot Ratings
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS spot_ratings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        spot_id UUID NOT NULL REFERENCES fishing_spots(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(spot_id, user_id)
      )
    `);

    // User Equipment
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_equipment (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50),
        brand VARCHAR(100),
        model VARCHAR(100),
        description TEXT,
        photo_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Reports (content moderation)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        target_type VARCHAR(20) NOT NULL,
        target_id UUID NOT NULL,
        reason VARCHAR(100) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        resolved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ── Functions ─────────────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_spot_location()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trigger_spot_location ON fishing_spots;
      CREATE TRIGGER trigger_spot_location
        BEFORE INSERT OR UPDATE ON fishing_spots
        FOR EACH ROW EXECUTE FUNCTION update_spot_location()
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_alert_location()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trigger_alert_location ON route_alerts;
      CREATE TRIGGER trigger_alert_location
        BEFORE INSERT OR UPDATE ON route_alerts
        FOR EACH ROW EXECUTE FUNCTION update_alert_location()
    `);

    // ── Seed Data ─────────────────────────────────────────────────────────

    // Fish species
    await queryRunner.query(`
      INSERT INTO fish_species (name, scientific_name, description, min_size_cm, max_size_cm, is_protected_in_rondonia, best_season, techniques)
      VALUES
        ('Tucunaré', 'Cichla ocellaris', 'Rei dos rios amazônicos, o tucunaré é o peixe símbolo de Rondônia.', 25, 90, false, '[1,2,3,11,12]', '["isca artificial","fly fishing","trolha"]'),
        ('Dourado', 'Salminus brasiliensis', 'O dourado é considerado o peixe mais nobre dos rios brasileiros.', 45, 130, false, '[6,7,8,9]', '["isca viva","trolha","molinete"]'),
        ('Pacu', 'Colossoma mitrei', 'Peixe onívoro muito apreciado na culinária regional.', 40, 80, false, '[10,11,12,1]', '["anzol de fundo","caniço","trolha"]'),
        ('Tambaqui', 'Colossoma macropomum', 'Um dos maiores peixes de escama da bacia amazônica.', 50, 100, false, '[11,12,1,2]', '["anzol de fundo","caniço"]'),
        ('Surubim', 'Pseudoplatystoma fasciatum', 'O surubim é um dos maiores bagres do Brasil.', 60, 150, false, '[7,8,9]', '["anzol de fundo","espinhel"]'),
        ('Pirarucu', 'Arapaima gigas', 'O pirarucu é o maior peixe de escama de água doce do mundo.', 100, 300, true, '[6,7,8]', '["arpão","rede"]'),
        ('Matrinxã', 'Brycon amazonicus', 'Peixe muito apreciado pela carne saborosa.', 30, 60, false, '[11,12,1,2]', '["isca natural","vogler","mosca"]'),
        ('Piranha', 'Serrasalmus rhombeus', 'A piranha é um dos peixes mais conhecidos do mundo.', 20, 40, false, '[6,7,8,9,10]', '["anzol simples","caniço"]'),
        ('Jaraqui', 'Semaprochilodus insignis', 'Peixe muito abundante na bacia amazônica.', 25, 40, false, '[10,11]', '["rede","tarrafa"]'),
        ('Curimatã', 'Prochilodus nigricans', 'Um dos peixes mais consumidos na Amazônia.', 30, 55, false, '[10,11,12]', '["rede","anzol de fundo"]')
      ON CONFLICT DO NOTHING
    `);

    // Piracema periods
    await queryRunner.query(`
      INSERT INTO piracema_periods (year, start_date, end_date, state, regulations)
      VALUES
        (2024, '2024-11-01', '2025-03-01', 'RO', 'Proibida a pesca durante o período de piracema conforme Lei Estadual. Permitida apenas pesca de subsistência para populações ribeirinhas.'),
        (2025, '2025-11-01', '2026-03-01', 'RO', 'Proibida a pesca durante o período de piracema conforme Lei Estadual. Permitida apenas pesca de subsistência para populações ribeirinhas.')
      ON CONFLICT DO NOTHING
    `);

    // Badges
    await queryRunner.query(`
      INSERT INTO badges (name, description, rarity, category, xp_required, condition_type, condition_value) VALUES
        ('Primeiro Peixe', 'Registrou o primeiro peixe capturado', 'common', 'fishing', 0, 'fish_log_count', '{"min": 1}'),
        ('Pescador Iniciante', 'Capturou 10 peixes', 'common', 'fishing', 0, 'fish_log_count', '{"min": 10}'),
        ('Pescador Experiente', 'Capturou 50 peixes', 'uncommon', 'fishing', 0, 'fish_log_count', '{"min": 50}'),
        ('Mestre da Pesca', 'Capturou 200 peixes', 'rare', 'fishing', 0, 'fish_log_count', '{"min": 200}'),
        ('Explorador', 'Visitou 5 pontos de pesca diferentes', 'common', 'exploration', 0, 'spot_checkin_count', '{"min": 5}'),
        ('Desbravador', 'Visitou 20 pontos de pesca diferentes', 'uncommon', 'exploration', 0, 'spot_checkin_count', '{"min": 20}'),
        ('Guarda-Floresta', 'Registrou 5 relatórios ecológicos', 'rare', 'conservation', 0, 'eco_report_count', '{"min": 5}'),
        ('Influencer', 'Ganhou 100 seguidores', 'uncommon', 'social', 0, 'follower_count', '{"min": 100}'),
        ('Criador de Conteúdo', 'Publicou 50 posts', 'uncommon', 'social', 0, 'post_count', '{"min": 50}'),
        ('Nível 5 — Desbravador', 'Alcançou o nível 5', 'rare', 'achievement', 7500, 'level', '{"min": 5}'),
        ('Nível 10 — Tucunaré Lenda', 'Alcançou o nível máximo', 'legendary', 'achievement', 150000, 'level', '{"min": 10}'),
        ('Tucunaré Dourado', 'Capturou um Tucunaré acima de 5kg', 'epic', 'fishing', 0, 'special_catch', '{"species": "Tucunaré", "min_weight_kg": 5}'),
        ('Guardião do Rio', 'Reportou 20 alertas de rota verificados', 'rare', 'conservation', 0, 'alert_count', '{"min": 20}'),
        ('Primeiro Check-in', 'Fez o primeiro check-in em um ponto', 'common', 'exploration', 0, 'checkin_count', '{"min": 1}'),
        ('Madrugada no Rio', 'Pescou entre 00h e 04h', 'uncommon', 'achievement', 0, 'night_fishing', '{"required": true}'),
        ('Diversidade', 'Capturou 5 espécies diferentes', 'rare', 'fishing', 0, 'species_variety', '{"min": 5}'),
        ('Beta Tester', 'Usuário dos primeiros dias do Tucun', 'special', 'special', 0, 'manual', '{}'),
        ('Fundador', 'Apoiador fundador do Tucun', 'legendary', 'special', 0, 'manual', '{}'),
        ('Campeão de Pesca', 'Vencedor de torneio oficial Tucun', 'legendary', 'special', 0, 'manual', '{}')
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse order of creation (respecting foreign keys)
    const tables = [
      'reports', 'user_equipment', 'spot_ratings', 'piracema_periods',
      'eco_reports', 'push_tokens', 'notifications', 'suggestion_votes',
      'suggestions', 'payment_history', 'subscriptions', 'xp_events',
      'user_badges', 'badges', 'messages', 'conversation_participants',
      'conversations', 'follows', 'stories', 'post_comments', 'post_likes',
      'posts', 'fish_logs', 'route_alerts', 'spot_checklist', 'fishing_spots',
      'fish_species', 'users'
    ];

    for (const table of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }

    const enums = [
      'subscription_tier', 'user_role', 'spot_type', 'alert_category',
      'danger_level', 'badge_rarity', 'conservation_status'
    ];

    for (const enumType of enums) {
      await queryRunner.query(`DROP TYPE IF EXISTS ${enumType}`);
    }
  }
}
