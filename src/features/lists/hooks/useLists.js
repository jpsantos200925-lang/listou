import { useState, useEffect, useCallback } from 'react'
import {
  fetchLists,
  createList,
  updateList,
  deleteList,
  uploadListLogo,
  migrateLogoToStorage,
} from '../services/lists.service'

export function useLists() {
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchLists()
      setLists(data)
      // Migra logos legados (data URLs) para o Storage em background
      migrateLegacyLogos(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Migra silenciosamente qualquer logo ainda armazenado como data URL
  function migrateLegacyLogos(data) {
    data
      .filter((list) => list.logo_url?.startsWith('data:'))
      .forEach((list) => {
        migrateLogoToStorage(list.id, list.logo_url)
          .then((publicUrl) =>
            setLists((prev) => prev.map((l) => l.id === list.id ? { ...l, logo_url: publicUrl } : l))
          )
          .catch((err) => console.warn('[useLists] Falha ao migrar logo legado:', err.message))
      })
  }

  const addList = useCallback(async (payload, logoFile) => {
    let logo_url = null
    if (logoFile) {
      try {
        logo_url = await uploadListLogo(logoFile)
      } catch (err) {
        console.warn('[useLists] Logo upload falhou, criando lista sem logo:', err.message)
      }
    }
    const list = await createList({ ...payload, logo_url })
    setLists((prev) => [...prev, list])
    return list
  }, [])

  const editList = useCallback(async (id, payload, logoFile) => {
    let updates = { ...payload }
    if (logoFile) {
      try {
        updates.logo_url = await uploadListLogo(logoFile)
      } catch (err) {
        console.warn('[useLists] Logo upload falhou, salvando lista sem atualizar logo:', err.message)
      }
    }
    const list = await updateList(id, updates)
    setLists((prev) => prev.map((l) => l.id === id ? list : l))
    return list
  }, [])

  const removeList = useCallback(async (id) => {
    await deleteList(id)
    setLists((prev) => prev.filter((l) => l.id !== id))
  }, [])

  return { lists, loading, addList, editList, removeList, reload: load }
}
