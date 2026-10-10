/**
 * Comprehensive Telugu Festival dictionary and Dharma Shastra Vyapti resolver.
 * Conforms to TTD (Tirumala Tirupati Devasthanams), Nithra Telugu Calendar,
 * and Dharma Shastra standards.
 */
const { GeoVector, Ecliptic, Body } = require('astronomy-engine');

/**
 * 200+ standard Hindu & Telugu festivals, vratas, ekadashis, and jayantis mapped to Telugu.
 */
const FESTIVAL_NAME_TE = {
  // Major Annual Telugu Festivals
  'Ugadi': 'ఉగాది (తెలుగు సంవత్సరాది)',
  'Ugadi / Gudi Padwa': 'ఉగాది (తెలుగు సంవత్సరాది)',
  'Sri Rama Navami': 'శ్రీరామ నవమి (సీతారాముల కళ్యాణం)',
  'Rama Navami': 'శ్రీరామ నవమి (సీతారాముల కళ్యాణం)',
  'Hanuman Jayanti': 'శ్రీ హనుమాన్ జయంతి',
  'Telugu Hanuman Jayanti': 'హనుమాన్ జయంతి (దీక్షా విరమణ)',
  'Narasimha Jayanti': 'శ్రీ లక్ష్మీనృసింహ జయంతి',
  'Guru Purnima': 'గురు పౌర్ణమి (వ్యాస పూర్ణిమ)',
  'Vyasa Puja': 'వ్యాస పూజ',
  'Varalakshmi Vratam': 'శ్రీ వరలక్ష్మీ వ్రతం',
  'Raksha Bandhan': 'రాఖీ పౌర్ణమి (రక్షాబంధన్ / జంధ్యాల పూర్ణిమ)',
  'Shravana Purnima': 'శ్రావణ పౌర్ణమి (రాఖీ పౌర్ణమి)',
  'Narali Purnima': 'నారళీ పూర్ణిమ',
  'Hayagriva Jayanti': 'శ్రీ హయగ్రీవ జయంతి',
  'Sri Vikhanasa Maharshi Jayanti': 'శ్రీ విఖనస మహర్షి జయంతి (వైఖానస గురు జయంతి)',
  'Krishna Janmashtami': 'శ్రీ కృష్ణాష్టమి (గోకులాష్టమి)',
  'Dahi Handi': 'ఉట్లోత్సవం (దహి హండీ)',
  'Ganesh Chaturthi': 'శ్రీ వినాయక చవితి (వరసిద్ధి వినాయక వ్రతం)',
  'Vinayaka Chavithi': 'శ్రీ వినాయక చవితి (వరసిద్ధి వినాయక వ్రతం)',
  'Vinayaka Chaturthi': 'వినాయక చతుర్థి (మాసిక)',
  'Ganesh Chaturthi (Day 1)': 'వినాయక చవితి (గణేశోత్సవ ప్రారంభం)',
  'Ganesh Panchami (Day 2)': 'గణేశోత్సవం (2వ రోజు)',
  'Ganesh Utsav Day 11': 'గణేశోత్సవం (11వ రోజు)',
  'Ganesh Visarjan': 'గణేష్ నిమజ్జనం',
  'Anant Chaturdashi': 'అనంత పద్మనాభ చతుర్దశి',
  'Anant Chaturdashi (Day 10)': 'అనంత చతుర్దశి (గణేష్ నిమజ్జనం)',
  'Rishi Panchami': 'ఋషి పంచమి',
  'Hartalika Teej': 'హరితాళికా తీజ్ (గౌరీ వ్రతం)',
  'Gowri Habba': 'స్వర్ణగౌరీ వ్రతం',
  'Radha Ashtami': 'శ్రీ రాధాష్టమి',
  'Vamana Jayanti': 'శ్రీ వామన జయంతి',
  'Mahalaya Amavasya': 'మహాలయ అమావాస్య (పెద్దల అమావాస్య)',
  'Sarva Pitru Amavasya (Mahalaya)': 'మహాలయ అమావాస్య (ఎంగిలి పూల బతుకమ్మ)',
  'Sarva Pitru Amavasya (Day 15)': 'మహాలయ అమావాస్య (సర్వ పితృ అమావాస్య)',
  'Engili Pula Bathukamma': 'ఎంగిలి పూల బతుకమ్మ (బతుకమ్మ ప్రారంభం)',
  'Saddula Bathukamma': 'సద్దుల బతుకమ్మ (బతుకమ్మ ముగింపు)',
  'Navaratri Ghatasthapana': 'శరన్నవరాత్రారంభం (కలశస్థాపన)',
  'Ghatasthapana (Day 1)': 'శరన్నవరాత్రారంభం (ఘటస్థాపన)',
  'Navaratri Dwitiya': 'శరన్నవరాత్రి విదియ (బాలాత్రిపురసుందరి పూజ)',
  'Navaratri Tritiya': 'శరన్నవరాత్రి తదియ (గాయత్రీ దేవి పూజ)',
  'Navaratri Chaturthi': 'శరన్నవరాత్రి చవితి (అన్నపూర్ణా దేవి పూజ)',
  'Navaratri Panchami': 'శరన్నవరాత్రి పంచమి (లలితా త్రిపురసుందరి పూజ)',
  'Upang Lalita Vrat': 'ఉపాంగ లలితా వ్రతం',
  'Navaratri Shashthi': 'శరన్నవరాత్రి షష్ఠి (మహాలక్ష్మి పూజ)',
  'Navaratri Saptami': 'శరన్నవరాత్రి సప్తమి (శ్రీ సరస్వతి పూజ / మూలా నక్షత్రం)',
  'Durga Ashtami (Maha Ashtami)': 'దుర్గాష్టమి (మహాష్టమి / సద్దుల బతుకమ్మ)',
  'Durga Ashtami (Day 8)': 'దుర్గాష్టమి (మహాష్టమి)',
  'Maha Navami': 'మహర్నవమి (ఆయుధ పూజ)',
  'Maha Navami (Day 9)': 'మహర్నవమి (ఆయుధ పూజ)',
  'Vijaya Dashami (Dussehra)': 'విజయదశమి (దసరా / శమీ పూజ)',
  'Vijaya Dashami': 'విజయదశమి (దసరా / శమీ పూజ)',
  'Dussehra': 'విజయదశమి (దసరా)',
  'Nagula Chavithi': 'నాగుల చవితి (శ్రీ నాగదేవత పూజ)',
  'Karva Chauth (Kartik)': 'నాగుల చవితి (శ్రీ నాగదేవత పూజ)',
  'Karwa Chauth': 'నాగుల చవితి',
  'Naraka Chaturdashi (Choti Diwali)': 'నరక చతుర్దశి (తైలాభ్యంగన స్నానం)',
  'Naraka Chaturdashi': 'నరక చతుర్దశి',
  'Diwali (Lakshmi Puja)': 'దీపావళి (శ్రీ మహాలక్ష్మి పూజ)',
  'Deepavali': 'దీపావళి (శ్రీ మహాలక్ష్మి పూజ)',
  'Diwali': 'దీపావళి',
  'Govardhan Puja': 'గోవర్ధన పూజ',
  'Bali Pratipada': 'బలిపాడ్యమి (కార్తీక శుద్ధ పాడ్యమి / గోపూజ)',
  'Bhai Dooj (Yama Dwitiya)': 'భగినీ హస్తభోజనం (యమ ద్వితీయ)',
  'Skanda Sashti (Kanda Sashti)': 'స్కంద షష్ఠి (సుబ్రహ్మణ్య షష్ఠి)',
  'Subrahmanya Sashti': 'సుబ్రహ్మణ్య షష్ఠి (స్కంద షష్ఠి)',
  'Tulasi Vivah': 'తులసీ కళ్యాణం (తులసీ వివాహం)',
  'Ksheerabdhi Dvadashi': 'క్షీరాబ్ధి ద్వాదశి (చిలుక ద్వాదశి)',
  'Kartik Purnima / Dev Diwali': 'కార్తీక పౌర్ణమి (జ్వాలాతోరణం / కార్తీక దీపోత్సవం)',
  'Vaikuntha Ekadashi': 'శ్రీ వైకుంఠ ఏకాదశి (ముక్కోటి ఏకాదశి / గీతా జయంతి)',
  'Mukkoti Dwadashi': 'ముక్కోటి ద్వాదశి',
  'Gita Jayanti': 'గీతా జయంతి',
  'Dattatreya Jayanti': 'శ్రీ దత్తాత్రేయ జయంతి',
  'Bhogi': 'భోగి పండుగ',
  'Makara Sankranti': 'మకర సంక్రాంతి (పెద్ద పండుగ)',
  'Kanuma': 'కనుమ (పశువుల పండుగ)',
  'Mukkanuma': 'ముక్కనుమ',
  'Ratha Saptami': 'రథసప్తమి (సూర్య జయంతి / ఆరోగ్య సప్తమి)',
  'Bhishma Ashtami': 'భీష్మాష్టమి',
  'Bhishma Ekadashi': 'భీష్మ ఏకాదశి (శ్రీ విష్ణు సహస్రనామ జయంతి)',
  'Maha Shivaratri': 'మహా శివరాత్రి (లింగోద్భవ కాల పూజ)',
  'Holika Dahan': 'కామదహనం (హోలికా దహన్)',
  'Holi (Rangwali / Dhulandi)': 'హోలీ (రంగుల పండుగ)',

  // All 24 Ekadashis
  'Kamada Ekadashi': 'కామదా ఏకాదశి',
  'Varuthini Ekadashi': 'వరూథినీ ఏకాదశి',
  'Mohini Ekadashi': 'మోహినీ ఏకాదశి',
  'Apara Ekadashi': 'అపర ఏకాదశి',
  'Nirjala Ekadashi': 'నిర్జల ఏకాదశి',
  'Yogini Ekadashi': 'యోగినీ ఏకాదశి',
  'Devshayani Ekadashi': 'తొలి ఏకాదశి (శయన ఏకాదశి / చాతుర్మాస్య ప్రారంభం)',
  'Kamika Ekadashi': 'కామికా ఏకాదశి',
  'Shravana Putrada Ekadashi': 'పుత్రదా ఏకాదశి',
  'Aja Ekadashi': 'అజా ఏకాదశి',
  'Parsva Ekadashi (Parivartini)': 'పరివర్తిని ఏకాదశి (వామన జయంతి)',
  'Indira Ekadashi': 'ఇందిరా ఏకాదశి',
  'Papankusha Ekadashi': 'పాశాంకుశ ఏకాదశి',
  'Rama Ekadashi': 'రమా ఏకాదశి',
  'Devutthana Ekadashi (Prabodhini)': 'ఉత్థాన ఏకాదశి (ప్రబోధినీ ఏకాదశి)',
  'Devutthana Ekadashi': 'ఉత్థాన ఏకాదశి (ప్రబోధినీ ఏకాదశి)',
  'Utpanna Ekadashi': 'ఉత్పన్న ఏకాదశి',
  'Mokshada Ekadashi': 'వైకుంఠ ఏకాదశి (ముక్కోటి ఏకాదశి / మోక్షదా ఏకాదశి)',
  'Saphala Ekadashi': 'సఫల ఏకాదశి',
  'Pausha Putrada Ekadashi': 'పుత్రదా ఏకాదశి',
  'Shattila Ekadashi': 'షట్తిలా ఏకాదశి',
  'Jaya Ekadashi': 'భీష్మ ఏకాదశి (జయ ఏకాదశి)',
  'Vijaya Ekadashi': 'విజయా ఏకాదశి',
  'Amalaki Ekadashi': 'ఆమలకీ ఏకాదశి',
  'Papmochani Ekadashi': 'పాపవిమోచనీ ఏకాదశి',

  // Monthly Regular Observances
  'Masik Shivaratri': 'మాస శివరాత్రి',
  'Sankashti Chaturthi': 'సంకష్టహర చతుర్థి',
  'Sakat Chauth (Sankashti)': 'సంకష్టహర చతుర్థి',
  'Pradosham (Shukla)': 'ప్రదోష వ్రతం (శుక్ల పక్షం)',
  'Pradosham (Krishna)': 'ప్రదోష వ్రతం (కృష్ణ పక్షం)',
  'Purnima': 'పౌర్ణమి (శ్రీ సత్యనారాయణ వ్రతం)',
  'Amavasya': 'అమావాస్య (పితృ తర్పణం)',
  'Mauni Amavasya': 'మౌనీ అమావాస్య',

  // Jayantis & Other Festivals
  'Akshaya Tritiya': 'అక్షయ తృతీయ (బంగారు తదియ)',
  'Ganga Saptami': 'గంగా సప్తమి',
  'Ganga Dussehra': 'గంగా దసరా',
  'Shani Jayanti': 'శని జయంతి',
  'Vat Savitri Vrat': 'వట సావిత్రి వ్రతం',
  'Vat Purnima': 'వట పౌర్ణమి (వట సావిత్రి వ్రతం)',
  'Jagannath Rathyatra': 'పూరీ జగన్నాథ రథయాత్ర',
  'Kokila Vrat': 'కోకిలా వ్రతం',
  'Nag Panchami': 'నాగ పంచమి (గరుడ పంచమి)',
  'Kalki Jayanti': 'శ్రీ కల్కి జయంతి',
  'Kajari Teej': 'కజరీ తీజ్',
  'Hariyali Teej': 'హరియాళీ తీజ్',
  'Ahoi Ashtami': 'అహోయి అష్టమి',
  'Dhanteras (Dhanatrayodashi)': 'ధన త్రయోదశి (ధన్వంతరి జయంతి)',
  'Gopashtami': 'గోపాష్టమి',
  'Akshaya Navami (Amla Navami)': 'అక్షయ నవమి (ధాత్రీ నవమి)',
  'Chhath Puja': 'ఛట్ పూజ (సూర్య షష్ఠి)',
  'Vivah Panchami': 'వివాహ పంచమి (శ్రీ సీతారాముల కల్యాణోత్సవం)',
  'Annapurna Jayanti': 'శ్రీ అన్నపూర్ణా జయంతి',
  'Kalabhairav Jayanti': 'శ్రీ కాలభైరవ జయంతి (భైరవాష్టమి)',
  'Pausha Purnima': 'పుష్య పౌర్ణమి',
  'Vasant Panchami (Shri Panchami)': 'వసంత పంచమి (శ్రీ పంచమి / సరస్వతి జయంతి)',
  'Magha Purnima': 'మాఘ పౌర్ణమి (మహామాఘి)',
  'Sheetala Ashtami (Basoda)': 'శీతలాష్టమి',
  'Ranga Panchami': 'రంగ పంచమి',
  'Gangaur': 'గణగౌర్ వ్రతం',
  'Yamuna Chhath (Yamuna Jayanti)': 'యమునా ఛట్ (యమునా జయంతి)',
  'Buddha Purnima': 'బుద్ధ పూర్ణిమ',
  'Parashurama Jayanti': 'శ్రీ పరశురామ జయంతి',
  'Sita Navami (Janaki Jayanti)': 'సీతా నవమి (జానకీ జయంతి)',
  'Narada Jayanti': 'నారద జయంతి',
  'Kurma Jayanti': 'శ్రీ కూర్మ జయంతి',
  'Gayatri Jayanti': 'శ్రీ గాయత్రీ జయంతి',
  'Gayatri Jayanti (Jyeshtha Shukla)': 'శ్రీ గాయత్రీ జయంతి',
  'Mahesh Navami': 'మహేష్ నవమి',
  'Durva Ashtami': 'దూర్వాష్టమి',
  'Jivitputrika Vrat (Jitiya)': 'జీవిత్పుత్రికా వ్రతం',
  'Kojagara Puja': 'కోజాగరి పూర్ణిమ (శరత్ పూర్ణిమ)',
  'Sharad Purnima': 'శరత్ పూర్ణిమ (కోజాగరి పౌర్ణమి)',
  'Kansa Vadh': 'కంస వధ',
  'Shakambhari Purnima': 'శాకంభరీ పౌర్ణమి',
  'Phulera Dooj': 'ఫూలేరా దూజ్',
  'Holashtak Begins': 'హోలాష్టకం ప్రారంభం',
  'Vaisakhi / Baisakhi': 'మేష సంక్రాంతి (బైసాఖీ)',
  'Tamil Puthandu': 'తమిళ పుత్తాండు',
  'Vishu': 'విషు పండుగ',
  'Thai Pusam': 'థాయ్ పూసం',
  'Onam (Simha Sankranti)': 'ఓణం (సింహ సంక్రాంతి)',
  'Valmiki Jayanti': 'వాల్మీకి జయంతి',
  'Vaishakha Purnima': 'వైశాఖ పౌర్ణమి (మహా వైశాఖి)',
  'Magha Gupta Navratri Begins': 'మాఘ గుప్త నవరాత్రారంభం',
  'Chaitra Navratri Ghatasthapana': 'వసంత నవరాత్రారంభం (ఘటస్థాపన)',
  'Chaitra Navratri Dwitiya': 'చైత్ర నవరాత్రి విదియ',
  'Chaitra Navratri Tritiya': 'చైత్ర నవరాత్రి తదియ',
  'Chaitra Navratri Chaturthi': 'చైత్ర నవరాత్రి చవితి',
  'Chaitra Navratri Panchami': 'చైత్ర నవరాత్రి పంచమి',
  'Chaitra Navratri Shashthi': 'చైత్ర నవరాత్రి షష్ఠి',
  'Chaitra Navratri Saptami': 'చైత్ర నవరాత్రి సప్తమి',
  'Chaitra Navratri Day 2 (Brahmacharini)': 'చైత్ర నవరాత్రి (బ్రహ్మచారిణి)',
  'Chaitra Navratri Day 3 (Chandraghanta)': 'చైత్ర నవరాత్రి (చంద్రఘంట)',
  'Chaitra Navratri Day 4 (Kushmanda)': 'చైత్ర నవరాత్రి (కూష్మాండ)',
  'Chaitra Navratri Day 5 (Skandamata)': 'చైత్ర నవరాత్రి (స్కందమాత)',
  'Chaitra Navratri Day 6 (Katyayani)': 'చైత్ర నవరాత్రి (కాత్యాయని)',
  'Chaitra Navratri Day 7 (Kaalratri)': 'చైత్ర నవరాత్రి (కాళరాత్రి)',
  'Chaitra Navratri Day 8 (Mahagauri)': 'చైత్ర దుర్గాష్టమి (మహాగౌరి పూజ)',
  'Durga Ashtami (Chaitra)': 'చైత్ర దుర్గాష్టమి',
  'Chaitra Navratri Day 9 (Siddhidatri / Rama Navami)': 'శ్రీరామ నవమి (సిద్ధిధాత్రి పూజ)',
  'Chaitra Purnima': 'చైత్ర పౌర్ణమి (హనుమజ్జయంతి)',
  'Margashirsha Shukla Pratipada': 'మార్గశిర శుద్ధ పాడ్యమి',
  'Ashadha Bonalu': 'ఆషాఢ బోనాలు',

  // Shraddhas
  'Prathama Shraddha (Day 1)': 'పాడ్యమి శ్రాద్ధం',
  'Dwitiya Shraddha (Day 2)': 'విదియ శ్రాద్ధం',
  'Tritiya Shraddha (Day 3)': 'తదియ శ్రాద్ధం',
  'Chaturthi Shraddha (Day 4)': 'చవితి శ్రాద్ధం',
  'Panchami Shraddha (Day 5)': 'పంచమి శ్రాద్ధం',
  'Shashthi Shraddha (Day 6)': 'షష్ఠి శ్రాద్ధం',
  'Saptami Shraddha (Day 7)': 'సప్తమి శ్రాద్ధం',
  'Navami Shraddha (Day 9)': 'అవిధవా నవమి (నవమి శ్రాద్ధం)',
  'Dashami Shraddha (Day 10)': 'దశమి శ్రాద్ధం',
  'Ekadashi Shraddha (Day 11)': 'ఏకాదశి శ్రాద్ధం',
  'Dwadashi Shraddha (Day 12)': 'ద్వాదశి శ్రాద్ధం',
  'Trayodashi Shraddha (Day 13)': 'త్రయోదశి శ్రాద్ధం',
  'Chaturdashi Shraddha (Day 14)': 'చతుర్దశి శ్రాద్ధం (ఘాత చతుర్దశి)',
  'Purnima Shraddha': 'పౌర్ణమి శ్రాద్ధం',

  // Tithi Numbers in multi-day Navaratri
  'Dwitiya (Day 2)': 'నవరాత్రి విదియ',
  'Tritiya (Day 3)': 'నవరాత్రి తదియ',
  'Chaturthi (Day 4)': 'నవరాత్రి చవితి',
  'Panchami (Day 5)': 'నవరాత్రి పంచమి',
  'Shashthi (Day 6)': 'నవరాత్రి షష్ఠి',
  'Shashthi (Day 3)': 'షష్ఠి',
  'Saptami (Day 7)': 'నవరాత్రి సప్తమి (శ్రీ సరస్వతి పూజ)',
  'Saptami (Day 4)': 'సప్తమి',
  'Ashtami (Day 5)': 'దుర్గాష్టమి',
  'Dashami (Day 7)': 'విజయదశమి',
  'Ekadashi (Day 8)': 'ఏకాదశి',
  'Dwadashi (Day 9)': 'ద్వాదశి',
};

