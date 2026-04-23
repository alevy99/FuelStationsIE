import boto3
import json
import os
from datetime import datetime, timezone

sqs = boto3.client('sqs')
QUEUE_URL = os.environ['SQS_QUEUE_URL']

MIN_PRICE = 1.3
MAX_PRICE = 3.0
MIN_LITRES = 1
MAX_LITRES = 200
MIN_SPEND = 1
MAX_SPEND = 500

def validate_price(value, name)
    if value is None
        return None
    try
        v = float(value)
    except (TypeError, ValueError)
        raise ValueError(f'{name} must be a number')
    if v  MIN_PRICE or v  MAX_PRICE
        raise ValueError(f'{name} must be between {MIN_PRICE} and {MAX_PRICE}')
    return v

def validate_limit(value, name, min_val, max_val)
    if value is None
        return None
    try
        v = float(value)
    except (TypeError, ValueError)
        raise ValueError(f'{name} must be a number')
    if v  min_val or v  max_val
        raise ValueError(f'{name} must be between {min_val} and {max_val}')
    return v

def process_report(report)
    station_id = report.get('stationId')
    if not station_id
        raise ValueError('stationId is required')

    petrol = validate_price(report.get('petrol'), 'petrol')
    diesel = validate_price(report.get('diesel'), 'diesel')
    litre_limit = validate_limit(report.get('litreLimit'), 'litreLimit', MIN_LITRES, MAX_LITRES)
    price_limit = validate_limit(report.get('priceLimit'), 'priceLimit', MIN_SPEND, MAX_SPEND)

    petrol_available = report.get('petrolAvailable')
    diesel_available = report.get('dieselAvailable')

    if petrol_available is not None and not isinstance(petrol_available, bool)
        raise ValueError('petrolAvailable must be boolean')
    if diesel_available is not None and not isinstance(diesel_available, bool)
        raise ValueError('dieselAvailable must be boolean')

    return {
        'stationId' str(station_id),
        'timestamp' datetime.now(timezone.utc).isoformat(),
        'petrol' petrol,
        'diesel' diesel,
        'petrolAvailable' petrol_available,
        'dieselAvailable' diesel_available,
        'priceLimit' price_limit,
        'litreLimit' litre_limit,
    }

def lambda_handler(event, context)
    try
        body = json.loads(event['body'])

        # определяем одиночный или батч
        if 'reports' in body
            reports = body['reports']
        else
            reports = [body]

        if len(reports)  100
            return {
                'statusCode' 400,
                'headers' {'Access-Control-Allow-Origin' ''},
                'body' json.dumps({'error' 'Maximum 100 reports per request'})
            }

        errors = []
        sent = 0

        for i, report in enumerate(reports)
            try
                message = process_report(report)
                sqs.send_message(
                    QueueUrl=QUEUE_URL,
                    MessageBody=json.dumps(message)
                )
                sent += 1
            except ValueError as e
                errors.append({
                    'index' i,
                    'stationId' report.get('stationId'),
                    'error' str(e)
                })

        return {
            'statusCode' 202,
            'headers' {'Access-Control-Allow-Origin' ''},
            'body' json.dumps({
                'ok' True,
                'sent' sent,
                'errors' errors
            })
        }

    except Exception as e
        return {
            'statusCode' 500,
            'body' json.dumps({'error' str(e)})
        }