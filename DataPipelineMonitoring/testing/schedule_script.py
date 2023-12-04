import requests
from crontab import CrontTab
import uuid
import os

base_url = 'http://localhost:8080/'

script_id = '4ba6ef55-f0d0-4f92-a3b4-ef1ba0f987bb'

#Schedule Script Test
def test_schedule_script():

    r = requests.post(base_url + 'API/schedule_script/' + script_id, {'schedule': '* * * * *'})
    assert(r.text == 'Sucessfully Scheduled')
