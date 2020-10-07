enum BaubleType {
    amulet = "amulet",
    ring = "ring",
    belt = "belt",
    head = "head",
    body = "body",
    charm = "charm"
}

interface BaubleDescription {
    /**
     * Item id
     */
    id: number,
    /**
     * Type of bauble. Tells which slot the item can be put in
     */
    type: BaubleType
    /**
     * Called when equipping the item and upon entering the world if the item is equipped
     */
    onEquip?: (client: ConnectedClient) => void
    /**
     * Called when a player take off the item or dies
     */
    onTakeOff?: (client: ConnectedClient) => void
    /**
     * Called every tick if the the item is equipped
     */
    tick: (client: ConnectedClient) => void
}

interface BaublesData {
    [id: number]: { container: ItemContainer, cache: any }
}

class Baubles {
    static btnContainer = new UI.Container();
    static descriptions: { [id: number]: BaubleDescription } = {};
    static data: BaublesData = {};

    static registerBauble(obj: BaubleDescription) {
        if (!obj.onEquip) {
            obj.onEquip = () => {
            };
        }

        if (!obj.onTakeOff) {
            obj.onEquip = () => {
            };
        }

        if (!obj.tick) {
            obj.tick = () => {
            };
        }
        this.descriptions[obj.id] = obj;
    }

    static setupClientSide() {
        ItemContainer.registerScreenFactory("baubles.ui", function (container, name) {
            alert("registerScreenFactory called");
            if (name === "main") {
                return GUI;
            }
            return null;
        });
    }

    static setupServerSide() {
        Network.addServerPacket("baubles.open_ui", (client) => {
            alert("Received baubles.open_ui");
            let container = Baubles.getContainer(client);
            alert(container.toString());
            container.openFor(client, "main");
        });
    }

    static setupContainer(container: ItemContainer, playerUid: number) {
        container.setClientContainerTypeName("baubles.ui");

        const slots = ["amulet", "ring0", "ring1", "belt", "head", "body", "charm"];
        for (const name of slots) {
            container.setDirtySlotListener(name, (container, name, slot) => {
                let data = Baubles.data[playerUid];
                let old = data.cache[name];
                if (!old && slot.id > 0 || slot.id !== old.id) {
                    const client = Network.getClientForPlayer(playerUid);
                    if (old) {
                        Baubles.getDesc(old.id)?.onTakeOff(client);
                    }
                    Baubles.getDesc(slot.id)?.onEquip(client);
                    data.cache[name] = {
                        id: slot.id
                    };
                }
            });

            container.setSlotAddTransferPolicy(name, (container, name, id, amount) => {
                const baubleName = name === "ring0" || name === "ring1" ? "ring" : name;
                return Baubles.getType(id) === baubleName ? Math.min(amount, Item.getMaxStack(id) - container.getSlot(name).count) : 0;
            });
        }
    }

    static getContainer(client: ConnectedClient) {
        const uid = client.getPlayerUid();
        let bauble = this.data[uid];
        if (!bauble) {
            alert("created new");
            const container = new ItemContainer();
            bauble = this.data[uid] = {
                container: container,
                cache: {}
            };
            this.setupContainer(container, client.getPlayerUid());
        }

        return bauble.container;
    }

    static tick() {
        for (const uid in Baubles.data) {
            let cache = Baubles.data[uid].cache;
            for (const slot in cache) {
                Baubles.getDesc(cache[slot].id)?.tick(Network.getClientForPlayer(parseInt(uid)));
            }
        }
    }

    static openGui() {
        Network.sendToServer("baubles.open_ui", {});
        alert("Packet open send");
    }

    static getDesc(id: number) {
        return this.descriptions[id];
    }

    static getType(id: number): BaubleType {
        let desc = this.descriptions[id];

        if (!desc) {
            return null;
        }

        return desc.type;
    }
}

Baubles.setupClientSide();
Baubles.setupServerSide();

Callback.addCallback("tick", function () {
    Baubles.tick();
});

Callback.addCallback("LevelLeft", function () {
    Baubles.data = {};
});

Callback.addCallback("EntityDeath", function (entity: number) {
    if (Entity.getType(entity) === 1) {
        const data = Baubles.data[entity];
        if (!data) {
            return;
        }

        const pos = Entity.getPosition(entity);
        const blockSource = BlockSource.getDefaultForActor(entity);
        const container = data.container;
        for (let i in data.cache) {
            const bauble = data.cache[i];
            if (bauble.onTakeOff) {
                bauble.onTakeOff(Network.getClientForPlayer(entity));
            }
            container.dropSlot(blockSource, i, pos.x, pos.y, pos.z);
        }
    }
});

Callback.addCallback("NativeGuiChanged", function (screenName: string) {
    if (screenName === "inventory_screen_pocket" || screenName === "inventory_screen") {
        Baubles.btnContainer.openAs(BUTTON_GUI);
    } else {
        Baubles.btnContainer.close();
    }
});

EXPORT("Baubles", Baubles);
EXPORT("BaubleType", BaubleType);