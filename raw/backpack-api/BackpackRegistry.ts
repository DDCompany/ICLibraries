const BackpackUseFunction: Callback.ItemUseLocalFunction = (coords, item, block, player) =>
    BackpackNotTargetUseFunction(item, player);

const BackpackNotTargetUseFunction: Callback.ItemUseNoTargetFunction = (item, player) => {
    if (Entity.getSneaking(player)) {
        return;
    }

    BackpackRegistry.openGuiFor(item, player);
};

class BackpackRegistry {
    /**
     * Next unique backpack identifier.
     */
    static nextUnique: number = 1;
    /**
     * Containers of backpacks. Key is 'dIdentifier'. For example, 'd1'.
     */
    static containers: { [key: string]: ItemContainer } = {};
    /**
     * Object that store prototypes of backpacks. Key is backpack id.
     */
    static prototypes: { [key: number]: IRegisteredBackpackPrototype } = {};

    /**
     * Backpack registration function.
     * @param id - item id
     * @param _prototype - object representing properties of the backpack
     */
    static register(id: number, _prototype: IBackpackPrototype) {
        if (id <= 0) {
            throw new Error("Invalid item id");
        }

        if (!_prototype) {
            throw new Error("Invalid backpack prototype");
        }

        const prototype: IRegisteredBackpackPrototype = _prototype;
        prototype.title = prototype.title ?? "Backpack";
        prototype.kind = prototype.useExtraData ? BackpackKind.EXTRA : (prototype.kind ?? BackpackKind.META);
        prototype.slots = prototype.slots ?? 10;
        prototype.inRow = prototype.inRow ?? prototype.slots;
        prototype.slotsCenter = prototype.slotsCenter ?? true;

        if (prototype.extend) {
            const parentPrototype = BackpackRegistry.prototypes[prototype.extend];
            if (!parentPrototype) {
                throw new Error("Items cannot be extended because no prototype backpack was not found");
            }

            prototype.extendItems = parentPrototype.items;
        }

        const slots = prototype.slots;
        if (!prototype.gui) {
            if (slots <= 0) {
                throw new Error("Amount of slots must be greater than zero");
            }

            prototype.gui = new UI.StandardWindow({
                standard: {
                    header: {
                        text: {
                            text: "",
                        },
                    },
                    inventory: {
                        standard: true,
                    },
                    background: {
                        standard: true,
                    },
                    minHeight: 20 + (slots / prototype.inRow * 91) + 70,
                },
                drawing: [],
                elements: {},
            });

            BackpackRegistry.addSlotsToGui(prototype.gui, slots, prototype.inRow, prototype.slotsCenter);
        }

        Item.registerUseFunctionForID(id, BackpackUseFunction);
        Item.registerNoTargetUseFunction(id, BackpackNotTargetUseFunction);

        this.prototypes[id] = prototype;
    }

    static setupClientSide() {
        ItemContainer.registerScreenFactory("backpack_api.ui",
            (container, name) => this.prototypes[Network.serverToLocalId(parseInt(name))]?.gui);
    }

    static setupContainer(proto: IRegisteredBackpackPrototype, container: ItemContainer) {
        const isValidFunc = proto.isValidItem || ((id, count, data) => {
            if (BackpackRegistry.isBackpack(id)) {
                return false;
            }

            if (proto.extendItems) {
                return BackpackRegistry.isValidFor(id, data, proto.extendItems) ||
                    (proto.items ? BackpackRegistry.isValidFor(id, data, proto.items) : false);
            }

            return proto.items ? BackpackRegistry.isValidFor(id, data, proto.items) : true;
        });

        container.setClientContainerTypeName("backpack_api.ui");
        container.setGlobalAddTransferPolicy((container, name, id, amount, data) =>
            isValidFunc(id, amount, data) ? Math.min(amount, Item.getMaxStack(id) - container.getSlot(name).count) : 0);
    }

