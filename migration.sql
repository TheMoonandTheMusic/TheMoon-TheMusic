-- =============================================================
-- Fleetwood Mac Website - Full Schema Migration
-- Run this in Supabase Dashboard > SQL Editor
-- =============================================================

-- 1. Drop existing tables if re-running
DROP TABLE IF EXISTS chart_rankings CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS index_stats CASCADE;

-- 2. Extend band_members with new columns
ALTER TABLE band_members ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE band_members ADD COLUMN IF NOT EXISTS contributions TEXT;
ALTER TABLE band_members ADD COLUMN IF NOT EXISTS composed_songs TEXT;
ALTER TABLE band_members ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 3. Chart rankings (Rolling Stone + Billboard)
CREATE TABLE chart_rankings (
  id SERIAL PRIMARY KEY,
  source VARCHAR NOT NULL,        -- 'Rolling Stone' | 'Billboard'
  chart_type VARCHAR NOT NULL,    -- '500 Greatest Albums' | '500 Greatest Songs' | 'Billboard 200' | 'Hot 100' | 'Year-End Top Album' | 'Year-End Hot 100' | 'Year-End Top Artist' | 'Touring'
  item_name VARCHAR NOT NULL,     -- album name, song name, or tour name
  year INTEGER,
  rank VARCHAR,
  detail TEXT
);

-- 4. Milestones (timeline on logros.html)
CREATE TABLE milestones (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL
);

-- 5. Achievements (hero stat cards on logros.html)
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  type VARCHAR NOT NULL,          -- 'sales' | 'award' | 'ranking' | 'hall_of_fame'
  title VARCHAR NOT NULL,
  value VARCHAR NOT NULL,
  sub_value VARCHAR,
  description TEXT
);