const FESTIVAL_CATEGORY_TE = {
  major: 'ప్రధాన పండుగ',
  ekadashi: 'ఏకాదశి',
  sankranti: 'సంక్రాంతి',
  solar: 'సౌర పండుగ',
  vratham: 'వ్రతం',
  pournami: 'పౌర్ణమి',
  amavasya: 'అమావాస్య',
  regional: 'ప్రాంతీయ ఉత్సవం',
  single: 'పండుగ',
  span: 'ఉత్సవం',
};

/**
 * Calculate Madhyahna solar and lunar coordinates for Vyapti checking.
 */
function getMadhyahnaTithi(dateKey) {
  const noon = new Date(`${dateKey}T12:00:00+05:30`);
  const sLon = Ecliptic(GeoVector(Body.Sun, noon, true)).elon;
  const mLon = Ecliptic(GeoVector(Body.Moon, noon, true)).elon;
  const diff = (mLon - sLon + 360) % 360;
  return Math.floor(diff / 12); // 0..29 (0 = Shukla Pratipada, 3 = Shukla Chaturthi)
}

/**
 * Dharma Shastra Vyapti and Telugu Regional Festival Resolver.
 * Strict alignment with TTD and Nithra Telugu Calendar.
 */
function resolveTeluguFestivals(rawFestivals = [], raw = {}, dateKey = '') {
  let list = [...rawFestivals];
  const masaIndex = raw.masa?.index; // 0: Chaitra .. 11: Phalguna
  const pakshaKey = raw.paksha; // 'Shukla' or 'Krishna'
  const tithiIndex = raw.tithi; // 0..29
  const nakshatraIndex = raw.nakshatra; // 0..26 (21 = Shravana)
  const varaIndex = raw.vara; // 0: Sunday .. 6: Saturday
  const [yearStr, monthStr, dayStr] = String(dateKey).split('-');
  const monthDay = `${monthStr}-${dayStr}`;

  // 1. SANKRANTI FESTIVAL CYCLE (జనవరి 14 - 17)
  if (monthDay === '01-14') {
    if (!list.some((f) => /Bhogi/i.test(f.name))) {
      list.unshift({
        name: 'భోగి పండుగ',
        nameTe: 'భోగి పండుగ',
        category: 'major',
        categoryTe: 'ప్రధాన పండుగ',
        type: 'single',
        description: 'భోగి పండుగ — భోగి మంటలు, గోదా కళ్యాణం, భోగి పండ్లు',
      });
    }
  } else if (monthDay === '01-15') {
    // Makara Sankranti / పెద్ద పండుగ
    list.unshift({
      name: 'మకర సంక్రాంతి (పెద్ద పండుగ)',
      nameTe: 'మకర సంక్రాంతి (పెద్ద పండుగ)',
      category: 'major',
      categoryTe: 'ప్రధాన పండుగ',
      type: 'sankranti',
      description: 'సూర్యుడు మకర రాశి ప్రవేశం — మకర సంక్రాంతి (పెద్ద పండుగ)',
    });
  } else if (monthDay === '01-16') {
    // Kanuma / కనుమ
    list.unshift({
      name: 'కనుమ (పశువుల పండుగ)',
      nameTe: 'కనుమ (పశువుల పండుగ)',
      category: 'major',
      categoryTe: 'ప్రధాన పండుగ',
      type: 'single',
      description: 'కనుమ పండుగ — పశువుల పూజ, వ్యవసాయ సంబరాలు',
    });
  } else if (monthDay === '01-17') {
    // Mukkanuma / ముక్కనుమ
    list.push({
      name: 'ముక్కనుమ',
      nameTe: 'ముక్కనుమ',
      category: 'regional',
      categoryTe: 'ప్రాంతీయ ఉత్సవం',
      type: 'single',
      description: 'ముక్కనుమ పండుగ',
    });
  }

  // 2. GANESH CHATURTHI (వినాయక చవితి) - Madhyahna Vyapti Check (TTD Decision)
  // Dharma Shastra: Bhadrapada Shukla Chaturthi at Madhyahna (11:30 AM - 1:30 PM).
  if (masaIndex === 5) { // Bhadrapada
    const noonTithi = getMadhyahnaTithi(dateKey);
    const hasGanesh = list.some((f) => /Ganesh|Vinayaka/i.test(f.name));

    if (noonTithi === 3) { // Shukla Chaturthi is active at Madhyahna!
      if (!hasGanesh) {
        list.unshift({
          name: 'శ్రీ వినాయక చవితి',
          nameTe: 'శ్రీ వినాయక చవితి (వరసిద్ధి వినాయక వ్రతం)',
          category: 'major',
          categoryTe: 'ప్రధాన పండుగ',
          type: 'single',
          paksha: 'Shukla',
          masa: 'Bhadrapada',
          tithi: 4,
          observances: ['వరసిద్ధి వినాయక వ్రత పూజ', 'గణపతి హోమం'],
          description: 'భాద్రపద శుద్ధ చవితి — శ్రీ వినాయక చవితి (మధ్యాహ్న వ్యాప్తి / TTD నిర్ణయం)',
        });
      }
    } else if (hasGanesh && noonTithi !== 3) {
      // Chaturthi ended before noon today (e.g. Sep 15 where Panchami occupies Madhyahna)
      list = list.filter(
        (f) => !/Ganesh Chaturthi|Vinayaka Chaturthi/i.test(f.name)
      );
    }
  }

  // 3. NAGULA CHAVITHI (నాగుల చవితి) - Kartika Shukla Chavithi
  // In Telugu tradition, Kartika Shukla Chavithi is Nagula Chavithi (serpent worship).
  // Replace North-Indian Karwa Chauth which erroneously maps to this.
  if (masaIndex === 7 && pakshaKey === 'Shukla' && (tithiIndex === 3 || tithiIndex === 4)) {
    list = list.filter((f) => !/Karva|Karwa/i.test(f.name));
    if (!list.some((f) => /Nagula Chavithi|నాగుల చవితి/i.test(f.name || f.nameTe))) {
      list.unshift({
        name: 'నాగుల చవితి',
        nameTe: 'నాగుల చవితి (శ్రీ నాగదేవత / సుబ్రహ్మణ్య పూజ)',
        category: 'major',
        categoryTe: 'ప్రధాన పండుగ',
        type: 'single',
        description: 'కార్తీక శుద్ధ చవితి — నాగుల చవితి (పుట్టలో పాలు పోసే పర్వదినం)',
      });
    }
  }

  // 4. VAIKUNTHA EKADASHI / MUKKOTI EKADASHI (శ్రీ వైకుంఠ ఏకాదశి / ముక్కోటి ఏకాదశి)
  // Margashirsha Shukla Ekadashi (Dec 20, 2026) — Most sacred day in Tirumala & Vaikhanasa
  if (masaIndex === 8 && pakshaKey === 'Shukla' && tithiIndex === 10) {
    const existingIdx = list.findIndex((f) => /Mokshada|Ekadashi/i.test(f.name));
    const vaikunthaObj = {
      name: 'శ్రీ వైకుంఠ ఏకాదశి (ముక్కోటి ఏకాదశి)',
      nameTe: 'శ్రీ వైకుంఠ ఏకాదశి (ముక్కోటి ఏకాదశి / గీతా జయంతి)',
      category: 'major',
      categoryTe: 'ప్రధాన పండుగ',
      type: 'ekadashi',
      isFastingDay: true,
      description: 'శ్రీ వైకుంఠ ఏకాదశి — తిరుమలలో వైకుంఠ ద్వార దర్శనం, గీతా జయంతి',
    };
    if (existingIdx >= 0) {
      list[existingIdx] = vaikunthaObj;
    } else {
      list.unshift(vaikunthaObj);
    }
  }

  // Margashirsha Shukla Dwadashi: Mukkoti Dwadashi (ముక్కోటి ద్వాదశి)
  if (masaIndex === 8 && pakshaKey === 'Shukla' && tithiIndex === 11) {
    if (!list.some((f) => /Mukkoti|ముక్కోటి/i.test(f.name || f.nameTe))) {
      list.unshift({
        name: 'ముక్కోటి ద్వాదశి',
        nameTe: 'ముక్కోటి ద్వాదశి (వైకుంఠ ద్వాదశి)',
        category: 'major',
        categoryTe: 'ప్రధాన పండుగ',
        type: 'single',
        description: 'ముక్కోటి ద్వాదశి — స్వామి పుష్కరిణి తీర్థ ముక్కోటి స్నానం',
      });
    }
  }

  // 5. TELUGU HANUMAN JAYANTI (హనుమాన్ జయంతి - తెలుగు రాష్ట్రాల పండుగ)
  // Celebrated on Vaishakha Bahula Dashami after 41-day Hanuman Deeksha
  if (masaIndex === 1 && pakshaKey === 'Krishna' && (tithiIndex === 23 || tithiIndex === 24)) {
    if (!list.some((f) => /Hanuman/i.test(f.name))) {
      list.unshift({
        name: 'హనుమాన్ జయంతి (తెలుగు)',
        nameTe: 'హనుమాన్ జయంతి (దీక్షా విరమణ - తెలుగు)',
        category: 'major',
        categoryTe: 'ప్రధాన పండుగ',
        type: 'single',
        description: 'వైశాఖ బహుళ దశమి — తెలుగు రాష్ట్రాలలో హనుమాన్ జయంతి దీక్షా విరమణ',
      });
    }
  }

  // 6. THOLI EKADASHI (తొలి ఏకాదశి / శయన ఏకాదశి)
  // Ashadha Shukla Ekadashi
  if (masaIndex === 3 && pakshaKey === 'Shukla' && tithiIndex === 10) {
    const idx = list.findIndex((f) => /Devshayani|Ekadashi/i.test(f.name));
    const tholiObj = {
      name: 'తొలి ఏకాదశి',
      nameTe: 'తొలి ఏకాదశి (శయన ఏకాదశి / చాతుర్మాస్య వ్రతారంభం)',
      category: 'major',
      categoryTe: 'ప్రధాన పండుగ',
      type: 'ekadashi',
      isFastingDay: true,
      description: 'ఆషాఢ శుద్ధ ఏకాదశి — తొలి ఏకాదశి (చాతుర్మాస్య వ్రతారంభం)',
    };
    if (idx >= 0) list[idx] = tholiObj;
    else list.unshift(tholiObj);
  }

  // 7. BHISHMA EKADASHI (భీష్మ ఏకాదశి)
  // Magha Shukla Ekadashi (Vishnu Sahasranama Upadesha Dinam)
  if (masaIndex === 10 && pakshaKey === 'Shukla' && tithiIndex === 10) {
    const idx = list.findIndex((f) => /Jaya|Ekadashi/i.test(f.name));
    const bhishmaObj = {
      name: 'భీష్మ ఏకాదశి',
      nameTe: 'భీష్మ ఏకాదశి (శ్రీ విష్ణు సహస్రనామ జయంతి)',
      category: 'major',
      categoryTe: 'ప్రధాన పండుగ',
      type: 'ekadashi',
      isFastingDay: true,
      description: 'మాఘ శుద్ధ ఏకాదశి — భీష్మ ఏకాదశి, విష్ణు సహస్రనామ స్తోత్ర ఆవిర్భావ దినం',
    };
    if (idx >= 0) list[idx] = bhishmaObj;
    else list.unshift(bhishmaObj);
  }

  // 8. SRI VIKHANASA MAHARSHI JAYANTI (శ్రీ విఖనస మహర్షి జయంతి)
  // Sravana Shukla Dwadashi with Shravana Nakshatra (Vaikhanasa Guru Jayanti)
  if (masaIndex === 4 && pakshaKey === 'Shukla' && (tithiIndex === 11 || nakshatraIndex === 21)) {
    if (!list.some((f) => /Vikhanasa|విఖనస/i.test(f.name || f.nameTe))) {
      list.unshift({
        name: 'శ్రీ విఖనస మహర్షి జయంతి',
        nameTe: 'శ్రీ విఖనస మహర్షి జయంతి (వైఖానస గురు జయంతి)',
        category: 'major',
        categoryTe: 'ప్రధాన పండుగ',
        type: 'single',
        description: 'శ్రావణ శుద్ధ ద్వాదశి, శ్రవణా నక్షత్రం — వైఖానస భగవచ్ఛాస్త్ర ప్రవర్తకులైన శ్రీ విఖనస మహర్షి జయంతి',
      });
    }
  }

  // 9. KSHEERABDHI DVADASHI (క్షీరాబ్ధి ద్వాదశి / చిలుక ద్వాదశి)
  // Kartika Shukla Dwadashi
  if (masaIndex === 7 && pakshaKey === 'Shukla' && (tithiIndex === 11 || tithiIndex === 12)) {
    if (!list.some((f) => /Ksheerabdhi|క్షీరాబ్ధి/i.test(f.name || f.nameTe))) {
      list.unshift({
        name: 'క్షీరాబ్ధి ద్వాదశి',
        nameTe: 'క్షీరాబ్ధి ద్వాదశి (చిలుక ద్వాదశి / బృందావన ద్వాదశి)',
        category: 'major',
        categoryTe: 'ప్రధాన పండుగ',
        type: 'single',
        description: 'కార్తీక శుద్ధ ద్వాదశి — క్షీరాబ్ధి ద్వాదశి, తులసీ-ధాత్రీ పూజ',
      });
    }
  }

  // 10. KARTHIKA POURNAMI (కార్తీక పౌర్ణమి / జ్వాలాతోరణం)
  if (masaIndex === 7 && pakshaKey === 'Shukla' && tithiIndex === 14) {
    if (!list.some((f) => /జ్వాలాతోరణం/i.test(f.nameTe || ''))) {
      const idx = list.findIndex((f) => /Kartik Purnima/i.test(f.name));
      const karthikaObj = {
        name: 'కార్తీక పౌర్ణమి',
        nameTe: 'కార్తీక పౌర్ణమి (జ్వాలాతోరణం / కార్తీక దీపోత్సవం)',
        category: 'major',
        categoryTe: 'ప్రధాన పండుగ',
        type: 'pournami',
        isFastingDay: true,
        description: 'కార్తీక పూర్ణిమ — నదీ స్నానం, దీపారాధన, జ్వాలాతోరణ దర్శనం',
      };
      if (idx >= 0) list[idx] = karthikaObj;
      else list.unshift(karthikaObj);
    }
  }

  // 11. SUBRAHMANYA SASHTI (సుబ్రహ్మణ్య షష్ఠి / స్కంద షష్ఠి)
  // Margashirsha Shukla Sashti
  if (masaIndex === 8 && pakshaKey === 'Shukla' && tithiIndex === 5) {
    if (!list.some((f) => /Subrahmanya|స్కంద షష్ఠి|సుబ్రహ్మణ్య/i.test(f.name || f.nameTe))) {
      list.unshift({
        name: 'సుబ్రహ్మణ్య షష్ఠి',
        nameTe: 'సుబ్రహ్మణ్య షష్ఠి (స్కంద షష్ఠి / చంపక షష్ఠి)',
        category: 'major',
        categoryTe: 'ప్రధాన పండుగ',
        type: 'single',
        description: 'మార్గశిర శుద్ధ షష్ఠి — శ్రీ సుబ్రహ్మణ్యేశ్వర స్వామి కల్యాణం / విశేష పూజ',
      });
    }
  }

  // 12. BATHUKAMMA & BONALU (తెలంగాణ సంస్కృతిక ఉత్సవాలు)
  // Engili Pula Bathukamma: Bhadrapada Amavasya (Mahalaya Amavasya)
  if (masaIndex === 5 && pakshaKey === 'Krishna' && tithiIndex === 29) {
    if (!list.some((f) => /Bathukamma|బతుకమ్మ/i.test(f.name || f.nameTe))) {
      list.push({
        name: 'ఎంగిలి పూల బతుకమ్మ',
        nameTe: 'ఎంగిలి పూల బతుకమ్మ (బతుకమ్మ పండుగ ప్రారంభం)',
        category: 'regional',
        categoryTe: 'ప్రాంతీయ ఉత్సవం',
        type: 'single',
        description: 'మహాలయ అమావాస్య — ఎంగిలి పూల బతుకమ్మ',
      });
    }
  }
  // Saddula Bathukamma: Ashwayuja Shukla Ashtami (Durgashtami)
  if (masaIndex === 6 && pakshaKey === 'Shukla' && tithiIndex === 7) {
    if (!list.some((f) => /సద్దుల బతుకమ్మ/i.test(f.nameTe || ''))) {
      list.push({
        name: 'సద్దుల బతుకమ్మ',
        nameTe: 'సద్దుల బతుకమ్మ (బతుకమ్మ పండుగ ముగింపు)',
        category: 'regional',
        categoryTe: 'ప్రాంతీయ ఉత్సవం',
        type: 'single',
        description: 'దుర్గాష్టమి — తెలంగాణలో సద్దుల బతుకమ్మ సంబరాలు',
      });
    }
  }
  // Ashadha Bonalu: Sundays in Ashadha Masam
  if (masaIndex === 3 && varaIndex === 0) {
    if (!list.some((f) => /Bonalu|బోనాలు/i.test(f.name || f.nameTe))) {
      list.push({
        name: 'ఆషాఢ బోనాలు',
        nameTe: 'ఆషాఢ బోనాలు (శ్రీ మహాంకాళి పూజ)',
        category: 'regional',
        categoryTe: 'ప్రాంతీయ ఉత్సవం',
        type: 'single',
        description: 'ఆషాఢ మాస ఆదివారం — తెలంగాణలో బోనాల సంబరాలు',
      });
    }
  }

  // 13. SANKASHTAHARA CHATURTHI (సంకష్టహర చతుర్థి)
  // Monthly Krishna Paksha Chaturthi
  if (pakshaKey === 'Krishna' && tithiIndex === 18) {
    if (!list.some((f) => /Sankashti|సంకష్టహర/i.test(f.name || f.nameTe))) {
      list.push({
        name: 'సంకష్టహర చతుర్థి',
        nameTe: 'సంకష్టహర చతుర్థి (చంద్రోదయ పూజ)',
        category: 'vratham',
        categoryTe: 'వ్రతం',
        type: 'single',
        description: 'బహుళ చవితి — సంకష్టహర చతుర్థి వ్రతం',
      });
    }
  }

  // 14. PRADOSHAM (ప్రదోష వ్రతం) - Trayodashi of every paksha
  if (tithiIndex === 12 || tithiIndex === 27) {
    const isShani = varaIndex === 6;
    const isSoma = varaIndex === 1;
    const prefix = isShani ? 'శని ప్రదోషం' : isSoma ? 'సోమ ప్రదోషం' : 'ప్రదోష వ్రతం';
    if (!list.some((f) => /Pradosh|ప్రదోష/i.test(f.name || f.nameTe))) {
      list.push({
        name: `${prefix} (${pakshaKey === 'Shukla' ? 'శుద్ధ' : 'బహుళ'} త్రయోదశి)`,
        nameTe: `${prefix} (${pakshaKey === 'Shukla' ? 'శుద్ధ' : 'బహుళ'} త్రయోదశి)`,
        category: 'vratham',
        categoryTe: 'వ్రతం',
        type: 'single',
        description: `${prefix} — సాయంకాలం శివారాధన విశేషం`,
      });
    }
  }

  // 15. MASA SHIVARATRI (మాస శివరాత్రి) - Krishna Chaturdashi of every month
  if (pakshaKey === 'Krishna' && tithiIndex === 28 && masaIndex !== 10) {
    if (!list.some((f) => /Masik Shivaratri|మాస శివరాత్రి/i.test(f.name || f.nameTe))) {
      list.push({
        name: 'మాస శివరాత్రి',
        nameTe: 'మాస శివరాత్రి (శివార్చన)',
        category: 'vratham',
        categoryTe: 'వ్రతం',
        type: 'single',
        description: 'మాస శివరాత్రి — అర్ధరాత్రి శివారాధన',
      });
    }
  }

  // Final mapping: Ensure every festival has proper Telugu nameTe and categoryTe
  return list.map((f) => {
    const teName = f.nameTe || FESTIVAL_NAME_TE[f.name] || f.name;
    const category = f.category || f.type || 'single';
    const teCat = f.categoryTe || FESTIVAL_CATEGORY_TE[category] || FESTIVAL_CATEGORY_TE[f.type] || 'పండుగ';

    return {
      name: teName, // Prioritize Telugu string as default name
      nameEn: f.name,
      nameTe: teName,
      category,
      categoryTe: teCat,
      type: f.type || 'single',
      paksha: f.paksha || pakshaKey,
      masa: f.masa || (raw.masa?.name ?? null),
      tithi: f.tithi ?? (tithiIndex + 1),
      isFastingDay: Boolean(f.isFastingDay),
      observances: f.observances || [],
      description: f.description || '',
      regional: f.regional || [],
      spanDays: f.spanDays,
      dailyNames: f.dailyNames || [],
    };
  });
}

module.exports = {
  FESTIVAL_NAME_TE,
  FESTIVAL_CATEGORY_TE,
  resolveTeluguFestivals,
};
