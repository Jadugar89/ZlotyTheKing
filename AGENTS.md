# AGENTS.md

## Cel aplikacji

Zloty the King to prosty kalkulator walutowy. Aplikacja pobiera aktualnie opublikowane średnie kursy walut z NBP i przelicza podaną kwotę na PLN.

Główne zastosowania:

- rozliczanie delegacji i wydatków poniesionych w walucie obcej,
- szybkie przeliczenia pomocnicze przy tradingu i analizie kwot,
- orientacyjne przeliczenia walut na potrzeby codziennych decyzji finansowych.

## Źródło danych

- Używamy publicznego API NBP: tabela A (`https://api.nbp.pl/api/exchangerates/tables/a?format=json`).
- Wykorzystywany jest kurs średni (`mid`) dla waluty.
- Odpowiedź jest cache'owana i odświeżana maksymalnie co 5 minut.
- Każdy wynik powinien pokazywać numer tabeli i datę publikacji kursu.
- Jeśli API NBP zwróci błąd albo niepoprawne dane, interfejs ma pokazać stan niedostępności zamiast zgadywać kurs.

## Zasady wyliczeń

- Kwota w walucie obcej jest mnożona przez kurs średni NBP: `kwota * mid = PLN`.
- Akceptujemy liczby z kropką lub przecinkiem dziesiętnym, maksymalnie do dwóch miejsc po przecinku.
- Nie przyjmujemy wartości ujemnych ani niepoprawnych tekstów.
- Wynik ma charakter informacyjny. Dla formalnych rozliczeń delegacji należy zachować datę, numer tabeli NBP i walutę transakcji.
- Dla tradingu kalkulator nie zastępuje kursu transakcyjnego, spreadu, prowizji ani danych realtime.

## Najważniejsze miejsca w kodzie

- `src/lib/nbp.ts` — pobieranie, walidacja i cache kursów NBP.
- `src/lib/currency.ts` — walidacja kwoty i przeliczenie na PLN.
- `src/components/Calculator.tsx` — formularz i prezentacja wyniku.
- `src/components/NavBar.tsx` — marka i nawigacja do kalkulatora.
- `src/app/layout.tsx` — wspólny layout, metadata i struktura strony.

## Reguła dni bez publikacji NBP

NBP nie publikuje tabel w weekendy ani w wybrane święta. Przy rozliczeniu używamy pierwszej dostępnej tabeli opublikowanej po dniu wydatku, więc piątek, sobota, niedziela i święto mogą wskazać kurs z kolejnego dnia roboczego.

## Wskazówki dla zmian

- Nie wprowadzaj kursów na stałe do kodu.
- Nie usuwaj walidacji odpowiedzi NBP bez dodania równoważnego zabezpieczenia.
- Przy zmianach wpływających na wynik dodaj lub zaktualizuj testy walidacji i przeliczeń.
- Zachowuj widoczną datę publikacji kursu.
- Po zmianach uruchom:

  ```sh
  npm run typecheck
  npm run lint
  ```