    /**
     * Checks whether an item can be put in the backpack.
     * @param id - item id
     * @param data - item data
     * @param items - items than can be put in the backpack
     * @returns whether an item can be put in the backpack.
     */
    static isValidFor(id: number, data: number = 0, items: T_BackpackItem[]): boolean {
        for (let item of items) {
            switch (typeof item) {
                case "number":
                    if (id === item) {
                        return true;
                    }
                    break;
                case "object":
                    let rId: number | string;
                    let rData: number | string;
                    let isOk = true;

                    if (Array.isArray(item)) {
                        rId = item[0];
                        rData = item[1] ?? 0;
                    } else {
                        rId = item.id;
                        rData = item.data ?? 0;
                    }

                    switch (typeof rId) {
                        case "string":
                            let match = IDRegistry.getNameByID(id)?.match(rId);
                            isOk = match !== null && match !== undefined;
                            break;
                        case "number":
                            isOk = rId == id;
                            break;
                    }

                    if (isOk == true) {
                        switch (typeof rData) {
                            case "string":
                                if ((data + "").match(rData)) {
                                    return true;
                                }
                                break;
                            case "number":
                                if (rData == -1 || rData == data) {
                                    return true;
                                }
                                break;
                        }
                    }
                    break;
                case "string":
                    if (IDRegistry.getNameByID(id)?.match(item)) {
                        return true;
                    }
                    break;
            }
        }

        return false;
    }

    /**
     * Open backpack gui.
     * @param item - item
     * @param player - player entity id
     * @returns backpack data. Can return a value other than passed one.
     */
    static openGuiFor(item: ItemInstance, player: number): number | null {
        const client = Network.getClientForPlayer(player);
        if (!client) {
            return;
        }

        const prototype = this.prototypes[item.id];
        if (prototype) {
            let key: string;
            let container: ItemContainer | undefined | null;
            switch (prototype.kind) {
                case BackpackKind.META:
                    if (!item.data) {
                        item.data = BackpackRegistry.nextUnique++;
                        Entity.setCarriedItem(player, item.id, item.count, item.data);
                    }

                    key = "d" + item.data;
                    container = this.containers[key];
                    break;
                case BackpackKind.EXTRA:
                    if (!item.extra) {
                        item.extra = new ItemExtraData();
                    }

                    let data = item.extra.getInt("container", -1); //For backward compatibility
                    if (data !== -1) {
                        item.extra.putInt("__backpack_id", data);
                        item.extra.putInt("container", -1);
                    }

                    data = item.extra.getInt("__backpack_id", -1);
                    if (data === -1) {
                        data = BackpackRegistry.nextUnique++;
                        item.extra.putInt("__backpack_id", data);
                        Entity.setCarriedItem(player, item.id, item.count, item.data, item.extra);
                    }

                    key = "d" + data;
                    container = this.containers[key];
                    break;
            }

            if (!container) {
                container = new ItemContainer();
                this.containers[key] = container;
            }

            if (!container.getClientContainerTypeName()) {
                this.setupContainer(BackpackRegistry.prototypes[item.id], container);
            }
            container.openFor(client, item.id + "");
            return item.data;
        }

        throw new Error("Item is not a backpack");
    };

    /**
     * Checks whether the item is backpack or not.
     * @param id - item id
     * @returns whether the item is backpack or not
     */
    static isBackpack(id: number): boolean {
        return !!this.prototypes[id];
    }

    /**
     * Helper function for adding items to the gui.
     * @param gui - gui to which slots will be added
     * @param slots - amount of slots
     * @param inRow - Amount of slots in one row
     * @param center - Do the slots center?
     * @param x - Initial x coordinate. Ignored if the center argument is true
     * @param y - Initial y coordinate.
     * @returns gui.
     */
    static addSlotsToGui(gui: UI.Window | UI.WindowGroup,
                         slots: number,
                         inRow: number,
                         center: boolean,
                         x = 0,
                         y = 0) {
        const content = gui.getContent();
        const slotSize = 90;
        const slotPadding = 1;
        const slotFullSize = slotSize + slotPadding;
        x = center ? 20 + (1000 - inRow * slotFullSize) / 2 : x;

        for (let i = 0; i < slots; i++) {
            content.elements["slot" + (i + 1)] = {
                type: "slot",
                size: slotSize,
                x: x + i % inRow * slotFullSize,
                y: y + Math.floor(i / inRow) * slotFullSize,
            };
        }

        return gui;
    }
}

EXPORT("BackpackRegistry", BackpackRegistry);

BackpackRegistry.setupClientSide();

Callback.addCallback("ServerPlayerLoaded", () => {
    for (let id in BackpackRegistry.prototypes) {
        const prototype = BackpackRegistry.prototypes[id];
        if (!prototype.title) {
            continue;
        }

        const gui = prototype.gui as any;
        if (gui.getWindow) {
            const header = gui.getWindow("header");
            if (header) {
                const drawing = header.contentProvider.drawing[2];
                if (drawing) {
                    drawing.text = Translation.translate(prototype.title);
                }
            }
        }
    }
});