IMPORT("BackpackAPI");

function setNameWithData(id: number) {
    Item.registerNameOverrideFunction(id, function (item, translation) {
        return translation + "\n" + "Data: " + item.data;
    });
}

//1
IDRegistry.genItemID("backpackTest");
Item.createItem("backpackTest", "Test Simple Backpack #1", {name: "backpack", meta: 0}, {stack: 1});
Item.setToolRender(ItemID.backpackTest, true);
Item.setGlint(ItemID.backpackTest, true);
setNameWithData(ItemID.backpackTest);

BackpackRegistry.register(ItemID.backpackTest, {
    title: "Test Backpack",
    items: [
        "ore.*", //Any ore
        {id: VanillaBlockID.wool, data: -1}, //Any wool
        {id: "ingot.*"}, //Any ingot
        {id: VanillaBlockID.planks}, //Oak planks
        {id: VanillaBlockID.concrete, data: -1} //Any concrete
    ]
});

//2
IDRegistry.genItemID("backpackTest2");
Item.createItem("backpackTest2", "Test Simple Backpack #2", {name: "backpack", meta: 0}, {stack: 1});
Item.setToolRender(ItemID.backpackTest2, true);
Item.setGlint(ItemID.backpackTest2, true);
setNameWithData(ItemID.backpackTest2);

BackpackRegistry.register(ItemID.backpackTest2, {
    slots: 3,
    slotsCenter: true,
    inRow: 1,
    items: [".*"] //Any item
});

Translation.addTranslation("Test Backpack", {ru: "Тестовый Рюкзак"});