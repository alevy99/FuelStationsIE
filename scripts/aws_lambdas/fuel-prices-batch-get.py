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

def get_latest_for_station(station_id):
    response = table.query(
        KeyConditionExpression=Key('stationId').eq(str(station_id)),
        ScanIndexForward=False,
        Limit=1
    )
    items = response.get('Items', [])

    if not items:
        return None

    item = items[0]

    count_response = table.query(
        KeyConditionExpression=Key('stationId').eq(str(station_id)),
        Select='COUNT'
    )
    item['reportCount'] = count_response.get('Count', 0)

    return item

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        station_ids = body.get('stationIds', [])

        if not station_ids:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'stationIds is required'})
            }

        if len(station_ids) > 100:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Maximum 100 stationIds per request'})
            }

        result = {}
        for station_id in station_ids:
            item = get_latest_for_station(station_id)
            if item:
                result[str(station_id)] = item

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