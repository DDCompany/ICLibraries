interface ISavedAchievement {
    completed: boolean
    data: IAchievementData
}

interface IAchievementsSaver {
    [key: string]: Dictionary<ISavedAchievement>
}

Saver.addSavesScope("AchievementsScope",
    function read(scope: IAchievementsSaver) {
        for (let groupKey in scope) {
            const group = AchievementAPI.getGroup(groupKey);
            const data = scope[groupKey];
            if (group) {
                for (let key in data) {
                    const child = group.getChild(key);
                    const saved = data[key];
                    if (child) {
                        child.isCompleted = saved.completed;
                        child.fullData = saved.data;
                    } else {
                        Logger.Log(`Achievement with uid '${key}' not found. Skipping...`, "WARNING");
                    }
                }
            } else {
                Logger.Log(`Group with uid '${groupKey}' not found. Skipping...`, "WARNING");
            }
        }
    },

    function save() {
        const data: IAchievementsSaver = {};

        for (let groupKey in AchievementAPI.groups) {
            const group = AchievementAPI.groups[groupKey];
            const _data: Dictionary<ISavedAchievement> = {};

            for (let key in group.children) {
                const child = group.getChild(key);
                _data[key] = {
                    completed: child.isCompleted,
                    data: child.fullData
                };
            }
            data[groupKey] = _data;
        }

        return data;
    }
);