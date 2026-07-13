(function () {
  'use strict';

  const CONFIG = {
    supabaseUrl: 'https://wqpnsuzulmrbsfuradjt.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcG5zdXp1bG1yYnNmdXJhZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MTA1NjEsImV4cCI6MjA5OTA4NjU2MX0.BFoI9LWKe9L5bvOOw45GeqYKw2GVmGC0ErdsMOsiwss',
    useAI: true,
    aiProvider: 'gemini',
    useN8N: false,
    n8nWebhookUrl: '',
    botName: 'Gerry',
    botTitle: 'Fleetwood Mac Expert'
  };

  let knowledge = [];
  let chatHistory = [];
  let aiKey = localStorage.getItem('gerry_ai_key') || '';

  const greetings = [
    'Hi there, I\'m Gerry — your Fleetwood Mac guide. Ask me anything about the band, their music, history, or legacy.',
    'Welcome to The Moon & The Music. I\'m Gerry, your Fleetwood Mac expert. What would you like to know?',
    'Hey! Gerry here. I know everything about Fleetwood Mac — from the Peter Green blues days to the Rumours era and beyond. Fire away!'
  ];

  const quickReplies = [
    'Who are the band members?',
    'Tell me about Rumours',
    'What are their biggest hits?',
    'What albums did they release?',
    'Top chart achievements',
    'Band history timeline'
  ];

  /* ═══════════════════════════════════════════════
     ENTITY ALIASES
     ═══════════════════════════════════════════════ */

  const memberAliases = {
    'mick fleetwood': { name: 'Mick Fleetwood', role: 'Drummer' },
    'mick': { name: 'Mick Fleetwood', role: 'Drummer' },
    'fleetwood': { name: 'Mick Fleetwood', role: 'Drummer' },
    'drummer': { name: 'Mick Fleetwood', role: 'Drummer' },
    'john mcvie': { name: 'John McVie', role: 'Bassist' },
    'john': { name: 'John McVie', role: 'Bassist' },
    'mcvie': { name: 'John McVie', role: 'Bassist' },
    'bassist': { name: 'John McVie', role: 'Bassist' },
    'stevie nicks': { name: 'Stevie Nicks', role: 'Singer' },
    'stevie': { name: 'Stevie Nicks', role: 'Singer' },
    'nicks': { name: 'Stevie Nicks', role: 'Singer' },
    'the witch': { name: 'Stevie Nicks', role: 'Singer' },
    'lindsey buckingham': { name: 'Lindsey Buckingham', role: 'Guitarist' },
    'lindsey': { name: 'Lindsey Buckingham', role: 'Guitarist' },
    'buckingham': { name: 'Lindsey Buckingham', role: 'Guitarist' },
    'guitarist': { name: 'Lindsey Buckingham', role: 'Guitarist' },
    'christine mcvie': { name: 'Christine McVie', role: 'Keyboardist' },
    'christine': { name: 'Christine McVie', role: 'Keyboardist' },
    'chris': { name: 'Christine McVie', role: 'Keyboardist' },
    'keyboardist': { name: 'Christine McVie', role: 'Keyboardist' },
    'pianist': { name: 'Christine McVie', role: 'Keyboardist' },
    'peter green': { name: 'Peter Green', role: 'Founding Guitarist' },
    'peter': { name: 'Peter Green', role: 'Founding Guitarist' },
    'danny kirwan': { name: 'Danny Kirwan', role: 'Guitarist' },
    'bob welch': { name: 'Bob Welch', role: 'Guitarist' },
    'jeremy spencer': { name: 'Jeremy Spencer', role: 'Guitarist' },
    'dave walker': { name: 'Dave Walker', role: 'Singer' },
    'billy burnette': { name: 'Billy Burnette', role: 'Guitarist' },
    'rick vito': { name: 'Rick Vito', role: 'Guitarist' },
    'bekka bramlett': { name: 'Bekka Bramlett', role: 'Singer' },
    'dave mason': { name: 'Dave Mason', role: 'Guitarist' }
  };

  const albumAliases = {
    'fleetwood mac': { title: 'Fleetwood Mac', year: 1975, desc: 'The "White Album" that broke them in the US' },
    'white album': { title: 'Fleetwood Mac', year: 1975, desc: 'The "White Album" that broke them in the US' },
    'rumours': { title: 'Rumours', year: 1977, desc: 'One of the best-selling albums of all time (40M+)' },
    'tusk': { title: 'Tusk', year: 1979, desc: 'The experimental double album' },
    'mirage': { title: 'Mirage', year: 1982, desc: 'A polished return to form' },
    'tango in the night': { title: 'Tango in the Night', year: 1987, desc: 'Commercial resurgence' },
    'tango': { title: 'Tango in the Night', year: 1987, desc: 'Commercial resurgence' },
    'behind the mask': { title: 'Behind the Mask', year: 1990, desc: 'Stevie Nicks\' final album before her 90s departure' },
    'say you will': { title: 'Say You Will', year: 2003, desc: 'First album without Christine McVie' },
    'the dance': { title: 'The Dance', year: 1997, desc: 'The reunion live album' },
    'then play on': { title: 'Then Play On', year: 1969, desc: 'The Peter Green era masterpiece' },
    'kiln house': { title: 'Kiln House', year: 1970, desc: 'First post-Green album' },
    'future games': { title: 'Future Games', year: 1971, desc: 'Bob Welch\'s first album' },
    'bare trees': { title: 'Bare Trees', year: 1972, desc: '' },
    'penguin': { title: 'Penguin', year: 1973, desc: '' },
    'mystery to me': { title: 'Mystery to Me', year: 1973, desc: '' },
    'heroes are hard to find': { title: 'Heroes Are Hard to Find', year: 1974, desc: '' },
    'time': { title: 'Time', year: 1995, desc: '' }
  };

  const songAliases = {
    'dreams': { title: 'Dreams', writer: 'Stevie Nicks', year: 1977 },
    'go your own way': { title: 'Go Your Own Way', writer: 'Lindsey Buckingham', year: 1977 },
    'landslide': { title: 'Landslide', writer: 'Stevie Nicks', year: 1975 },
    'rhiannon': { title: 'Rhiannon', writer: 'Stevie Nicks', year: 1975 },
    'the chain': { title: 'The Chain', writer: 'Fleetwood Mac', year: 1977 },
    'gold dust woman': { title: 'Gold Dust Woman', writer: 'Stevie Nicks', year: 1977 },
    'silver springs': { title: 'Silver Springs', writer: 'Stevie Nicks', year: 1977 },
    'big love': { title: 'Big Love', writer: 'Lindsey Buckingham', year: 1987 },
    'everywhere': { title: 'Everywhere', writer: 'Christine McVie', year: 1987 },
    'little lies': { title: 'Little Lies', writer: 'Christine McVie', year: 1987 },
    'dont stop': { title: 'Don\'t Stop', writer: 'Christine McVie', year: 1977 },
    'songbird': { title: 'Songbird', writer: 'Christine McVie', year: 1977 },
    'you make loving fun': { title: 'You Make Loving Fun', writer: 'Christine McVie', year: 1977 },
    'never going back again': { title: 'Never Going Back Again', writer: 'Lindsey Buckingham', year: 1977 },
    'tusk': { title: 'Tusk', writer: 'Lindsey Buckingham', year: 1979 },
    'sara': { title: 'Sara', writer: 'Stevie Nicks', year: 1979 },
    'hold me': { title: 'Hold Me', writer: 'Christine McVie', year: 1982 },
    'gypsy': { title: 'Gypsy', writer: 'Stevie Nicks', year: 1982 },
    'seven wonders': { title: 'Seven Wonders', writer: 'Sandy Stewart / Stevie Nicks', year: 1987 },
    'say you love me': { title: 'Say You Love Me', writer: 'Christine McVie', year: 1976 },
    'over my head': { title: 'Over My Head', writer: 'Christine McVie', year: 1975 },
    'think about me': { title: 'Think About Me', writer: 'Christine McVie', year: 1980 },
    'black magic woman': { title: 'Black Magic Woman', writer: 'Peter Green', year: 1968 },
    'albatross': { title: 'Albatross', writer: 'Peter Green', year: 1968 },
    'oh well': { title: 'Oh Well', writer: 'Peter Green', year: 1969 },
    'man of the world': { title: 'Man of the World', writer: 'Peter Green', year: 1969 },
    'green manalishi': { title: 'The Green Manalishi', writer: 'Peter Green', year: 1970 },
    'hypnotized': { title: 'Hypnotized', writer: 'Bob Welch', year: 1973 }
  };

  /* ═══════════════════════════════════════════════
     STATIC KNOWLEDGE BASE
     ═══════════════════════════════════════════════ */

  const staticFacts = [
    { intent: 'formation', kw: ['formed', 'started', 'began', 'created', 'founded in', 'origin', 'origins', 'how did they form', 'when were they formed', 'when did the band start'], text: 'Fleetwood Mac was formed in <strong>London, July 1967</strong> by Peter Green, who recruited Mick Fleetwood and John McVie from John Mayall\'s Bluesbreakers. The band name combines the surnames of Mick Fleetwood and John McVie.' },
    { intent: 'name_origin', kw: ['name come from', 'name mean', 'why are they called', 'why named', 'origin of name', 'band name', 'how did they get their name'], text: 'The name <strong>Fleetwood Mac</strong> comes from the surnames of rhythm section members <strong>Mick Fleetwood</strong> and <strong>John McVie</strong>. Peter Green chose the name, joking that the rhythm section would never quit if the band was named after them!' },
    { intent: 'genre', kw: ['genre', 'style', 'type of music', 'kind of music', 'what genre', 'musical style', 'what kind of music do they play', 'what style of music'], text: 'Fleetwood Mac evolved from <strong>British blues</strong> (1967–1970, under Peter Green) to <strong>soft rock / pop rock</strong> (1975 onward). Their sound blends rock, pop, folk, and experimental elements, with four distinct eras: <em>Peter Green blues (1967–1970), Bob Welch transitional (1971–1974), Buckingham/Nicks classic (1975–1987), and post-classic (1990–present)</em>.' },
    { intent: 'biggest_hit', kw: ['biggest hit', 'most popular song', 'most famous', 'number one', '#1 song', 'their biggest', 'most successful song', 'best known song', 'signature song'], text: 'Fleetwood Mac\'s biggest hit is <strong>"Dreams"</strong>, written by Stevie Nicks. It reached <strong>#1 on the Billboard Hot 100</strong> in 1977 and went viral on TikTok in 2020, becoming one of the most-streamed songs from the 20th century with billions of streams.' },
    { intent: 'best_album', kw: ['best album', 'greatest album', 'most successful album', 'which album is their best', 'what is the best album', 'top album', 'most popular album'], text: 'Fleetwood Mac\'s most acclaimed and best-selling album is <strong>"Rumours"</strong> (1977), with over <strong>40 million copies</strong> sold worldwide. It won Album of the Year at the Grammys, spent 31 weeks at #1 on the Billboard 200, and Rolling Stone ranked it <strong>#7 on the 500 Greatest Albums of All Time</strong>.' },
    { intent: 'mick_facts', kw: ['how tall is mick', 'mick height', 'mick fleetwood height', 'tall drummer', 'how tall is the drummer'], text: 'Mick Fleetwood stands at <strong>6\'5" (196 cm)</strong>, making him one of the tallest drummers in rock history. His eccentric stage presence and towering frame became a visual hallmark of the band.' },
    { intent: 'stevie_facts', kw: ['stevie style', 'stevie fashion', 'stevie nicks style', 'witch', 'shawl', 'twirl', 'spin', 'stage presence', 'gypsy witch', 'stevie nicks witch', 'does stevie twirl'], text: 'Stevie Nicks is famous for her <strong>mystical stage presence</strong> — flowing shawls, platform boots, and her iconic twirling spin while singing. She cultivated a "gypsy witch" persona that made her one of rock\'s most visually distinctive performers.' },
    { intent: 'lindsey_facts', kw: ['lindsey style', 'fingerpick', 'fingerpicking', 'lindsey buckingham style', 'lindsey buckingham technique', 'lindsey production', 'obsessive', 'perfectionist'], text: 'Lindsey Buckingham is known for his <strong>virtuosic fingerpicking guitar technique</strong> and obsessive production style. He produced or co-produced most of the band\'s classic albums, often spending weeks perfecting a single guitar part or vocal harmony.' },
    { intent: 'christine_facts', kw: ['christine style', 'christine mcvie style', 'christine voice', 'warm voice', 'christine mcvie songs', 'christine pop songs'], text: 'Christine McVie was the band\'s <strong>pop mastermind</strong>, writing many of their most commercially successful songs: "Don\'t Stop", "Little Lies", "Everywhere", "You Make Loving Fun", "Songbird", and "Hold Me". Her warm, soulful voice and piano-driven melodies provided the emotional balance to the band.' },
    { intent: 'peter_green_facts', kw: ['peter green', 'peter green talent', 'peter green guitar', 'peter green style', 'green god', 'greeny', 'peter green blues', 'original guitarist', 'founding guitarist'], text: 'Peter Green was a <strong>blues guitar prodigy</strong> who played with Eric Clapton in John Mayall\'s Bluesbreakers. He influenced B.B. King, who said Green "had the sweetest tone I ever heard." His songwriting included "Black Magic Woman" (later a hit for Santana), "Albatross", "Oh Well", and "The Green Manalishi". He left the band in 1970 after his mental health deteriorated from heavy LSD use.' },
    { intent: 'tiktok', kw: ['tiktok', 'viral', 'dreams tiktok', 'tiktok 2020', 'viral renaissance', 'fleetwood mac tiktok', 'skateboard', 'cranberry juice', 'doggface'], text: 'In <strong>September 2020</strong>, "Dreams" went viral on TikTok after a video of <strong>@doggface208 (Nathan Apodaca)</strong> skateboarding while drinking cranberry juice and lip-syncing to the song. It earned billions of streams, charted again on the Billboard Hot 100, and introduced Fleetwood Mac to an entirely new generation.' },
    { intent: 'grammy', kw: ['grammy', 'award', 'grammy award', 'won grammy', 'how many grammys', 'awards won', 'album of the year'], text: 'Fleetwood Mac has won <strong>2 Grammy Awards</strong>. <em>Rumours</em> won the prestigious <strong>Album of the Year</strong> in 1978. The band also received the <strong>Lifetime Achievement Award</strong> at the Grammys in 2018 and has been nominated many times across their career.' },
    { intent: 'hall_of_fame', kw: ['hall of fame', 'rock and roll hall of fame', 'inducted', 'induction', 'rock hall', 'rrf', 'when were they inducted'], text: 'Fleetwood Mac was <strong>inducted into the Rock and Roll Hall of Fame in 1998</strong>. The classic lineup of Mick Fleetwood, John McVie, Stevie Nicks, Lindsey Buckingham, and Christine McVie performed together at the ceremony, joined by a reclusive <strong>Peter Green</strong>.' },
    { intent: 'lineup_changes', kw: ['lineup changes', 'members changed', 'how many members', 'who played in', 'members over the years', 'original members', 'original lineup', 'founding members', 'lineup history', 'band members over time'], text: 'Fleetwood Mac has had <strong>over 15 members</strong> across its history. The original 1967 lineup: <strong>Peter Green</strong> (guitar), <strong>Jeremy Spencer</strong> (guitar), <strong>Mick Fleetwood</strong> (drums), <strong>John McVie</strong> (bass). The classic 1975–1987 lineup: <strong>Mick Fleetwood, John McVie, Stevie Nicks, Lindsey Buckingham, Christine McVie</strong>. Other notable members: Danny Kirwan, Bob Welch, Bob Weston, Dave Walker, Billy Burnette, Rick Vito, Bekka Bramlett, Dave Mason.' },
    { intent: 'tours', kw: ['tour', 'concerts', 'live shows', 'world tour', 'touring', 'biggest tour', 'grossed', 'ticket sales'], text: 'Fleetwood Mac\'s biggest tour was the <strong>"An Evening with Fleetwood Mac" (2018–2019)</strong>, which grossed over <strong>$150 million</strong>. Their <strong>"On With the Show Tour" (2014–2015)</strong>, featuring Christine McVie\'s return, sold 1.2 million tickets for $100M+. The <strong>"The Dance Reunion Tour" (1997)</strong> had 89 dates across North America and grossed $80M.' },
    { intent: 'songbird_meaning', kw: ['songbird meaning', 'songbird about', 'songbird story', 'songbird written', 'what is songbird about'], text: '"Songbird" was written by <strong>Christine McVie</strong> in about <strong>half an hour</strong> at the piano in her home. It\'s one of her most personal songs, written as a simple expression of love. The song became a staple of weddings and memorial services, and was played at Christine\'s own funeral in 2022.' },
    { intent: 'dreams_meaning', kw: ['dreams about', 'dreams meaning', 'dreams inspiration', 'dreams written', 'dreams story', 'what is dreams about', 'what inspired dreams'], text: '"Dreams" was written by <strong>Stevie Nicks</strong> about the breakdown of her relationship with <strong>Lindsey Buckingham</strong>. She wrote it in just 10 minutes at the Record Plant in Sausalito, sitting in a closet with a portable keyboard. The song became Fleetwood Mac\'s only <strong>#1 Billboard Hot 100</strong> hit.' },
    { intent: 'go_your_own_way_meaning', kw: ['go your own way about', 'go your own way meaning', 'go your own way written', 'what is go your own way about', 'pack her things'], text: '"Go Your Own Way" was written by <strong>Lindsey Buckingham</strong> about his painful breakup with <strong>Stevie Nicks</strong>. The raw, emotional lyrics reflect their toxic relationship during the Rumours sessions. Stevie famously hated being told to "pack her things" and found the song "too personal."' },
    { intent: 'the_chain_meaning', kw: ['the chain about', 'the chain meaning', 'the chain written', 'what is the chain about', 'the chain bass', 'the chain formula one', 'f1 theme'], text: '"The Chain" is the <strong>only song credited to all five members</strong> of the classic Fleetwood Mac lineup. Each member contributed a section: the iconic bass intro by <strong>John McVie</strong>, the "chain keep us together" chorus by all five, the guitar solo by Lindsey, and the driving ending by Mick Fleetwood. It\'s famous for being the theme song for <strong>Formula 1</strong> broadcasts.' },
    { intent: 'silver_springs', kw: ['silver springs', 'silver springs about', 'silver springs story', 'silver springs dance', 'what is silver springs about', 'silver springs stevie lindsey'], text: '"Silver Springs" was written by <strong>Stevie Nicks</strong> about <strong>Lindsey Buckingham</strong>, but was famously left off <em>Rumours</em> in favor of shorter songs. In 1997, during <strong>The Dance</strong> reunion concert, Stevie sang it directly at Lindsey with such raw intensity that it became legendary — the performance has over 100 million views on YouTube.' },
    { intent: 'albums_total', kw: ['how many albums', 'total albums', 'albums released', 'discography', 'how many studio albums', 'number of albums', 'album count'], text: 'Fleetwood Mac has released <strong>18 studio albums</strong>, plus multiple live albums, compilations, and box sets. Their discography spans from 1968 (<em>Fleetwood Mac</em>) to 2003 (<em>Say You Will</em>). Their most commercially successful album is <em>Rumours</em> (1977), followed by <em>Fleetwood Mac</em> (1975), <em>Tango in the Night</em> (1987), and <em>Tusk</em> (1979).' },
    { intent: 'albums_list', kw: ['list of albums', 'albums in order', 'chronological albums', 'album discography', 'all albums', 'list albums', 'order of albums', 'full discography'], text: 'Fleetwood Mac\'s 18 studio albums (in order):<br><br><strong>Peter Green Era:</strong><br>1. Fleetwood Mac (1968)<br>2. Mr. Wonderful (1968)<br>3. Then Play On (1969)<br><br><strong>Transitional Era:</strong><br>4. Kiln House (1970)<br>5. Future Games (1971)<br>6. Bare Trees (1972)<br>7. Penguin (1973)<br>8. Mystery to Me (1973)<br>9. Heroes Are Hard to Find (1974)<br><br><strong>Buckingham/Nicks Classic Era:</strong><br>10. Fleetwood Mac "White Album" (1975)<br>11. Rumours (1977)<br>12. Tusk (1979)<br>13. Mirage (1982)<br>14. Tango in the Night (1987)<br><br><strong>Later Era:</strong><br>15. Behind the Mask (1990)<br>16. Time (1995)<br>17. Say You Will (2003)<br><br><strong>Essential Live Album:</strong><br>• The Dance (1997)' },
    { intent: 'net_worth', kw: ['net worth', 'how much are they worth', 'worth', 'fortune', 'how much money', 'rich', 'wealth'], text: 'Fleetwood Mac\'s collective net worth is estimated at <strong>$200–300 million+</strong> combined.<br><br><strong>Individual estimates:</strong><br>• Stevie Nicks: <strong>$120M</strong><br>• Lindsey Buckingham: <strong>$80M</strong><br>• Mick Fleetwood: <strong>$45M</strong><br>• John McVie: <strong>$25M</strong><br>• Christine McVie (estate): <strong>$25M</strong><br><br>Their 2018–2019 tour alone grossed <strong>$150M+</strong>.' },
    { intent: 'peter_green_death', kw: ['peter green death', 'peter green died', 'peter green die', 'peter green passed away', 'when did peter green die', 'how did peter green die'], text: 'Peter Green passed away on <strong>July 25, 2020</strong> at age 73. Despite leaving Fleetwood Mac in 1970 and living a quiet life away from the spotlight, his influence on British blues and Fleetwood Mac\'s legacy was immense.' },
    { intent: 'christine_death', kw: ['christine mcvie death', 'christine mcvie died', 'christine passed away', 'when did christine mcvie die', 'how did christine mcvie die'], text: 'Christine McVie passed away on <strong>November 30, 2022</strong> at age 79 after a brief illness. Her death was marked by an outpouring of tributes from across the music world. Stevie Nicks said, "A part of my heart has flown away today." Christine\'s warm voice and timeless songs remain a core part of Fleetwood Mac\'s legacy.' },
    { intent: 'stevie_and_lindsey', kw: ['stevie and lindsey', 'lindsey and stevie', 'stevie lindsey relationship', 'did stevie and lindsey date', 'stevie lindsey breakup', 'were stevie and lindsey together', 'buckingham nicks'], text: 'Stevie Nicks and Lindsey Buckingham were a <strong>romantic couple</strong> before joining Fleetwood Mac. They met in high school, formed a duo called <strong>Buckingham Nicks</strong>, and joined Fleetwood Mac on New Year\'s Eve 1974. Their <strong>tumultuous breakup</strong> during the <em>Rumours</em> sessions (1976–1977) fueled the album\'s emotional intensity, with songs like "Dreams" (Stevie about Lindsey) and "Go Your Own Way" (Lindsey about Stevie) immortalizing their pain.' },
    { intent: 'sales_total', kw: ['how many records sold', 'total sales', 'records sold', 'copies sold', 'how much have they sold', 'sales worldwide', 'album sales total'], text: 'Fleetwood Mac has sold over <strong>120 million records worldwide</strong>, making them one of the best-selling music artists of all time. <em>Rumours</em> alone accounts for over <strong>40 million copies</strong>. In the US alone, they have sold more than <strong>50 million albums</strong> certified by the RIAA.' },
    { intent: 'chris_songs', kw: ['songs did christine write', 'christine mcvie wrote', 'what songs did christine write', 'christine mcvie songs list', 'songs by christine mcvie'], text: 'Christine McVie wrote many of Fleetwood Mac\'s biggest hits, including:<br><br>• <strong>"Don\'t Stop"</strong><br>• <strong>"Everywhere"</strong><br>• <strong>"Little Lies"</strong><br>• <strong>"You Make Loving Fun"</strong><br>• <strong>"Songbird"</strong><br>• <strong>"Hold Me"</strong><br>• <strong>"Over My Head"</strong><br>• <strong>"Say You Love Me"</strong><br>• <strong>"Think About Me"</strong><br>• <strong>"Warm Ways"</strong><br>• <strong>"World Turning"</strong> (co-write with Lindsey)<br><br>Her songs were known for their warm, melodic quality and were the commercial backbone of the band.' },
    { intent: 'stevie_songs', kw: ['songs did stevie write', 'stevie nicks wrote', 'what songs did stevie write', 'stevie nicks songs list', 'songs by stevie nicks'], text: 'Stevie Nicks wrote some of Fleetwood Mac\'s most iconic songs, including:<br><br>• <strong>"Dreams"</strong> — The band\'s only #1 Hot 100 hit<br>• <strong>"Rhiannon"</strong> — Inspired by a Welsh witch<br>• <strong>"Landslide"</strong> — A deeply personal acoustic ballad<br>• <strong>"Gold Dust Woman"</strong> — About the dark side of fame<br>• <strong>"Silver Springs"</strong> — Left off Rumours, legendary live version<br>• <strong>"Sara"</strong> — The longest song on Tusk (6:22)<br>• <strong>"Gypsy"</strong> — Nostalgic look at her pre-fame days<br>• <strong>"Beautiful Child"</strong><br>• <strong>"Sisters of the Moon"</strong><br><br>Her poetic, mystical lyrics and distinctive voice made her one of rock\'s most influential female songwriters.' },
    { intent: 'lindsey_songs', kw: ['songs did lindsey write', 'lindsey buckingham wrote', 'what songs did lindsey write', 'lindsey buckingham songs list', 'songs by lindsey buckingham'], text: 'Lindsey Buckingham wrote many of Fleetwood Mac\'s most acclaimed songs, including:<br><br>• <strong>"Go Your Own Way"</strong> — About his breakup with Stevie<br>• <strong>"Tusk"</strong> — The avant-garde marching band anthem<br>• <strong>"Big Love"</strong> — A driving, fingerpicked classic<br>• <strong>"Never Going Back Again"</strong> — Deceptively complex fingerpicking<br>• <strong>"Second Hand News"</strong> — Opening track of Rumours<br>• <strong>"The Chain"</strong> (co-write with all five members)<br>• <strong>"I\'m So Afraid"</strong> — A haunting, intense live staple<br><br>His intricate guitar work and innovative production defined the band\'s sound.' },
    { intent: 'where_are_they_from', kw: ['where are they from', 'where did they come from', 'nationality', 'band origin', 'where were they formed', 'country', 'what country'], text: 'Fleetwood Mac is a <strong>British-American</strong> band. They were <strong>formed in London, England in 1967</strong> by Peter Green, Mick Fleetwood, and John McVie (all British). After adding Californians Stevie Nicks and Lindsey Buckingham in 1975, the band became a true Anglo-American hybrid. The band became closely associated with <strong>California\'s Laurel Canyon sound</strong> in the late 70s.' },
    { intent: 'who_is_gerry', kw: ['who are you', 'who is gerry', 'gerry who', 'what is gerry', 'tell me about yourself', 'what are you'], text: 'I\'m <strong>Gerry</strong>, your Fleetwood Mac expert! I\'m named after <strong>Gerry Fleetwood</strong> (no direct relation — just a fun play on words). I know everything about the band: their members, albums, songs, chart history, and legacy. Ask me anything about Fleetwood Mac and I\'ll do my best to answer with detailed, accurate information.' },
    { intent: 'vibe', kw: ['vibes', 'aesthetic', '70s vibe', 'fleetwood mac vibe', 'california sound', 'laurel canyon'], text: 'Fleetwood Mac is the <strong>quintessential 70s band</strong>. Their sound defined soft rock with its California harmonies, confessional songwriting, and mix of folk, pop, and rock. The <em>Rumours</em> era (1977) captured the height of 70s music culture — big hair, bigger emotions, and the deathless sound of a band falling apart while making the greatest album of their lives.' },
    { intent: 'stevie_voice', kw: ['stevie voice', 'stevie vocal', 'stevie nicks voice', 'why does stevie sound like that', 'raspy voice', 'husky voice'], text: 'Stevie Nicks has a <strong>distinctive husky, raspy voice</strong> that became her trademark. She never warmed up her voice before performances, believing the "cracked" quality added raw emotion. She said, "My voice is not a beautiful voice. It\'s a character voice." Her unique timbre made songs like "Dreams" and "Rhiannon" instantly recognizable.' },
    { intent: 'lindsey_firing', kw: ['lindsey fired', 'lindsey left', 'lindsey buckingham fired', 'why did lindsey leave', 'lindsey buckingham 2018', 'lindsey sued', 'why was lindsey fired'], text: 'Lindsey Buckingham was <strong>fired from Fleetwood Mac in 2018</strong> after a disagreement over the tour schedule. The band wanted to tour for 12 months, but Lindsey wanted to start later to work on solo material and a possible new FM album. He was replaced by Mike Campbell (Tom Petty\'s guitarist) and Neil Finn (Crowded House). Lindsey later filed a lawsuit and settled out of court.' },
    { intent: 'current_status', kw: ['are they still together', 'are they still touring', 'still active', 'current status', 'current members', 'fleetwood mac now', 'fleetwood mac 2024', 'fleetwood mac today'], text: 'As of 2026, Fleetwood Mac\'s future is uncertain following <strong>Christine McVie\'s death in 2022</strong>. The band members have stated that continuing without Christine would be difficult. Mick Fleetwood has said the band is "done" and it would not feel right to continue. The remaining members focus on solo projects and occasional tributes to Christine.' },
    { intent: 'soaring', kw: ['soaring', 'the soaring', 'album soaring', 'fleetwood mac documentary', 'fleetwood mac soaring'], text: '"The Soaring" is a student-made documentary from the band\'s own website about Fleetwood Mac\'s journey. It features their history, interviews with fans, and celebrates the band\'s legacy. Watch it on the website homepage!' },
    { intent: 'stevie_rhiannon', kw: ['rhiannon story', 'rhiannon meaning', 'rhiannon about', 'rhiannon witch', 'what is rhiannon about', 'rhiannon welsh'], text: '"Rhiannon" was written by <strong>Stevie Nicks</strong> after she read a novel about a Welsh witch named Rhiannon. The song is about a mystical, free-spirited woman — Stevie has said she never knew if Rhiannon was a witch or a goddess, but she was "definitely magical." It became one of the band\'s most enduring classics, reaching #11 on the Billboard Hot 100 in 1976.' },
    { intent: 'landslide_meaning', kw: ['landslide about', 'landslide meaning', 'landslide story', 'landslide written', 'what is landslide about', 'landslide stevie'], text: '"Landslide" was written by <strong>Stevie Nicks</strong> in 1974 at a friend\'s house in Aspen, Colorado. She was questioning her life choices — whether to stay with Lindsey Buckingham or leave the music business entirely. The song\'s title came from the snow melting on the mountains around her. It has become one of the most covered and beloved songs in the band\'s catalog.' },
    { intent: 'big_love_meaning', kw: ['big love about', 'big love meaning', 'big love lindsey', 'what is big love about'], text: '"Big Love" was written by <strong>Lindsey Buckingham</strong> about the end of his relationship with <strong>Stevie Nicks</strong> years after their breakup. The song was recorded almost entirely by Lindsey alone in 1987 for <em>Tango in the Night</em>. The stripped-down acoustic version from <strong>The Dance</strong> (1997) is widely considered the definitive version, showcasing his incredible fingerpicking technique.' },
    { intent: 'members_count', kw: ['how many members', 'total members', 'number of members', 'how many people have been in the band', 'how many members in fleetwood mac'], text: 'Fleetwood Mac has had <strong>17 official members</strong> across its history, though the core always revolved around Mick Fleetwood and John McVie. The most famous lineup is the classic five: <strong>Mick, John, Stevie, Lindsey, and Christine</strong>. Other notable members include the original trio (Peter Green, Jeremy Spencer), Danny Kirwan, Bob Welch, Bob Weston, Dave Walker, Billy Burnette, Rick Vito, Bekka Bramlett, Dave Mason, and Neil Finn.' },
    { intent: 'peter_green_lsd', kw: ['peter green lsd', 'peter green acid', 'peter green mental health', 'peter green schizophrenia', 'what happened to peter green', 'why did peter green leave'], text: 'Peter Green\'s mental health deteriorated rapidly due to <strong>heavy LSD use</strong>. By 1970, he was taking massive amounts of acid daily, believing he was "the chosen one" and struggling with paranoid schizophrenia. His final show in Munich was a chaotic, disturbing performance where he refused to play anything but a single note. He was later diagnosed with schizophrenia and spent much of his later life in quiet anonymity before passing away in 2020.' },
    { intent: 'rumours_story', kw: ['rumours story', 'rumours making of', 'how was rumours made', 'rumours recording', 'rumours sessions', 'behind rumours', 'story of rumours'], text: 'The making of <strong>"Rumours" (1977)</strong> is one of rock\'s most legendary stories. The band was falling apart: <strong>Lindsey and Stevie had broken up</strong>, <strong>Christine and John McVie had divorced</strong>, and Mick Fleetwood\'s marriage was imploding. Despite (or because of) the chaos, they channeled all their pain into music. The album was recorded at the Record Plant in Sausalito and the Criteria Studios in Miami, with each song becoming a raw confessional of heartbreak and betrayal.' },
    { intent: 'stevie_solo', kw: ['stevie solo', 'stevie solo career', 'stevie nicks solo', 'stevie solo albums', 'stand back', 'edge of seventeen', 'bella donna'], text: 'Stevie Nicks launched a massively successful <strong>solo career</strong> alongside her Fleetwood Mac work. Her debut album <strong>"Bella Donna" (1981)</strong> reached #1 and sold millions, featuring the hits "Edge of Seventeen" and "Stop Draggin\' My Heart Around." Her solo work made her the first woman to have two albums simultaneously in the Billboard Top 5 (1982). She has released 8 solo albums and was inducted into the Rock Hall twice — with Fleetwood Mac (1998) and as a solo artist (2019).' }
  ];

  /* ═══════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════ */

  function init() {
    injectStyles();
    buildUI();
    loadKnowledge();
    bindEvents();
  }

  function injectStyles() {
    if (document.getElementById('gerry-css')) return;
    const link = document.createElement('link');
    link.id = 'gerry-css';
    link.rel = 'stylesheet';
    link.href = 'gerry.css';
    document.head.appendChild(link);
  }

  function buildUI() {
    if (document.getElementById('gerry-bubble')) return;

    const bubble = document.createElement('button');
    bubble.id = 'gerry-bubble';
    bubble.setAttribute('aria-label', 'Open chat with Gerry');
    bubble.innerHTML = '<span class="material-symbols-outlined">chat</span>';
    document.body.appendChild(bubble);

    const panel = document.createElement('div');
    panel.id = 'gerry-panel';
    panel.innerHTML =
      '<div id="gerry-header">' +
        '<div id="gerry-header-left">' +
          '<div id="gerry-avatar">G</div>' +
          '<div id="gerry-header-info">' +
            '<h3>' + CONFIG.botName + '</h3>' +
            '<p>' + CONFIG.botTitle + '</p>' +
          '</div>' +
        '</div>' +
        '<button id="gerry-close-btn" aria-label="Close chat"><span class="material-symbols-outlined">close</span></button>' +
      '</div>' +
      '<div id="gerry-messages"></div>' +
      '<div id="gerry-input-area">' +
        '<input id="gerry-input" type="text" placeholder="Ask about Fleetwood Mac..." autocomplete="off">' +
        '<button id="gerry-send-btn" aria-label="Send message"><span class="material-symbols-outlined">arrow_upward</span></button>' +
      '</div>';
    document.body.appendChild(panel);
  }

  async function loadKnowledge() {
    try {
      const supabase = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
      const tables = ['band_members', 'albums', 'songs', 'chart_rankings', 'milestones', 'achievements', 'index_stats'];
      const results = await Promise.all(
        tables.map(function (t) {
          return supabase.from(t).select('*').then(function (r) {
            return { table: t, data: r.data || [], error: r.error };
          });
        })
      );
      results.forEach(function (_a) {
        var table = _a.table, data = _a.data;
        data.forEach(function (item) { knowledge.push({ table: table, data: item }); });
      });
    } catch (e) {
      console.warn('Gerry: Could not load knowledge base from Supabase.', e);
    }
  }

  function bindEvents() {
    document.getElementById('gerry-bubble').addEventListener('click', togglePanel);
    document.getElementById('gerry-close-btn').addEventListener('click', closePanel);
    document.getElementById('gerry-send-btn').addEventListener('click', handleSend);
    document.getElementById('gerry-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
    var trigger = document.getElementById('gerry-trigger');
    if (trigger) trigger.addEventListener('click', openPanel);
  }

  /* ═══════════════════════════════════════════════
     PANEL
     ═══════════════════════════════════════════════ */

  function togglePanel() {
    var p = document.getElementById('gerry-panel');
    p.classList.contains('open') ? closePanel() : openPanel();
  }

  function openPanel() {
    document.getElementById('gerry-panel').classList.add('open');
    if (chatHistory.length === 0) {
      setTimeout(function () {
        addBotMessage(greetings[Math.floor(Math.random() * greetings.length)]);
        showQuickReplies();
      }, 400);
    }
    setTimeout(function () { document.getElementById('gerry-input').focus(); }, 500);
  }

  function closePanel() {
    document.getElementById('gerry-panel').classList.remove('open');
  }

  /* ═══════════════════════════════════════════════
     MESSAGES
     ═══════════════════════════════════════════════ */

  function handleSend() {
    var input = document.getElementById('gerry-input');
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    addUserMessage(text);
    chatHistory.push({ role: 'user', text: text });
    showTyping();
    setTimeout(function () { generateResponse(text); }, 300 + Math.random() * 200);
  }

  function addUserMessage(text) {
    var c = document.getElementById('gerry-messages');
    var d = document.createElement('div');
    d.className = 'gerry-msg user';
    d.textContent = text;
    c.appendChild(d);
    scrollBottom();
  }

  function addBotMessage(html) {
    var c = document.getElementById('gerry-messages');
    removeTyping();
    var d = document.createElement('div');
    d.className = 'gerry-msg bot';
    d.innerHTML = html;
    c.appendChild(d);
    scrollBottom();
    chatHistory.push({ role: 'bot', text: html });
  }

  function showTyping() {
    removeTyping();
    var c = document.getElementById('gerry-messages');
    var d = document.createElement('div');
    d.className = 'gerry-typing';
    d.id = 'gerry-typing-indicator';
    d.innerHTML = '<span></span><span></span><span></span>';
    c.appendChild(d);
    scrollBottom();
  }

  function removeTyping() {
    var el = document.getElementById('gerry-typing-indicator');
    if (el) el.remove();
  }

  function scrollBottom() {
    var c = document.getElementById('gerry-messages');
    c.scrollTop = c.scrollHeight;
  }

  function showQuickReplies() {
    var c = document.getElementById('gerry-messages');
    var div = document.createElement('div');
    div.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;align-self:flex-start;';
    quickReplies.forEach(function (q) {
      var btn = document.createElement('button');
      btn.textContent = q;
      btn.className = 'gerry-ai-btn';
      btn.onclick = function () {
        addUserMessage(q);
        chatHistory.push({ role: 'user', text: q });
        showTyping();
        setTimeout(function () { generateResponse(q); }, 300 + Math.random() * 200);
      };
      div.appendChild(btn);
    });
    c.appendChild(div);
    scrollBottom();
  }

  /* ═══════════════════════════════════════════════
     TEXT UTILITIES
     ═══════════════════════════════════════════════ */

  function normalizeText(str) {
    return str.toLowerCase()
      .replace(/[á]/g, 'a').replace(/[é]/g, 'e').replace(/[í]/g, 'i')
      .replace(/[ó]/g, 'o').replace(/[ú]/g, 'u').replace(/[ñ]/g, 'n').replace(/[ü]/g, 'u')
      .replace(/['']/g, "'").replace(/[""]/g, '"')
      .replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function tokenize(text) {
    return text.replace(/[^a-z0-9áéíóúñü\s']/g, ' ').split(/\s+/)
      .filter(function (t) { return t.length > 1 && !commonWords.has(t); });
  }

  var commonWords = new Set([
    'the','a','an','is','was','are','were','has','have','had','do','does','did',
    'can','could','will','would','shall','should','may','might','must','about',
    'tell','me','give','show','list','all','some','any','get','find','search',
    'know','like','just','want','does','need','please','thanks','thank','you',
    'your','its','their','our','this','that','these','those','with','without',
    'from','they','them','he','she','his','her','for','not','but','and','or',
    'very','much','many','more','then','than','also','too','been','being',
    'have','has','had','having','make','made','makes','take','took','taken',
    'what','when','where','who','why','how','which','please','thanks','thank'
  ]);

  /* ═══════════════════════════════════════════════
     ENTITY DETECTION
     ═══════════════════════════════════════════════ */

  function findMember(q) {
    var norm = q.toLowerCase().trim();
    var entries = Object.entries(memberAliases).filter(function (_a) {
      var alias = _a[0];
      if (alias.indexOf(' ') !== -1) return norm.indexOf(alias) !== -1;
      return norm.split(/\s+/).some(function (t) { return t === alias || t.replace(/[^a-z]/g, '') === alias; });
    });
    return entries.length ? memberAliases[entries[0][0]] : null;
  }

  function findAlbum(q) {
    var norm = q.toLowerCase().trim();
    var entries = Object.entries(albumAliases).filter(function (_a) {
      var alias = _a[0];
      if (alias.indexOf(' ') !== -1) return norm.indexOf(alias) !== -1;
      return norm.split(/\s+/).some(function (t) { return t === alias; });
    });
    if (entries.length) return albumAliases[entries[0][0]];
    for (var i = 0; i < knowledge.length; i++) {
      if (knowledge[i].table === 'albums') {
        var title = (knowledge[i].data.title || '').toLowerCase();
        if (title && norm.indexOf(title) !== -1) return { title: knowledge[i].data.title, year: knowledge[i].data.year, desc: '' };
      }
    }
    return null;
  }

  function findSong(q) {
    var norm = q.toLowerCase().trim();
    var entries = Object.entries(songAliases).filter(function (_a) {
      var alias = _a[0];
      if (alias.indexOf(' ') !== -1) return norm.indexOf(alias) !== -1;
      return norm.split(/\s+/).some(function (t) { return t === alias; });
    });
    if (entries.length) return songAliases[entries[0][0]];
    for (var i = 0; i < knowledge.length; i++) {
      if (knowledge[i].table === 'songs') {
        var title = (knowledge[i].data.title || '').toLowerCase();
        if (title && norm.indexOf(title) !== -1) return { title: knowledge[i].data.title, writer: knowledge[i].data.writer_name || '', year: knowledge[i].data.year };
      }
    }
    return null;
  }

  function findStaticFact(q, norm) {
    for (var i = 0; i < staticFacts.length; i++) {
      for (var j = 0; j < staticFacts[i].kw.length; j++) {
        if (norm.indexOf(staticFacts[i].kw[j]) !== -1 || q.toLowerCase().indexOf(staticFacts[i].kw[j]) !== -1) {
          return staticFacts[i];
        }
      }
    }
    return null;
  }

  function detectIntent(q, norm) {
    if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|what'?s\s*up|sup|howdy|hola|buenas)\b/.test(q)) return 'GREETING';
    if (/(^|\s)(bye|goodbye|see you|adios|chao|ciao|hasta luego|nos vemos)(\s|$)/.test(q)) return 'FAREWELL';
    if (/(thank|thanks|gracias|appreciate)/.test(q)) return 'THANKS';

    var fact = findStaticFact(q, norm);
    if (fact) return fact.intent;

    if (findMember(q)) return 'MEMBER_QUERY';
    if (findAlbum(q)) return 'ALBUM_QUERY';
    if (findSong(q)) return 'SONG_QUERY';

    if (/\b(chart|ranking|rank|#\d|billboard|rolling stone|position|top|greatest)\b/.test(q)) return 'CHART_QUERY';
    if (/\b(timeline|history|when\s*(did|was|were)|what\s*year|milestone|event|happened)\b/.test(q)) return 'TIMELINE_QUERY';
    if (/\b(achievement|award|sales|stream|platinum|gold|certif|copies|records? sold)\b/.test(q)) return 'ACHIEVEMENT_QUERY';

    return 'UNKNOWN';
  }

  /* ═══════════════════════════════════════════════
     RESPONSE GENERATION
     ═══════════════════════════════════════════════ */

  function generateResponse(query) {
    if (CONFIG.useN8N && CONFIG.n8nWebhookUrl) {
      callN8N(query);
      return;
    }

    var q = query.trim();
    var norm = normalizeText(q);
    var intent = detectIntent(q, norm);

    if (intent === 'GREETING')     { addBotMessage(greetings[Math.floor(Math.random() * greetings.length)]); return; }
    if (intent === 'FAREWELL')     { addBotMessage('Goodbye! Feel free to come back anytime you want to talk Fleetwood Mac. 🎵'); return; }
    if (intent === 'THANKS')       { addBotMessage('You\'re welcome! I\'m always here to talk Fleetwood Mac. What else would you like to know?'); return; }

    /* Static fact match */
    if (intent !== 'MEMBER_QUERY' && intent !== 'ALBUM_QUERY' && intent !== 'SONG_QUERY' &&
        intent !== 'CHART_QUERY' && intent !== 'TIMELINE_QUERY' && intent !== 'ACHIEVEMENT_QUERY' &&
        intent !== 'UNKNOWN') {
      var fact = staticFacts.find(function (f) { return f.intent === intent; });
      if (fact) { addBotMessage(fact.text + '<br><br><small>Anything else you\'d like to know?</small>'); return; }
    }

    if (intent === 'MEMBER_QUERY')      { generateMemberResponse(q); return; }
    if (intent === 'ALBUM_QUERY')       { generateAlbumResponse(q); return; }
    if (intent === 'SONG_QUERY')        { generateSongResponse(q); return; }
    if (intent === 'CHART_QUERY')       { generateChartResponse(q); return; }
    if (intent === 'TIMELINE_QUERY')    { generateTimelineResponse(q); return; }
    if (intent === 'ACHIEVEMENT_QUERY') { generateAchievementResponse(q); return; }

    /* Keyword fallback */
    var scores = knowledge.map(function (item) {
      return { item: item, score: scoreItem(item, tokenize(norm), norm) };
    }).filter(function (s) { return s.score > 0; }).sort(function (a, b) { return b.score - a.score; });

    if (scores.length && scores[0].score >= 5) {
      addBotMessage(formatResponse(scores[0].item)); return;
    }
    if (scores.length) {
      var topR = scores.slice(0, 3).map(function (s) { return formatResponse(s.item); }).filter(Boolean);
      if (topR.length) {
        addBotMessage('I found some related information that might help:<br><br>' + topR.join('<br><br>') +
          '<br><br><small>If this isn\'t what you were looking for, try rephrasing your question!</small>');
        return;
      }
    }

    /* Try AI fallback */
    if (CONFIG.useAI && aiKey) {
      callAI(query);
      return;
    }

    /* Show setup prompt if AI is enabled but no key */
    if (CONFIG.useAI && !aiKey) {
      addBotMessage(
        'I don\'t have an exact match for that in my local knowledge base. ' +
        'But I can connect to <strong>Google Gemini AI</strong> to answer ANY question about Fleetwood Mac!<br><br>' +
        '<button class="gerry-ai-btn" onclick="setupAIKey()">🔑 Set up AI</button>' +
        '<br><br><small>It\'s free — you just need a Gemini API key from Google AI Studio (takes 30 seconds).</small>'
      );
      return;
    }

    /* Complete fallback */
    addBotMessage(
      'I don\'t have information about that specific topic yet. I can tell you about:<br><br>' +
      '<strong>Band Members</strong> — bios, roles, instruments, and history<br>' +
      '<strong>Albums</strong> — discography, sales, and stories<br>' +
      '<strong>Songs</strong> — writers, rankings, and meanings<br>' +
      '<strong>Chart Rankings</strong> — Billboard, Rolling Stone positions<br>' +
      '<strong>Timeline</strong> — key events from 1967 to today<br>' +
      '<strong>Trivia</strong> — the stories behind the music<br><br>' +
      'What would you like to ask about?'
    );
  }

  /* ═══════════════════════════════════════════════
     AI INTEGRATION (Gemini)
     ═══════════════════════════════════════════════ */

  window.setupAIKey = function () {
    var key = prompt('Enter your free Google Gemini API key:\n(Get one at https://aistudio.google.com/apikey)');
    if (key && key.trim()) {
      aiKey = key.trim();
      localStorage.setItem('gerry_ai_key', aiKey);
      addBotMessage('✅ AI key saved! Now ask me anything about Fleetwood Mac and I\'ll use AI to answer. 🎵');
    } else {
      addBotMessage('No problem! You can still ask me anything using my local knowledge base.');
    }
  };

  function buildAIContext() {
    var parts = ['You are Gerry, a Fleetwood Mac expert assistant. Answer the user\'s question about Fleetwood Mac accurately and concisely using ONLY the context below. If the answer is not in the context, say "I don\'t have that specific information." Do not make up facts.\n\nCONTEXT:\n'];

    staticFacts.forEach(function (f) { parts.push('- ' + f.text.replace(/<[^>]+>/g, '')); });

    knowledge.forEach(function (k) {
      var d = k.data;
      if (k.table === 'band_members' && d.name) {
        parts.push('- Band member: ' + d.name + ', Role: ' + (d.role || '') + ', Instrument: ' + (d.instrument || '') + ', Bio: ' + (d.bio || '') + ', Composed: ' + (d.composed_songs || '') + ', Contributions: ' + (d.contributions || ''));
      } else if (k.table === 'albums' && d.title) {
        parts.push('- Album: ' + d.title + ' (' + (d.year || '') + '), Sales: ' + (d.sales || '') + ', Cert: ' + (d.cert || '') + ', Streams: ' + (d.streams || '') + ', Description: ' + (d.description || ''));
      } else if (k.table === 'songs' && d.title) {
        parts.push('- Song: ' + d.title + ', Album: ' + (d.album_title || '') + ', Year: ' + (d.year || '') + ', Writer: ' + (d.writer_name || '') + ', Streams: ' + (d.streams || '') + ', Rank: ' + (d.rank || ''));
      } else if (k.table === 'chart_rankings' && d.item_name) {
        parts.push('- Chart: ' + d.item_name + ', Source: ' + (d.source || '') + ', Type: ' + (d.chart_type || '') + ', Rank: ' + (d.rank || '') + ', Year: ' + (d.year || ''));
      } else if (k.table === 'milestones' && d.title) {
        parts.push('- Milestone: ' + d.year + ' - ' + d.title + ': ' + (d.description || ''));
      } else if (k.table === 'achievements' && d.title) {
        parts.push('- Achievement: ' + d.title + ', Value: ' + (d.value || ''));
      }
    });

    parts.push('\nAnswer the user\'s question conversationally using only the information above. Be friendly, enthusiastic, and thorough. If you don\'t know, say so honestly.');

    return parts.join('\n');
  }

  async function callAI(query) {
    var context = buildAIContext();
    var history = chatHistory.slice(-4).map(function (m) {
      return (m.role === 'user' ? 'User: ' : 'Assistant: ') + m.text;
    }).join('\n');

    var prompt = context + '\n\nConversation:\n' + history + '\n\nUser: ' + query + '\n\nAssistant:';

    try {
      var res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + encodeURIComponent(aiKey), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 600, topP: 0.95 }
        })
      });

      if (res.status === 429) {
        addBotMessage('Gemini AI is temporarily rate-limited. Please wait a moment and try again, or ask me using my local knowledge base.');
        return;
      }
      if (res.status === 403 || res.status === 400) {
        var errData = await res.json();
        if (errData.error && (errData.error.message || '').indexOf('API_KEY') !== -1) {
          aiKey = '';
          localStorage.removeItem('gerry_ai_key');
          addBotMessage('Your AI key appears to be invalid. Please set it up again.<br><br><button class="gerry-ai-btn" onclick="setupAIKey()">🔑 Set up AI key</button>');
          return;
        }
        addBotMessage('I encountered an error with the AI service. You can still ask me using my local knowledge base!');
        return;
      }
      if (!res.ok) {
        addBotMessage('AI service error. Please try again or ask me a different question.');
        return;
      }

      var data = await res.json();
      var text = '';
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        text = data.candidates[0].content.parts.map(function (p) { return p.text; }).join('').trim();
      }
      if (text) {
        addBotMessage(text.replace(/\n/g, '<br>'));
      } else {
        addBotMessage('The AI didn\'t return a response. Try rephrasing your question.');
      }
    } catch (e) {
      addBotMessage('Could not reach the AI service. Your local knowledge base is still available. Try asking another way!');
    }
  }

  /* ═══════════════════════════════════════════════
     MEMBER RESPONSES
     ═══════════════════════════════════════════════ */

  function generateMemberResponse(q) {
    var entry = findMember(q);
    if (!entry) {
      addBotMessage(
        'I\'m not sure which member you\'re asking about. Our members are: <strong>Mick Fleetwood</strong>, <strong>John McVie</strong>, <strong>Stevie Nicks</strong>, <strong>Lindsey Buckingham</strong>, and <strong>Christine McVie</strong>. Which one interests you?'
      );
      return;
    }

    var data = knowledge.find(function (k) {
      return k.table === 'band_members' && (k.data.name || '').toLowerCase() === entry.name.toLowerCase();
    });
    if (data) { addBotMessage(formatMember(data.data)); return; }

    if (entry.name === 'Peter Green') {
      addBotMessage(
        '<strong>Peter Green (1946–2020)</strong><br><br>' +
        'Peter Green was the <strong>founding guitarist and leader</strong> of Fleetwood Mac. Born Peter Allen Greenbaum in London, he was a <strong>blues prodigy</strong> who replaced Eric Clapton in John Mayall\'s Bluesbreakers at age 19. He formed Fleetwood Mac in 1967.<br><br>' +
        'His songwriting defined the early band: "Black Magic Woman" (later a hit for Santana), "Albatross" (#1 UK instrumental), "Oh Well", and "Man of the World". B.B. King said Green had "the sweetest tone I ever heard."<br><br>' +
        'After heavy LSD use, his mental health deteriorated. He left the band in 1970 following a chaotic final show. He passed away on <strong>July 25, 2020</strong>.<br><br>' +
        'He was inducted into the Rock and Roll Hall of Fame with Fleetwood Mac in 1998.'
      );
      return;
    }

    addBotMessage('<strong>' + entry.name + '</strong><br><em>' + entry.role + '</em><br><br>I don\'t have detailed information about this member yet, but they were part of Fleetwood Mac\'s storied history.');
  }

  /* ═══════════════════════════════════════════════
     ALBUM RESPONSES
     ═══════════════════════════════════════════════ */

  function generateAlbumResponse(q) {
    var entry = findAlbum(q);
    var norm = q.toLowerCase();

    if (!entry) {
      if (/\b(albums|discography|all|list)\b/.test(norm)) {
        var fact = staticFacts.find(function (f) { return f.intent === 'albums_list'; });
        if (fact) { addBotMessage(fact.text + '<br><br><small>Would you like details on a specific album?</small>'); return; }
      }
      var allA = knowledge.filter(function (k) { return k.table === 'albums'; });
      if (allA.length) {
        var html = '<strong>Fleetwood Mac Albums:</strong><br><br>';
        allA.sort(function (a, b) { return (a.data.year || 0) - (b.data.year || 0); });
        allA.forEach(function (a) { html += '• <strong>' + a.data.title + '</strong> (' + a.data.year + ')' + (a.data.sales ? ' — ' + a.data.sales : '') + '<br>'; });
        addBotMessage(html + '<br><small>Ask me about any specific album for more details!</small>');
        return;
      }
      var totalF = staticFacts.find(function (f) { return f.intent === 'albums_total'; });
      addBotMessage(totalF ? totalF.text : 'Fleetwood Mac released 18 studio albums. Ask me about any of them!');
      return;
    }

    var data = knowledge.find(function (k) {
      return k.table === 'albums' && (k.data.title || '').toLowerCase() === entry.title.toLowerCase();
    });
    if (data) { addBotMessage(formatAlbum(data.data)); return; }

    addBotMessage(
      '<strong>' + entry.title + '</strong> <em>(' + entry.year + ')</em><br><br>' +
      (entry.desc || '') + '<br><br>' +
      '<small>Detailed data for this album may not be loaded. Ask me about one of the major albums: Rumours, Fleetwood Mac (1975), Tusk, Mirage, or Tango in the Night.</small>'
    );
  }

  /* ═══════════════════════════════════════════════
     SONG RESPONSES
     ═══════════════════════════════════════════════ */

  function generateSongResponse(q) {
    var norm = q.toLowerCase();
    var entry = findSong(q);
    if (!entry) {
      var whowrote = norm.match(/(?:who|who's|tell me who)\s+(?:wrote|composed)\s+(?:the song\s+)?["']?(.+?)["']?$/);
      if (whowrote) {
        var sn = whowrote[1].trim().toLowerCase();
        for (var sk in songAliases) {
          if (songAliases[sk].title.toLowerCase().indexOf(sn) !== -1 || sn.indexOf(songAliases[sk].title.toLowerCase()) !== -1) {
            var wd = knowledge.find(function (k) { return k.table === 'band_members' && (k.data.composed_songs || '').toLowerCase().indexOf(songAliases[sk].title.toLowerCase()) !== -1; });
            addBotMessage('"<strong>' + songAliases[sk].title + '</strong>" was written by <strong>' + (wd ? wd.data.name : songAliases[sk].writer) + '</strong>.' + (songAliases[sk].year ? ' (Released ' + songAliases[sk].year + ')' : ''));
            return;
          }
        }
      }
      addBotMessage(
        'I know information about many Fleetwood Mac songs!<br><br>' +
        'Try asking: "Tell me about <strong>Dreams</strong>", "Who wrote <strong>Go Your Own Way</strong>?", or "What is <strong>The Chain</strong> about?"<br><br>' +
        'Or ask about: Dreams, Go Your Own Way, Landslide, Rhiannon, The Chain, Songbird, Everywhere, Little Lies, Tusk, Big Love, Silver Springs.'
      );
      return;
    }

    var songData = knowledge.find(function (k) {
      return k.table === 'songs' && (k.data.title || '').toLowerCase() === entry.title.toLowerCase();
    });

    if (norm.indexOf('write') !== -1 || norm.indexOf('compos') !== -1 || norm.indexOf('who') !== -1) {
      var writerInfo = knowledge.find(function (k) { return k.table === 'band_members' && (k.data.composed_songs || '').toLowerCase().indexOf(entry.title.toLowerCase()) !== -1; });
      if (writerInfo) {
        addBotMessage('"<strong>' + entry.title + '</strong>" was written by <strong>' + writerInfo.data.name + '</strong>.' + (entry.year ? ' Released in ' + entry.year + '.' : '') + (writerInfo.data.composed_songs ? '<br><br>Other songs by ' + writerInfo.data.name + ': ' + writerInfo.data.composed_songs : ''));
        return;
      }
      if (entry.writer) { addBotMessage('"<strong>' + entry.title + '</strong>" was written by <strong>' + entry.writer + '</strong>.' + (entry.year ? ' Released in ' + entry.year + '.' : '')); return; }
    }

    var meaningFacts = {
      'dreams': staticFacts.find(function (f) { return f.intent === 'dreams_meaning'; }),
      'go your own way': staticFacts.find(function (f) { return f.intent === 'go_your_own_way_meaning'; }),
      'the chain': staticFacts.find(function (f) { return f.intent === 'the_chain_meaning'; }),
      'songbird': staticFacts.find(function (f) { return f.intent === 'songbird_meaning'; }),
      'silver springs': staticFacts.find(function (f) { return f.intent === 'silver_springs'; }),
      'landslide': staticFacts.find(function (f) { return f.intent === 'landslide_meaning'; }),
      'rhiannon': staticFacts.find(function (f) { return f.intent === 'stevie_rhiannon'; }),
      'big love': staticFacts.find(function (f) { return f.intent === 'big_love_meaning'; })
    };

    for (var kk in meaningFacts) {
      if (entry.title.toLowerCase().indexOf(kk) !== -1 || kk.indexOf(entry.title.toLowerCase()) !== -1) {
        if (meaningFacts[kk]) {
          if (norm.indexOf('about') !== -1 || norm.indexOf('meaning') !== -1 || norm.indexOf('story') !== -1 || norm.indexOf('inspire') !== -1) {
            addBotMessage(meaningFacts[kk].text); return;
          }
        }
      }
    }

    if (songData) { addBotMessage(formatSong(songData.data)); return; }

    addBotMessage(
      '<strong>"' + entry.title + '"</strong>' + (entry.year ? ' <em>(' + entry.year + ')</em>' : '') +
      (entry.writer ? '<br>Written by: <strong>' + entry.writer + '</strong>' : '') +
      '<br><br><small>Detailed streaming/ranking data may not be available for this song.</small>'
    );
  }

  /* ═══════════════════════════════════════════════
     CHART / TIMELINE / ACHIEVEMENT
     ═══════════════════════════════════════════════ */

  function generateChartResponse(q) {
    var norm = q.toLowerCase();
    var charts = knowledge.filter(function (k) { return k.table === 'chart_rankings'; });

    if (!charts.length) { addBotMessage('Chart ranking data is not available right now.'); return; }

    var yearMatch = norm.match(/\b(19\d\d|20\d\d)\b/);
    if (yearMatch) {
      var year = yearMatch[1];
      var yc = charts.filter(function (c) { return String(c.data.year) === year; });
      if (yc.length) {
        var html = '<strong>Chart rankings from ' + year + ':</strong><br><br>';
        yc.forEach(function (c) { html += '• ' + formatChartRanking(c.data) + '<br>'; });
        addBotMessage(html); return;
      }
    }

    if (norm.indexOf('rolling stone') !== -1) {
      var rs = charts.filter(function (c) { return c.data.source === 'Rolling Stone'; });
      if (rs.length) {
        var html = '<strong>Rolling Stone Rankings:</strong><br><br>';
        rs.forEach(function (c) { html += '• <strong>' + c.data.chart_type + ':</strong> ' + c.data.item_name + ' — ' + c.data.rank + (c.data.detail ? ' (' + c.data.detail + ')' : '') + '<br>'; });
        addBotMessage(html); return;
      }
    }

    if (norm.indexOf('billboard') !== -1) {
      var bb = charts.filter(function (c) { return c.data.source === 'Billboard'; });
      if (bb.length) {
        var hot100 = bb.filter(function (c) { return c.data.chart_type === 'Hot 100'; }).sort(function (a, b) { return (parseInt(a.data.rank) || 999) - (parseInt(b.data.rank) || 999); });
        var html = '<strong>Billboard Hot 100 Hits:</strong><br><br>';
        hot100.slice(0, 10).forEach(function (c) { html += '• #' + c.data.rank + ' — "' + c.data.item_name + '" (' + c.data.year + ')' + (c.data.detail ? ' <em>' + c.data.detail + '</em>' : '') + '<br>'; });
        addBotMessage(html); return;
      }
    }

    addBotMessage(
      'Fleetwood Mac has <strong>' + charts.length + ' chart entries</strong> in my database:<br><br>' +
      '• <strong>Billboard:</strong> ' + charts.filter(function (c) { return c.data.source === 'Billboard'; }).length + ' entries<br>' +
      '• <strong>Rolling Stone:</strong> ' + charts.filter(function (c) { return c.data.source === 'Rolling Stone'; }).length + ' entries<br><br>' +
      'Ask for specifics like "Billboard Hot 100", "Rolling Stone rankings", or about a particular year!'
    );
  }

  function generateTimelineResponse(q) {
    var milestones = knowledge.filter(function (k) { return k.table === 'milestones'; }).sort(function (a, b) { return a.data.year - b.data.year; });
    if (!milestones.length) { addBotMessage('Timeline data is not available right now.'); return; }

    var norm = q.toLowerCase();
    var yearMatch = norm.match(/\b(19\d\d|20\d\d)\b/);
    if (yearMatch) {
      var year = yearMatch[1];
      var filtered = milestones.filter(function (m) { return String(m.data.year) === year; });
      if (filtered.length) {
        var html = '<strong>Events from ' + year + ':</strong><br><br>';
        filtered.forEach(function (m) { html += '• <strong>' + m.data.title + '</strong> — ' + m.data.description + '<br><br>'; });
        addBotMessage(html); return;
      }
    }

    if (norm.indexOf('early') !== -1 || norm.indexOf('beginning') !== -1 || norm.indexOf('origins') !== -1) {
      var early = milestones.slice(0, 4);
      var html = '<strong>The Early Years (1967–1970):</strong><br><br>';
      early.forEach(function (m) { html += '• <strong>' + m.data.year + '</strong> — ' + m.data.title + ': ' + m.data.description + '<br><br>'; });
      addBotMessage(html); return;
    }
    if (norm.indexOf('rumours') !== -1 || norm.indexOf('classic') !== -1 || norm.indexOf('buckingham') !== -1) {
      var classic = milestones.filter(function (m) { return m.data.year >= 1975 && m.data.year <= 1987; });
      var html = '<strong>The Classic Era (1975–1987):</strong><br><br>';
      classic.forEach(function (m) { html += '• <strong>' + m.data.year + '</strong> — ' + m.data.title + ': ' + m.data.description + '<br><br>'; });
      addBotMessage(html); return;
    }
    if (norm.indexOf('recent') !== -1 || norm.indexOf('later') !== -1 || norm.indexOf('modern') !== -1) {
      var later = milestones.filter(function (m) { return m.data.year >= 1990; });
      var html = '<strong>The Later Years (1990–present):</strong><br><br>';
      later.forEach(function (m) { html += '• <strong>' + m.data.year + '</strong> — ' + m.data.title + ': ' + m.data.description + '<br><br>'; });
      addBotMessage(html); return;
    }

    var html = '<strong>Fleetwood Mac Timeline — Key Events:</strong><br><br>';
    milestones.forEach(function (m) { html += '<strong>' + m.data.year + ':</strong> ' + m.data.title + '<br>'; });
    addBotMessage(html + '<br><small>Ask about a specific year or era for more details!</small>');
  }

  function generateAchievementResponse(q) {
    var achievements = knowledge.filter(function (k) { return k.table === 'achievements'; });
    if (!achievements.length) { addBotMessage('Achievement data is not available right now.'); return; }
    var html = '<strong>🏆 Key Achievements</strong><br><br>';
    achievements.forEach(function (a) { html += formatAchievement(a.data) + '<br><br>'; });
    html += '<strong>Sales Milestones:</strong><br>';
    html += '• Over <strong>120 million records</strong> sold worldwide<br>';
    html += '• <em>Rumours</em>: <strong>40+ million copies</strong><br>';
    html += '• Certified <strong>50 million albums</strong> in the US (RIAA)<br><br>';
    html += '<small>Ask about chart rankings or timeline for more!</small>';
    addBotMessage(html);
  }

  /* ═══════════════════════════════════════════════
     SCORING & FORMATTING
     ═══════════════════════════════════════════════ */

  function scoreItem(item, tokens, rawQuery) {
    var text = flattenItem(item).toLowerCase();
    var score = 0;
    var matched = 0;
    tokens.forEach(function (t) {
      var re = new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
      var m = text.match(re);
      if (m) { score += m.length * 8; matched++; }
      else if (text.indexOf(t) !== -1) { score += 3; matched += 0.5; }
    });
    if (matched === 0) return 0;
    score *= (0.5 + (matched / Math.max(tokens.length, 1)) * 0.5);

    var y = rawQuery.match(/\b(19\d\d|20\d\d)\b/);
    if (y && String(item.data.year) === y[1]) score += 30;
    if (item.table === 'band_members') score += 2;
    return score;
  }

  function flattenItem(item) {
    var d = item.data;
    var parts = [];
    Object.values(d).forEach(function (v) {
      if (typeof v === 'string') parts.push(v);
      else if (typeof v === 'number') parts.push(String(v));
      else if (v && typeof v === 'object')
        Object.values(v).forEach(function (x) { if (typeof x === 'string' || typeof x === 'number') parts.push(String(x)); });
    });
    return parts.join(' ');
  }

  function formatResponse(item) {
    switch (item.table) {
      case 'band_members': return formatMember(item.data);
      case 'albums': return formatAlbum(item.data);
      case 'songs': return formatSong(item.data);
      case 'chart_rankings': return formatChartRanking(item.data);
      case 'milestones': return formatMilestone(item.data);
      case 'achievements': return formatAchievement(item.data);
      case 'index_stats': return formatIndexStat(item.data);
      default: return flattenItem(item);
    }
  }

  function formatMember(d) {
    return '<strong>🎵 ' + d.name + '</strong><br><em>' + d.role + '</em>' + (d.instrument ? ' — ' + d.instrument : '') +
      '<br><br>' + (d.bio || '') +
      (d.before_fm ? '<br><br><strong>Before Fleetwood Mac:</strong> ' + d.before_fm : '') +
      (d.composed_songs ? '<br><br><strong>Composed Songs:</strong> ' + d.composed_songs : '') +
      (d.contributions ? '<br><br><strong>Notable Contributions:</strong> ' + d.contributions : '');
  }

  function formatAlbum(d) {
    return '<strong>💿 ' + d.title + '</strong>' + (d.year ? ' <em>(' + d.year + ')</em>' : '') +
      (d.description ? '<br><br>' + d.description : '') +
      (d.sales ? '<br><br><strong>Sales:</strong> ' + d.sales : '') +
      (d.streams ? '<br><strong>Streams:</strong> ' + d.streams : '') +
      (d.cert ? '<br><strong>Certification:</strong> ' + d.cert : '') +
      (d.era ? '<br><strong>Era:</strong> ' + d.era : '');
  }

  function formatSong(d) {
    return '<strong>🎵 "' + d.title + '"</strong>' + (d.album_title || d.albums?.title ? ' — <em>' + (d.album_title || d.albums.title) + '</em>' : '') +
      (d.year ? ' (' + d.year + ')' : '') +
      (d.rank ? '<br><strong>Rank:</strong> #' + d.rank : '') +
      (d.streams ? '<br><strong>Streams:</strong> ' + Number(d.streams).toLocaleString() : '') +
      (d.writer_name ? '<br><strong>Written by:</strong> ' + d.writer_name : '');
  }

  function formatChartRanking(d) {
    return '<strong>' + d.item_name + '</strong>' + (d.rank ? ' — <strong>' + d.rank + '</strong>' : '') +
      (d.year ? ' <em>(' + d.year + ')</em>' : '') +
      '<br><strong>Source:</strong> ' + d.source + ' (' + d.chart_type + ')' +
      (d.detail ? '<br><em>' + d.detail + '</em>' : '');
  }

  function formatMilestone(d) {
    return '<strong>📅 ' + d.year + ' — ' + d.title + '</strong>' + (d.description ? '<br><br>' + d.description : '');
  }

  function formatAchievement(d) {
    return '<strong>🏆 ' + d.title + '</strong>' + (d.description ? '<br><br>' + d.description : '') +
      (d.value ? '<br><br><strong>' + (d.sub_value ? d.sub_value + ':' : '') + '</strong> ' + d.value : '');
  }

  function formatIndexStat(d) {
    return '<strong>📈 ' + d.label + ':</strong> ' + d.value;
  }

  /* ═══════════════════════════════════════════════
     n8n FALLBACK
     ═══════════════════════════════════════════════ */

  async function callN8N(query) {
    try {
      var res = await fetch(CONFIG.n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, history: chatHistory.slice(-10) })
      });
      var data = await res.json();
      addBotMessage(data.response || data.output || '...');
    } catch (e) {
      addBotMessage('Sorry, I could not reach the n8n AI service. Please try again later.');
    }
  }

  /* ═══════════════════════════════════════════════
     START
     ═══════════════════════════════════════════════ */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
