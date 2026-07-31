import type { TimelineEvent } from "../types";

// TODO-korisnik: provjeri sve godine i činjenice prije objave!
// Izvori: hr.wikipedia.org/wiki/NK_Veli_Vrh, HNS Semafor, Istrasport.
// Uklonjeni raniji nepotvrđeni zapisi: "2016. utakmica protiv Dinama",
// "2017. slavlje 50 godina" (matematički nemoguće uz osnutak 1975.),
// "2021. ulazak u 4. HNL" — vrati ih ako su točni.

export const timelineEvents: TimelineEvent[] = [
  {
    id: "event-1972",
    year: 1972,
    title: "Inicijativa za osnivanje",
    description:
      "Iz mjesne zajednice i omladinske organizacije kreće inicijativa za osnivanje kluba. Odlukom općinske uprave za igralište je određena lokacija bivšeg kamenoloma u središtu naselja — današnji Tivoli.",
    category: "founding",
  },
  {
    id: "event-1975",
    year: 1975,
    title: "Osnivanje kluba",
    description:
      "Na osnivačkoj skupštini 21. ožujka 1975. službeno je osnovan NK Veli Vrh. Prvi predsjednik bio je Anton Bjažić, a prvi trener Bruno Krstulović.",
    category: "founding",
  },
  {
    id: "event-1975-match",
    year: 1975,
    title: "Prva utakmica",
    description:
      "14. rujna 1975. odigrana je prva utakmica — pobjeda 1:0 protiv NK Šišan, a povijesni prvi pogodak zabio je Rade Mandić.",
    category: "achievement",
  },
  {
    id: "event-2002",
    year: 2002,
    title: "Ulazak u 1. Županijsku ligu",
    description:
      "Klub je ušao u 1. Županijsku nogometnu ligu Istarske županije, ostvarivši plasman u najviši rang županijskog nogometa.",
    category: "achievement",
  },
  {
    id: "event-2025",
    year: 2025,
    title: "50 godina kluba",
    description:
      "Pola stoljeća nogometa na Velom Vrhu — jubilej uz generacije igrača, trenera i navijača koji su gradili klub.",
    category: "achievement",
  },
  {
    id: "event-2026",
    year: 2026,
    title: "Elitna liga NSŽI",
    description:
      "Seniori se natječu u Elitnoj ligi Nogometnog saveza Županije Istarske — najvišem rangu županijskog nogometa, uz aktivan rad svih uzrasnih kategorija.",
    category: "achievement",
  },
];
