import re

with open('MobilePage.tsx', 'rb') as f:
    content = f.read()

# Convert to string
text = content.decode('utf-8')

# Fix all broken .join() patterns by using regex
# Pattern: .join('\n'); where the newline is literal
text = re.sub(r"\.join\('\n'\);", ".join('\\n');", text)

# Pattern: .join('\n\n---\n\n');
text = re.sub(r"\.join\('\n\n---\n\n'\);", ".join('\\n\\n---\\n\\n');", text)

# Also fix any template literals with literal newlines inside backticks followed by template continuation
# Fix: Nome: ... followed by newline and Fantasia:
text = re.sub(
    r"`Nome: \$\{s\.name \|\| s\.razaoSocial \|\| '-'\}\n\s*Fantasia:",
    "`Nome: ${s.name || s.razaoSocial || '-'}\\nFantasia:",
    text
)
text = re.sub(
    r"\\nFantasia: \$\{s\.nomeFantasia \|\| '-'\}\n\s*CNPJ:",
    "\\nFantasia: ${s.nomeFantasia || '-'}\\nCNPJ:",
    text
)
text = re.sub(
    r"\\nCNPJ: \$\{s\.cnpj \|\| '-'\}\n\s*Serial:",
    "\\nCNPJ: ${s.cnpj || '-'}\\nSerial:",
    text
)

with open('MobilePage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixes applied!")

# Verify
with open('MobilePage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

errors = []
for i, line in enumerate(lines, 1):
    if ".join('" in line and not line.strip().endswith("');") and "\n" not in line:
        errors.append(f"Line {i}: possible broken join")

if errors:
    print("Potential issues found:")
    for e in errors:
        print(f"  {e}")
else:
    print("No obvious issues found!")
