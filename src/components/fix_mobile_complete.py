# Read the file
with open('MobilePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken .join() calls by replacing literal newlines with escaped newlines
# We need to find patterns like .join('
# '); and replace with .join('\n');

# First fix: simple newlines
content = content.replace("].join('\n');", "].join('\n');")

# Second fix: double newlines with separator
content = content.replace(").join('\n\n---\n\n');", ").join('\n\n---\n\n');")

# Write the file
with open('MobilePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Attempting to fix joins...")

# Read again and check
with open('MobilePage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find problematic lines
for i, line in enumerate(lines):
    if ".join('" in line and not line.strip().endswith("');"):
        if i+1 < len(lines) and lines[i+1].strip() == "');":
            # This is a broken join - fix it
            combined = line.rstrip() + "\n" + lines[i+1].strip()
            lines[i] = combined[:-4] + "');\n"  # remove the extra ');
            lines[i+1] = ""

# Now look for the specific broken patterns and fix them
content = ''.join(lines)

# More aggressive fix
import re
# Pattern: .join('\n at end of line
content = re.sub(r"\.join\('\s*\n\s*'\);", ".join('\\n');", content)
content = re.sub(r"\.join\('\s*\n\s*\n---\s*\n\s*\n'\);", ".join('\\n\\n---\\n\\n');", content)

with open('MobilePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
