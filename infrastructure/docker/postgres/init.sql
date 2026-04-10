-- ============================================================
-- TUCUN — PostgreSQL + PostGIS Initialization
-- ============================================================
-- Este arquivo roda automaticamente quando o container
-- é criado pela primeira vez.
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- busca por similaridade de texto
CREATE EXTENSION IF NOT EXISTS "unaccent";   -- busca sem acento

-- Configurações de timezone
SET timezone = 'America/Porto_Velho';
ALTER DATABASE tucun SET timezone TO 'America/Porto_Velho';

-- ============================================================
-- IDENTITY
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Autenticação
  email TEXT UNIQUE,
  password_hash TEXT,
  whatsapp TEXT UNIQUE,
  whatsapp_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  oauth_providers TEXT[] DEFAULT '{}',

  -- Perfil
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  profession TEXT,
  city TEXT,
  state CHAR(2) DEFAULT 'RO',

  -- Gamificação
  xp_points INTEGER DEFAULT 0,
  consecutive_days INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),

  -- Assinatura
  subscription_tier TEXT DEFAULT 'free',
  is_founding_member BOOLEAN DEFAULT FALSE,

  -- Selos pinados
  pinned_badge_ids TEXT[] DEFAULT '{}',

  -- Contadores (denormalizados para performance)
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  spots_created_count INTEGER DEFAULT 0,
  fish_logged_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EQUIPAMENTOS E HISTÓRICO
-- ============================================================

CREATE TABLE IF NOT EXISTS user_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ESPÉCIES DE PEIXES
-- ============================================================

CREATE TABLE IF NOT EXISTS fish_species (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  scientific_name TEXT,
  photo_url TEXT,
  description TEXT,
  min_size_cm DECIMAL,
  avg_weight_kg DECIMAL,
  max_weight_kg DECIMAL,
  season_open_month INTEGER,
  season_close_month INTEGER,
  is_protected BOOLEAN DEFAULT FALSE,
  recommended_baits TEXT[] DEFAULT '{}',
  fishing_tips TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS species_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  species_id UUID REFERENCES fish_species(id) ON DELETE CASCADE,
  area_name TEXT,
  center GEOGRAPHY(POINT, 4326),
  radius_km DECIMAL
);

CREATE TABLE IF NOT EXISTS fish_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  species_id UUID REFERENCES fish_species(id),
  spot_id UUID,
  weight_kg DECIMAL,
  length_cm DECIMAL,
  was_released BOOLEAN DEFAULT TRUE,
  photo_url TEXT,
  notes TEXT,
  fished_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MAPA — PONTOS DE PESCA
-- ============================================================

CREATE TABLE IF NOT EXISTS fishing_spots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  avg_rating DECIMAL DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  xp_reward_for_creator INTEGER DEFAULT 100,
  is_premium_only BOOLEAN DEFAULT FALSE,
  is_offline_available BOOLEAN DEFAULT FALSE,
  moderation_enabled BOOLEAN DEFAULT TRUE,
  fish_species_ids UUID[] DEFAULT '{}',
  media_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spot_checklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spot_id UUID UNIQUE REFERENCES fishing_spots(id) ON DELETE CASCADE,
  ground_type TEXT,
  has_trees_for_tarp BOOLEAN DEFAULT FALSE,
  has_flat_tent_area BOOLEAN DEFAULT FALSE,
  has_stone_firepit BOOLEAN DEFAULT FALSE,
  has_covered_area BOOLEAN DEFAULT FALSE,
  has_jiral BOOLEAN DEFAULT FALSE,
  has_bath_spot BOOLEAN DEFAULT FALSE,
  has_bathroom BOOLEAN DEFAULT FALSE,
  has_drinking_water BOOLEAN DEFAULT FALSE,
  has_electricity BOOLEAN DEFAULT FALSE,
  has_shade BOOLEAN DEFAULT FALSE,
  has_dock BOOLEAN DEFAULT FALSE,
  has_boat_ramp BOOLEAN DEFAULT FALSE,
  has_boat_rental BOOLEAN DEFAULT FALSE,
  has_equipment_rental BOOLEAN DEFAULT FALSE,
  has_cell_signal BOOLEAN DEFAULT FALSE,
  has_satellite_internet BOOLEAN DEFAULT FALSE,
  has_camping BOOLEAN DEFAULT FALSE,
  has_trash_collection BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS spot_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spot_id UUID REFERENCES fishing_spots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  fishing_quality INTEGER CHECK (fishing_quality BETWEEN 1 AND 5),
  structure_quality INTEGER CHECK (structure_quality BETWEEN 1 AND 5),
  access_quality INTEGER CHECK (access_quality BETWEEN 1 AND 5),
  safety_quality INTEGER CHECK (safety_quality BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(spot_id, user_id)
);

