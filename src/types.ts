import type { InstanceBase, JsonValue } from '@companion-module/base'
import type { ModuleConfig } from './config.js'
import type { ActionSchema } from './actions.js'
import type { FeedbackSchema } from './feedbacks.js'
import { Logger } from './logger.js'

export interface ModuleTypes {
	config: ModuleConfig
	secrets: undefined
	actions: ActionSchema
	feedbacks: FeedbackSchema
	variables: Record<string, JsonValue>
}

export interface InstanceBaseExt extends InstanceBase<ModuleTypes> {
	config: ModuleConfig
	logger: Logger
}
