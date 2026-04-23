import random
import json

station_ids = [
    "1905704074",
    "2050353787",
    "2050674169",
    "2051429317",
    "2051499540",
    "2102313258",
    "2102313259",
    "2102313364",
    "2102325546",
    "2200792324",
    "2277926392",
    "2286248853",
    "2299643696",
    "2353400544",
    "2360482321",
    "2765915140",
    "3659562380",
    "4809883809",
    "4981290500",
    "5519364813",
    "7997944743",
    "8308498526",
    "8772866598",
    "8783750120",
    "9436443275",
    "9576143055",
    "9977157997",
    "10866884099",
    "10866978571",
    "11021735563",
    "11272475295",
    "11272552802",
    "11367106127",
    "11820299687",
    "12488521921",
    "12889479906",
    "13059267948",
    "13516443671",
    "13546870909",
    "13602555290",
    "13626434039",
    "13690435373",
    "25761891",
    "25772053",
    "78079067",
    "78103022",
    "100009342",
    "100010223",
    "100724610",
    "116700020",
    "161479303",
    "162508829",
    "177937260",
    "178054693",
    "178080021",
    "194176785",
    "194553122",
    "194686103",
    "194705953",
    "194713859",
    "194810134",
    "194818949",
    "195637433",
    "198635779",
    "200006928",
    "200301472",
    "206508519",
    "217616410",
    "226587452",
    "237580969",
    "277747437",
    "283745556",
    "311852601",
    "467518353",
    "513237912",
    "588467537",
    "598009543",
    "720664344",
    "729743039",
    "789740645",
    "801953209",
    "816241253",
    "824273862",
    "824422420",
    "825345918",
    "825346488",
    "825348459",
    "825437125",
    "825437359",
    "898049676",
    "1015239435",
    "1038106659",
    "1046949461",
    "1060672163",
    "1078219465",
    "1135963125",
    "1137317876",
    "1137317877",
    "1249148611",
    "1299287332",
    "1334546027"
]

def generate_report(station_id):
    petrol_available = random.choices([True, False], weights=[80, 20])[0]
    diesel_available = random.choices([True, False], weights=[80, 20])[0]

    petrol = round(random.uniform(1.7, 2.0), 3) if petrol_available else None
    diesel = round(random.uniform(1.8, 2.2), 3) if diesel_available else None

    has_price_limit = random.random() < 0.25
    has_litre_limit = random.random() < 0.15

    return {
        "stationId": str(station_id),
        "petrol": petrol,
        "diesel": diesel,
        "petrolAvailable": petrol_available,
        "dieselAvailable": diesel_available,
        "priceLimit": random.choice([50, 60, 80]) if has_price_limit else None,
        "litreLimit": random.choice([20, 30, 40]) if has_litre_limit else None,
    }

reports = [generate_report(sid) for sid in station_ids]

# разбиваем на батчи по 90
batch_size = 60
for i, start in enumerate(range(0, len(reports), batch_size)):
    batch = {"reports": reports[start:start + batch_size]}
    filename = f"batch_{i + 1}.json"
    with open(filename, 'w') as f:
        json.dump(batch, f)
    print(f"Saved {filename}: {len(batch['reports'])} reports")