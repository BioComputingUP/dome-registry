
def listEntries_to_dictEntries(list_entries):
    '''
    transfer list_entries to dict_entries
    key: '_id'
    value: entry
    '''
    dict_entries = {}
    for entry in list_entries:
        dict_entries[entry['_id']] = entry
    return dict_entries


def extract_key_structure(d):
    structure = {}
    for key, value in d.items():
        if isinstance(value, dict):
            structure[key] = list(value.keys())
        else:
            structure[key] = []
    return structure