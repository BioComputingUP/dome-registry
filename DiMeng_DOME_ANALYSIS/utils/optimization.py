from utils.constant import ALGORITHM_MAP, METHOD_TO_CATEGORY


def normalize_algorithms(raw_outputs):
    """
    Normalize predicted algorithm names to canonical names.
    raw_outputs - list of str, list of algorithms.
    """
    normalized = []
    
    detected = raw_outputs
    matched = set()

    for canon, aliases in ALGORITHM_MAP.items():
        for alias in aliases:
            if any(alias in d for d in detected):
                matched.add(canon)

    normalized.append(sorted(matched))
    return normalized


def method2category(list_method):
    '''
    Given ML method name, return ML category.
    '''
    return list(set([METHOD_TO_CATEGORY[m] for m in list_method]))