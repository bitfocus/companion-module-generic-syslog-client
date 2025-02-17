import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import syslog from '@phillipivan/syslog-client'
import PQueue from 'p-queue'

const queue = new PQueue({ concurrency: 1, interval: 10, intervalCap: 1 })

export class SyslogClient extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	private syslogClient!: syslog.Client

	constructor(internal: unknown) {
		super(internal)
	}

	async logMessage(msg: string, options: syslog.MessageOptions): Promise<void> {
		let message = await this.parseVariablesInString(msg)
		while (message.endsWith('\n')) {
			message = message.substring(0, message.length - 2)
		}
		if (this.syslogClient) {
			await queue.add(() => {
				this.syslogClient.log(message, options, (error) => {
					if (error) {
						this.log('warn', `Message Send Failure:\nMessage: ${message}\n${JSON.stringify(error)}`)
					} else {
						this.log('debug', `Message sent: ${message}`)
					}
				})
			})
		} else {
			this.log('warn', `Syslog client not initialised.\nCould not send: ${message}`)
		}
	}

	setupSyslogClient(config: ModuleConfig): void {
		if (this.syslogClient) this.syslogClient.close()
		const options: syslog.ClientOptions = {
			port: config.port,
			syslogHostname: config.hostname,
			transport: config.transport,
			facility: config.facility,
			severity: config.severity,
			rfc3164: !config.rfc5424,
			appName: config.appName,
			udpBindAddress: '0.0.0.0',
		}
		this.syslogClient = syslog.createClient(config.host, options)
		this.syslogClient.on('close', () => {
			this.log('warn', 'Client Closed')
			this.updateStatus(InstanceStatus.Disconnected, 'Client Closed')
		})
		this.syslogClient.on('error', (error: Error) => {
			this.log('error', `${error.name}: ${error.message}\n${error.cause}\n${error.stack}`)
			this.updateStatus(InstanceStatus.UnknownError, error.name)
		})
		this.updateStatus(InstanceStatus.Ok)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.configUpdated(config).catch(() => {})
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', `destroy ${this.id}:${this.label}`)
		queue.clear()
		if (this.syslogClient) {
			this.syslogClient.close()
		}
		this.updateStatus(InstanceStatus.Disconnected)
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		queue.clear()
		this.config = config
		if (this.config.host) {
			this.setupSyslogClient(config)
			this.updateActions() // export actions
			this.updateFeedbacks() // export feedbacks
			this.updateVariableDefinitions() // export variable definitions
		} else {
			this.updateStatus(InstanceStatus.BadConfig, 'No Host')
		}
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(SyslogClient, UpgradeScripts)
