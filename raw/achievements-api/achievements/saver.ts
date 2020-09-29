interface IAchievementsSaver {
    [key: string]: { [key: string]: { completed: boolean, data: IAchievementData } }
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
                        child.setCompleted(saved.completed);
                        child.setData(saved.data);
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
            const _data: { [key: string]: { completed: boolean, data: IAchievementData } } = {};

            for (let key in group.getChildren()) {
                const child = group.getChild(key);
                _data[key] = {
                    completed: child.isCompleted(),
                    data: child.getFullData()
                };
            }
            data[groupKey] = _data;
        }

        return data;
    }
);