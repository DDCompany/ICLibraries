IMPORT("BaublesAPI");

IDRegistry.genItemID("baubleTest");
Item.createItem("baubleTest", "Test Bauble", {name: "ring", meta: 0}, {stack: 1});
Item.setGlint(ItemID.baubleTest, true);

Baubles.registerBauble({
    id: ItemID.baubleTest,
    type: BaubleType.ring,
    onEquip() {
        alert("equip");
    },
    onTakeOff() {
        alert("takeoff");
    },
    tick() {

    }
});