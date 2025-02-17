import type { SyslogClient } from './main.js'

export function UpdateVariableDefinitions(self: SyslogClient): void {
	self.setVariableDefinitions([])
}
