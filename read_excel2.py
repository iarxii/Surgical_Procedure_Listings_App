import pandas as pd
xls = pd.ExcelFile('docs/Master_v4 TTGs.xlsx')
with open('tmp_excel_out2.txt', 'w', encoding='utf-8') as f:
    f.write('Sheet names: ' + str(xls.sheet_names) + '\n\n')
    for sheet in xls.sheet_names:
        df = pd.read_excel('docs/Master_v4 TTGs.xlsx', sheet_name=sheet)
        f.write(f'--- Sheet: {sheet} ---\n')
        f.write(f'Shape: {df.shape}\n')
        # Drop fully empty columns for readability
        df = df.dropna(how='all', axis=1)
        # Drop rows where all elements are nan
        df = df.dropna(how='all', axis=0)
        f.write(f'Columns: {df.columns.tolist()[:10]}\n')
        if not df.empty:
            f.write(df.head(5).to_markdown() + '\n\n')
