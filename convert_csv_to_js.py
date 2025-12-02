import pandas as pd

def clean_string(value):
    if pd.isna(value):
        return ''
    return str(value).strip().replace('\n', ' ').replace('\r', '').replace('"', "'")

def get_region_key(region):
    region_map = {
        'ภาคเหนือ': 'north',
        'ภาคอีสาน': 'northeast', 
        'ภาคกลาง': 'central',
        'ภาคตะวันออก': 'east',
        'ภาคตะวันตก': 'west',
        'ภาคใต้': 'south'
    }
    return region_map.get(region, 'central')

def get_size_category(size):
    if pd.isna(size):
        return 'medium'
    size_str = str(size).lower()
    if 'x' in size_str:
        parts = size_str.split('x')
        try:
            width = float(parts[0])
            height = float(parts[1]) if len(parts) > 1 else 0
            area = width * height
            if area >= 80:
                return 'xlarge'
            elif area >= 50:
                return 'large'
            elif area >= 20:
                return 'medium'
            else:
                return 'small'
        except:
            return 'medium'
    return 'medium'

def get_traffic_level(traffic):
    if pd.isna(traffic):
        return 'medium'
    try:
        traffic_val = float(str(traffic).replace(',', ''))
        if traffic_val >= 3000000:
            return 'very_high'
        elif traffic_val >= 2000000:
            return 'high'
        elif traffic_val >= 1000000:
            return 'medium'
        else:
            return 'low'
    except:
        return 'medium'

# Read CSV file
df = pd.read_csv('data.csv')

# Clean and prepare data
locations = []
for i, row in df.iterrows():
    if pd.notna(row['Media Locations']) and pd.notna(row['Unnamed: 3']):
        location = {
            'id': i + 1,
            'name': clean_string(row['Unnamed: 3']),
            'province': clean_string(row['Unnamed: 1']),
            'region': get_region_key(row['Regions']),
            'latitude': float(row['Latitude']) if pd.notna(row['Latitude']) else 0,
            'longitude': float(row['Longitude']) if pd.notna(row['Longitude']) else 0,
            'size': get_size_category(row['Size']),
            'dimensions': clean_string(row['Size']),
            'showTimes': clean_string(row['Show Times']),
            'timing': clean_string(row['Timing']),
            'address': clean_string(row['Unnamed: 3']),
            'description': f"จอ LED {clean_string(row['Size'])} ตั้งอยู่{clean_string(row['Unnamed: 3'])} จังหวัด{clean_string(row['Unnamed: 1'])}",
            'traffic': get_traffic_level(row['Traffic/Mth']),
            'viewersPerDay': int(str(row['Traffic/Mth']).replace(',', '')) if pd.notna(row['Traffic/Mth']) else 0
        }
        locations.append(location)

# Generate JavaScript content with proper escaping
js_content = '// PP Cloud Media - LED Billboard Locations Data\n'
js_content += '// Generated from data.csv\n\n'
js_content += 'const locationsData = [\n'

for i, location in enumerate(locations):
    js_content += '    {\n'
    for key, value in location.items():
        if isinstance(value, str):
            # Escape quotes properly
            escaped_value = value.replace('\\', '\\\\').replace('"', '\\"')
            js_content += f'        {key}: "{escaped_value}",\n'
        else:
            js_content += f'        {key}: {value},\n'
    if i < len(locations) - 1:
        js_content += '    },\n'
    else:
        js_content += '    }\n'

js_content += '];\n'

# Write to file
with open('locations-data.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f'Successfully generated locations-data.js with {len(locations)} locations')
