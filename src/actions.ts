import { type CompanionActionDefinitions } from '@companion-module/base'
import type SyslogClient from './main.js'
import { Facility, Severity, MessageOptions } from '@phillipivan/syslog-client'
import { facilityChoices, severityChoices } from './config.js'

export enum ActionId {
	LogMessage = 'logMessage',
}
export type ActionSchema = {
	[ActionId.LogMessage]: {
		options: {
			msg: string
			facility: Facility
			severity: Severity
			appName: string
			msgId: string
			escape: boolean
		}
	}
}

export function UpdateActions(self: SyslogClient): void {
	const actionDefs = {} as CompanionActionDefinitions<ActionSchema>
	actionDefs[ActionId.LogMessage] = {
		name: 'Send Syslog Message',
		options: [
			{
				id: 'msg',
				type: 'textinput',
				label: 'Message',
				default: '',
				useVariables: true,
				multiline: true,
			},
			{
				type: 'dropdown',
				id: 'facility',
				label: 'Facility',
				choices: facilityChoices,
				default: self.config.facility,
				expressionDescription: 'Return a number from 0 (Kernel) to 23 (Local7)',
			},
			{
				type: 'dropdown',
				id: 'severity',
				label: 'Severity',
				choices: severityChoices,
				default: self.config.severity,
				expressionDescription: 'Return a number from 0 (Emergency) to 7 (Debug)',
			},
			{
				type: 'textinput',
				id: 'appName',
				label: 'Application Name',
				default: self.config.appName,
				tooltip: 'Set the APP-NAME field when using RFC 5424',
				useVariables: true,
				isVisibleExpression: `${self.config.rfc5424}`,
			},
			{
				type: 'textinput',
				id: 'msgId',
				label: 'Message ID',
				default: '',
				useVariables: true,
				isVisibleExpression: `${self.config.rfc5424}`,
			},
			{
				type: 'checkbox',
				id: 'escape',
				label: 'Parse Escape Charaters',
				default: true,
				tooltip: 'Parse escape characters such as \\r, \\n, \\t',
			},
		],
		callback: async (action, _context) => {
			const options: MessageOptions = {
				facility: action.options.facility,
				severity: action.options.severity,
				appName: action.options.appName,
				msgid: action.options.msgId,
			}
			await self.logMessage(action.options.msg, options, action.options.escape)
		},
	}
	self.setActionDefinitions(actionDefs)
}
