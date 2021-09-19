type T_BackpackItem = IBackpackObjectItem | [string | number, string | number] | number | string;

/**
 * Object representing the item or group of items that can be stored in backpack
 * @deprecated use [id, data] syntax instead
 */
interface IBackpackObjectItem {
    /**
     * The item id. May be number or regex string.
     */
    id: number | string;
    /**
     * The item data. May be number or regex string.
     * @default 0
     */
    data?: number | string;
}