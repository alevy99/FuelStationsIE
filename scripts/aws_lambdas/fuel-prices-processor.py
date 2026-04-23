import boto3
import json
import os
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])

def lambda_handler(event, context):
    for record in event['Records']:
        try:
            message = json.loads(record['body'])

            item = {
                'stationId': message['stationId'],
                'timestamp': message['timestamp'],
            }

            # цены
            if message.get('petrol') is not None:
                item['petrol'] = Decimal(str(message['petrol']))

            if message.get('diesel') is not None:
                item['diesel'] = Decimal(str(message['diesel']))

            # наличие
            if message.get('petrolAvailable') is not None:
                item['petrolAvailable'] = message['petrolAvailable']

            if message.get('dieselAvailable') is not None:
                item['dieselAvailable'] = message['dieselAvailable']

            # ограничения
            if message.get('priceLimit') is not None:
                item['priceLimit'] = Decimal(str(message['priceLimit']))

            if message.get('litreLimit') is not None:
                item['litreLimit'] = Decimal(str(message['litreLimit']))

            table.put_item(Item=item)

            print(f"Saved report for station {message['stationId']}")

        except Exception as e:
            print(f"Error processing record: {str(e)}")
            raise e