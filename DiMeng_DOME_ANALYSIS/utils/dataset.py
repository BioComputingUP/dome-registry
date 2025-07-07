import re

def label_data_availability_simple(text):
    '''
    label data availablity. Check data if it is publically available.
    Y - available
    N - not available
    R - Available upon requirement
    '''
    
    if not isinstance(text, str) or text.strip() == "":
        return 'N'

    text = text.lower().strip()
    if text in ['no', 'no.', '?']:
        return 'N'
    # Patterns strongly suggesting data is NOT available
    no_patterns = [
        "no,",
        "no\n",
        "but ",
        "data is not available",
        "not publicly available",
        "not shared",
        "data is not reported",
        "to be updated",
        "tbc",
        "private",
        "privacy"
    ]
    uponRequest_patterns = [
        "contact",     # just email
        "upon request at ELIXIR",   # vague
        "upon request to",   # vague
        "upon request\.",
        "upon reasonable request",
        "request from the corresponding author",
        "study/ upon request",
        "available from authors",
    ]

    for pat in no_patterns:
        if re.search(pat, text):
            return 'N'
    
    for pat in uponRequest_patterns:
        if re.search(pat, text):
            # print(pat)
            return 'R'

    return 'Y'