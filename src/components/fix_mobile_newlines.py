import re

# Read the file
with open('MobilePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix broken newline escapes - replace the multiline join statements with correct ones
# Pattern 1: join('
# followed by ');
content = re.sub(r"\.join\('\n'\);", ".join('\n');", content)

# Also fix --- separators
content = re.sub(r"\.join\('\n\n---\n\n'\);", ".join('\n\n---\n\n');", content)

# Write the file
with open('MobilePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed newline escapes in join() calls!")

# Verify the fix
with open('MobilePage.tsx', 'r', encoding='utf-8') as f:
    new_content = f.read()

# Check for remaining broken joins
broken = re.findall(r"\.join\('[^']*$", new_content, re.MULTILINE)
if broken:
    print(f"WARNING: Still have broken joins: {broken}")
else:
    print("All joins look correct!")
