import type { SyslogClient } from './main.js'
import { Facility, Severity, MessageOptions } from '@phillipivan/syslog-client'
import { facilityChoices, severityChoices } from './config.js'

export function UpdateActions(self: SyslogClient): void {
	self.setActionDefinitions({
		logMessage: {
			name: 'Send Syslog Message',
			options: [
				{
					id: 'msg',
					type: 'textinput',
					label: 'Message',
					default: '',
					useVariables: true,
				},
				{
					type: 'dropdown',
					id: 'facility',
					label: 'Facility',
					choices: facilityChoices,
					default: self.config.facility,
				},
				{
					type: 'dropdown',
					id: 'severity',
					label: 'Severity',
					choices: severityChoices,
					default: self.config.severity,
				},
				{
					type: 'textinput',
					id: 'appName',
					label: 'Application Name',
					default: self.config.appName,
					tooltip: 'Set the APP-NAME field when using RFC 5424',
					useVariables: true,
					isVisible: (_options, isVisibleData) => {
						return isVisibleData.rfc5424
					},
					isVisibleData: { rfc5424: self.config.rfc5424 },
				},
				{
					type: 'textinput',
					id: 'msgId',
					label: 'Message ID',
					default: '',
					useVariables: true,
					isVisible: (_options, isVisibleData) => {
						return isVisibleData.rfc5424
					},
					isVisibleData: { rfc5424: self.config.rfc5424 },
				},
			],
			callback: async (action, context) => {
				const options: MessageOptions = {
					facility: action.options.facility as Facility,
					severity: action.options.severity as Severity,
					appName: await context.parseVariablesInString(action.options.appName?.toString() ?? ''),
					msgid: await context.parseVariablesInString(action.options.msgId?.toString() ?? ''),
				}
				await self.logMessage(action.options.msg?.toString() ?? '', options)
			},
		},
	})
}
