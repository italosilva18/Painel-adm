import re

with open('MobilePage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and fix the problematic sections
output_lines = []
skip_until = -1

for i, line in enumerate(lines):
    if i < skip_until:
        continue
    
    # Check if this line starts a problematic template literal
    if "`Nome: ${s.name || s.razaoSocial || '-'}" in line and "\n" not in line:
        # This is a broken multiline template literal - fix it
        # Read next lines until we find the closing `
        template_start = i
        template_content = line.rstrip()
        j = i + 1
        while j < len(lines) and '`' not in lines[j] and 'Serial:' not in lines[j]:
            j += 1
        if j < len(lines):
            # Construct the fixed line
            fixed_line = "                        `Nome: ${s.name || s.razaoSocial || '-'}\\nFantasia: ${s.nomeFantasia || '-'}\\nCNPJ: ${s.cnpj || '-'}\\nSerial: ${s.serial || '-'}`\n"
            output_lines.append(fixed_line)
            skip_until = j + 1
            # Now find and fix the join that follows
            continue
    
    # Check for broken join statements with literal newlines
    if ".join('" in line and line.strip() == ".join('":
        # Skip the newlines and find the closing
        j = i + 1
        while j < len(lines) and "');" not in lines[j]:
            j += 1
        # Replace with proper escaped newline
        if j < len(lines):
            output_lines.append("                      ).join('\\n\\n---\\n\\n');\n")
            skip_until = j + 1
            continue
    
    output_lines.append(line)

with open('MobilePage.tsx', 'w', encoding='utf-8') as f:
    f.writelines(output_lines)

print("File processed!")
