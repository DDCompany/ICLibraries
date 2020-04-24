class BackpackRegistry {
    /**
     * Next unique backpack identifier.
     */
    static nextUnique: number = 1;
    /**
     * Containers of backpacks. Key is 'dIdentifier'. For example, 'd1'.
     */
    static containers: { [key: string]: UI.Container } = {};
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
        prototype.items = prototype.items ?? [];
        prototype.slots = prototype.slots ?? 10;
        prototype.inRow = prototype.inRow ?? prototype.slots;
        prototype.slotsCenter = prototype.slotsCenter ?? true;

        let slots = prototype.slots;
        let isValidFunc = prototype.isValidItem || function (id, count, data) {
            return !BackpackRegistry.isBackpack(id) &&
                (prototype.items ? BackpackRegistry.isValidFor(id, data, prototype.items) : true);
        };

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

            BackpackRegistry.addSlotsToGui(prototype.gui, slots, isValidFunc, prototype.inRow, prototype.slotsCenter);
        }

        Item.registerUseFunctionForID(id, function (coords, item) {
            BackpackRegistry.openGuiFor(item.id, item.data);
        });

        Item.registerNoTargetUseFunction(id, function (item) {
            BackpackRegistry.openGuiFor(item.id, item.data);
        });

        this.prototypes[id] = prototype;
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
     * @param id - backpack id
     * @param data - backpack data
     * @param notUpdateData - If false and no container has been created for the passed data, a new item will be set
     * in the player’s hand
     * @returns backpack data. Can return a value other than passed one.
     */
    static openGuiFor(id: number, data: number, notUpdateData?: boolean): number | null {
        let prototype = this.prototypes[id];

        if (prototype) {
            if (!data) {
                data = BackpackRegistry.nextUnique++;
                if (!notUpdateData)
                    Player.setCarriedItem(id, 1, data);
            }

            let key = "d" + data;
            let container = this.containers[key];

            if (!container) {
                container = new UI.Container();
                this.containers[key] = container;
            }

            let gui = prototype.gui;
            if ((gui as any).getWindow) {
                let header = (gui as any).getWindow("header");
                header.contentProvider.drawing[1].text = Translation.translate(prototype.title);
            }
            container.openAs(gui);
            return data;
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
     * @param isValidFunc - validation function
     * @param inRow - Amount of slots in one row
     * @param center - Do the slots center?
     * @param x - Initial x coordinate. Ignored if the center argument is true
     * @param y - Initial coordinate y.
     * @returns gui.
     */
    static addSlotsToGui(gui: UI.Window | UI.WindowGroup,
                         slots: number,
                         isValidFunc: T_ValidationFunc,
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
                y: y + Math.floor(i / inRow) * 61,
                isValid: isValidFunc
            };
        }

        return gui;
    }
}

EXPORT("BackpackRegistry", BackpackRegistry);