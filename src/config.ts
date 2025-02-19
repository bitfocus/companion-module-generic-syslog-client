import { Regex, type SomeCompanionConfigField } from '@companion-module/base'
import os from 'node:os'
import { Facility, Severity, Transport } from '@phillipivan/syslog-client'
import { LoggerLevel } from './logger.js'

export interface ModuleConfig {
	host: string
	port: number
	transport: Transport
	rfc5424: boolean
	hostname: string
	facility: Facility
	severity: Severity
	appName: string
	logging: LoggerLevel
}

export const facilityChoices = [
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
]

export const severityChoices = [
	{ id: Severity.Emergency, label: 'Emergency' },
	{ id: Severity.Alert, label: 'Alert' },
	{ id: Severity.Critical, label: 'Critical' },
	{ id: Severity.Error, label: 'Error' },
	{ id: Severity.Warning, label: 'Warning' },
	{ id: Severity.Notice, label: 'Notice' },
	{ id: Severity.Informational, label: 'Informational' },
	{ id: Severity.Debug, label: 'Debug' },
]

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Syslog Server',
			width: 8,
			regex: Regex.HOSTNAME,
		},
		{
			type: 'number',
			id: 'port',
			label: 'Target Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 514,
			tooltip: 'Defaults - UDP:514, TCP:1468',
		},
		{
			type: 'dropdown',
			id: 'transport',
			label: 'Transport',
			width: 4,
			choices: [
				{ id: Transport.Udp, label: 'UDP' },
				{ id: Transport.Tcp, label: 'TCP' },
			],
			default: Transport.Udp,
		},
		{
			type: 'textinput',
			id: 'hostname',
			label: 'Hostname',
			default: os.hostname(),
			width: 4,
			tooltip: 'Value to place into the HOSTNAME part of the HEADER part of each message sent',
		},
		{
			type: 'dropdown',
			id: 'facility',
			label: 'Facility',
			width: 4,
			choices: facilityChoices,
			default: Facility.Local0,
			tooltip: 'Default value for new messages',
		},
		{
			type: 'dropdown',
			id: 'severity',
			label: 'Severity',
			width: 4,
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
			default: Severity.Informational,
			tooltip: 'Default value for new messages',
		},
		{
			type: 'checkbox',
			id: 'rfc5424',
			label: 'RFC 5424',
			default: true,
			tooltip: 'Turn off to use RFC 3164',
			width: 4,
		},
		{
			type: 'textinput',
			id: 'appName',
			label: 'Application Name',
			default: 'Companion',
			width: 4,
			tooltip: 'Set the APP-NAME field when using RFC 5424',
			isVisible: (options) => {
				return !!options.rfc5424
			},
		},
		{
			type: 'static-text',
			id: 'placeholder1',
			label: '',
			value: '',
			width: 4,
			isVisible: (options) => {
				return !options.rfc5424
			},
		},
		{
			type: 'dropdown',
			id: 'logging',
			label: 'Minimum Log Level',
			default: LoggerLevel.Information,
			choices: [
				{ id: LoggerLevel.Error, label: 'Error' },
				{ id: LoggerLevel.Warning, label: 'Warning' },
				{ id: LoggerLevel.Information, label: 'Information' },
				{ id: LoggerLevel.Debug, label: 'Debug' },
				{ id: LoggerLevel.Console, label: 'Console' },
			],
			allowCustom: false,
			width: 8,
		},
		{
			type: 'static-text',
			id: 'rfc-link1',
			label: '',
			value: '<A HREF="https://www.ietf.org/rfc/rfc5424.txt">RFC 5424</A>',
			width: 4,
			isVisible: (options) => {
				return !!options.rfc5424
			},
		},
		{
			type: 'static-text',
			id: 'rfc-link2',
			label: '',
			value: '<A HREF="https://www.ietf.org/rfc/rfc3164.txt">RFC 3164</A>',
			width: 4,
			isVisible: (options) => {
				return !options.rfc5424
			},
		},
	]
}
