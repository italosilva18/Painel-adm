with open('MobilePage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i in range(614, 620):
    print(f'{i}: {repr(lines[i])}')
