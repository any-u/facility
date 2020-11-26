import { Prepare as PrepareService } from './services'
import { WaitProvider } from './services/waitProvider'
import { WorkspaceFolder } from './services/workspaceFolder'

const prepare = new PrepareService()

const workspaceFolder = new WorkspaceFolder()
prepare.registry('workspaceFolder', workspaceFolder)

const waitProvider = new WaitProvider()
prepare.registry('waitProvider', waitProvider)

export { workspaceFolder, waitProvider }

export default prepare
