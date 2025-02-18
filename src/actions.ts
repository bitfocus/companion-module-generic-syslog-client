import type { SyslogClient } from './main.js'
import { Facility, Severity, MessageOptions } from '@phillipivan/syslog-client'

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
					choices: [
						{ id: Facility.Kernel, label: 'Kernel' },
						{ id: Facility.User, label: 'User' },
						{ id: Facility.Mail, label: 'Mail' },
						{ id: Facility.Daemon, label: 'Daemon' },
						{ id: Facility.Auth, label: 'Auth' },
						{ id: Facility.Syslog, label: 'Syslog' },
						{ id: Facility.Lpr, label: 'LPR' },
						{ id: Facility.News, label: 'News' },
						{ id: Facility.Uucp, label: 'UUCP' },
						{ id: Facility.Cron, label: 'Cron' },
						{ id: Facility.Authpriv, label: 'AuthPriv' },
						{ id: Facility.Ftp, label: 'FTP' },
						{ id: Facility.Audit, label: 'Audit' },
						{ id: Facility.Alert, label: 'Alert' },
						{ id: Facility.Local0, label: 'Local 0' },
						{ id: Facility.Local1, label: 'Local 1' },
						{ id: Facility.Local2, label: 'Local 2' },
						{ id: Facility.Local3, label: 'Local 3' },
						{ id: Facility.Local4, label: 'Local 4' },
						{ id: Facility.Local5, label: 'Local 5' },
						{ id: Facility.Local6, label: 'Local 6' },
						{ id: Facility.Local7, label: 'Local 7' },
					],
					default: self.config.facility,
				},
				{
					type: 'dropdown',
					id: 'severity',
					label: 'Severity',
					choices: [
						{ id: Severity.Emergency, label: 'Emergency' },
						{ id: Severity.Alert, label: 'Alert' },
						{ id: Severity.Critical, label: 'Critical' },
						{ id: Severity.Error, label: 'Error' },
						{ id: Severity.Warning, label: 'Warning' },
						{ id: Severity.Notice, label: 'Notice' },
						{ id: Severity.Informational, label: 'Informational' },
						{ id: Severity.Debug, label: 'Debug' },
					],
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
