import type SyslogClient from './main.js'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type FeedbackSchema = {}

export function UpdateFeedbacks(self: SyslogClient): void {
	self.setFeedbackDefinitions({})
}
