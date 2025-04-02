import { resolve } from 'path'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { storage_path } from '@common/configs.js'

export const Storage = ({ label = 'global' } = {}) => {
  const storageDir = resolve(storage_path)
  const storageFile = resolve(storageDir, `${label}.json`)

  try {
    if (!existsSync(storageDir)) mkdirSync(storageDir)
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
        timestamp: Date.now(),
      }

      writeFileSync(storageFile, JSON.stringify(currentData))

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
