import requests
import html5lib
from bs4 import BeautifulSoup
from multiprocessing import Pool
import re

plays_patterns = re.compile(r'Macbeth|Othello|Romeo\s(and|\&)\sJuliet|Hamlet|King\sLear|The\sTempest')

hamlet_urls = 'http://collections.shakespeare.org.uk/search/rsc-performances/view_as/list/search/everywhere:hamlet/page/7'
