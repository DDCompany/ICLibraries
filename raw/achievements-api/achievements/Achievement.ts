class Achievement {
    private completed = false;
    private parent: Achievement | null = null;
    private data = {
        progress: 0, //TODO: move to another field when AchievementAPI.getData will removed
        data: {}
    };

    constructor(private group: AchievementGroup,
                private description: IAchievement) {
        const parent = description.parent;
        if (parent) {
            let child: Achievement | null = null;
            if (!parent.groupUnique || parent.groupUnique == group.getUid()) {
                child = group.getChild(parent.unique);
            } else {
                const otherGroup = AchievementAPI.groups[parent.groupUnique];
                if (otherGroup) {
                    child = otherGroup.getChild(parent.unique);
                } else throw new IllegalArgumentException("Parent not found: group uid is invalid");
            }

            if (child) {
                this.parent = child;
            } else throw new IllegalArgumentException("Parent not found: achievement uid is invalid");
        }
    }

    give() {
        if (this.isCompleted()) {
            return;
        }

        if (this.parent && !this.parent.isCompleted()) {
            return; //Throw an exception? Hm...
        }

        if (this.description.progressMax && ++this.data.progress < this.description.progressMax) {
            return;
        }

        if (!this.description.notCompletePopup) {
            let item = this.description.item;
            let title;
            let color;

            switch (this.description.type) {
                case "challenge":
                    title = Translation.translate("message.achievementApi.challenge_complete");
                    color = android.graphics.Color.MAGENTA;
                    break;
                case "goal":
                    title = Translation.translate("message.achievementApi.goal_complete");
                    color = android.graphics.Color.YELLOW;
                    break;
                default:
                    title = Translation.translate("message.achievementApi.achievement_complete");
                    color = android.graphics.Color.YELLOW;
            }

            AchievementPopup.show({
                title: title,
                color: color,
                description: AchievementAPI.getLocalized(this.description, "name"),
                item: {
                    id: item.id || 1,
                    data: item.data || 0,
                    count: 1
                }
            });
        }

        this.completed = true;
        Callback.invokeCallback("onAchieve", this.group.getDescription(), this.getDescription());
        Callback.invokeCallback("onAchievementCompleted", this);
    }

    reset() {
        this.completed = false;
        this.data.progress = 0;
        this.data.data = {};
    }

    /**
     * Show alert with information about achievement
     */
    showAlert() {
        let info = AchievementAPI.getLocalized(this.description, "name");

        if (this.description.progressMax) {
            info += `(${this.getProgress()}/${this.description.progressMax})`;
        }

        let description = AchievementAPI.getLocalized(this.description, "description");
        if (description)
            info += "\n" + description;

        alert(info);
    }

    /**
     * @return Is the achievement unlocked?
     */
    isUnlocked() {
        return this.parent ? this.parent.isCompleted() : true;
    }

    /**
     * @return Is the achievement completed?
     */
    isCompleted() {
        return this.completed;
    }

    isStrongDependence() {
        return this.description.strongDependence;
    }

    getTextureName() {
        let type;

        if (this.isCompleted())
            type = "completed";
        else if (this.isUnlocked())
            type = "unlocked";
        else type = "locked";

        return "achievement_bg." + (this.description.type || "default") + "_" + type;
    }

    getParent() {
        return this.parent;
    }

    getProgress(): number {
        return this.data.progress;
    }

    getUid(): string {
        return this.description.unique;
    }

    getDescription() {
        return this.description;
    }

    /**
     * For backward capability. Don't use it
     * @deprecated
     */
    getFullData() {
        return this.data;
    }

    getIcon() {
        return this.description.item;
    }

    getGroup() {
        return this.group;
    }

    setCompleted(value: boolean) {
        this.completed = value;
    }

    setData(value: IAchievementData) {
        this.data = value;
    }
}