-- ============================================================
-- ALERTAS DE ROTA
-- ============================================================

CREATE TABLE IF NOT EXISTS route_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES users(id),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  location_name TEXT,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  danger_level TEXT DEFAULT 'medio',
  affects_boat BOOLEAN DEFAULT FALSE,
  affects_car BOOLEAN DEFAULT FALSE,
  river_condition TEXT,
  is_seasonal BOOLEAN DEFAULT FALSE,
  active_months INTEGER[],
  duration_type TEXT DEFAULT 'medio_prazo',
  expires_at TIMESTAMPTZ,
  title TEXT NOT NULL,
  description TEXT,
  media_urls TEXT[] DEFAULT '{}',
  confirmations INTEGER DEFAULT 0,
  denials INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  is_emergency BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alert_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id UUID REFERENCES route_alerts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  vote TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alert_id, user_id)
);

-- ============================================================
-- ÁREAS PROTEGIDAS
-- ============================================================

CREATE TABLE IF NOT EXISTS protected_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  restriction_type TEXT,
  area GEOGRAPHY(POLYGON, 4326),
  active_from DATE,
  active_until DATE,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- SOCIAL — FEED
-- ============================================================

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  caption TEXT,
  media_urls TEXT[] DEFAULT '{}',
  media_types TEXT[] DEFAULT '{}',
  music_id UUID,
  spot_id UUID REFERENCES fishing_spots(id),
  species_ids UUID[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_likes (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  type TEXT DEFAULT 'photo',
  spot_id UUID REFERENCES fishing_spots(id),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS music_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  url TEXT NOT NULL,
  duration_seconds INTEGER,
  cover_url TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- MENSAGENS / CHAT
-- ============================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT DEFAULT 'direct',
  name TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT,
  media_url TEXT,
  type TEXT DEFAULT 'text',
  spot_id UUID REFERENCES fishing_spots(id),
  location_lat DECIMAL,
  location_lng DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GAMIFICAÇÃO
-- ============================================================

CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL,
  icon_url TEXT,
  rarity TEXT NOT NULL,
  category TEXT,
  requirement_type TEXT,
  requirement_value INTEGER,
  display_priority INTEGER DEFAULT 0,
  is_animated BOOLEAN DEFAULT FALSE,
  border_color TEXT DEFAULT '#6B7280',
  glow_color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_limited_edition BOOLEAN DEFAULT FALSE,
  available_until TIMESTAMPTZ,
  total_awarded INTEGER DEFAULT 0,
  max_awards INTEGER,
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT REFERENCES badges(id),
  is_pinned BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  show_next_to_name BOOLEAN DEFAULT FALSE,
  awarded_by UUID REFERENCES users(id),
  award_reason TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS xp_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  total_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ASSINATURAS E PAGAMENTOS
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan_type TEXT,
  plan_price DECIMAL,
  billing_cycle TEXT,
  payment_method TEXT,
  asaas_customer_id TEXT,
  asaas_subscription_id TEXT,
  installments INTEGER DEFAULT 1,
  installment_value DECIMAL,
  installments_paid INTEGER DEFAULT 0,
  status TEXT DEFAULT 'trial',
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  trial_converted BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_founding_member_free BOOLEAN DEFAULT FALSE,
  founding_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  asaas_payment_id TEXT UNIQUE,
  amount DECIMAL NOT NULL,
  method TEXT,
  status TEXT DEFAULT 'pending',
  pix_qr_code TEXT,
  pix_copy_paste TEXT,
  pix_expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUGESTÕES E FEEDBACK
-- ============================================================

CREATE TABLE IF NOT EXISTS suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  admin_note TEXT,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMPTZ,
  voting_starts_at TIMESTAMPTZ,
  voting_ends_at TIMESTAMPTZ,
  votes_count INTEGER DEFAULT 0,
  implemented_at TIMESTAMPTZ,
  implementation_note TEXT,
  version_released TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suggestion_votes (
  suggestion_id UUID REFERENCES suggestions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (suggestion_id, user_id)
);

CREATE TABLE IF NOT EXISTS dev_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  suggestion_id UUID REFERENCES suggestions(id),
  message TEXT NOT NULL,
  category TEXT,
  app_version TEXT,
  device_info TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  admin_reply TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICAÇÕES
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- ============================================================
-- ÍNDICES (Performance)
-- ============================================================

-- Geoespaciais
CREATE INDEX IF NOT EXISTS idx_spots_location ON fishing_spots USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_alerts_location ON route_alerts USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_species_areas_center ON species_areas USING GIST(center);

-- Usuários
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_whatsapp ON users(whatsapp);
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp_points DESC);

-- Posts/Feed
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_spot_id ON posts(spot_id);

-- Mensagens
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- Alertas
CREATE INDEX IF NOT EXISTS idx_alerts_status ON route_alerts(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_alerts_category ON route_alerts(category, danger_level);

-- Notificações
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- Busca por texto (Full Text Search)
CREATE INDEX IF NOT EXISTS idx_spots_name_fts ON fishing_spots
  USING GIN(to_tsvector('portuguese', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_species_name_fts ON fish_species
  USING GIN(to_tsvector('portuguese', name || ' ' || COALESCE(scientific_name, '')));

-- ============================================================
-- FUNÇÕES ÚTEIS
-- ============================================================

-- Adicionar XP ao usuário
CREATE OR REPLACE FUNCTION add_xp(
  p_user_id UUID,
  p_xp INTEGER,
  p_reason TEXT
) RETURNS INTEGER AS $$
DECLARE
  v_new_total INTEGER;
BEGIN
  UPDATE users
  SET xp_points = xp_points + p_xp,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING xp_points INTO v_new_total;

  INSERT INTO xp_events (user_id, amount, reason, total_after)
  VALUES (p_user_id, p_xp, p_reason, v_new_total);

  RETURN v_new_total;
END;
$$ LANGUAGE plpgsql;

-- Buscar alertas próximos
CREATE OR REPLACE FUNCTION get_nearby_alerts(
  p_lat FLOAT,
  p_lng FLOAT,
  p_radius_meters FLOAT DEFAULT 1000
) RETURNS TABLE(
  id UUID,
  title TEXT,
  subcategory TEXT,
  danger_level TEXT,
  affects_boat BOOLEAN,
  affects_car BOOLEAN,
  distance_meters FLOAT
) AS $$
  SELECT
    ra.id, ra.title, ra.subcategory, ra.danger_level,
    ra.affects_boat, ra.affects_car,
    ST_Distance(ra.location, ST_MakePoint(p_lng, p_lat)::geography) AS distance_meters
  FROM route_alerts ra
  WHERE
    ra.status = 'active'
    AND (ra.expires_at IS NULL OR ra.expires_at > NOW())
    AND ST_DWithin(
      ra.location,
      ST_MakePoint(p_lng, p_lat)::geography,
      p_radius_meters
    )
  ORDER BY distance_meters ASC;
$$ LANGUAGE SQL;

-- Buscar pontos próximos
CREATE OR REPLACE FUNCTION get_nearby_spots(
  p_lat FLOAT,
  p_lng FLOAT,
  p_radius_meters FLOAT DEFAULT 50000,
  p_status TEXT DEFAULT 'approved'
) RETURNS TABLE(
  id UUID,
  name TEXT,
  type TEXT,
  avg_rating DECIMAL,
  is_premium_only BOOLEAN,
  distance_meters FLOAT
) AS $$
  SELECT
    fs.id, fs.name, fs.type, fs.avg_rating, fs.is_premium_only,
    ST_Distance(fs.location, ST_MakePoint(p_lng, p_lat)::geography) AS distance_meters
  FROM fishing_spots fs
  WHERE
    fs.status = p_status
    AND ST_DWithin(
      fs.location,
      ST_MakePoint(p_lng, p_lat)::geography,
      p_radius_meters
    )
  ORDER BY distance_meters ASC;
$$ LANGUAGE SQL;

-- ============================================================
-- SEED DATA — Dados iniciais
-- ============================================================

-- Espécies de peixes de Rondônia
INSERT INTO fish_species (name, scientific_name, description, min_size_cm, avg_weight_kg, max_weight_kg, season_open_month, season_close_month, is_protected, recommended_baits, fishing_tips)
VALUES
  ('Tucunaré', 'Cichla ocellaris', 'O rei dos rios de Rondônia! Peixe de água doce muito apreciado por pescadores esportivos. Possui coloração verde-amarelada com manchas escuras.', 25, 2.5, 12.0, 4, 10, FALSE, ARRAY['isca artificial', 'colher', 'plugin', 'lambari vivo'], 'Pescar pela manhã cedo ou ao entardecer. Preferem áreas com sombra e vegetação submersa.'),
  ('Dourado', 'Salminus brasiliensis', 'Considerado o rei dos peixes de água doce. Luta bravamente após ser fisgado, sendo muito valorizado na pesca esportiva.', 45, 5.0, 30.0, 4, 10, FALSE, ARRAY['lambari', 'isca artificial grande', 'colher grande'], 'Prefere corredeiras e rios com boa oxigenação. Ativo nas manhãs frescas.'),
  ('Pacu', 'Piaractus mesopotamicus', 'Peixe robusto e saboroso, muito comum nos rios de Rondônia. Alimenta-se principalmente de frutas que caem na água.', 40, 3.0, 20.0, 4, 10, FALSE, ARRAY['milho', 'banana', 'mamão', 'masa', 'buriti'], 'Usar frutas da época como isca. Pescar próximo às matas ciliares onde caem frutas.'),
  ('Tambaqui', 'Colossoma macropomum', 'Um dos maiores peixes da Amazônia. Muito apreciado pela carne saborosa, principalmente as costelas.', 60, 8.0, 45.0, 4, 10, FALSE, ARRAY['buriti', 'seringa', 'milho', 'coco'], 'Pescar no período das cheias quando as matas ficam inundadas. Usar frutas nativas.'),
  ('Surubim', 'Pseudoplatystoma corruscans', 'Grande bagre maculado, um dos mais valorizados da pesca esportiva. Predador noturno.', 60, 10.0, 50.0, 4, 10, FALSE, ARRAY['lambari', 'piranha', 'peixe cortado'], 'Pescar à noite ou de madrugada. Usar iscas naturais próximo ao fundo.'),
  ('Pirarucu', 'Arapaima gigas', 'O maior peixe de escamas de água doce do mundo. Espécie ameaçada com cotas de captura rígidas.', 150, 80.0, 250.0, NULL, NULL, TRUE, ARRAY['peixe vivo grande'], 'ESPÉCIE PROTEGIDA - Verificar autorização específica do IBAMA antes de pescar.'),
  ('Matrinxã', 'Brycon amazonicus', 'Peixe ágil e saltitante, difícil de manter na linha. Muito saboroso e apreciado.', 30, 1.5, 5.0, 4, 10, FALSE, ARRAY['isca artificial pequena', 'lambari', 'minhoca', 'milho'], 'Prefere rios de corredeira. Exige equipamento leve e linha resistente.'),
  ('Piranha', 'Serrasalmus spp.', 'Peixe carnívoro muito comum. Apesar da má fama, é excelente para caldo e fritada.', 15, 0.5, 3.0, NULL, NULL, FALSE, ARRAY['carne', 'peixe cortado', 'isca artificial vermelha'], 'Cuidado ao manusear! Usar alicate para retirar da linha. Não pescar onde há ferimentos abertos.'),
  ('Jaraqui', 'Semaprochilodus insignis', 'Peixe migratório muito apreciado, especialmente defumado. Comum nos grandes rios amazônicos.', 20, 0.5, 2.0, 4, 10, FALSE, ARRAY['minhoca', 'tela de seda', 'massa de mandioca'], 'Peixe de cardume, quando aparece um, há muitos. Usar linha fina.'),
  ('Curimatã', 'Prochilodus nigricans', 'Peixe muito abundante e nutritivo. Excelente para moqueca e fritura.', 25, 0.8, 3.0, 4, 10, FALSE, ARRAY['minhoca', 'tela', 'farinha de mandioca'], 'Pescar próximo ao fundo. Muito comum em igarapés e lagos.')
ON CONFLICT DO NOTHING;

-- Badges iniciais
INSERT INTO badges (id, name, description, emoji, rarity, category, requirement_type, requirement_value, border_color, xp_reward)
VALUES
  ('pescador', 'Pescador', 'Registrou o primeiro peixe no histórico', '🎣', 'common', 'pesca', 'fish_logged', 1, '#6B7280', 0),
  ('explorador', 'Explorador', 'Cadastrou o primeiro ponto no mapa', '📍', 'common', 'mapa', 'spots_created', 1, '#6B7280', 0),
  ('fotografo', 'Fotógrafo', 'Publicou 5 posts com foto', '📸', 'common', 'social', 'posts_created', 5, '#6B7280', 0),
  ('verificado', 'Verificado', 'Confirmou e-mail e WhatsApp', '✅', 'common', 'identidade', 'verified', 1, '#6B7280', 0),
  ('mapeador', 'Mapeador', 'Cadastrou 3 pontos no mapa', '🗺️', 'common', 'mapa', 'spots_created', 3, '#6B7280', 0),
  ('acampador', 'Acampador', 'Registrou 5 acampamentos', '🏕️', 'uncommon', 'aventura', 'camps_logged', 5, '#3B82F6', 25),
  ('navegador', 'Navegador', 'Criou 5 alertas fluviais', '🌊', 'uncommon', 'alertas', 'boat_alerts_created', 5, '#3B82F6', 25),
  ('guardiao_rio', 'Guardião do Rio', 'Fez 10 denúncias ambientais válidas', '🌿', 'rare', 'sustentabilidade', 'eco_reports', 10, '#8B5CF6', 100),
  ('mestre_pescador', 'Mestre Pescador', '25 peixes no histórico', '🪝', 'rare', 'pesca', 'fish_logged', 25, '#8B5CF6', 75),
  ('influencer', 'Influencer', '500 seguidores no Tucun', '👑', 'rare', 'social', 'followers', 500, '#8B5CF6', 150),
  ('embaixador', 'Embaixador Tucun', '50 pontos cadastrados aprovados', '🏅', 'epic', 'mapa', 'spots_approved', 50, '#F59E0B', 300),
  ('lenda_ro', 'Lenda de RO', 'Top 3 em XP do estado', '🦁', 'epic', 'ranking', 'top_xp_state', 3, '#F59E0B', 500),
  ('tucun_lenda', 'Tucun Lenda', 'Top 1 em XP do Brasil', '👑', 'legendary', 'ranking', 'top_xp_brazil', 1, '#EF4444', 1000),
  ('beta_tester', 'Beta Tester', 'Testou o app antes do lançamento', '🌟', 'special', 'especial', 'manual', 1, '#D4AF37', 200),
  ('fundador', 'Fundador Tucun', 'Esteve no app nos primeiros 30 dias', '🏗️', 'special', 'especial', 'manual', 1, '#D4AF37', 500),
  ('membro_fundador', 'Membro Fundador', 'Conquistou acesso gratuito vitalício por contribuição', '🌱', 'legendary', 'assinatura', 'xp_goal', 5000, '#D4AF37', 0),
  ('eco_warrior', 'Eco Warrior', '25 denúncias ambientais válidas', '🌿', 'epic', 'sustentabilidade', 'eco_reports', 25, '#10B981', 300),
  ('heroi', 'Herói', 'Criou alerta de emergência que ajudou alguém', '🆘', 'epic', 'alertas', 'emergency_alerts', 1, '#EF4444', 500),
  ('assinante_fiel', 'Assinante Fiel', '12 meses consecutivos assinando', '💎', 'epic', 'assinatura', 'months_subscribed', 12, '#D4AF37', 400)
ON CONFLICT (id) DO NOTHING;

-- Log de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Tucun database initialized successfully!';
  RAISE NOTICE '📍 PostGIS extensions enabled';
  RAISE NOTICE '🗄️ All tables created';
  RAISE NOTICE '📊 Indexes created';
  RAISE NOTICE '🐟 Fish species seeded (10 species)';
  RAISE NOTICE '🏅 Badges seeded (19 badges)';
END $$;
