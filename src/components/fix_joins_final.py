# Read the file
with open('MobilePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all empty joins with newline joins
content = content.replace("].join('');", "].join('\n');")
content = content.replace(").join('');", ").join('\n\n---\n\n');")

# Write the file
with open('MobilePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed empty joins!")
