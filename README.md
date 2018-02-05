# Shakespeare Productions Dataset (Last update: 2/5/18)


# Rewrite README to discuss purposes of various files

### Included in this repo are several test Python scripts that scrape production data from various online databases and archives

### In scripts folder:

The **url_scrapes** directory contains Python scripts that take web pages with lists of relevant urls of productions. Most of these scripts will only match for the plays we're interested in, including The Tempest, Hamlet, Macbeth, King Lear, Othello, and Romeo and Juliet. Each script is tailored for the particular database or archive of past performances.

The **production_scrapes** contains scripts that scrape for metadata for each production of any given play. We're interested in opening dates, production company, theatre venue, the actors for certain roles (listed below), and the director of the production.

Once scraped, tsv's are generated and written to a .tsv file in the **urls** subdirectory inside **data**

## TODO:

* Remove old test and practice scripts
* Remove duplicate entries of same actor/production + look at anomalous role notations
* Remove amateur productions based on producer/production company name? (Mostly an issue with Theatricalia)
* Normalize cast and production information
* Create single actor database [Finished script 1/27/18; need to add all files once production scraping is complete]
* Update age calculation script
* Update actor scrape script to grab categories
* package to do date normalization

* Design:
    *Character Icons; hand-drawn?*

#### PRODUCTIONS TO ADD:
* Stratford (urls scraped; need to get production info)
* Shakespeare's Globe (urls scraped; need to write to tsv file still 2/5)
* RSC
* Misc. productions spreadsheet [e.g., Chicago Shakespeare Theater]
* Broadway productions
* Film?

* Add links to TSV files?

#### PARAMETERS TO INCLUDE IN ENCODING:
* Age of actor
* Ethnicity/Race of actor
* Production in language other than English
* Filter by the big production companies and series (e.g. RSC, Shakespeare in the Park)
* Theatre capacity
