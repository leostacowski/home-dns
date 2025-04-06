import { isPrimary } from 'cluster'
import { Boss } from './modules/boss/index.js'
import { Worker } from './modules/worker/index.js'

import configs from './config.js'

configs.setup()

if (isPrimary) {
  new Boss()
} else {
  new Worker()
}
