import fs from 'node:fs'

export class Cache {
  constructor({ label = 'default', persist = false, prune = false } = {}) {
    this.label = label
    this.cache = {}

    if (persist) {
      this._handlePersistence()
    }

    if (prune) {
      this._handleTTL()
    }
  }

  get(key) {
    return this.cache?.[key]?.value
  }

  set(key, value) {
    this.cache[key] = {
      value,
      timestamp: Date.now(),
    }
  }

  delete(key) {
    delete this.cache[key]
  }

  list() {
    return this.cache
  }

  clear() {
    this.cache = {}
  }

  _persist() {
    try {
      fs.writeFileSync(`${CACHE_DIR}/${this.label}.json`, JSON.stringify(this.cache))
    } catch {}
  }

  _loadPersistentCache() {
    try {
      if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR)
      }

      if (!fs.existsSync(`${CACHE_DIR}/${this.label}.json`)) {
        fs.writeFileSync(`${CACHE_DIR}/${this.label}.json`, '{}')
      }

      const cache = JSON.parse(fs.readFileSync(`${CACHE_DIR}/${this.label}.json`))

      this.cache = cache || {}
    } catch {}
  }

  _handlePersistence() {
    this._loadPersistentCache()
    this._persist()

    setInterval(() => {
      this._persist()
    }, CACHE_SYNC_INTERVAL)
  }

  _prune() {
    try {
      const cache = this.list()
      const now = Date.now()

      for (const key in cache) {
        if (typeof cache?.[key] !== 'object') {
          delete cache[key]
        }

        if (!cache?.[key]?.timestamp) {
          delete cache[key]
        }

        if (cache[key]?.timestamp + CACHE_TTL < now) {
          delete cache[key]
        }
      }

      this.cache = cache
    } catch {}
  }

  _handleTTL() {
    this._prune()

    setInterval(() => {
      this._prune()
    }, CACHE_PRUNE_INTERVAL)
  }
}
