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
    onEquip?: () => void
    /**
     * Called when a player take off the item or dies
     */
    onTakeOff?: () => void
    /**
     * Called every tick if the the item is equipped
     */
    tick: () => void
}

class Baubles {
    static container = new UI.Container();
    static btnContainer = new UI.Container();
    static descriptions: { [id: number]: BaubleDescription } = {};
    static baubles: { [id: string]: BaubleDescription | undefined } = {};

    static registerBauble(obj: BaubleDescription) {
        this.descriptions[obj.id] = obj;
    }

    static tick() {
        for (let i in this.baubles) {
            let bauble = this.baubles[i];

            if (!bauble) {
                continue;
            }

            if (bauble.tick) {
                bauble.tick();
            }
        }
    }

    static cache() {
        let baubles = this.baubles;
        let baubles_old: typeof baubles = {
            amulet: baubles.amulet,
            ring0: baubles.ring0,
            ring1: baubles.ring1,
            belt: baubles.belt,
            head: baubles.head,
            body: baubles.body,
            charm: baubles.charm
        };

        baubles.amulet = this.getDesc(this.container.getSlot("amulet").id);
        baubles.ring0 = this.getDesc(this.container.getSlot("ring0").id);
        baubles.ring1 = this.getDesc(this.container.getSlot("ring1").id);
        baubles.belt = this.getDesc(this.container.getSlot("belt").id);
        baubles.head = this.getDesc(this.container.getSlot("head").id);
        baubles.body = this.getDesc(this.container.getSlot("body").id);
        baubles.charm = this.getDesc(this.container.getSlot("charm").id);

        for (let i in baubles) {
            let bauble = baubles[i];
            let bauble_old = baubles_old[i];

            if (bauble?.id !== bauble_old?.id) {
                if (bauble?.onEquip) {
                    bauble.onEquip();
                }
                if (bauble_old?.onTakeOff) {
                    bauble_old.onTakeOff();
                }
            }
        }
    }

    static openGui() {
        this.container.openAs(GUI);
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

Callback.addCallback("tick", function () {
    Baubles.cache();
    Baubles.tick();
});

Callback.addCallback("LevelLeft", function () {
    Baubles.baubles = {};
});

Callback.addCallback("EntityDeath", function (entity: number) {
    if (Entity.getType(entity) === 1) {
        const pos = Player.getPosition();
        for (let i in Baubles.baubles) {
            let bauble = Baubles.baubles[i];

            if (bauble) {
                alert("drop " + i);
                Baubles.container.dropSlot(i, pos.x, pos.y, pos.z);

                if (bauble.onTakeOff) {
                    bauble.onTakeOff();
                }
            }
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