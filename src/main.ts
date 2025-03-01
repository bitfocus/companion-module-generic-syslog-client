import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { Logger } from './logger.js'
import { StatusManager } from './status.js'
import syslog from '@phillipivan/syslog-client'
import PQueue from 'p-queue'

const queue = new PQueue({ concurrency: 1, interval: 10, intervalCap: 1 })

export class SyslogClient extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	#statusManager = new StatusManager(this, { status: InstanceStatus.Connecting, message: 'Initialising' }, 2000)
	public logger: Logger = new Logger(this)
	private syslogClient!: syslog.Client

	constructor(internal: unknown) {
		super(internal)
	}

	private parseEscapeCharacters(msg: string): string {
		return msg
			.replaceAll('\\n', '\n')
			.replaceAll('\\r', '\r')
			.replaceAll('\\t', '\t')
			.replaceAll('\\f', '\f')
			.replaceAll('\\v', '\v')
			.replaceAll('\\b', '\b')
			.replaceAll('\\\\', '\\')
	}

	async logMessage(msg: string, options: syslog.MessageOptions, escape: boolean): Promise<void> {
		let message = msg
		if (escape) message = this.parseEscapeCharacters(message)
		while (message.endsWith('\n') || message.endsWith('\r')) {
			message = message.substring(0, message.length - 1)
		}
		if (this.syslogClient) {
			await queue.add(() => {
				this.syslogClient.log(message, options, (error) => {
					if (error) {
						this.logger.warn(`Message Send Failure:\nMessage: ${message}\n${JSON.stringify(error)}`)
						this.#statusManager.updateStatus(InstanceStatus.ConnectionFailure, 'Message Send Failure')
					} else {
						this.logger.debug(`Message sent: ${message}\nOptions: ${JSON.stringify(options)}`)
						this.#statusManager.updateStatus(InstanceStatus.Ok)
					}
				})
			})
		} else {
			this.logger.warn(`Syslog client not initialised.\nCould not send: ${message}`)
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
		this.logger.debug(
			`Creating new syslog client\nTarget Host: ${config.host}\nConfig Options: ${JSON.stringify(options)}`,
		)
		this.syslogClient = syslog.createClient(config.host, options)
		this.syslogClient.on('close', () => {
			this.logger.warn('Client Closed')
			this.#statusManager.updateStatus(InstanceStatus.Disconnected, 'Client Closed')
		})
		this.syslogClient.on('error', (error: Error) => {
			this.logger.error(`${error.name}: ${error.message}\n${error.cause}\n${error.stack}`)
			this.#statusManager.updateStatus(InstanceStatus.UnknownError, error.name)
		})
		this.#statusManager.updateStatus(InstanceStatus.Ok)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.configUpdated(config).catch(() => {})
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.logger.debug(`destroy ${this.id}:${this.label}`)
		queue.clear()
		if (this.syslogClient) {
			this.syslogClient.close()
		}
		this.#statusManager.destroy()
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		queue.clear()
		this.config = config
		this.logger = new Logger(this, config.logging)
		if (this.config.host) {
			this.setupSyslogClient(config)
			this.updateActions() // export actions
			this.updateFeedbacks() // export feedbacks
			this.updateVariableDefinitions() // export variable definitions
		} else {
			this.#statusManager.updateStatus(InstanceStatus.BadConfig, 'No Host')
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
