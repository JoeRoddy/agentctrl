import type { BaseItem, ConvertContext, TargetHooks } from "./types.js";

export async function runSyncHook(options: {
	hook?: TargetHooks["beforeSync"] | TargetHooks["afterSync"];
	context: ConvertContext;
	onError: (message: string) => void;
	label: string;
}): Promise<boolean> {
	if (!options.hook) {
		return true;
	}
	try {
		await options.hook({ context: options.context });
		return true;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		options.onError(`${options.label} hook failed: ${message}`);
		return false;
	}
}

export async function runConvertHook(options: {
	hook?: TargetHooks["beforeConvert"] | TargetHooks["afterConvert"];
	item: BaseItem;
	context: ConvertContext;
	onError: (message: string) => void;
	label: string;
}): Promise<boolean> {
	if (!options.hook) {
		return true;
	}
	try {
		await options.hook({ item: options.item, context: options.context });
		return true;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		options.onError(`${options.label} hook failed: ${message}`);
		return false;
	}
}
