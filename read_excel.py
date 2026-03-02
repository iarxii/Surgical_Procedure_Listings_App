import pandas as pd
df = pd.read_excel('docs/Master_v4 TTGs.xlsx')
with open('tmp_excel_out.txt', 'w', encoding='utf-8') as f:
    f.write('Shape: ' + str(df.shape) + '\n\n')
    f.write('Columns: ' + str(df.columns.tolist()) + '\n\n')
    f.write(df.head(10).to_markdown())
