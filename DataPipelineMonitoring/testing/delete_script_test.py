import requests
from crontab import CrontTab
import uuid
import os

base_url = 'http://localhost:8080/'

script_id = '4ba6ef55-f0d0-4f92-a3b4-ef1ba0f987bb'

# Delete Script test
def test_delete_script():
   test_id = str(uuid.UUID('{fbf5ab3d-15f2-46c2-8830-7e93ad8335a5}'))
   createScriptUrl = "http://localhost:8080/API/testing/create_test_script/testUser1/" + test_id
   data_in = {'name': 'deletScriptSuccessTest'}
   requests.post(createScriptUrl, data_in)

   url = "http://localhost:8080/API/delete_script/" + test_id
   response = requests.delete(url)
   response_body = response.json()
   response.close()

   script_filename = "script-" + test_id + ".py"
   scriptFolderPath = os.path.dirname(os.path.realpath(__file__)) + "/../scriptsFolder/" + script_filename

   cron = CrontTab(user='root')
   jobs = cron.find_comment(test_id)
   i = 0
   for job in jobs:
       i = i + 1

   assert response.status_code == 200
   assert i == 0
   assert !os.path.exists(script_filename)
