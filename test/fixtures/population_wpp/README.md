# Population by age group from WPP

source: 

- both sex: http://esa.un.org/unpd/wpp/DVD/Files/1_Indicators%20(Standard)/EXCEL_FILES/5_Interpolated/WPP2015_INT_F03_1_POPULATION_BY_AGE_ANNUAL_BOTH_SEXES.XLS
- male: http://esa.un.org/unpd/wpp/DVD/Files/1_Indicators%20(Standard)/EXCEL_FILES/5_Interpolated/WPP2015_INT_F03_2_POPULATION_BY_AGE_ANNUAL_MALE.XLS
- female: http://esa.un.org/unpd/wpp/DVD/Files/1_Indicators%20(Standard)/EXCEL_FILES/5_Interpolated/WPP2015_INT_F03_3_POPULATION_BY_AGE_ANNUAL_FEMALE.XLS


## how to generate the dataset

1. download all of the source files above and put them into etl/source dir.
2. run in commandline: `cd etl/script && python pop_all.py`


## notes:

1. there are 2 types of data: estimates and medium variant. For year before 2015,
the data type is estimates, and medium variant for later. But for year 2015,
there are both estimates and medium variant data for each area.
2. there are groups that are not single year group: 80+ group and 100+ group. the
80+ group only appears before 1990, as the last group available for the data. After
1990, the last group available becomes 100+.
