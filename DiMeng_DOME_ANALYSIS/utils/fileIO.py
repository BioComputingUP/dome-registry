import os
import pandas as pd
import numpy as np
import json

###
# file IO
###
def save_tab(df: pd.DataFrame, file_path: str):
    df.to_csv(file_path, index=False, sep='\t')
    
def load_tab(file_path: str) -> pd.DataFrame:
    df = pd.read_csv(file_path, sep='\t')
    return df

def save_np(arr: list, file_path: str):
    '''
    Save a list of numpy array to a file.
    params: 
        arr - a list of numpy array
        file_path - file path with .npy
    
    '''
    np.save(file_path, np.array(arr, dtype=np.float32), allow_pickle=True)
    
def load_np(file_path: str):
    '''
    Save a list of numpy array to a file.
    params: 
        file_path - file path with .npy
        
    return:
        arr - a list of numpy array
    '''
    arr = np.load(file_path, allow_pickle=True)
    return arr

'''
!!!! Not using yet
'''
def dump_dicts2jsons(list_dicts: list, folder: str, chain=False):
    '''
    Save a list of dictionaries to multiple json files. 
    Each dictionary contains a key 'pdbid', and name the json file as [pdbid].json
    
    param:
        chain - False: each dictionary represents a PDB-entry
                True: each dictionary represents a Chain
    '''
    
    for dict_content in list_dicts:
        # A PDB-entry: [pdbid].json
        # A chain: [pdbid]_[chainid].json
        file_name = ''
        if chain:
            file_name = dict_content['pdbid'] + '_' + dict_content['chain'][0] + '.json'
        else:
            file_name = dict_content['pdbid']+'.json'
            
        path_json = os.path.join(folder, file_name)
            
        with open(path_json, 'w') as fp:
            json.dump(dict_content, fp)

def dump_dict2json(dictData: dict, path_json: str):
    '''
    Save a dictionary to a JSON file.
    Note that JSON does not recognize Array or Numpy, change it to int or list!!
    '''
    with open(path_json, 'w') as fout:
        json.dump(dictData, fout)
        
def dump_list2json(listData: list, path_json: str):
    '''
    Save a dictionary to a JSON file.
    Note that JSON does not recognize Array or Numpy, change it to int or list!!
    '''
    with open(path_json, 'w') as fout:
        json.dump(listData, fout)

def read_json2dict(path_json: str) -> dict:
    '''
    Read JSON to a dict
    '''
    with open(path_json, 'r') as f:
        dictData = json.load(f)
        
    return dictData

def read_json2list(path_json: str) -> list:
    '''
    Read JSON to a list of dicts
    '''
    with open(path_json, 'r') as f:
        listData = json.load(f)
        
    return listData

def df2json(df: pd.DataFrame, path_json: str, index=True):
    '''
    Save df to a json file.
    ignore index
    '''
    
    df.to_json(path_json, index=index)