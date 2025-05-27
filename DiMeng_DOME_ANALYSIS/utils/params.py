import os
'''
13th May 2025

Folder: Upper case first letter name: PATH_RegistryData
File: lowercase name: path_registry_data_json
'''
ROOT = os.path.realpath('.')

PATH_DATA = os.path.join(ROOT, 'data')
PATH_RegistryData = os.path.join(PATH_DATA, 'DOME_Registry_Data')
PATH_Registry_PMC_Full_Texts = os.path.join(PATH_DATA, 'DOME_Registry_PMC_Full_Texts')
PATH_Output = os.path.join(PATH_DATA, 'output')
PATH_Output_GigaScience = os.path.join(PATH_Output, 'gigascience')

path_registry_data_json = os.path.join(PATH_RegistryData, 'dome_registry_data.json')
path_registry_data_processed_json = os.path.join(PATH_RegistryData, 'dome_registry_data_processed.json')
