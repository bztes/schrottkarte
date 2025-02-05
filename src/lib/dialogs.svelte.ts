import { SvelteMap } from 'svelte/reactivity';

export interface DialogParamsAction {
  type: 'none' | 'primary' | 'secondary' | 'accent';
  label: string;
}

export interface DialogParams<ButtonIds extends string = string> {
  title: string;
  msg: string;
  buttons?: Record<ButtonIds, DialogParamsAction>;
}
export interface DialogInstance<ActionKeys extends string = string>
  extends DialogParams<ActionKeys> {
  onaction: (action: ActionKeys) => void;
}
export type DialogsService = ReturnType<typeof createDialogsService>;

export function createDialogsService() {
  let nextId = 0;
  const dialogsMap = new SvelteMap<number, DialogInstance<string>>();
  const allDialogs = $derived([...dialogsMap.values()]);

  function modal<ActionKeys extends string>(params: DialogParams<ActionKeys>) {
    return new Promise<ActionKeys>((resolve) => {
      const id = nextId++;
      const dialogInstance: DialogInstance<ActionKeys> = {
        ...params,
        onaction: (action) => {
          dialogsMap.delete(id);
          resolve(action);
        },
      };
      dialogsMap.set(id, dialogInstance as DialogInstance);
    });
  }

  return {
    get all() {
      return allDialogs;
    },
    modal,
  };
}
