'''
Created on 14 May 2025,
by Di.
'''
import re
import os

import requests
from Bio import Entrez

# Always set email (NCBI requires this)
Entrez.email = "di.meng@ucdconnect.ie"


def extract_valid_doi(doi):
    '''
    get Clear DOI (code need to be updated if there are new user free styles in the future)
        styles of available DOI:

        10.1186/1471-2105-8-S5-S3
        https://doi.org/10.48550/arXiv.2202.05146
        doi.org/10.48550/arXiv.2202.05146
        doi: 10.48550/arXiv.2202.05146
    '''
    if not isinstance(doi, str):
        doi_clean = ''

    # Clean and strip spaces
    doi_clean = doi.strip().lower()

    # Remove URL prefix if present
    if doi_clean.startswith("https://doi.org/"):
        doi_clean = doi_clean.replace("https://doi.org/", "")
        
    elif doi_clean.startswith("doi.org/"):
        doi_clean = doi_clean.replace("doi.org/", "")
        
    elif doi_clean.startswith("doi:"):
        doi_clean = doi_clean.replace("doi:", "")
        doi_clean = doi_clean.strip()
        
    # Basic DOI pattern (can be refined if needed)
    if not re.match(r"^10\.\d{4,9}/[^\s]+$", doi_clean):
        doi_clean = ''
    return doi_clean


def is_valid_pmid(pmid) -> bool:
    '''
    Check PMID format. 
    '''
    
    if isinstance(pmid, int):
        return pmid > 0
    if isinstance(pmid, str):
        pmid = pmid.strip()
        return pmid.isdigit() and int(pmid) > 0
    return False

def extract_valid_pmid(pmid) -> str:
    '''
    if pmid is valid, return it; otherwise, return empty str
    '''
    if is_valid_pmid(pmid):
        return pmid
    else:
        return ''


def fetch_pmid_from_doi(doi):
    '''
    Search PubMed using the DOI. Not always exist.
    '''
    handle = Entrez.esearch(db="pubmed", term=doi, field="doi")
    record = Entrez.read(handle)
    handle.close()

    id_list = record.get("IdList", [])
    if id_list:
        return id_list[0]  # Return the first PMID
    else:
        print(f"No PMID found for DOI: {doi}")
        return None


def link_pmid2pmcid(pmid):
    '''
    If PMCID exist, the full text is available on PMC.
    return - PMCID or '' (not available)
    '''
    handle = Entrez.elink(dbfrom="pubmed", db="pmc", id=pmid, linkname="pubmed_pmc")
    records = Entrez.read(handle)
    handle.close()
    
    try:
        pmcid = records[0]["LinkSetDb"][0]["Link"][0]["Id"]
        print(f"Found PMCID: PMC{pmcid}")
        return pmcid
    except (IndexError, KeyError):
        print("This article is not available in PMC.")
        return ''
    
def fetch_pmc_xml(pmcid, output_dir="."):
    '''
    Gavin PMCID, download the full text and save it under output_dir.
    Params:
        pmcid - str
        output_dir - path to the folder
    '''
    # Step 1: Fetch XML full text
    handle = Entrez.efetch(db="pmc", id=pmcid, rettype="full", retmode="xml")
    xml_data = handle.read()
    handle.close()

    # Step 2: decode bytes to String
    xml_text = xml_data.decode('utf-8')
    
    # Step 3: Save XML
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"PMC{pmcid}.xml")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(xml_text)

    print(f"Saved XML to {output_path}")
    return output_path


def get_openalex_citations_by_doi(doi):
    '''
    Given DOI, return the number of citations.
    e.g. DOI: "10.1038/s41586-020-2649-2"
    '''
    doi = doi.lower().strip().replace("https://doi.org/", "")
    url = f"https://api.openalex.org/works/https://doi.org/{doi}"

    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return {
            "title": data.get("title"),
            "cited_by_count": data.get("cited_by_count"),
            "publication_year": data.get("publication_year"),
            "openalex_id": data.get("id")
        }
    else:
        print(f"Error {response.status_code}: {response.text}")
        return None