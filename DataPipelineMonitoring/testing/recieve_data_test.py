import requests
from crontab import CrontTab
import uuid
import os

base_url = 'http://localhost:8080/'

script_id = '4ba6ef55-f0d0-4f92-a3b4-ef1ba0f987bb'

#Recieve Data Test
def test_receive_data():
    testData = 'col1,col2\ndata1,data2\ndata1,data2'
    r = requests.post(base_url + 'API/recieve_data/' + script_id, data={'data': testData})
    assert(r.text == 'Data Recieved')
