import ItemUseCoordinates = Callback.ItemUseCoordinates;

IMPORT("AchievementsAPI");

AchievementAPI.registerGroup({
    uid: "world_of_colors",
    name: "achievements.world_of_colors",
    background: "groups_bg.husbandry",
    icon: {
        id: VanillaBlockID.wool,
        data: 3
    }
});

AchievementAPI.registerAll("world_of_colors", [
    {
        uid: "welcome",
        column: 0,
        row: 0,
        name: "achievements.world_of_colors.welcome",
        icon: VanillaItemID.ender_pearl
    },
    {
        uid: `glass`,
        type: AchievementType.goal,
        column: 1,
        row: 3,
        parent: "welcome",
        name: `achievements.world_of_colors.glass`,
        description: "achievements.world_of_colors.glass_desc",
        progressMax: 16,
        connection: Connection.VERTICAL,
        icon: VanillaBlockID.stained_glass
    }
]);

for (let i = 0; i < 16; i++) {
    AchievementAPI.register("world_of_colors", {
        uid: `wool${i}`,
        column: 1 + i % 6,
        row: Math.floor(i / 6),
        parent: "welcome",
        name: `achievements.world_of_colors.wool`,
        description: "achievements.world_of_colors.wool_desc",
        connection: Connection.VERTICAL,
        icon: {
            id: VanillaBlockID.wool,
            data: i
        }
    });
}

Translation.addTranslation("achievements.world_of_colors", {en: "World of Colors"});
Translation.addTranslation("achievements.world_of_colors.welcome", {en: "Welcome to the Club"});
Translation.addTranslation("achievements.world_of_colors.wool", {en: "Wool"});
Translation.addTranslation("achievements.world_of_colors.wool_desc", {en: "Place the block of Wool"});
Translation.addTranslation("achievements.world_of_colors.glass", {en: "Glass"});
Translation.addTranslation("achievements.world_of_colors.glass_desc", {en: "Place all colors of Glass"});


Callback.addCallback("ServerPlayerLoaded", (player: number) =>
    AchievementAPI.give(player, "world_of_colors", "welcome"));

Callback.addCallback("ItemUse", (coords: ItemUseCoordinates, item: ItemInstance, block: any, isExternal: any, player: number) => {
    switch (item.id) {
        case VanillaBlockID.wool:
            AchievementAPI.give(player, "world_of_colors", `wool${item.data}`);
            break;
        case VanillaBlockID.stained_glass:
            const achievement =
                AchievementAPI
                    .getGroup("world_of_colors")
                    .getChild("glass");
            const data = achievement.getData(player);
            if (!data[item.data]) {
                data[item.data] = true;
                achievement.give(player);
            }
            break;
    }
});