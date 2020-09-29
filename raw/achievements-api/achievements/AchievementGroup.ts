class AchievementGroup {
    private children: { [key: string]: Achievement } = {};

    constructor(private description: IAchievementGroup) {
        if (!description.unique) {
            throw new IllegalArgumentException("Invalid uid");
        }

        if (typeof description.icon === "number") {
            description.icon = {
                id: description.icon
            };
        }
    }

    give(uid: string) {
        const achievement = this.getChild(uid);
        if (!achievement) {
            throw new IllegalArgumentException("Invalid achievement uid");
        }

        achievement.give();
    }

    /**
     * Give all achievements of the group
     */
    giveAll() {
        for (let key in this.children) {
            this.children[key].give();
        }
    }

    getUid() {
        return this.description.unique;
    }

    addChildren(child: Achievement) {
        if (this.children[child.getUid()]) {
            throw new IllegalArgumentException(`Achievement with uid '${child.getUid()}' already registered`);
        }

        this.children[child.getUid()] = child;
    }

    getChild(uid: string) {
        return this.children[uid];
    }

    getChildren() {
        return this.children;
    }

    getDescription() {
        return this.description;
    }

    getWidth() {
        return this.description.width;
    }

    getHeight() {
        return this.description.height;
    }

    getName() {
        return this.description.name;
    }

    getIcon(): IItemIcon {
        return this.description.icon as IItemIcon;
    }

    getBgTextureName() {
        return this.description.background || this.description.bgTexture;
    }

    getAchievementSize() {
        return this.description.size;
    }
}