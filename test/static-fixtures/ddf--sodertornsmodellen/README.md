# Södertörnsmodellen

Before running the scripts:
Step1: add "Total" columns besides man and women cells for each sheet
Step2: Create cumulative calculations for (man, women and total:
Kumulativt flyttöverskott högutbildade (Sheet: flytt utbildning rensad)
Kumulativt Flyttöverskott förvärvsarbete (Sheet: flytt arbete rensad 2000-2014)
Kumulativt Flyttöverskott( Sheet: total flytt rensad 2000-2014)

Python Main function:
you will see few basomrade codes which are not part of calculations. They have been removed as they don't have population data.
if these codes are available in A7 or A9 sheet then you can remove them and run sheet.

Basomrade missing Names:
by default we use BASKOD2010 to get the names for basmorade.
BUT there are abut > 50 codes which does not have info there. 
So we look for BASKOD2000 which is parent code and has multiple
entries. we add those entries with "&" sign
