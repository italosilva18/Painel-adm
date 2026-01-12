# Remove duplicate lines and fix the file
with open('MobilePage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove consecutive duplicate lines and excessive empty lines
output = []
prev_line = None
empty_count = 0

for line in lines:
    # Skip if exact duplicate of previous
    if line == prev_line and line.strip():
        continue
    
    # Limit consecutive empty lines
    if not line.strip():
        empty_count += 1
        if empty_count > 1:
            continue
    else:
        empty_count = 0
    
    output.append(line)
    prev_line = line

with open('MobilePage.tsx', 'w', encoding='utf-8') as f:
    f.writelines(output)

print(f"Reduced from {len(lines)} to {len(output)} lines")
