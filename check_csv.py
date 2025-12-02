import pandas as pd

# Read CSV file
df = pd.read_csv('data.csv')

print('Columns:', df.columns.tolist())
print('Shape:', df.shape)
print('\nFirst row data:')
for i, col in enumerate(df.columns):
    print(f'{i}: {col} = {df.iloc[0][i]}')

print('\nFirst 3 rows:')
print(df.head(3).to_string())