-- 6. Index stats (hero counter on index.html)
CREATE TABLE index_stats (
  id SERIAL PRIMARY KEY,
  label VARCHAR NOT NULL,
  value VARCHAR NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- =============================================================
-- SEED DATA
-- =============================================================

-- band_members: update with rich data
UPDATE band_members SET
  bio = 'The rhythmic anchor and tall, eccentric heart of the band. Mick''s distinctive percussion style and towering presence kept the band together through decades of upheaval.',
  contributions = 'The Chain, Tusk (The marching band concept), World Turning.',
  composed_songs = NULL,
  image_url = 'fleetwood.jpg'
WHERE name = 'Mick Fleetwood';

UPDATE band_members SET
  bio = 'The silent strength behind the Mac sound. John''s melodic bass lines provided the sophisticated foundation that allowed the band''s pop sensibilities to soar.',
  contributions = 'The foundational bass melody of ''The Chain'', Dreams, Rhiannon.',
  composed_songs = NULL,
  image_url = 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Fleetwood_mac_john_mcvie.jpg'
WHERE name = 'John McVie';

UPDATE band_members SET
  bio = 'The high priestess of rock. Stevie brought a mystical, poetic sensibility and an iconic vocal rasp that defined the band''s most legendary hits.',
  contributions = NULL,
  composed_songs = 'Dreams, Rhiannon, Landslide, Gold Dust Woman, Silver Springs.',
  image_url = 'nicks.jpg'
WHERE name = 'Stevie Nicks';

UPDATE band_members SET
  bio = 'The sonic architect. Lindsey''s intricate fingerpicking and obsessive production style transformed the band into a studio powerhouse.',
  contributions = NULL,
  composed_songs = 'Go Your Own Way, Tusk, Big Love, Never Going Back Again.',
  image_url = 'https://upload.wikimedia.org/wikipedia/commons/4/48/Lindsey_Buckingham_1977.jpg'
WHERE name = 'Lindsey Buckingham';

UPDATE band_members SET
  bio = 'The perfect pop songwriter. Christine''s warm vocals and melodic piano compositions provided the commercial and emotional balance to the band''s edgier elements.',
  contributions = NULL,
  composed_songs = 'Don''t Stop, Songbird, You Make Loving Fun, Everywhere, Little Lies.',
  image_url = 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Christine_McVie_-_Fleetwood_Mac_(1977).jpg'
WHERE name = 'Christine McVie';

-- Achievements
INSERT INTO achievements (type, title, value, sub_value, description) VALUES
('sales', 'The Rumours Phenomenon', '40M+', 'Copies Sold Globally', 'Released in 1977, ''Rumours'' became one of the best-selling albums of all time, spending 31 weeks at #1 on the Billboard 200 and dominating the cultural landscape for decades.'),
('award', 'Grammy Award', 'Album of the Year 1978', NULL, 'Recognized for technical brilliance and emotional honesty.'),
('ranking', 'Rolling Stone', '#7', '500 Greatest Albums of All Time', NULL),
('hall_of_fame', 'Rock & Roll Hall of Fame', 'Inducted Class of 1998', NULL, NULL);

-- Milestones
INSERT INTO milestones (year, title, description) VALUES
(1967, 'Formation in London', 'Peter Green recruits Mick Fleetwood and John McVie from John Mayall''s Bluesbreakers, forming a new blues-rock outfit named after the rhythm section.'),
(1968, 'Debut Album & First Hits', 'The self-titled debut reaches #4 on the UK charts. The instrumental "Albatross" hits #1 in the UK in January 1969.'),
(1969, 'Peter Green''s Peak', '"Black Magic Woman", "Man of the World", and the epic "Oh Well" establish Fleetwood Mac as the premier British blues band. Danny Kirwan joins as third guitarist.'),
(1970, 'The End of the Green Era', 'Peter Green''s mental health collapses due to heavy LSD use. He leaves the band after a chaotic final show in Munich.'),
(1971, 'American Expansion Begins', 'Jeremy Spencer vanishes during a Los Angeles tour, joining the Children of God cult. Bob Welch joins, steering the band toward a Californian sound.'),
(1973, 'The Welch Era Matures', 'Danny Kirwan is fired after a breakdown on stage. The band releases "Penguin" and "Mystery to Me", with "Hypnotized" becoming an FM radio staple.'),
(1975, 'The California Transition', 'On New Year''s Eve 1974, Mick Fleetwood invites Lindsey Buckingham and Stevie Nicks to join. The self-titled "White Album" becomes a #1 breakthrough, selling millions.'),
(1977, 'Rumours Perfection', 'Recorded amid divorce, betrayal, and heartbreak, "Rumours" becomes one of the best-selling albums of all time with 40M+ copies. Wins Album of the Year at the Grammys.'),
(1979, 'The Tusk Experiment', 'Lindsey Buckingham''s avant-garde double album "Tusk" divides fans but later earns a reputation as a masterpiece of experimental pop.'),
(1982, 'Mirage: The Return to #1', 'After solo projects dominate 1980-1981, the band reunites for "Mirage", a polished return to form that hits #1 on the Billboard 200.'),
(1987, 'Tango in the Night', 'A commercial resurgence in the digital age. "Tango in the Night" becomes their second-biggest selling studio album, fueled by hits "Big Love", "Everywhere", and ""Little Lies".'),
(1990, 'Behind the Mask & Nicks'' Exit', '"Behind the Mask" debuts at #1 in the UK. Exhausted by band dynamics, Stevie Nicks leaves following the 1990 tour.'),
(1997, 'The Dance: Worldwide Reunion', 'The five classic members reunite for a live album and MTV special. "The Dance" debuts at #1 and reminds the world of their unmatched chemistry.'),
(1998, 'Rock & Roll Hall of Fame', 'Fleetwood Mac is inducted into the Rock and Roll Hall of Fame. The classic lineup performs together alongside a reclusive Peter Green.'),
(2003, 'Say You Will', 'The first studio album in 15 years without Christine McVie. "Say You Will" debuts at #3 on the Billboard 200, supported by a massive world tour.'),
(2014, 'On With the Show', 'Christine McVie rejoins after a decade away. The "On With the Show" tour features all five classic members together for the first time in 16 years.'),
(2020, 'Viral Renaissance & Streaming Records', '"Dreams" goes viral on TikTok, racking up billions of streams and introducing Fleetwood Mac to a new generation of fans.'),
(2022, 'The Loss of Christine McVie', 'On November 30, Christine McVie passes away at 79 after a brief illness. Her death marks the true end of an era for the band.');

-- Chart rankings: Rolling Stone 500 Greatest Albums
INSERT INTO chart_rankings (source, chart_type, item_name, year, rank, detail) VALUES
('Rolling Stone', '500 Greatest Albums', 'Rumours', 1977, '#7', NULL),
('Rolling Stone', '500 Greatest Albums', 'Fleetwood Mac', 1975, '#183', NULL),
('Rolling Stone', '500 Greatest Albums', 'Tusk', 1979, '#225', NULL);

-- Chart rankings: Rolling Stone 500 Greatest Songs
INSERT INTO chart_rankings (source, chart_type, item_name, year, rank, detail) VALUES
('Rolling Stone', '500 Greatest Songs', 'Dreams', 1977, '#9', NULL),
('Rolling Stone', '500 Greatest Songs', 'Go Your Own Way', 1977, '#120', NULL),
('Rolling Stone', '500 Greatest Songs', 'Landslide', 1975, '#170', NULL),
('Rolling Stone', '500 Greatest Songs', 'The Chain', 1977, '#264', NULL),
('Rolling Stone', '500 Greatest Songs', 'Rhiannon', 1975, '#488', NULL);

-- Chart rankings: Billboard 200 Albums
INSERT INTO chart_rankings (source, chart_type, item_name, year, rank, detail) VALUES
('Billboard', 'Billboard 200', 'Rumours', 1977, '#1', '31 weeks at #1'),
('Billboard', 'Billboard 200', 'Fleetwood Mac', 1975, '#1', '136 weeks on chart'),
('Billboard', 'Billboard 200', 'Mirage', 1982, '#1', '#1 US & UK'),
('Billboard', 'Billboard 200', 'The Dance', 1997, '#1', '5M copies sold'),
('Billboard', 'Billboard 200', 'Tusk', 1979, '#4', '4M copies sold'),
('Billboard', 'Billboard 200', 'Tango in the Night', 1987, '#7', '15M copies sold'),
('Billboard', 'Billboard 200', 'Say You Will', 2003, '#3', 'Debut week'),
('Billboard', 'Billboard 200', 'Behind the Mask', 1990, '#18', '#1 UK'),
('Billboard', 'Billboard 200', 'Rumours (2020 re-entry)', 2020, 'Top 10', '#1 Vinyl Albums');

-- Chart rankings: Billboard Hot 100 Singles
INSERT INTO chart_rankings (source, chart_type, item_name, year, rank, detail) VALUES
('Billboard', 'Hot 100', 'Dreams', 1977, '#1', '1 week at #1'),
('Billboard', 'Hot 100', 'Don''t Stop', 1977, '#3', NULL),
('Billboard', 'Hot 100', 'Hold Me', 1982, '#4', NULL),
('Billboard', 'Hot 100', 'Little Lies', 1987, '#4', NULL),
('Billboard', 'Hot 100', 'Big Love', 1987, '#5', NULL),
('Billboard', 'Hot 100', 'Sara', 1980, '#7', NULL),
('Billboard', 'Hot 100', 'Tusk', 1979, '#8', NULL),
('Billboard', 'Hot 100', 'Say You Love Me', 1976, '#9', NULL),
('Billboard', 'Hot 100', 'You Make Loving Fun', 1977, '#9', NULL),
('Billboard', 'Hot 100', 'Go Your Own Way', 1977, '#10', NULL),
('Billboard', 'Hot 100', 'Rhiannon', 1976, '#11', NULL),
('Billboard', 'Hot 100', 'Gypsy', 1982, '#12', NULL),
('Billboard', 'Hot 100', 'Everywhere', 1988, '#14', NULL),
('Billboard', 'Hot 100', 'Seven Wonders', 1987, '#19', NULL),
('Billboard', 'Hot 100', 'Over My Head', 1975, '#20', NULL),
('Billboard', 'Hot 100', 'Think About Me', 1980, '#20', NULL),
('Billboard', 'Hot 100', 'Dreams (2020 re-entry)', 2020, '#21', 'TikTok viral'),
('Billboard', 'Hot 100', 'Over My Head / Rhiannon', 1976, '#1 AC', 'Easy Listening chart');

-- Chart rankings: Billboard Touring
INSERT INTO chart_rankings (source, chart_type, item_name, year, rank, detail) VALUES
('Billboard', 'Touring', 'An Evening with Fleetwood Mac', 2018, '$150M', 'Highest-grossing tour of the band''s career'),
('Billboard', 'Touring', 'On With the Show Tour', 2014, '$100M+', '1.2M tickets sold worldwide'),
('Billboard', 'Touring', 'The Dance Reunion Tour', 1997, '$80M', '89 dates across North America');

-- Chart rankings: Billboard Year-End
INSERT INTO chart_rankings (source, chart_type, item_name, year, rank, detail) VALUES
('Billboard', 'Year-End Top Album', 'Rumours', 1977, '#1 (1977)', NULL),
('Billboard', 'Year-End Top Album', 'Fleetwood Mac', 1977, '#5 (1977)', NULL),
('Billboard', 'Year-End Top Album', 'Rumours', 1978, '#13 (1978)', NULL),
('Billboard', 'Year-End Hot 100', 'Dreams', 1977, '#52 (1977)', NULL),
('Billboard', 'Year-End Hot 100', 'Don''t Stop', 1978, '#72 (1978)', NULL),
('Billboard', 'Year-End Top Artist', 'Fleetwood Mac', 1977, 'Top 10 (1977, 1978)', NULL);

-- Index stats (hero stats on index.html)
INSERT INTO index_stats (label, value, order_index) VALUES
('STUDIO ALBUMS', '18', 1),
('YEARS ACTIVE', '57', 2),
('GLOBAL STREAMS', '16.3B+', 3),
('GRAMMY AWARDS', '2', 4),
('HALL OF FAME', '1998', 5);
