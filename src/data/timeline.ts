import type { TimelineEvent } from "../types";

// Izvori: arhivirana službena stranica kluba (web.archive.org/nkvelivrh.hr/klub/,
// snapshot 2015.–2021.), Glas Istre, istrasport.eu, HRT Radio Pula, Wikipedija,
// HNS Semafor. TODO-korisnik: provjeri s upravom prije objave, posebno imena.

export const timelineEvents: TimelineEvent[] = [
  {
    id: "event-1972",
    year: 1972,
    title: "Inicijativa i zemljište",
    description:
      "Na inicijativu mjesne zajednice, SUBNOR-a i omladinske organizacije kreću pripreme za osnivanje kluba. Rješenjem općine Pula od 3. srpnja 1972. za igralište je određeno područje bivšeg kamenoloma i odlagališta otpada u centru naselja — mjesto današnjeg Tivolija, koje se zatim dvije godine uređivalo.",
    category: "founding",
  },
  {
    id: "event-1975",
    year: 1975,
    title: "Osnivanje kluba",
    description:
      "Na osnivačkoj skupštini 21. ožujka 1975. osnovan je NK Veli Vrh. Prvi predsjednik bio je Anton Bjažić, a prvi trener Bruno Krstulović. U prvoj upravi bili su Elvino Šuran, Giorgo Bucci, Mario Žufić, Vladimir Šešelja, Veljko Zgrablić, Denis Runko, Bruno Bucci, Željko Benčić i Bruno Lali.",
    category: "founding",
  },
  {
    id: "event-1975-match",
    year: 1975,
    title: "Prva utakmica: 1:0",
    description:
      "Klub ulazi u Međuopćinsku ligu Pula–Rovinj, a 14. rujna 1975. igra prvu prvenstvenu utakmicu — protiv NK Šišan, na posuđenom igralištu Fortin u Štinjanu jer Tivoli još nije bio gotov. Pobjeda 1:0 golom Rade Mandića.",
    category: "milestone",
  },
  {
    id: "event-1978",
    year: 1978,
    title: "Prvi mlađi uzrasti",
    description:
      "Formirani su juniori i pioniri, iako u tom rangu nisu bili obavezni. Kako se još nisu mogli natjecati, mlade igrače klub je ustupao NK Štinjanu, a kasnije NK Valbandonu.",
    category: "milestone",
  },
  {
    id: "event-1991",
    year: 1991,
    title: "Kroz Domovinski rat",
    description:
      "Najteže razdoblje u povijesti kluba — kronična besparica i teškoće oko okupljanja dovoljnog broja igrača. Unatoč svemu, rad kluba nije prestao ni jedne sezone.",
    category: "milestone",
  },
  {
    id: "event-1996",
    year: 1996,
    title: "Škola nogometa i turnir",
    description:
      "Rad s najmlađima podignut je na zavidnu razinu i pokrenuta je škola nogometa. U isto vrijeme rađa se tradicionalni lipanjski turnir za U-9 i U-11, nasljednik nekadašnjeg seniorskog turnira za Dan borca. Do 2015. prerastao je u međunarodni turnir s tridesetak ekipa i preko 400 djece.",
    category: "milestone",
  },
  {
    id: "event-2004",
    year: 2004,
    title: "Dva ranga u dvije sezone",
    description:
      "Sezonama 2002./03. i 2003./04. klub iz najnižeg ranga prolazi do 1. županijske lige — cilj je bio ući u rang koji omogućuje natjecanje mlađih kategorija. U godinama koje slijede juniori su dvije sezone bili najbolji u Istri, a pioniri u samom vrhu.",
    category: "achievement",
  },
  {
    id: "event-2010",
    year: 2010,
    title: "Bronca u 1. ŽNL",
    description:
      "U sezoni 2009./10. seniori zauzimaju 3. mjesto u 1. Županijskoj nogometnoj ligi Istarskoj — 45 bodova iz 26 utakmica uz gol-razliku 50:38.",
    category: "achievement",
  },
  {
    id: "event-2022",
    year: 2022,
    title: "Prvi put u saveznom rangu",
    description:
      "Sezone 2021./22. Veli Vrh prvi put u povijesti igra 4. NL NS Rijeka i osvaja 5. mjesto — iskorak iz županijskog u savezni rang natjecanja.",
    category: "achievement",
  },
  {
    id: "event-2023",
    year: 2023,
    title: "Najbolji plasman u povijesti",
    description:
      "U sezoni 2022./23. klub završava na 3. mjestu 4. NL NS Rijeka s 55 bodova (17-4-5) i gol-razlikom 57:31 — najveći sportski uspjeh u povijesti kluba. Stefan Antanasković zabio je 17, a Ismar Hairlahović 10 golova. Zbog nedostatnog omladinskog pogona klub nije mogao iskoristiti pravo na viši rang te se vraća u županijsko natjecanje.",
    category: "achievement",
  },
  {
    id: "event-2025",
    year: 2025,
    title: "Pola stoljeća kluba",
    description:
      "Klub obilježava 50 godina postojanja. Vodstvo preuzima predsjednik Ilija Lovrić, a seniorsku momčad trener Dalibor Božac — nekadašnji igrač Istre, Hajduka, Pomorca i Slaven Belupa te hrvatski U-21 reprezentativac. Županijska liga mijenja ime u Elitnu ligu NSŽI.",
    category: "milestone",
  },
  {
    id: "event-2026",
    year: 2026,
    title: "Obnova Tivolija",
    description:
      "U lipnju 2026. kreće potpuna rekonstrukcija igrališta vrijedna 830.000 eura — nova umjetna trava, sustav navodnjavanja, nove tribine pristupačne osobama s invaliditetom, ograda i klupe. U rujnu iste godine naselje dobiva Ulicu Veljka Zgrablića, nazvanu po osnivaču kluba koji je Velom Vrhu bio igrač, trener, predsjednik i član uprave.",
    category: "infrastructure",
  },
];
