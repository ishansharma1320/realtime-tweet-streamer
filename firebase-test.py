# import firebase_admin
# from firebase_admin import credentials
# from firebase_admin import firestore
# import asyncio
# # cred = credentials.Certificate('/Users/ishansharma/Desktop/research/misc/collect-tweets/plasma-creek-353007-51a12ec2c8b1.json')
# firebase_admin.initialize_app()

# db = firestore.AsyncClient.from_service_account_json('/Users/ishansharma/Desktop/research/misc/collect-tweets/plasma-creek-353007-51a12ec2c8b1.json')
# # 
# async def main():
    
#     await db.collection('test').add({'data':'test'})

# if __name__ =='__main__':
#     loop = asyncio.get_event_loop()
#     loop.run_until_complete(main())
#     # print(cred)
#     # print("dons")
from google.cloud import datastore

# Instantiates a client
datastore_client = datastore.Client.from_service_account_json('/Users/ishansharma/Desktop/research/misc/collect-tweets/plasma-creek-353007-51a12ec2c8b1.json')

# The kind for the new entity
kind1 = "english"
kind2 = 'hindi'
query1 = datastore_client.query(kind=kind1)
query2 = datastore_client.query(kind=kind2)

more=True
eng = []
hin = []
# while more:
# en = query1.fetch()
# eng.extend(en)
hi = query2.fetch()
hin.extend(hi)
# print(f'Number of English Tweets: {len(eng)}')
print(f'Number of Hindi Tweets: {len(hin)}')

# print(query1)
# print(query1.cursor())
    # if query1.cursor() is not None:
        # query1 = query1.fetch(start_cursor=query1.cursor())
        # more = bool(en)
    # else:
        # more = False

# print(query2.count())
# The name/ID for the new entity
# name = "sampletask1"
# # The Cloud Datastore key for the new entity
# task_key = datastore_client.key(kind, name)

# # Prepares the new entity
# task = datastore.Entity(key=task_key)
# task["description"] = "Buy milk"

# # Saves the entity
# datastore_client.put(task)

# print(f"Saved {task.key.name}: {task['description']}")