IMPORT("BaublesAPI");

IDRegistry.genItemID("baubleOfWind");
Item.createItem("baubleOfWind", "Ring of Wind", {name: "ring", meta: 0}, {stack: 1});
Item.setGlint(ItemID.baubleOfWind, true);

Baubles.registerBauble({
    id: ItemID.baubleOfWind,
    type: BaubleType.ring,

    onEquip(client) {
        Debug.message("onEquip " + client.getPlayerUid());
        Debug.message(client.getPlayerUid() + "");
        client.send("baubles_test.wind_ring", {equip: true});
    },

    onTakeOff(client) {
        Debug.message("onTakeOff");
        client.send("baubles_test.wind_ring", {equip: false});
    },

    tick() {

    }
});

Network.addClientPacket("baubles_test.wind_ring", (data: { equip: boolean }) => Player.setFlyingEnabled(data.equip));