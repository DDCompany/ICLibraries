enum BackpackKind {
    EXTRA = "extra",
    META = "meta"
}

EXPORT("BackpackKind", BackpackKind);

type T_ValidationFunc = (id: number, count: number, data: number) => boolean;

/**
 * Object representing properties of the backpack
 */
interface IBackpackPrototype {
    /**
     * For backward compatibility. Don't use it.
     * @see kind
     * @deprecated
     */
    useExtraData?: boolean
    /**
     * Specify where backpack id is stored.
     * @default <i>BackpackKind.META</i>
     */
    kind?: BackpackKind
    /**
     * Backpack title.
     */
    title?: string;
    /**
     * Amount of slots in the backpack.
     * @default 10
     */
    slots?: number;
    /**
     * Do the slots center?
     * @default true
     */
    slotsCenter?: boolean;
    /**
     * Amount of slots in a one row.
     */
    inRow?: number;
    /**
     * Items that can be stored the backpack.
     * @default []
     */
    items?: T_BackpackItem[];
    /**
     * A function that checks whether an item can be put in a backpack. The default function checks if an item
     * is specified in the <i>items</i> field.
     * @param id - item id
     * @param count - item count
     * @param data - item data
     * @return {boolean} whether an item can be put in a backpack.
     */
    isValidItem?: T_ValidationFunc;
    /**
     * GUI of the backpack.
     */
    gui?: UI.Window | UI.WindowGroup
}