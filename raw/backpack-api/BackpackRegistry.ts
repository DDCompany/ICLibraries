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
    static prototypes: { [key: number]: IBackpackPrototype } = {};

    /**
     * Backpack registration function.
     * @param id - item id
     * @param prototype - object representing properties of the backpack
     */
    static register(id: number, prototype: IBackpackPrototype) {
        if (id <= 0) {
            Logger.Log("id for backpack register function is not valid", "ERROR");
            return;
        }

        if (!prototype) {
            Logger.Log("object for backpack register function is not valid", "ERROR");
            return;
        }

        prototype.title = prototype.title ?? "Backpack";
        prototype.kind = prototype.kind ?? BackpackKind.META;
        prototype.slots = prototype.slots ?? 10;
        prototype.inRow = prototype.inRow ?? prototype.slots;
        prototype.slotsCenter = prototype.slotsCenter ?? true;

        let slots = prototype.slots;

        if (!prototype.gui) {
            if (slots <= 0) {
                Logger.Log("slots amount is not valid", "ERROR");
                return;
            }

            prototype.gui = new UI.StandartWindow({
                standart: {
                    header: {
                        text: {
                            text: ""
                        }
                    },
                    inventory: {
                        standart: true
                    },
                    background: {
                        standart: true
                    },
                    minHeight: 90 + (slots / 10 * 61) + 70
                },
                drawing: [],
                elements: {}
            });

            BackpackRegistry.addSlotsToGui(prototype.gui, slots, prototype.inRow, prototype.slotsCenter);
        }

        Item.registerUseFunctionForID(id, function (coords, item, block, player) {
            BackpackRegistry.openGuiFor(item, player);
        });

        Item.registerNoTargetUseFunction(id, function (item, player) {
            BackpackRegistry.openGuiFor(item, player);
        });

        this.prototypes[id] = prototype;
    }

    static setupClientSide() {
        ItemContainer.registerScreenFactory("backpack_api.ui", (container, name) => {
            const prototype = this.prototypes[Network.serverToLocalId(parseInt(name))];
            if (prototype) {
                return prototype.gui;
            }

            return null;
        });
    }

    static setupContainer(proto: IBackpackPrototype, container: ItemContainer) {
        container.setClientContainerTypeName("backpack_api.ui");

        const isValidFunc = proto.isValidItem || function (id, count, data) {
            return !BackpackRegistry.isBackpack(id) &&
                (proto.items ? BackpackRegistry.isValidFor(id, data, proto.items) : true);
        };

        container.setGlobalAddTransferPolicy((container, name, id, amount, data) => {
            return isValidFunc(id, amount, data) ? Math.min(amount, Item.getMaxStack(id) - container.getSlot(name).count) : 0;
        });
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
                    let rId = item.id;
                    let rData = item.data ?? 0;
                    let isOk = true;

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

        let prototype = this.prototypes[item.id];
        if (prototype) {
            let key: string;
            let container: ItemContainer | undefined | null;
            switch (prototype.kind) {
                case BackpackKind.META:
                    if (!item.data) {
                        item.data = BackpackRegistry.nextUnique++;
                        Player.setCarriedItem(item.id, item.count, item.data);
                    }

                    key = "d" + item.data;
                    container = this.containers[key];
                    break;
                case BackpackKind.EXTRA:
                    if (!item.extra) {
                        item.extra = new ItemExtraData();
                    }

                    let data = (item.extra as ItemExtra).getInt("__backpack_id", -1);
                    if (data === -1) {
                        data = BackpackRegistry.nextUnique++;
                        (item.extra as ItemExtra).putInt("__backpack_id", data);
                        Player.setCarriedItem(item.id, item.count, item.data, item.extra);
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

        Logger.Log("item is not a backpack", "ERROR");
        return null;
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
                         x = 345,
                         y = 70) {
        let content = gui.getContent();
        x = center ? 300 + (700 - inRow * 61) / 2 : x;

        for (let i = 0; i < slots; i++) {
            content.elements["slot" + (i + 1)] = {
                type: "slot",
                x: x + i % inRow * 61,
                y: y + Math.floor(i / inRow) * 61
            };
        }

        return gui;
    }
}

EXPORT("BackpackRegistry", BackpackRegistry);

BackpackRegistry.setupClientSide();

Callback.addCallback("LevelLoaded", function () {
    for (let id in BackpackRegistry.prototypes) {
        let prototype = BackpackRegistry.prototypes[id];
        if (!prototype.title) {
            continue;
        }

        let gui = prototype.gui as any;
        if (gui.getWindow) {
            let header = gui.getWindow("header");
            if (header) {
                let drawing = header.contentProvider.drawing[2];
                if (drawing) {
                    drawing.text = Translation.translate(prototype.title);
                }
            }
        }
    }
});