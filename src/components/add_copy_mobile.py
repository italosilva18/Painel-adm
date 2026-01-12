import re

# Read the file
with open('MobilePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Copy to imports
old_import = "import { Search, Plus, Edit, Trash2, X, Smartphone, Store, UserPlus, Download } from 'lucide-react';"
new_import = "import { Search, Plus, Edit, Trash2, X, Smartphone, Store, UserPlus, Download, Copy } from 'lucide-react';"
if 'Copy' not in content.split("from 'lucide-react'")[0]:
    content = content.replace(old_import, new_import)
    print("1. Copy icon added to imports!")
else:
    print("1. Copy icon already in imports")

# 2. Add copy button in User Details section (after Excluir button)
old_delete_btn = '''                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>

            {/* User Info Grid */}'''

new_delete_btn = '''                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                  <button
                    onClick={() => {
                      if (!currentUser) return;
                      const userData = [
                        `Nome: ${currentUser.name || '-'}`,
                        `Email: ${currentUser.email || '-'}`,
                        `Tipo: ${currentUser._type || currentUser.type || '-'}`,
                        `Telefone: ${currentUser.phone || '-'}`,
                        `Parceiro: ${currentUser.partner || '-'}`,
                        `Status: ${currentUser.active ? 'Ativo' : 'Inativo'}`,
                      ].join('\n');
                      navigator.clipboard.writeText(userData);
                      toast.success('Dados do usuário copiados!');
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    title="Copiar dados do usuário"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar
                  </button>
                </div>
              </div>
            </div>

            {/* User Info Grid */}'''

if 'Copiar dados do usuário' not in content:
    content = content.replace(old_delete_btn, new_delete_btn)
    print("2. Copy user button added!")
else:
    print("2. Copy user button already exists")

# 3. Add "Copiar Todos" button in Stores header (after Adicionar Loja button)
old_stores_header = '''                <button
                  onClick={() => setShowAddStoreModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Loja
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">'''

new_stores_header = '''                <button
                  onClick={() => setShowAddStoreModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Loja
                </button>
                {userStores.length > 0 && (
                  <button
                    onClick={() => {
                      const allStoresData = userStores.map(s =>
                        `Nome: ${s.name || s.razaoSocial || '-'}\nFantasia: ${s.nomeFantasia || '-'}\nCNPJ: ${s.cnpj || '-'}\nSerial: ${s.serial || '-'}`
                      ).join('\n\n---\n\n');
                      navigator.clipboard.writeText(allStoresData);
                      toast.success(`${userStores.length} loja(s) copiada(s)!`);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                    title="Copiar dados de todas as lojas"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar Todos
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">'''

if 'Copiar Todos' not in content:
    content = content.replace(old_stores_header, new_stores_header)
    print("3. Copy All stores button added!")
else:
    print("3. Copy All stores button already exists")

# 4. Add copy button in store row actions (before Trash2 button)
old_store_action = '''                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleRemoveStore(store.cnpj)}
                          className="text-red-600 hover:text-red-900"
                          title="Remover loja"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>'''

new_store_action = '''                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const storeData = [
                                `Nome: ${store.name || store.razaoSocial || '-'}`,
                                `Fantasia: ${store.nomeFantasia || '-'}`,
                                `CNPJ: ${store.cnpj || '-'}`,
                                `Serial: ${store.serial || '-'}`,
                              ].join('\n');
                              navigator.clipboard.writeText(storeData);
                              toast.success('Dados da loja copiados!');
                            }}
                            className="text-gray-600 hover:text-gray-900"
                            title="Copiar dados da loja"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveStore(store.cnpj)}
                            className="text-red-600 hover:text-red-900"
                            title="Remover loja"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>'''

if 'Copiar dados da loja' not in content:
    content = content.replace(old_store_action, new_store_action)
    print("4. Copy store button added!")
else:
    print("4. Copy store button already exists")

# Write the file
with open('MobilePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nAll changes applied to MobilePage.tsx!")
