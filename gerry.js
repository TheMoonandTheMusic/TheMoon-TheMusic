(function () {
  'use strict';

  const CONFIG = {
    supabaseUrl: 'https://wqpnsuzulmrbsfuradjt.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcG5zdXp1bG1yYnNmdXJhZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MTA1NjEsImV4cCI6MjA5OTA4NjU2MX0.BFoI9LWKe9L5bvOOw45GeqYKw2GVmGC0ErdsMOsiwss',
    useN8N: false,
    n8nWebhookUrl: '',
    botName: 'Gerry',
    botTitle: 'Fleetwood Mac Expert'
  };

  let knowledge = [];
  let chatHistory = [];
  let memberNames = [];
  let albumNames = [];
  let songNames = [];

  const greetings = [
    'Hi there, I\'m Gerry — your Fleetwood Mac guide. Ask me anything about the band, their music, history, or legacy.',
    'Welcome to The Moon & The Music. I\'m Gerry, your Fleetwood Mac expert. What would you like to know?',
    'Hey! Gerry here. I know everything about Fleetwood Mac — from the Peter Green blues days to the Rumours era and beyond. Fire away!'
  ];

  const quickReplies = [
    'Tell me about the band members',
    'What albums did they release?',
    'Tell me about Rumours',
    'What are their biggest hits?',
    'Top chart achievements',
    'Band history timeline'
  ];

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
    'gyo w': { title: 'Go Your Own Way', writer: 'Lindsey Buckingham', year: 1977 },
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
    'green manalishi': { title: 'The Green Manalishi (With the Two Prong Crown)', writer: 'Peter Green', year: 1970 },
    'hypnotized': { title: 'Hypnotized', writer: 'Bob Welch', year: 1973 }
  };

  const songWriterLookup = {};
  Object.entries(songAliases).forEach(([key, info]) => {
    const k = info.title.toLowerCase();
    if (!songWriterLookup[k]) songWriterLookup[k] = info.writer;
  });

  const staticFacts = [
    { intent: 'formation', keywords: ['formed', 'formed in', 'formed when', 'started', 'began', 'created', 'founded', 'origin', 'origins', 'how did they form', 'how did it start', 'when were they formed', 'when did they form', 'when did they start', 'when was the band formed'], text: 'Fleetwood Mac was formed in <strong>London, July 1967</strong> by Peter Green, who recruited Mick Fleetwood and John McVie from John Mayall\'s Bluesbreakers. The band name combines the surnames of Mick Fleetwood and John McVie.' },
    { intent: 'name_origin', keywords: ['name come from', 'name mean', 'why are they called', 'why named', 'why the name', 'origin of name', 'band name', 'how did they get their name', 'how did the name'], text: 'The name <strong>Fleetwood Mac</strong> comes from the surnames of rhythm section members <strong>Mick Fleetwood</strong> and <strong>John McVie</strong>. Peter Green chose the name, joked that the rhythm section would never quit if the band was named after them!' },
    { intent: 'genre', keywords: ['genre', 'style', 'type of music', 'kind of music', 'what genre', 'what kind of', 'musical style', 'what style'], text: 'Fleetwood Mac evolved from <strong>British blues</strong> (1967-1970, under Peter Green) to <strong>soft rock / pop rock</strong> (1975 onward). Their sound blends rock, pop, folk, and experimental elements, with four distinct eras: <em>Peter Green blues (1967-1970), Bob Welch transitional (1971-1974), Buckingham/Nicks classic (1975-1987), and post-classic (1990-present)</em>.' },
    { intent: 'biggest_hit', keywords: ['biggest hit', 'most popular', 'most famous', 'number one', '#1', 'their biggest', 'most successful song', 'best known song', 'signature song'], text: 'Fleetwood Mac\'s biggest hit is <strong>"Dreams"</strong>, written by Stevie Nicks. It reached <strong>#1 on the Billboard Hot 100</strong> in 1977 and went viral on TikTok in 2020, becoming one of the most-streamed songs from the 20th century with billions of streams.' },
    { intent: 'best_album', keywords: ['best album', 'greatest album', 'most successful album', 'which album', 'what is the best', 'top album', 'most popular album'], text: 'Fleetwood Mac\'s most acclaimed and best-selling album is <strong>"Rumours"</strong> (1977), with over <strong>40 million copies</strong> sold worldwide. It won Album of the Year at the Grammys, spent 31 weeks at #1 on the Billboard 200, and Rolling Stone ranked it <strong>#7 on the 500 Greatest Albums of All Time</strong>.' },
    { intent: 'mick_facts', keywords: ['tall', 'height', 'how tall', 'mick height', 'mick fleetwood height', 'tall drummer'], text: 'Mick Fleetwood stands at <strong>6\'5" (196 cm)</strong>, making him one of the tallest drummers in rock history. His eccentric stage presence and towering frame became a visual hallmark of the band.' },
    { intent: 'stevie_facts', keywords: ['stevie style', 'stevie fashion', 'witch', 'shawl', 'twirl', 'spin', 'stage presence', 'stevie nicks style', 'stevie nicks fashion', 'gypsy style'], text: 'Stevie Nicks is famous for her <strong>mystical stage presence</strong> — flowing shawls, platform boots, and her iconic twirling spin while singing. She cultivated a "gypsy witch" persona that made her one of rock\'s most visually distinctive performers.' },
    { intent: 'lindsey_facts', keywords: ['lindsey style', 'fingerpick', 'fingerpicking', 'lindsey buckingham style', 'lindsey buckingham technique', 'lindsey production', 'obsessive', 'perfectionist'], text: 'Lindsey Buckingham is known for his <strong>virtuosic fingerpicking guitar technique</strong> and obsessive production style. He produced or co-produced most of the band\'s classic albums, often spending weeks perfecting a single guitar part or vocal harmony.' },
    { intent: 'christine_facts', keywords: ['christine songs', 'christine mcvie songs', 'christine style', 'christine mcvie style', 'christine voice', 'warm voice'], text: 'Christine McVie was the band\'s <strong>pop mastermind</strong>, writing many of their most commercially successful songs: "Don\'t Stop", "Little Lies", "Everywhere", "You Make Loving Fun", "Songbird", and "Hold Me". Her warm, soulful voice and piano-driven melodies provided the emotional balance to the band.' },
    { intent: 'peter_green_facts', keywords: ['peter green', 'peter green talent', 'peter green guitar', 'peter green playing', 'peter green style', 'green god', 'greeny', 'peter green blues'], text: 'Peter Green was a <strong>blues guitar prodigy</strong> who played with Eric Clapton in John Mayall\'s Bluesbreakers. He influenced B.B. King, who said Green "had the sweetest tone I ever heard." His songwriting included "Black Magic Woman" (later a hit for Santana), "Albatross", "Oh Well", and "The Green Manalishi". He left the band in 1970 after his mental health deteriorated from heavy LSD use.' },
    { intent: 'tiktok', keywords: ['tiktok', 'viral', 'dreams tiktok', 'tiktok 2020', 'viral renaissance', 'fleetwood mac tiktok', 'goat', 'fleetwood mac viral'], text: 'In <strong>September 2020</strong>, "Dreams" went viral on TikTok after a video of <strong>@doggface208 (Nathan Apodaca)</strong> skateboarding while drinking cranberry juice and lip-syncing to the song. It earned billions of streams, charted again on the Billboard Hot 100, and introduced Fleetwood Mac to an entirely new generation.' },
    { intent: 'grammy', keywords: ['grammy', 'award', 'won', 'awards', 'how many grammys', 'grammy award', 'awards won'], text: 'Fleetwood Mac has won <strong>2 Grammy Awards</strong>. <em>Rumours</em> won the prestigious <strong>Album of the Year</strong> in 1978. The band also received the <strong>Lifetime Achievement Award</strong> at the Grammys in 2018 and has been nominated many times across their career.' },
    { intent: 'hall_of_fame', keywords: ['hall of fame', 'rock and roll hall of fame', 'inducted', 'induction', 'rock hall', 'rrf', 'when were they inducted', 'inducted into'], text: 'Fleetwood Mac was <strong>inducted into the Rock and Roll Hall of Fame in 1998</strong>. The classic lineup of Mick Fleetwood, John McVie, Stevie Nicks, Lindsey Buckingham, and Christine McVie performed together at the ceremony, joined by a reclusive <strong>Peter Green</strong>.' },
    { intent: 'lineup_changes', keywords: ['lineup changes', 'members changed', 'how many members', 'who played in', 'members over the years', 'original members', 'original lineup', 'founding members', 'how many members have', 'lineup'], text: 'Fleetwood Mac has had <strong>over 15 members</strong> across its history. The original 1967 lineup: <strong>Peter Green</strong> (guitar), <strong>Jeremy Spencer</strong> (guitar), <strong>Mick Fleetwood</strong> (drums), <strong>John McVie</strong> (bass). The classic 1975-1987 lineup: <strong>Mick Fleetwood, John McVie, Stevie Nicks, Lindsey Buckingham, Christine McVie</strong>. Other notable members: Danny Kirwan, Bob Welch, Bob Weston, Dave Walker, Billy Burnette, Rick Vito, Bekka Bramlett, Dave Mason.' },
    { intent: 'tours', keywords: ['tour', 'concerts', 'performed', 'live shows', 'world tour', 'touring', 'biggest tour', 'tours they did', 'grossed'], text: 'Fleetwood Mac\'s biggest tour was the <strong>"An Evening with Fleetwood Mac" (2018-2019)</strong>, which grossed over <strong>$150 million</strong>. Their <strong>"On With the Show Tour" (2014-2015)</strong>, featuring Christine McVie\'s return, sold 1.2 million tickets for $100M+. The <strong>"The Dance Reunion Tour" (1997)</strong> had 89 dates across North America and grossed $80M.' },
    { intent: 'songbird_meaning', keywords: ['songbird meaning', 'songbird about', 'songbird story', 'songbird written', 'songbird christine'], text: '"Songbird" was written by <strong>Christine McVie</strong> in about <strong>half an hour</strong> at the piano in her home. It\'s one of her most personal songs, written as a simple expression of love. The song became a staple of weddings and memorial services, and was played at Christine\'s own funeral in 2022.' },
    { intent: 'dreams_meaning', keywords: ['dreams about', 'dreams meaning', 'dreams inspiration', 'dreams written', 'dreams story', 'dreams stevie', 'what is dreams about', 'what inspired dreams'], text: '"Dreams" was written by <strong>Stevie Nicks</strong> about the breakdown of her relationship with <strong>Lindsey Buckingham</strong>. She wrote it in just 10 minutes at the Record Plant in Sausalito, sitting in a closet with a portable keyboard. The song became Fleetwood Mac\'s only <strong>#1 Billboard Hot 100</strong> hit.' },
    { intent: 'go_your_own_way_meaning', keywords: ['go your own way about', 'go your own way meaning', 'go your own way written', 'go your own way lindsey', 'go your own way story', 'what is go your own way about'], text: '"Go Your Own Way" was written by <strong>Lindsey Buckingham</strong> about his painful breakup with <strong>Stevie Nicks</strong>. The raw, emotional lyrics reflect their toxic relationship during the Rumours sessions. Stevie famously hated being told to "pack her things" and found the song "too personal."' },
    { intent: 'the_chain_meaning', keywords: ['the chain about', 'the chain meaning', 'the chain written', 'the chain story', 'what is the chain about', 'the chain bass', 'the chain everyone'], text: '"The Chain" is the <strong>only song credited to all five members</strong> of the classic Fleetwood Mac lineup. Each member contributed a section: the iconic bass intro by <strong>John McVie</strong>, the "chain keep us together" chorus by all five, the guitar solo by Lindsey, and the driving ending by Mick Fleetwood. It\'s famous for being the theme song for <strong>Formula 1</strong> broadcasts.' },
    { intent: 'silver_springs', keywords: ['silver springs', 'silver springs about', 'silver springs story', 'silver springs stevie', 'silver springs lindsey', 'silver springs dance', 'what is silver springs about'], text: '"Silver Springs" was written by <strong>Stevie Nicks</strong> about <strong>Lindsey Buckingham</strong>, but was famously left off <em>Rumours</em> in favor of shorter songs. In 1997, during <strong>The Dance</strong> reunion concert, Stevie sang it directly at Lindsey with such raw intensity that it became legendary — the performance has over 100 million views on YouTube.' },
    { intent: 'albums_total', keywords: ['how many albums', 'total albums', 'albums released', 'discography', 'how many studio albums', 'number of albums', 'album count'], text: 'Fleetwood Mac has released <strong>18 studio albums</strong>, plus multiple live albums, compilations, and box sets. Their discography spans from 1968 (<em>Fleetwood Mac</em>) to 2003 (<em>Say You Will</em>). Their most commercially successful album is <em>Rumours</em> (1977), followed by <em>Fleetwood Mac</em> (1975), <em>Tango in the Night</em> (1987), and <em>Tusk</em> (1979).' },
    { intent: 'net_worth', keywords: ['worth', 'net worth', 'how much', 'fortune', 'money', 'rich', 'wealth', 'networth', 'worth how much'], text: 'Fleetwood Mac\'s collective net worth is estimated at <strong>$200-300 million+</strong> combined.<br><br><strong>Individual estimates:</strong><br>• Mick Fleetwood: <strong>$45M</strong><br>• Stevie Nicks: <strong>$120M</strong><br>• Lindsey Buckingham: <strong>$80M</strong><br>• John McVie: <strong>$25M</strong><br>• Christine McVie (estate): <strong>$25M</strong><br><br>Their 2018-2019 tour alone grossed <strong>$150M+</strong>.' },
    { intent: 'peter_green_death', keywords: ['peter green die', 'peter green death', 'peter green passed', 'peter green dead', 'peter green died', 'when did peter green', 'peter green 2020'], text: 'Peter Green passed away on <strong>July 25, 2020</strong> at age 73. His death was announced by his family in a statement. Despite leaving Fleetwood Mac in 1970 and living a quiet life away from the spotlight, his influence on British blues and Fleetwood Mac\'s legacy was immense.' },
    { intent: 'christine_death', keywords: ['christine mcvie die', 'christine mcvie death', 'christine passed', 'christine died', 'christine dead', 'when did christine', 'christine mcvie 2022', 'christine mcvie died of'], text: 'Christine McVie passed away on <strong>November 30, 2022</strong> at age 79 after a brief illness. Her death was marked by an outpouring of tributes from across the music world. Stevie Nicks said, "A part of my heart has flown away today." Christine\'s warm voice and timeless songs remain a core part of Fleetwood Mac\'s legacy.' },
    { intent: 'stevie_and_lindsey', keywords: ['stevie and lindsey', 'lindsey and stevie', 'stevie lindsey relationship', 'did stevie and lindsey date', 'stevie lindsey breakup', 'stevie and lindsey together', 'relationship stevie lindsey'], text: 'Stevie Nicks and Lindsey Buckingham were a <strong>romantic couple</strong> before joining Fleetwood Mac. They met in high school, formed a duo called <strong>Buckingham Nicks</strong>, and joined Fleetwood Mac on New Year\'s Eve 1974. Their <strong>tumultuous breakup</strong> during the <em>Rumours</em> sessions (1976-1977) fueled the album\'s emotional intensity, with songs like "Dreams" (Stevie about Lindsey) and "Go Your Own Way" (Lindsey about Stevie) immortalizing their pain.' },
    { intent: 'sales_total', keywords: ['how many records', 'total sales', 'records sold', 'copies sold', 'how much sold', 'sales worldwide', 'album sales'], text: 'Fleetwood Mac has sold over <strong>120 million records worldwide</strong>, making them one of the best-selling music artists of all time. <em>Rumours</em> alone accounts for over <strong>40 million copies</strong>. In the US alone, they have sold more than <strong>50 million albums</strong> certified by the RIAA.' },
    { intent: 'christine_mcvie_songs_list', keywords: ['songs did christine write', 'songs did christine mcvie write', 'christine mcvie wrote', 'christine mcvie songs', 'songs by christine', 'christine compositions', 'christine wrote'], text: 'Christine McVie wrote or co-wrote many of Fleetwood Mac\'s biggest hits, including:<br><br><strong>• "Don\'t Stop"</strong><br><strong>• "Everywhere"</strong><br><strong>• "Little Lies"</strong><br><strong>• "You Make Loving Fun"</strong><br><strong>• "Songbird"</strong><br><strong>• "Hold Me"</strong><br><strong>• "Over My Head"</strong><br><strong>• "Say You Love Me"</strong><br><strong>• "Think About Me"</strong><br><strong>• "Warm Ways"</strong><br><strong>• "World Turning"</strong> (co-write with Lindsey)<br><br>Her songs were known for their warm, melodic quality and were the commercial backbone of the band.' },
    { intent: 'stevie_songs_list', keywords: ['songs did stevie write', 'songs did stevie nicks write', 'stevie nicks wrote', 'stevie nicks songs', 'songs by stevie', 'stevie compositions', 'stevie wrote'], text: 'Stevie Nicks wrote some of Fleetwood Mac\'s most iconic songs, including:<br><br><strong>• "Dreams"</strong> — The band\'s only #1 Hot 100 hit<br><strong>• "Rhiannon"</strong> — Inspired by a Welsh witch<br><strong>• "Landslide"</strong> — A deeply personal acoustic ballad<br><strong>• "Gold Dust Woman"</strong> — About the dark side of fame<br><strong>• "Silver Springs"</strong> — Left off Rumours, legendary live version<br><strong>• "Sara"</strong> — The longest song on Tusk (6:22)<br><strong>• "Gypsy"</strong> — Nostalgic look at her pre-fame days<br><strong>• "Beautiful Child"</strong><br><strong>• "Sisters of the Moon"</strong><br><br>Her poetic, mystical lyrics and distinctive voice made her one of rock\'s most influential female songwriters.' },
    { intent: 'lindsey_songs_list', keywords: ['songs did lindsey write', 'songs did lindsey buckingham write', 'lindsey buckingham wrote', 'lindsey buckingham songs', 'songs by lindsey', 'lindsey compositions', 'lindsey wrote'], text: 'Lindsey Buckingham wrote many of Fleetwood Mac\'s most acclaimed songs, including:<br><br><strong>• "Go Your Own Way"</strong> — About his breakup with Stevie<br><strong>• "Tusk"</strong> — The avant-garde marching band anthem<br><strong>• "Big Love"</strong> — A driving, fingerpicked classic<br><strong>• "Never Going Back Again"</strong> — Deceptively complex fingerpicking<br><strong>• "Second Hand News"</strong> — Opening track of Rumours<br><strong>• "The Chain"</strong> (co-write with all five members)<br><strong>• "I\'m So Afraid"</strong> — A haunting, intense live staple<br><strong>• "That\'s All for Everyone"</strong><br><strong>• "Trouble"</strong> — From his solo debut<br><br>His intricate guitar work and innovative production defined the band\'s sound.' },
    { intent: 'albums_list', keywords: ['list of albums', 'albums in order', 'chronological albums', 'album discography', 'all albums', 'list albums', 'albums list'], text: 'Fleetwood Mac\'s 18 studio albums (in order):<br><br><strong>Peter Green Era:</strong><br>1. Fleetwood Mac (1968)<br>2. Mr. Wonderful (1968)<br>3. Then Play On (1969)<br><br><strong>Transitional Era:</strong><br>4. Kiln House (1970)<br>5. Future Games (1971)<br>6. Bare Trees (1972)<br>7. Penguin (1973)<br>8. Mystery to Me (1973)<br>9. Heroes Are Hard to Find (1974)<br><br><strong>Buckingham/Nicks Classic Era:</strong><br>10. Fleetwood Mac "White Album" (1975)<br>11. Rumours (1977)<br>12. Tusk (1979)<br>13. Mirage (1982)<br>14. Tango in the Night (1987)<br><br><strong>Later Era:</strong><br>15. Behind the Mask (1990)<br>16. Time (1995)<br>17. Say You Will (2003)<br><br><strong>Essential Live Album:</strong><br>• The Dance (1997)' },
    { intent: 'where_are_they_from', keywords: ['where are they from', 'where is', 'where did they come from', 'origin of band', 'band origin', 'where were they formed', 'where did the band originate', 'nationality', 'band from'], text: 'Fleetwood Mac is a <strong>British-American</strong> band. They were <strong>formed in London, England in 1967</strong> by Peter Green, Mick Fleetwood, and John McVie (all British). After adding Californians Stevie Nicks and Lindsey Buckingham in 1975, the band became a true Anglo-American hybrid. The band became closely associated with <strong>California\'s Laurel Canyon sound</strong> in the late 70s.' },
    { intent: 'who_is_gerry', keywords: ['who are you', 'who is gerry', 'gerry who', 'what is gerry', 'gerry fleetwood', 'why gerry', 'who the hell', 'tell me about yourself'], text: 'I\'m <strong>Gerry</strong>, your Fleetwood Mac expert! I\'m named after <strong>Gerry Fleetwood</strong> (no direct relation — just a fun play on words). I know everything about the band: their members, albums, songs, chart history, and legacy. Ask me anything about Fleetwood Mac and I\'ll do my best to answer with detailed, accurate information.' },
    { intent: 'hippie', keywords: ['hippie', 'love', 'peace', 'vibes', 'vibe', 'mood', 'aesthetic', '70s', '70s band'], text: 'Fleetwood Mac is the <strong>quintessential 70s band</strong>. Their sound defined soft rock with its California harmonies, confessional songwriting, and mix of folk, pop, and rock. The <em>Rumours</em> era (1977) captured the height of 70s music culture — big hair, bigger emotions, and the deathless sound of a band falling apart while making the greatest album of their lives.' }
  ];

  const intentMap = {
    formation: ['formed', 'found', 'started', 'began', 'created', 'origin'],
    genre: ['genre', 'style', 'type of music', 'rock', 'blues', 'pop'],
    name_origin: ['name', 'called', 'mean'],
    best_album: ['best album', 'greatest album', 'what album'],
    biggest_hit: ['biggest hit', 'best song', 'most famous'],
    tours: ['tour', 'concert', 'gross', 'performed live'],
    lineup_changes: ['lineup', 'members change', 'who played', 'original members'],
    stevie_and_lindsey: ['stevie and lindsey', 'lindsey and stevie', 'relationship'],
    sales_total: ['total sales', 'records sold', 'copies', 'how many records'],
    tiktok: ['tiktok', 'viral', '2020', 'doggface'],
    hall_of_fame: ['hall of fame', 'inducted', 'rock hall'],
    grammy: ['grammy', 'award', 'won'],
    net_worth: ['net worth', 'worth', 'money', 'rich', 'wealth'],
    albums_total: ['how many albums', 'discography', 'total albums'],
    albums_list: ['all albums', 'list albums', 'album list', 'order', 'chronological'],
    stevie_songs_list: ['stevie write', 'stevie composed', 'songs by stevie', 'stevie songs'],
    lindsey_songs_list: ['lindsey write', 'lindsey composed', 'songs by lindsey', 'lindsey songs'],
    christine_mcvie_songs_list: ['christine write', 'christine composed', 'songs by christine', 'christine songs'],
    dreams_meaning: ['dreams meaning', 'dreams about', 'dreams inspiration'],
    go_your_own_way_meaning: ['go your own way meaning', 'go your own way about'],
    the_chain_meaning: ['the chain meaning', 'the chain about'],
    songbird_meaning: ['songbird meaning', 'songbird about'],
    silver_springs: ['silver springs'],
    christine_death: ['christine mcvie death', 'christine mcvie died'],
    peter_green_death: ['peter green death', 'peter green died'],
    where_are_they_from: ['where from', 'where are they from', 'nationality', 'band from'],
    stevie_facts: ['stevie style', 'stevie fashion', 'stevie twirl'],
    lindsey_facts: ['lindsey style', 'fingerpick'],
    christine_facts: ['christine style', 'warm voice'],
    peter_green_facts: ['peter green', 'green god'],
    mick_facts: ['mick height', 'how tall', 'tall'],
    who_is_gerry: ['who are you', 'who is', 'what is gerry'],
    hippie: ['hippie', 'vibes', '70s band', 'aesthetic'],
    albums_total: ['album count', 'albums released', 'studio albums']
  };

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
    panel.innerHTML = `
      <div id="gerry-header">
        <div id="gerry-header-left">
          <div id="gerry-avatar">G</div>
          <div id="gerry-header-info">
            <h3>${CONFIG.botName}</h3>
            <p>${CONFIG.botTitle}</p>
          </div>
        </div>
        <button id="gerry-close-btn" aria-label="Close chat">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div id="gerry-messages"></div>
      <div id="gerry-input-area">
        <input id="gerry-input" type="text" placeholder="Ask about Fleetwood Mac..." autocomplete="off">
        <button id="gerry-send-btn" aria-label="Send message">
          <span class="material-symbols-outlined">arrow_upward</span>
        </button>
      </div>
    `;
    document.body.appendChild(panel);
  }

  async function loadKnowledge() {
    try {
      const supabase = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
      const tables = ['band_members', 'albums', 'songs', 'chart_rankings', 'milestones', 'achievements', 'index_stats'];
      const results = await Promise.all(
        tables.map(t => supabase.from(t).select('*').then(r => ({ table: t, data: r.data || [], error: r.error })))
      );
      results.forEach(({ table, data }) => {
        data.forEach(item => knowledge.push({ table, data: item }));
      });

      memberNames = knowledge
        .filter(k => k.table === 'band_members')
        .map(k => k.data.name?.toLowerCase())
        .filter(Boolean);

      albumNames = knowledge
        .filter(k => k.table === 'albums')
        .map(k => k.data.title?.toLowerCase())
        .filter(Boolean);

      songNames = knowledge
        .filter(k => k.table === 'songs')
        .map(k => k.data.title?.toLowerCase())
        .filter(Boolean);
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
    const trigger = document.getElementById('gerry-trigger');
    if (trigger) trigger.addEventListener('click', openPanel);
  }

  function togglePanel() {
    const panel = document.getElementById('gerry-panel');
    const isOpen = panel.classList.contains('open');
    if (isOpen) { closePanel(); } else { openPanel(); }
  }

  function openPanel() {
    const panel = document.getElementById('gerry-panel');
    panel.classList.add('open');
    if (chatHistory.length === 0) {
      setTimeout(() => {
        addBotMessage(greetings[Math.floor(Math.random() * greetings.length)]);
        showQuickReplies();
      }, 400);
    }
    document.getElementById('gerry-input').focus();
  }

  function closePanel() {
    document.getElementById('gerry-panel').classList.remove('open');
  }

  function handleSend() {
    const input = document.getElementById('gerry-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addUserMessage(text);
    chatHistory.push({ role: 'user', text });
    showTyping();
    setTimeout(() => {
      generateResponse(text);
    }, 400 + Math.random() * 300);
  }

  function addUserMessage(text) {
    const container = document.getElementById('gerry-messages');
    const div = document.createElement('div');
    div.className = 'gerry-msg user';
    div.textContent = text;
    container.appendChild(div);
    scrollToBottom();
  }

  function addBotMessage(html) {
    const container = document.getElementById('gerry-messages');
    removeTyping();
    const div = document.createElement('div');
    div.className = 'gerry-msg bot';
    div.innerHTML = html;
    container.appendChild(div);
    scrollToBottom();
    chatHistory.push({ role: 'bot', text: html });
  }

  function showTyping() {
    removeTyping();
    const container = document.getElementById('gerry-messages');
    const div = document.createElement('div');
    div.className = 'gerry-typing';
    div.id = 'gerry-typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(div);
    scrollToBottom();
  }

  function removeTyping() {
    const el = document.getElementById('gerry-typing-indicator');
    if (el) el.remove();
  }

  function scrollToBottom() {
    const container = document.getElementById('gerry-messages');
    container.scrollTop = container.scrollHeight;
  }

  function showQuickReplies() {
    const container = document.getElementById('gerry-messages');
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;align-self:flex-start;';
    quickReplies.forEach(q => {
      const btn = document.createElement('button');
      btn.textContent = q;
      btn.style.cssText = 'font-family:Hanken Grotesk,sans-serif;font-size:12px;padding:6px 12px;border:1px solid rgba(0,0,0,0.15);border-radius:20px;background:transparent;color:#1c1b1b;cursor:pointer;transition:all 0.2s;min-height:32px;';
      btn.onmouseover = () => { btn.style.background = '#000'; btn.style.color = '#fff'; };
      btn.onmouseout = () => { btn.style.background = 'transparent'; btn.style.color = '#1c1b1b'; };
      btn.onclick = () => {
        addUserMessage(q);
        chatHistory.push({ role: 'user', text: q });
        showTyping();
        setTimeout(() => generateResponse(q), 400 + Math.random() * 300);
      };
      div.appendChild(btn);
    });
    container.appendChild(div);
    scrollToBottom();
  }

  function normalizeText(str) {
    return str
      .toLowerCase()
      .replace(/[á]/g, 'a')
      .replace(/[é]/g, 'e')
      .replace(/[í]/g, 'i')
      .replace(/[ó]/g, 'o')
      .replace(/[ú]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ü]/g, 'u')
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"')
      .replace(/[^a-z0-9\s']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokenize(text) {
    return text
      .replace(/[^a-z0-9áéíóúñü\s']/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1 && !commonWords.has(t));
  }

  const commonWords = new Set([
    'the','a','an','is','was','are','were','has','have','had','do','does','did',
    'can','could','will','would','shall','should','may','might','must','about',
    'tell','me','give','show','list','all','some','any','get','find','search',
    'know','like','just','want','does','need','please','thanks','thank','you',
    'your','its','their','our','this','that','these','those','with','without',
    'from','they','them','he','she','his','her','for','not','but','and','or',
    'very','much','many','more','then','than','also','too','been','being',
    'have','has','had','having','make','made','makes','take','took','taken',
    'what','when','where','who','why','how','which'
  ]);

  /* ─── Intent Detection ─── */

  function detectIntent(q, norm) {
    if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|what'?s\s*up|sup|howdy|hola)\b/.test(q)) {
      return 'GREETING';
    }
    if (/(^|\s)(bye|goodbye|see you|adios|chao|ciao|hasta luego)(\s|$)/.test(q)) {
      return 'FAREWELL';
    }
    if (/(thank|thanks|gracias|appreciate)/.test(q)) {
      return 'THANKS';
    }

    const memberEntry = findMemberInQuery(q);
    if (memberEntry) return 'MEMBER_QUERY';

    const albumEntry = findAlbumInQuery(q);
    if (albumEntry) return 'ALBUM_QUERY';

    const songEntry = findSongInQuery(q);
    if (songEntry) return 'SONG_QUERY';

    for (const staticFact of staticFacts) {
      for (const keyword of staticFact.keywords) {
        if (norm.includes(keyword) || q.includes(keyword)) {
          return staticFact.intent;
        }
      }
    }

    if (/\b(chart|ranking|rank|#\d|billboard|rolling stone|position|top|greatest|best)\b/.test(q)) {
      return 'CHART_QUERY';
    }
    if (/\b(timeline|history|when\s*(did|was|were)|what\s*year|milestone|event|happened)\b/.test(q)) {
      return 'TIMELINE_QUERY';
    }
    if (/\b(achievement|award|sales|stream|platinum|gold|diamond|certif|copies|record)\b/.test(q)) {
      return 'ACHIEVEMENT_QUERY';
    }

    return 'UNKNOWN';
  }

  function findMemberInQuery(q) {
    const norm = q.toLowerCase().trim();
    const entries = Object.entries(memberAliases).filter(([alias]) => {
      if (alias.includes(' ')) return norm.includes(alias);
      const tokens = norm.split(/\s+/);
      return tokens.some(t => t === alias || t.replace(/[^a-z]/g, '') === alias);
    });
    if (entries.length > 0) {
      const alias = entries[0][0];
      return memberAliases[alias];
    }
    return null;
  }

  function findAlbumInQuery(q) {
    const norm = q.toLowerCase().trim();
    const tokens = norm.split(/\s+/);
    const entries = Object.entries(albumAliases).filter(([alias]) => {
      if (alias.includes(' ')) return norm.includes(alias);
      return tokens.some(t => t === alias);
    });
    if (entries.length > 0) {
      const alias = entries[0][0];
      return albumAliases[alias];
    }
    for (const k of knowledge) {
      if (k.table === 'albums') {
        const title = k.data.title?.toLowerCase();
        if (title && norm.includes(title)) {
          return { title: k.data.title, year: k.data.year, desc: '' };
        }
      }
    }
    return null;
  }

  function findSongInQuery(q) {
    const norm = q.toLowerCase().trim();
    const tokens = norm.split(/\s+/);
    const entries = Object.entries(songAliases).filter(([alias]) => {
      if (alias.includes(' ')) return norm.includes(alias);
      return tokens.some(t => t === alias);
    });
    if (entries.length > 0) {
      const alias = entries[0][0];
      return songAliases[alias];
    }
    for (const k of knowledge) {
      if (k.table === 'songs') {
        const title = k.data.title?.toLowerCase();
        if (title && norm.includes(title)) {
          return { title: k.data.title, writer: k.data.writer_name || '', year: k.data.year };
        }
      }
    }
    return null;
  }

  /* ─── Response Generation ─── */

  function generateResponse(query) {
    const context = getContext();
    if (CONFIG.useN8N && CONFIG.n8nWebhookUrl) {
      callN8N(query, context);
      return;
    }

    const q = query.trim();
    const norm = normalizeText(q);

    if (detectIntent(q, norm) === 'GREETING') {
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      addBotMessage(greeting);
      return;
    }
    if (detectIntent(q, norm) === 'FAREWELL') {
      addBotMessage('Goodbye! Feel free to come back anytime you want to talk Fleetwood Mac. 🎵');
      return;
    }
    if (detectIntent(q, norm) === 'THANKS') {
      addBotMessage('You\'re welcome! I\'m always here to talk Fleetwood Mac. What else would you like to know?');
      return;
    }

    let intent = detectIntent(q, norm);

    if (intent === 'MEMBER_QUERY') {
      generateMemberResponse(q);
      return;
    }
    if (intent === 'ALBUM_QUERY') {
      generateAlbumResponse(q);
      return;
    }
    if (intent === 'SONG_QUERY') {
      generateSongResponse(q);
      return;
    }
    if (intent === 'CHART_QUERY') {
      generateChartResponse(q);
      return;
    }
    if (intent === 'TIMELINE_QUERY') {
      generateTimelineResponse(q);
      return;
    }
    if (intent === 'ACHIEVEMENT_QUERY') {
      generateAchievementResponse(q);
      return;
    }

    const staticMatch = staticFacts.find(f => f.intent === intent);
    if (staticMatch) {
      addBotMessage(staticMatch.text + '<br><br><small>Is there anything else you\'d like to know?</small>');
      return;
    }

    if (intent !== 'UNKNOWN') {
      const staticFallback = staticFacts.find(f => f.intent === intent);
      if (staticFallback) {
        addBotMessage(staticFallback.text + '<br><br><small>Is there anything else you\'d like to know?</small>');
        return;
      }
    }

    const scores = knowledge.map(item => ({
      item,
      score: scoreItem(item, tokenize(norm), norm)
    })).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

    if (scores.length > 0 && scores[0].score >= 5) {
      const top = scores[0];
      const response = formatResponse(top.item);
      addBotMessage(response);
      return;
    }

    if (scores.length > 0) {
      const topResponses = scores.slice(0, 3).map(s => formatResponse(s.item)).filter(Boolean);
      if (topResponses.length > 0) {
        addBotMessage(
          `I found some related information that might help:<br><br>${topResponses.join('<br><br>')}` +
          `<br><br><small>If this isn't what you were looking for, try rephrasing your question!</small>`
        );
        return;
      }
    }

    addBotMessage(
      `I don't have information about that specific topic yet. I can tell you about:<br><br>` +
      `<strong>Band Members</strong> — bios, roles, instruments, and history<br>` +
      `<strong>Albums</strong> — discography, sales, and stories<br>` +
      `<strong>Songs</strong> — writers, rankings, and meanings<br>` +
      `<strong>Chart Rankings</strong> — Billboard, Rolling Stone positions<br>` +
      `<strong>Timeline</strong> — key events from 1967 to today<br>` +
      `<strong>Trivia</strong> — the stories behind the music<br><br>` +
      `What would you like to ask about?`
    );
  }

  function getContext() {
    if (chatHistory.length < 2) return null;
    const lastBotMessage = [...chatHistory].reverse().find(m => m.role === 'bot');
    const lastUserMessage = [...chatHistory].reverse().find(m => m.role === 'user');
    return { lastBotMessage, lastUserMessage };
  }

  /* ─── Member Responses ─── */

  function generateMemberResponse(q) {
    const entry = findMemberInQuery(q);
    if (!entry) {
      addBotMessage(
        `I'm not sure which member you're asking about. Our members are: <strong>Mick Fleetwood</strong>, <strong>John McVie</strong>, <strong>Stevie Nicks</strong>, <strong>Lindsey Buckingham</strong>, and <strong>Christine McVie</strong>. Which one interests you?`
      );
      return;
    }

    const data = knowledge.find(k =>
      k.table === 'band_members' &&
      k.data.name?.toLowerCase() === entry.name.toLowerCase()
    );
    if (data) {
      addBotMessage(formatMember(data.data));
      return;
    }

    if (entry.name === 'Peter Green') {
      addBotMessage(
        '<strong>Peter Green (1946–2020)</strong><br><br>' +
        'Peter Green was the <strong>founding guitarist and leader</strong> of Fleetwood Mac. Born Peter Allen Greenbaum in London, he was a <strong>blues prodigy</strong> who replaced Eric Clapton in John Mayall\'s Bluesbreakers at age 19. He formed Fleetwood Mac in 1967.<br><br>' +
        'His songwriting defined the early band: "Black Magic Woman" (later a hit for Santana), "Albatross" (#1 UK instrumental), "Oh Well", and "Man of the World". B.B. King said Green had "the sweetest tone I ever heard."<br><br>' +
        'After heavy LSD use, his mental health deteriorated. He left the band in 1970 following a chaotic final show. He was diagnosed with schizophrenia and spent decades away from the spotlight before passing away on <strong>July 25, 2020</strong>.<br><br>' +
        'He was inducted into the Rock and Roll Hall of Fame with Fleetwood Mac in 1998.'
      );
      return;
    }

    addBotMessage(
      `<strong>${entry.name}</strong><br>` +
      `<em>${entry.role}</em><br><br>` +
      `I don't have detailed information about this member yet, but they were part of Fleetwood Mac's storied history.`
    );
  }

  /* ─── Album Responses ─── */

  function generateAlbumResponse(q) {
    const entry = findAlbumInQuery(q);
    if (!entry) {
      if (/\b(albums|discography|all)\b/.test(q.toLowerCase())) {
        const fact = staticFacts.find(f => f.intent === 'albums_list');
        if (fact) {
          addBotMessage(fact.text + '<br><br><small>Would you like details on a specific album?</small>');
          return;
        }
      }
      const allAlbums = knowledge.filter(k => k.table === 'albums');
      if (allAlbums.length > 0) {
        let html = '<strong>Fleetwood Mac Albums:</strong><br><br>';
        allAlbums.sort((a, b) => (a.data.year || 0) - (b.data.year || 0));
        allAlbums.forEach(a => {
          html += `• <strong>${a.data.title}</strong> (${a.data.year}) — ${a.data.sales || ''} ${a.data.cert ? `[${a.data.cert}]` : ''}<br>`;
        });
        addBotMessage(html + '<br><small>Ask me about any specific album for more details!</small>');
        return;
      }
      const fact = staticFacts.find(f => f.intent === 'albums_total');
      addBotMessage(fact ? fact.text : 'Fleetwood Mac released 18 studio albums. Ask me about any of them!');
      return;
    }

    const data = knowledge.find(k =>
      k.table === 'albums' &&
      k.data.title?.toLowerCase() === entry.title.toLowerCase()
    );
    if (data) {
      addBotMessage(formatAlbum(data.data));
      return;
    }

    addBotMessage(
      `<strong>${entry.title}</strong> <em>(${entry.year})</em><br><br>` +
      `${entry.desc || ''}<br><br>` +
      `<small>Detailed data for this album may not be loaded. Ask me about one of the major albums: Rumours, Fleetwood Mac (1975), Tusk, Mirage, or Tango in the Night.</small>`
    );
  }

  /* ─── Song Responses ─── */

  function generateSongResponse(q) {
    const norm = q.toLowerCase();
    const entry = findSongInQuery(q);
    if (!entry) {
      const whowrote = norm.match(/(?:who|who's|tell me who)\s+(?:wrote|composed|wrote)\s+(?:the song\s+)?(?:"?)(.+?)(?:"?)?$/);
      if (whowrote) {
        const songName = whowrote[1].trim().toLowerCase();
        for (const [key, info] of Object.entries(songAliases)) {
          if (info.title.toLowerCase().includes(songName) || songName.includes(info.title.toLowerCase())) {
            const writerData = knowledge.find(k =>
              k.table === 'band_members' &&
              k.data.composed_songs?.toLowerCase().includes(info.title.toLowerCase())
            );
            if (writerData) {
              addBotMessage(`"<strong>${info.title}</strong>" was written by <strong>${writerData.data.name}</strong>. ${info.year ? `(Released ${info.year})` : ''}`);
              return;
            }
            addBotMessage(`"<strong>${info.title}</strong>" was written by <strong>${info.writer}</strong>. ${info.year ? `(Released ${info.year})` : ''}`);
            return;
          }
        }
        const song = knowledge.find(k => k.table === 'songs' && k.data.title?.toLowerCase().includes(songName));
        if (song) {
          addBotMessage(formatSong(song.data));
          return;
        }
      }
      addBotMessage(
        `I know information about many Fleetwood Mac songs!<br><br>` +
        `Try asking: "Tell me about <strong>Dreams</strong>", "Who wrote <strong>Go Your Own Way</strong>?", or "What is <strong>The Chain</strong> about?"<br><br>` +
        `Or ask about: Dreams, Go Your Own Way, Landslide, Rhiannon, The Chain, Songbird, Everywhere, Little Lies, Tusk, Big Love, Silver Springs, and many more.`
      );
      return;
    }

    const songData = knowledge.find(k =>
      k.table === 'songs' &&
      k.data.title?.toLowerCase() === entry.title.toLowerCase()
    );

    if (norm.includes('write') || norm.includes('compos') || norm.includes('who')) {
      const writerInfo = knowledge.find(k =>
        k.table === 'band_members' &&
        k.data.composed_songs?.toLowerCase().includes(entry.title.toLowerCase())
      );
      if (writerInfo) {
        addBotMessage(`"<strong>${entry.title}</strong>" was written by <strong>${writerInfo.data.name}</strong>. ${entry.year ? `Released in ${entry.year}.` : ''} ${writerInfo.data.composed_songs ? `<br><br>Other songs by ${writerInfo.data.name}: ${writerInfo.data.composed_songs}` : ''}`);
        return;
      }
      if (entry.writer) {
        addBotMessage(`"<strong>${entry.title}</strong>" was written by <strong>${entry.writer}</strong>. ${entry.year ? `Released in ${entry.year}.` : ''}`);
        return;
      }
    }

    if (norm.includes('about') || norm.includes('meaning') || norm.includes('story') || norm.includes('inspire')) {
      const meaningFacts = {
        'dreams': staticFacts.find(f => f.intent === 'dreams_meaning'),
        'go your own way': staticFacts.find(f => f.intent === 'go_your_own_way_meaning'),
        'the chain': staticFacts.find(f => f.intent === 'the_chain_meaning'),
        'songbird': staticFacts.find(f => f.intent === 'songbird_meaning'),
        'silver springs': staticFacts.find(f => f.intent === 'silver_springs')
      };
      for (const [key, fact] of Object.entries(meaningFacts)) {
        if (entry.title.toLowerCase().includes(key) || key.includes(entry.title.toLowerCase())) {
          if (fact) { addBotMessage(fact.text); return; }
        }
      }
    }

    if (songData) {
      addBotMessage(formatSong(songData.data));
      return;
    }

    addBotMessage(
      `<strong>"${entry.title}"</strong>${entry.year ? ` <em>(${entry.year})</em>` : ''}<br>` +
      `${entry.writer ? `<br>Written by: <strong>${entry.writer}</strong>` : ''}<br><br>` +
      `<small>Detailed streaming/ranking data may not be available for this song.</small>`
    );
  }

  /* ─── Chart / Timeline / Achievement ─── */

  function generateChartResponse(q) {
    const norm = q.toLowerCase();
    const charts = knowledge.filter(k => k.table === 'chart_rankings');

    if (charts.length === 0) {
      addBotMessage('Chart ranking data is not available right now. Check back later!');
      return;
    }

    const yearMatch = norm.match(/\b(19\d\d|20\d\d)\b/);
    if (yearMatch) {
      const year = yearMatch[1];
      const yearCharts = charts.filter(c => String(c.data.year) === year);
      if (yearCharts.length > 0) {
        let html = `<strong>Chart rankings from ${year}:</strong><br><br>`;
        yearCharts.forEach(c => html += `• ${formatChartRanking(c.data)}<br>`);
        addBotMessage(html);
        return;
      }
    }

    if (norm.includes('rolling stone')) {
      const rs = charts.filter(c => c.data.source === 'Rolling Stone');
      if (rs.length > 0) {
        let html = '<strong>Rolling Stone Rankings:</strong><br><br>';
        rs.forEach(c => {
          html += `• <strong>${c.data.chart_type}:</strong> ${c.data.item_name} — ${c.data.rank}${c.data.detail ? ` (${c.data.detail})` : ''}<br>`;
        });
        addBotMessage(html);
        return;
      }
    }

    if (norm.includes('billboard')) {
      const bb = charts.filter(c => c.data.source === 'Billboard');
      if (bb.length > 0) {
        const hot100 = bb.filter(c => c.data.chart_type === 'Hot 100').sort((a, b) => {
          const ra = parseInt(a.data.rank) || 999;
          const rb = parseInt(b.data.rank) || 999;
          return ra - rb;
        });
        let html = '<strong>Billboard Hot 100 Hits:</strong><br><br>';
        hot100.slice(0, 10).forEach(c => {
          html += `• #${c.data.rank} — "${c.data.item_name}" (${c.data.year})${c.data.detail ? ` <em>${c.data.detail}</em>` : ''}<br>`;
        });
        addBotMessage(html);
        return;
      }
    }

    const total = charts.length;
    const bbCharts = charts.filter(c => c.data.source === 'Billboard').length;
    const rsCharts = charts.filter(c => c.data.source === 'Rolling Stone').length;
    addBotMessage(
      `Fleetwood Mac has <strong>${total} chart entries</strong> in my database:<br><br>` +
      `• <strong>Billboard:</strong> ${bbCharts} entries (Hot 100, Billboard 200, Touring, Year-End)<br>` +
      `• <strong>Rolling Stone:</strong> ${rsCharts} entries (500 Greatest Albums, 500 Greatest Songs)<br><br>` +
      `Ask for specifics like "Billboard Hot 100", "Rolling Stone rankings", or about a particular year!`
    );
  }

  function generateTimelineResponse(q) {
    const milestones = knowledge.filter(k => k.table === 'milestones').sort((a, b) => a.data.year - b.data.year);
    if (milestones.length === 0) {
      addBotMessage('Timeline data is not available right now.');
      return;
    }
    const norm = q.toLowerCase();
    const yearMatch = norm.match(/\b(19\d\d|20\d\d)\b/);
    if (yearMatch) {
      const year = yearMatch[1];
      const filtered = milestones.filter(m => String(m.data.year) === year);
      if (filtered.length > 0) {
        let html = `<strong>Events from ${year}:</strong><br><br>`;
        filtered.forEach(m => html += `• <strong>${m.data.title}</strong> — ${m.data.description}<br><br>`);
        addBotMessage(html);
        return;
      }
      const nearby = milestones.filter(m => Math.abs(m.data.year - parseInt(year)) <= 2);
      if (nearby.length > 0) {
        let html = `Nothing specific for ${year}, but here's what happened nearby:<br><br>`;
        nearby.forEach(m => html += `• <strong>${m.data.year}</strong> — ${m.data.title}<br>`);
        addBotMessage(html);
        return;
      }
    }
    if (norm.includes('early') || norm.includes('beginning') || norm.includes('origins')) {
      const early = milestones.slice(0, 4);
      let html = '<strong>The Early Years (1967–1970):</strong><br><br>';
      early.forEach(m => html += `• <strong>${m.data.year}</strong> — ${m.data.title}: ${m.data.description}<br><br>`);
      addBotMessage(html);
      return;
    }
    if (norm.includes('rumours') || norm.includes('classic')) {
      const classic = milestones.filter(m => m.data.year >= 1975 && m.data.year <= 1987);
      let html = '<strong>The Classic Era (1975–1987):</strong><br><br>';
      classic.forEach(m => html += `• <strong>${m.data.year}</strong> — ${m.data.title}: ${m.data.description}<br><br>`);
      addBotMessage(html);
      return;
    }
    if (norm.includes('recent') || norm.includes('later') || norm.includes('modern')) {
      const later = milestones.filter(m => m.data.year >= 1990);
      let html = '<strong>The Later Years (1990–present):</strong><br><br>';
      later.forEach(m => html += `• <strong>${m.data.year}</strong> — ${m.data.title}: ${m.data.description}<br><br>`);
      addBotMessage(html);
      return;
    }
    let html = '<strong>Fleetwood Mac Timeline — Key Events:</strong><br><br>';
    milestones.forEach(m => {
      html += `<strong>${m.data.year}:</strong> ${m.data.title}<br>`;
    });
    addBotMessage(html + '<br><small>Ask about a specific year or era for more details!</small>');
  }

  function generateAchievementResponse(q) {
    const achievements = knowledge.filter(k => k.table === 'achievements');
    const milestones = knowledge.filter(k => k.table === 'milestones');
    if (achievements.length === 0 && milestones.length === 0) {
      addBotMessage('Achievement data is not available right now.');
      return;
    }
    let html = '<strong>🏆 Key Achievements</strong><br><br>';
    achievements.forEach(a => {
      html += formatAchievement(a.data) + '<br><br>';
    });
    html += '<strong>Sales Milestones:</strong><br>';
    html += '• Over <strong>120 million records</strong> sold worldwide<br>';
    html += '• <em>Rumours</em>: <strong>40+ million copies</strong><br>';
    html += '• Certified <strong>50 million albums</strong> in the US (RIAA)<br><br>';
    html += '<small>Ask about chart rankings or timeline for more!</small>';
    addBotMessage(html);
  }

  /* ─── Scoring ─── */

  function scoreItem(item, tokens, rawQuery) {
    const text = flattenItem(item).toLowerCase();
    let score = 0;
    let matchedTokens = 0;

    tokens.forEach(t => {
      const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp('\\b' + escaped + '\\b', 'gi');
      const matches = text.match(regex);
      if (matches) {
        score += matches.length * 8;
        matchedTokens++;
      } else if (text.includes(t)) {
        score += 3;
        matchedTokens += 0.5;
      }
    });

    if (matchedTokens === 0) return 0;

    const tokenRatio = matchedTokens / Math.max(tokens.length, 1);
    score *= (0.5 + tokenRatio * 0.5);

    const yearMatch = rawQuery.match(/\b(19\d\d|20\d\d)\b/);
    if (yearMatch && item.table === 'milestones' && String(item.data.year) === yearMatch[1]) {
      score += 30;
    }
    if (yearMatch && item.table === 'albums' && String(item.data.year) === yearMatch[1]) {
      score += 30;
    }
    if (yearMatch && item.table === 'songs' && String(item.data.year) === yearMatch[1]) {
      score += 30;
    }
    if (yearMatch && item.table === 'chart_rankings' && String(item.data.year) === yearMatch[1]) {
      score += 30;
    }

    if (item.table === 'band_members') score += 2;

    return score;
  }

  function flattenItem(item) {
    const d = item.data;
    const parts = [];
    Object.values(d).forEach(v => {
      if (typeof v === 'string') parts.push(v);
      else if (typeof v === 'number') parts.push(String(v));
      else if (v && typeof v === 'object' && !Array.isArray(v)) {
        Object.values(v).forEach(x => {
          if (typeof x === 'string' || typeof x === 'number') parts.push(String(x));
        });
      }
    });
    return parts.join(' ');
  }

  function formatResponse(item) {
    const d = item.data;
    switch (item.table) {
      case 'band_members': return formatMember(d);
      case 'albums': return formatAlbum(d);
      case 'songs': return formatSong(d);
      case 'chart_rankings': return formatChartRanking(d);
      case 'milestones': return formatMilestone(d);
      case 'achievements': return formatAchievement(d);
      case 'index_stats': return formatIndexStat(d);
      default: return flattenItem(item);
    }
  }

  function formatMember(d) {
    let html = `<strong>🎵 ${d.name}</strong><br>`;
    html += `<em>${d.role}</em>`;
    if (d.instrument) html += ` — ${d.instrument}`;
    html += `<br><br>${d.bio || ''}`;
    if (d.before_fm) html += `<br><br><strong>Before Fleetwood Mac:</strong> ${d.before_fm}`;
    if (d.composed_songs) html += `<br><br><strong>Composed Songs:</strong> ${d.composed_songs}`;
    if (d.contributions) html += `<br><br><strong>Notable Contributions:</strong> ${d.contributions}`;
    return html;
  }

  function formatAlbum(d) {
    let html = `<strong>💿 ${d.title}</strong>`;
    if (d.year) html += ` <em>(${d.year})</em>`;
    if (d.description) html += `<br><br>${d.description}`;
    if (d.sales) html += `<br><br><strong>Sales:</strong> ${d.sales}`;
    if (d.streams) html += `<br><strong>Streams:</strong> ${d.streams}`;
    if (d.cert) html += `<br><strong>Certification:</strong> ${d.cert}`;
    if (d.era) html += `<br><strong>Era:</strong> ${d.era}`;
    return html;
  }

  function formatSong(d) {
    let html = `<strong>🎵 "${d.title}"</strong>`;
    if (d.album_title || d.albums?.title) html += ` — <em>${d.album_title || d.albums.title}</em>`;
    if (d.year) html += ` (${d.year})`;
    if (d.rank) html += `<br><strong>Rank:</strong> #${d.rank}`;
    if (d.streams) html += `<br><strong>Streams:</strong> ${Number(d.streams).toLocaleString()}`;
    if (d.writer_name) html += `<br><strong>Written by:</strong> ${d.writer_name}`;
    return html;
  }

  function formatChartRanking(d) {
    let html = `<strong>📊 ${d.item_name}</strong>`;
    if (d.rank) html += ` — <strong>${d.rank}</strong>`;
    if (d.year) html += ` <em>(${d.year})</em>`;
    html += `<br><strong>Source:</strong> ${d.source} (${d.chart_type})`;
    if (d.detail) html += `<br><em>${d.detail}</em>`;
    return html;
  }

  function formatMilestone(d) {
    let html = `<strong>📅 ${d.year} — ${d.title}</strong>`;
    if (d.description) html += `<br><br>${d.description}`;
    return html;
  }

  function formatAchievement(d) {
    let html = `<strong>🏆 ${d.title}</strong>`;
    if (d.description) html += `<br><br>${d.description}`;
    if (d.value) html += `<br><br><strong>${d.sub_value ? d.sub_value + ':' : ''}</strong> ${d.value}`;
    return html;
  }

  function formatIndexStat(d) {
    return `<strong>📈 ${d.label}:</strong> ${d.value}`;
  }

  /* ─── n8n Fallback ─── */

  async function callN8N(query, context) {
    try {
      const res = await fetch(CONFIG.n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, history: chatHistory.slice(-10) })
      });
      const data = await res.json();
      addBotMessage(data.response || data.output || '...');
    } catch (e) {
      addBotMessage('Sorry, I could not reach the n8n AI service. Please try again later.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
