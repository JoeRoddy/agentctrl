export type TargetId = string;

export type MaybePromise<T> = T | Promise<T>;

export type ConfigCallback<TItem, TValue> = (options: {
	item: TItem;
	context: ConvertContext;
}) => MaybePromise<TValue>;

export type ConfigValue<TItem, TValue> = TValue | ConfigCallback<TItem, TValue>;

export type ItemType = "skill" | "command" | "subagent" | "instruction";

export type FrontmatterValue = string | string[];

export type BaseItem = {
	itemType: ItemType;
	sourcePath: string;
	sourceType: "shared" | "local";
	name: string;
	raw: string;
	frontmatter: Record<string, FrontmatterValue>;
	body: string;
	targetAgents?: string[] | null;
};

export type SkillItem = BaseItem & {
	itemType: "skill";
	relativePath: string;
	directoryPath: string;
	skillFileName: string;
	outputFileName: string;
	files: string[];
};

export type CommandItem = BaseItem & {
	itemType: "command";
	prompt: string;
};

export type SubagentItem = BaseItem & {
	itemType: "subagent";
	fileName: string;
};

export type InstructionItem = BaseItem & {
	itemType: "instruction";
	outputDir: string;
	group: string | null;
	origin: "template" | "repo";
};

export type ConvertContext = {
	repo: string;
	home: string;
	target: ResolvedTargetDefinition;
	flags: Record<string, unknown>;
	template: (value: string, options?: { item?: BaseItem | null }) => string;
	resolvePath: (value: string, options?: { item?: BaseItem | null }) => string;
	hash: (value: string | Buffer) => string;
};

export type ConvertOutput = {
	path: string;
	content: string;
};

/**
 * Converter results:
 * - string uses the default output path
 * - { path, content } or an array writes explicit outputs
 * - { skip: true } or { satisfy: true } writes nothing
 * - { error: string } fails the target
 * - null/undefined skips the item
 */
export type ConvertResult =
	| string
	| ConvertOutput
	| ConvertOutput[]
	| { skip: true; reason?: string }
	| { satisfy: true; reason?: string }
	| { error: string }
	| null
	| undefined;

export type Converter<TItem> = (options: {
	item: TItem;
	context: ConvertContext;
}) => MaybePromise<ConvertResult>;

export type SkillOutputConfig = {
	path: ConfigValue<SkillItem, string>;
	convert?: Converter<SkillItem>;
};

export type SubagentOutputConfig = {
	path: ConfigValue<SubagentItem, string>;
	convert?: Converter<SubagentItem>;
};

export type CommandFormat = "markdown" | "toml";
export type CommandScope = "project" | "global";
export type CommandFallback = "skills" | "skip";

export type CommandOutputConfig = {
	path: ConfigValue<CommandItem, string>;
	format?: ConfigValue<CommandItem, CommandFormat>;
	scopes?: ConfigValue<CommandItem, CommandScope | CommandScope[]>;
	globalPath?: ConfigValue<CommandItem, string>;
	fallback?: ConfigValue<CommandItem, CommandFallback>;
	convert?: Converter<CommandItem>;
};

export type InstructionOutputConfig = {
	fileName?: ConfigValue<InstructionItem, string>;
	group?: ConfigValue<InstructionItem, string | null>;
	convert?: Converter<InstructionItem>;
};

/**
 * Hooks run per target; throwing records a target error.
 * beforeSync/afterSync run once per target; beforeConvert/afterConvert run per item.
 */
export type TargetHooks = {
	beforeSync?: (options: { context: ConvertContext }) => MaybePromise<void>;
	afterSync?: (options: { context: ConvertContext }) => MaybePromise<void>;
	beforeConvert?: (options: { item: BaseItem; context: ConvertContext }) => MaybePromise<void>;
	afterConvert?: (options: { item: BaseItem; context: ConvertContext }) => MaybePromise<void>;
};

export type TargetOutputsConfig = {
	skills?: SkillOutputConfig | ConfigValue<SkillItem, string>;
	commands?: CommandOutputConfig | ConfigValue<CommandItem, string>;
	subagents?: SubagentOutputConfig | ConfigValue<SubagentItem, string>;
	instructions?: InstructionOutputConfig | ConfigValue<InstructionItem, string> | false;
};

export type TargetDefinition = {
	id: string;
	displayName?: string;
	aliases?: string[];
	extends?: string;
	outputs?: TargetOutputsConfig;
	hooks?: TargetHooks;
	disabled?: boolean;
};

export type OmniagentConfig = {
	targets?: TargetDefinition[];
	disabledTargets?: string[];
};

export type ResolvedTargetOutputs = {
	skills?: SkillOutputConfig | null;
	commands?: CommandOutputConfig | null;
	subagents?: SubagentOutputConfig | null;
	instructions?: InstructionOutputConfig | null | false;
};

export type ResolvedTargetDefinition = {
	id: string;
	displayName: string;
	aliases: string[];
	source: "built-in" | "override" | "custom";
	outputs: ResolvedTargetOutputs;
	hooks: TargetHooks;
	supports: {
		commands: boolean;
		subagents: boolean;
	};
};

export type OutputFile = {
	path: string;
	content: string | Buffer;
	itemType: ItemType;
	itemName: string;
	sourcePath: string;
	targetId: string;
	isCanonicalInstruction?: boolean;
};

export type OutputWriteCounts = {
	created: number;
	updated: number;
	skipped: number;
	failed: number;
};

export type OutputWriteResult = {
	targetId: string;
	counts: OutputWriteCounts;
	warnings: string[];
	errors: string[];
};
