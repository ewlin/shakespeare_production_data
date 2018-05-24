# Shakespeare Productions Dataset (Todos updated on: 5/24/18)

# Latest UI/Article To-dos: 

* Franchise/Actor Career/Shakespeare chart
* Prose for Introduction + Directions for Navigating Piece
* Backwards in article code 
* Use male/female unicode symbols for cross-gender casting
* Brush/Slider update/redesign

* Refactor code to make more modular and reusable





------------------------


# Latest Data To-dos: (last updated in March 2018)

> Note some broadway productions only return and Month + year or just Year in the database and crashes the role_clean.py script;
> temporarily deleted those lines


## Data collection:
* Chicago [Some], Oregon [Some]
* Add Emilia somewhat [DONE, I think]
* Some Additional National Theatre productions?
* Redo Theatricalia production scrape; getting closing date instead of opening for some productions [March 27, 2018]
* Manually add productions of Richard III and Julius Caesar to Misc spreadsheet

## Data Normalization
--Data collection happens in (manual + scripts in production_scrapes)

* Combine these two into one script?
--Sort by Role (actor_scrapes/role_clean.py) using regex
--Filter out accidental matches and occasionally different role notations (helper_scripts/cleaned_roles.py)

* Manually look through temporary_files/temp_to_clean.tsv and copy/paste into proper file in temp/

* actor_meta_data_scrape_test.py requests each actor using wiki (need to send cleaned data) and then writes to data/ages/[role].tsv
[Here, birthdays are all converted to ISO formats; but still need to manually collect bdays]
* Think about how to include manually-collected age-estimates...

* Sort by Production-companies and look at the odd productions; remove amateur productions


## Misc.
* Start creating d3 code for quick prototype [Started March 9th]
* Collect metadata on actors' other productions (like 'best known for' data on Wikipedia)
> Harry Potter
> Star Wars
> Star Trek
> Lord of the Rings
> Game of Thrones
> Marvel (Avengers, X Men)
> TV shows


#### PARAMETERS TO INCLUDE IN ENCODING:
* Age of actor
* Ethnicity/Race of actor
* Production in language other than English
* Filter by the big production companies and series (e.g. RSC, Shakespeare in the Park)
* Theatre capacity

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
* Stratford (urls scraped; need to get production info) [finished]
* Shakespeare's Globe (urls scraped; need to write to tsv file still 2/5 (Finished 2/8)) (FINISHED)
> Fixed some issues with the url scraping; was not grabbing every production due to a bug in the code (2/8/2018)
> Still need to finish up individual production scrape
* National Theatre (hard to find some of)
* Film?

* Add links to TSV files?
