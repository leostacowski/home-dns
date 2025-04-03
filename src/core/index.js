import { isPrimary } from 'cluster'
import { ParentProcess } from '@core/modules/parent_process'
import { ChildProcess } from '@core/modules/child_process'

if (isPrimary) {
  const parentProcess = ParentProcess()

  parentProcess.start()
} else {
  const childProcess = ChildProcess()

  childProcess.start()
}
