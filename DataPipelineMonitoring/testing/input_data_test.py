import requests
from crontab import CrontTab
import uuid
import os

base_url = 'http://localhost:8080/'

script_id = '4ba6ef55-f0d0-4f92-a3b4-ef1ba0f987bb'

#Input Data Test
def test_input_data():
    r = requests.get(base_url + 'API/input_data/' + script_id)
    data = r.json()
    assert(data[0]['col1'] == 'data1')
