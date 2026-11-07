/** Tanzania regions with major districts. Admin-managed in the database; this is the seed/default set. */
export const TZ_REGIONS: Record<string, readonly string[]> = {
  "Dar es Salaam": ["Ilala", "Kinondoni", "Temeke", "Ubungo", "Kigamboni"],
  Arusha: ["Arusha City", "Arumeru", "Karatu", "Monduli"],
  Dodoma: ["Dodoma City", "Bahi", "Chamwino", "Kondoa"],
  Mwanza: ["Nyamagana", "Ilemela", "Magu", "Sengerema"],
  Mbeya: ["Mbeya City", "Rungwe", "Kyela", "Mbarali"],
  Morogoro: ["Morogoro Urban", "Kilosa", "Mvomero", "Ifakara"],
  Tanga: ["Tanga City", "Muheza", "Korogwe", "Pangani"],
  Kilimanjaro: ["Moshi Urban", "Moshi Rural", "Hai", "Rombo"],
  Pwani: ["Kibaha", "Bagamoyo", "Mkuranga", "Kisarawe"],
  Iringa: ["Iringa Urban", "Mufindi", "Kilolo"],
  Zanzibar: ["Mjini", "Magharibi A", "Magharibi B", "Kaskazini A"],
  Tabora: ["Tabora Urban", "Nzega", "Igunga"],
  Kagera: ["Bukoba Urban", "Karagwe", "Muleba"],
  Mtwara: ["Mtwara Urban", "Masasi", "Newala"],
};

export const TZ_REGION_NAMES = Object.keys(TZ_REGIONS);
