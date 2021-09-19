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
        "ore.*", //Any modded ore
        "ingot.*", //Any modded ingot
        VanillaBlockID.concrete, //Any concrete
        [VanillaBlockID.planks, 0], //Oak planks
    ],
});

//2
IDRegistry.genItemID("backpackTest2");
Item.createItem("backpackTest2", "Test Simple Backpack #2", {name: "backpack", meta: 0}, {stack: 1});
Item.setToolRender(ItemID.backpackTest2, true);
Item.setGlint(ItemID.backpackTest2, true);
setNameWithData(ItemID.backpackTest2);

BackpackRegistry.register(ItemID.backpackTest2, {
    //Any item, because 'items' field is undefined
    kind: BackpackKind.EXTRA,
    slots: 3,
    slotsCenter: true,
    inRow: 1,
});

//3
IDRegistry.genItemID("backpackTest3");
Item.createItem("backpackTest3", "Test Simple Backpack #3", {name: "backpack", meta: 0}, {stack: 1});
Item.setToolRender(ItemID.backpackTest3, true);
Item.setGlint(ItemID.backpackTest3, true);
setNameWithData(ItemID.backpackTest3);

BackpackRegistry.register(ItemID.backpackTest3, {
    extend: ItemID.backpackTest,
    kind: BackpackKind.EXTRA,
    items: [
        VanillaBlockID.iron_ore,
    ],
});

Translation.addTranslation("Test Backpack", {ru: "Тестовый Рюкзак"});