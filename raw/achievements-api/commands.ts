Callback.addCallback("NativeCommand", function (str: string) {
    str = str.replace("/", "");
    let parts = str.split(" ");

    if (parts[0] === "ach" || parts[0] === "achievement") {
        switch (parts[1]) {
            case "giveAll":
                AchievementsAPI.giveAll();
                Game.message("[AchievementsAPI] All achievements was gave");
                Game.prevent();
                return;
            case "give":
                if (!parts[2] || !AchievementsAPI.giveAllForGroup(AchievementsAPI.groups[parts[2]]))
                    return;

                Game.message("[AchievementsAPI] Achievements was gave!");
                Game.prevent();
                return;
            case "consumeAll":
                AchievementsAPI.completed = {};
                Game.message("[AchievementsAPI] All achievements was consumed");
                Game.prevent();
        }
    }
});