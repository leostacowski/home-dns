import { resolve } from 'path'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { storage_path } from '@common/configs.js'

export const Storage = ({ label = 'global' } = {}) => {
  const storageFile = resolve(storage_path, `./${label}.json`)

  try {
    if (!existsSync(storage_path)) mkdirSync(storage_path)
    if (!existsSync(storageFile)) writeFileSync(storageFile, '{}')
  } catch {}

  const get = (key) => {
    try {
      return JSON.parse(readFileSync(storageFile, 'utf8'))?.[key]
    } catch {
      return null
    }
  }

  const list = () => {
    try {
      return JSON.parse(readFileSync(storageFile, 'utf8')) || null
    } catch {
      return null
    }
  }

  const set = (key, value) => {
    try {
      const currentFile = readFileSync(storageFile, 'utf8')
      const currentData = JSON.parse(currentFile)

      currentData[key] = {
        ...value,
        lastHit: Date.now(),
      }

      writeFileSync(storageFile, JSON.stringify(currentData, null, 2))

      return true
    } catch {
      return false
    }
  }

  return {
    get,
    list,
    set,
  }
}
