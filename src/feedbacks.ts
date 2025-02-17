import type { SyslogClient } from './main.js'

export function UpdateFeedbacks(self: SyslogClient): void {
	self.setFeedbackDefinitions({})
}
