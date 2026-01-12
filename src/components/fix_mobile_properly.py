# Read the file
with open('MobilePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix template literal in userStores.map that has broken lines 678-687
old_stores_map = '''const allStoresData = userStores.map(s =>
                        `Nome: ${s.name || s.razaoSocial || '-'}
Fantasia: ${s.nomeFantasia || '-'}
CNPJ: ${s.cnpj || '-'}
Serial: ${s.serial || '-'}`
                      ).join('

---

');'''

new_stores_map = '''const allStoresData = userStores.map(s =>
                        `Nome: ${s.name || s.razaoSocial || '-'}\nFantasia: ${s.nomeFantasia || '-'}\nCNPJ: ${s.cnpj || '-'}\nSerial: ${s.serial || '-'}`
                      ).join('\n\n---\n\n');'''

content = content.replace(old_stores_map, new_stores_map)

# Fix individual store copy that may also be broken
old_store_copy = '''const storeData = [
                                `Nome: ${store.name || store.razaoSocial || '-'}`,
                                `Fantasia: ${store.nomeFantasia || '-'}`,
                                `CNPJ: ${store.cnpj || '-'}`,
                                `Serial: ${store.serial || '-'}`,
                              ].join('
');'''

new_store_copy = '''const storeData = [
                                `Nome: ${store.name || store.razaoSocial || '-'}`,
                                `Fantasia: ${store.nomeFantasia || '-'}`,
                                `CNPJ: ${store.cnpj || '-'}`,
                                `Serial: ${store.serial || '-'}`,
                              ].join('\n');'''

if old_store_copy in content:
    content = content.replace(old_store_copy, new_store_copy)
    print("Fixed individual store copy")

# Fix user data copy that may be broken
old_user_copy = '''const userData = [
                        `Nome: ${currentUser.name || '-'}`,
                        `Email: ${currentUser.email || '-'}`,
                        `Tipo: ${currentUser._type || currentUser.type || '-'}`,
                        `Telefone: ${currentUser.phone || '-'}`,
                        `Parceiro: ${currentUser.partner || '-'}`,
                        `Status: ${currentUser.active ? 'Ativo' : 'Inativo'}`,
                      ].join('
');'''

new_user_copy = '''const userData = [
                        `Nome: ${currentUser.name || '-'}`,
                        `Email: ${currentUser.email || '-'}`,
                        `Tipo: ${currentUser._type || currentUser.type || '-'}`,
                        `Telefone: ${currentUser.phone || '-'}`,
                        `Parceiro: ${currentUser.partner || '-'}`,
                        `Status: ${currentUser.active ? 'Ativo' : 'Inativo'}`,
                      ].join('\n');'''

if old_user_copy in content:
    content = content.replace(old_user_copy, new_user_copy)
    print("Fixed user data copy")

with open('MobilePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done fixing template literals!")
