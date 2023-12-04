import requests
from crontab import CrontTab
import uuid
import os

base_url = 'http://localhost:8080/'

script_id = '4ba6ef55-f0d0-4f92-a3b4-ef1ba0f987bb'

# Save Script test
def test_save_script():
   url = base_url + "API/save_script/" + script_id
   script_text = "import sys import pandas as pd def ctry_any_actor(ctry:str)->int: return df[(df['Actor1Geo'] == ctry) | (df['Actor2Geo'] == ctry)]['Frequency'].sum() df = pd.read_csv(sys.argv[1]) total_articles = df['Frequency'].sum()$   data_in = {'script_text': script_text}

   response = requests.post(url, data = data_in)
   response_body = response.json()
   response.close()

   script_filename = "script-" + script_id + ".py"
   scriptFolderPath = os.path.dirname(os.path.realpath(__file__)) + "/../scriptsFolder/" + script_filename

   assert response.status_code == 200
   assert os.path.exists(scriptFolderPath)

   fileObj = open(scriptFolderPath, "r")
   actual_text = fileObj.read()
   fileObj.close()
   assert script_text == actual_text
