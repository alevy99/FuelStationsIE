import boto3
import json
import os
from decimal import Decimal
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

def lambda_handler(event, context):
    try:
        station_id = event['pathParameters']['stationId']

        # последняя запись
        latest_response = table.query(
            KeyConditionExpression=Key('stationId').eq(station_id),
            ScanIndexForward=False,
            Limit=1
        )

        # количество репортов
        count_response = table.query(
            KeyConditionExpression=Key('stationId').eq(station_id),
            Select='COUNT'
        )

        items = latest_response.get('Items', [])
        count = count_response.get('Count', 0)

        if not items:
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(None)
            }

        result = items[0]
        result['reportCount'] = count

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result, cls=DecimalEncoder)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }