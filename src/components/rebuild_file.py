with open('MobilePage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output = []
i = 0
while i < len(lines):
    line = lines[i]
    
    # Check for broken join on line 616 pattern
    if "].join('" in line and line.strip() == "].join('":
        # This is a broken join - combine with next line
        if i + 1 < len(lines) and lines[i + 1].strip() == "');":
            # Skip these two lines and add fixed version
            output.append(line.replace("].join('", "].join('\n');"))
            i += 2  # Skip the next line (');)
            continue
    
    # Check for broken join with --- separator
    if ").join('" in line and line.strip() == ").join('":
        # Look ahead for the separator pattern
        if i + 4 < len(lines):
            if lines[i+1].strip() == "" and lines[i+2].strip() == "---" and lines[i+3].strip() == "" and "');" in lines[i+4]:
                output.append(line.replace(").join('", ").join('\n\n---\n\n');"))
                i += 5  # Skip all separator lines
                continue
    
    output.append(line)
    i += 1

with open('MobilePage.tsx', 'w', encoding='utf-8') as f:
    f.writelines(output)

print(f"Processed {len(lines)} lines, output {len(output)} lines")
