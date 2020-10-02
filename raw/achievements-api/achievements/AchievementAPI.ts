import UIElementSet = UI.UIElementSet;
import DrawingElement = UI.DrawingElement;
import TileMode = android.graphics.Shader.TileMode;

class AchievementAPI {
    /**
     * Array of registered groups by <i>AchievementAPI.registerGroup</i>
     */
    static groups: { [key: string]: AchievementGroup } = {};

    /**
     * Array of groups identifiers
     */
    static groupNames: string[] = [];

    /**
     * Amount of registered groups
     */
    static groupsAmount = 0;

    /**
     * Container of <i>groupsShowUI</i>
     */
    static containerOverlay = new UI.Container();

    /**
     * Container of achievements area window
     */
    static container = new UI.Container();

    /**
     * Container of <i>windowParent</i>
     */
    static parentContainer = new UI.Container();

    /**
     * Current group index
     */
    static currentIndex = 0;
    static windowArea: UI.Window | null = null;
    /**
     * Background window
     */
    static windowParent = new UI.Window({
        location: {
            x: 244,
            y: (UI.getScreenHeight() - 370) / 2,
            width: 512,
            height: 370
        },
        drawing: [
            {type: "frame", x: 0, y: 0, width: 1000, height: 725, bitmap: "achievements_frame", scale: 5},
            {
                type: "text",
                text: Translation.translate("achievementApi.achievements"),
                x: 80,
                y: 65,
                font: {size: 35, color: android.graphics.Color.DKGRAY}
            }
        ],
        elements: {
            "slotGroupIcon": {
                type: "slot",
                x: 75,
                y: 605,
                size: 100,
                visual: true,
                bitmap: "_default_slot_empty",
                isTransparentBackground: true
            },
            "textGroupName": {
                type: "text",
                x: 180,
                y: 630,
                text: "",
                font: {size: 40, color: android.graphics.Color.DKGRAY}
            },
            "btnClose": {
                type: "button",
                x: 910,
                y: 15,
                bitmap: "achievements_btn_close",
                bitmap2: "achievements_btn_close_hover",
                scale: 5,
                clicker: {
                    onClick() {
                        AchievementAPI.windowParent.close();
                        AchievementAPI.windowArea.close();
                    }
                }
            },
            "textPageIndex": {
                type: "text",
                x: 730,
                y: 630,
                text: "",
                font: {size: 40, color: android.graphics.Color.DKGRAY}
            },
            "btnNext": {
                type: "button",
                x: 860,
                y: 620,
                bitmap: "btn_achievements_next",
                bitmap2: "btn_achievements_next_hover",
                scale: 3,
                clicker: {
                    onClick() {
                        AchievementAPI.currentIndex++;
                        AchievementAPI.openAchievementsWindow();
                    }
                }
            },
            "btnPrevious": {
                type: "button",
                x: 640,
                y: 620,
                bitmap: "btn_achievements_previous",
                bitmap2: "btn_achievements_previous_hover",
                scale: 3,
                clicker: {
                    onClick() {
                        AchievementAPI.currentIndex--;
                        AchievementAPI.openAchievementsWindow();
                    }
                }
            }
        }
    });
    /**
     * Window with button that open achievements window
     */
    static groupsShowUI = new UI.Window({
        location: {
            x: 1000 / 2 - 80,
            y: 5,
            width: 45,
            height: 45
        },

        drawing: [
            {type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)}
        ],

        elements: {
            "btn": {
                type: "button", x: 0, y: 0, bitmap: "btn_achievements", scale: 60, clicker: {
                    onClick() {
                        AchievementAPI.currentIndex = 0;
                        AchievementAPI.parentContainer.openAs(AchievementAPI.windowParent);
                        AchievementAPI.openAchievementsWindow();
                    }
                }
            }
        }
    });

    /**
     * Initialize windows
     */
    static init() {
        this.groupsShowUI.setAsGameOverlay(true);
        this.windowParent.setBlockingBackground(true);
    }

    /**
     * Register new group
     * @param description - description object
     */
    static registerGroup(description: IAchievementGroup): AchievementGroup {
        const group = new AchievementGroup(description);

        if (this.groups[group.uid]) {
            throw new IllegalArgumentException(`Group with uid "$\{uid}" already registered`);
        }

        this.groups[group.uid] = group;
        this.groupsAmount++;
        return group;
    }

    /**
     * Register new achievement
     * @param uid - group unique identifier
     * @param description - description object
     */
    static register(uid: string, description: IAchievement): Achievement {
        const group = this.groups[uid];
        if (!group) {
            throw new IllegalArgumentException("Invalid group uid");
        }

        let achievement = new Achievement(group, description);
        group.addChild(achievement);
        return achievement;
    }

    /**
     * Register array of achievements
     * @param uid - group unique identifier
     * @param descriptions - descriptions array
     */
    static registerAll(uid: string, descriptions: IAchievement[]) {
        for (let description of descriptions) {
            AchievementAPI.register(uid, description);
        }
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Load groups and achievements from JSON file
     * @param path - path to JSON
     * @example <i>AchievementAPI.loadFrom(\_\_dir\_\_ + "/achievements.json")</i>
     */
    static loadFrom(path: string) {
        let content = FileTools.ReadText(path);
        if (content) {
            let parsed = JSON.parse(content);

            let groups = parsed.groups;
            if (groups) {
                for (let key in groups) {
                    AchievementAPI.registerGroup(groups[key]);
                }
            }

            let achievements = parsed.achievements;
            if (achievements) {
                for (let key in achievements) {
                    const group = achievements[key];
                    AchievementAPI.registerAll(key, group);
                }
            }

            return;
        }

        Logger.Log("Error loading file " + path, "ERROR");
    }

    static initGroupForWindow(group: AchievementGroup) {
        let parentElements = this.windowParent.getContent().elements;
        parentElements["textPageIndex"].text = (this.currentIndex + 1) + "/" + this.groupsAmount;
        parentElements["textGroupName"].text = Translation.translate(group.name);

        let slotIcon = this.parentContainer.getSlot("slotGroupIcon");
        let groupIcon = group.icon;

        if (groupIcon) {
            slotIcon.id = groupIcon.id || 0;
            slotIcon.data = groupIcon.data || 0;
        } else {
            slotIcon.id = 0;
            slotIcon.data = 0;
        }

        slotIcon.count = 1;
    }

    static initAchievementsForWindow(group: AchievementGroup, size: number, elements: UIElementSet) {
        let contentExist;
        for (let index in group.children) {
            let achievement = group.getChild(index);
            let parent = achievement.parent;

            if (parent) {
                if (!parent.isCompleted && achievement.strongDependence) {
                    continue;
                }
            }
            contentExist = true;

            let x = this.getAchievementX(achievement.description, size);
            let y = this.getAchievementY(achievement.description, size);

            elements[index] = {
                type: "slot",
                x: x,
                y: y,
                size: size,
                visual: true,
                bitmap: achievement.texture,
                isTransparentBackground: true,
                clicker: {
                    onClick() {
                        achievement.showAlert();
                    }
                }
            };

            const item = achievement.icon || {id: 0, data: 0};
            const slot = this.container.getSlot(index);
            slot.id = item?.id ?? 0;
            slot.data = item?.data ?? 0;
            slot.count = 1;
        }

        return contentExist;
    }

    static initConditionsForWindow(group: AchievementGroup, size: number, elements: UIElementSet) {
        let halfOfSize = size / 2;
        //noinspection JSUnusedGlobalSymbols
        elements["lines"] = {
            type: "custom",
            z: -1,
            custom: {},

            onSetup() {
                this.paint = new android.graphics.Paint();
                this.paint.setARGB(255, 255, 255, 255);
                this.paint.setStyle(android.graphics.Paint.Style.STROKE);

                this.paint2 = new android.graphics.Paint();
                this.paint2.setARGB(255, 0, 0, 0);
                this.paint2.setStyle(android.graphics.Paint.Style.STROKE);
            },

            onDraw(self: unknown, canvas: android.graphics.Canvas, scale: number) {
                if (!this.path) {
                    this.path = new android.graphics.Path();

                    for (let index in group.children) {
                        let achievement = group.getChild(index);
                        let parent = achievement.parent;

                        if (achievement.description.connection === Connection.NONE) {
                            continue;
                        }

                        if (!parent || parent.group.uid !== group.uid ||
                            (!parent.isCompleted && achievement.strongDependence)) {
                            continue;
                        }

                        let parentItem = group.getChild(parent.uid);
                        if (parentItem) {
                            let x = AchievementAPI.getAchievementX(achievement.description, size);
                            let y = AchievementAPI.getAchievementY(achievement.description, size);
                            let _x = (x + halfOfSize) * scale;
                            let _y = (y + halfOfSize) * scale;
                            let parentX = AchievementAPI.getAchievementX(parentItem.description, size);
                            let parentY = AchievementAPI.getAchievementY(parentItem.description, size);
                            let _parentX = (parentX + halfOfSize) * scale;
                            let _parentY = (parentY + halfOfSize) * scale;

                            if (parentX === x || parentY === y) {
                                this.path.moveTo(_x, _y);
                                this.path.lineTo(_parentX, _parentY);
                            } else {
                                let x2 = _x + ((parentX < x ? -(halfOfSize + 5) : halfOfSize + 5) * scale);

                                this.path.moveTo(_x, _y);
                                this.path.lineTo(x2, _y);

                                switch (achievement.description.connection) {
                                    case Connection.HORIZONTAL:
                                        this.path.lineTo(x2, _parentY);
                                        this.path.lineTo(_parentX, _parentY);
                                        break;
                                    case Connection.VERTICAL:
                                        this.path.lineTo(_parentX, _y);
                                        this.path.lineTo(_parentX, _parentY);
                                        break;
                                    default:
                                }

                            }
                        }
                    }
                }

                this.paint.setStrokeWidth(6 * scale);
                this.paint2.setStrokeWidth(14 * scale);

                canvas.drawPath(this.path, this.paint2);
                canvas.drawPath(this.path, this.paint);
            }
        };
    }

    static initBackgroundForWindow(drawing: DrawingElement[], bgTexture: string) {
        //noinspection JSUnusedGlobalSymbols
        drawing.push({
            type: "custom",

            onDraw(canvas: android.graphics.Canvas, scale: number) {
                let bitmap = android.graphics.Bitmap.createScaledBitmap(UI.TextureSource.get(bgTexture), 80 * scale,
                    80 * scale,
                    false);
                let paint = new android.graphics.Paint();
                paint.setShader(new android.graphics.BitmapShader(bitmap, TileMode.REPEAT, TileMode.REPEAT));
                canvas.drawRect(0, 0, canvas.getWidth(), canvas.getHeight(), paint);
                bitmap.recycle();
            }
        });
    }

    /**
     * Open achievement window
     */
    static openAchievementsWindow() {
        if (this.currentIndex < 0) {
            this.currentIndex = this.groupsAmount - 1;
        } else if (this.currentIndex >= this.groupsAmount) {
            this.currentIndex = 0;
        }

        let group = this.groups[this.groupNames[AchievementAPI.currentIndex]];
        let width = group.width || 600;
        let height = group.height || 250;
        let elements: UIElementSet = {};
        let drawing = [{type: "color", color: android.graphics.Color.rgb(0, 0, 0)}];

        this.initGroupForWindow(group);

        let size = group.nodeSize || 100;
        let contentExist = this.initAchievementsForWindow(group, size, elements);

        if (contentExist) {
            this.initConditionsForWindow(group, size, elements);

            if (group.backgroundTexture) {
                this.initBackgroundForWindow(drawing, group.backgroundTexture);
            }
        } else {
            width = 432;
            height = 260;

            let translated = Translation.translate("achievementApi.nothing");
            if (translated === "achievementApi.nothing") {
                translated = "Nothing to Show :(";
            }

            elements["nothing"] = {
                type: "text",
                x: 0,
                y: 200,
                text: translated,
                font: {size: 40, color: android.graphics.Color.WHITE}
            };
        }

        if (this.windowArea) {
            this.windowArea.close();
        }

        this.windowArea = new UI.Window({
            location: {
                x: 284,
                y: (UI.getScreenHeight() - 370) / 2 + 50,
                width: 432,
                height: 260,
                scrollX: width,
                scrollY: height
            },

            drawing: drawing,
            elements: elements
        });

        AchievementAPI.container.openAs(this.windowArea);

        if (!contentExist) {
            elements["nothing"].x = (1000 - AchievementAPI.container.getElement("nothing").elementRect.width()) / 2;
        }
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * @param groupUID - group identifier in which achievement contains
     * @param uid - achievement identifier
     * @returns Is the achievement unlocked?
     */
    static isUnlocked(groupUID: string, uid: string) {
        let group = this.groups[groupUID];
        if (!group) {
            throw new IllegalArgumentException(`Group with uid '${groupUID}' not found`);
        }

        let achievement = group.getChild(uid);
        if (!achievement) {
            throw new IllegalArgumentException(`Achievement with uid '${groupUID}' not found`);
        }

        return achievement.isUnlocked;
    }

    /**
     * Give all achievements
     */
    static giveAll() {
        for (let key in this.groups) {
            this.groups[key].giveAll();
        }
    }

    /**
     * @param groupUID - group identifier in which achievement contains
     * @param uid - achievement identifier
     * @returns Is the achievement completed?
     */
    static isCompleted(groupUID: string, uid: string): boolean {
        return this.groups[groupUID].getChild(uid).isCompleted;
    }

    /**
     * Give the achievement
     * @param groupUID - group identifier
     * @param uid - achievement identifier
     */
    static give(groupUID: string, uid: string) {
        const group = this.groups[groupUID];
        if (!group) {
            throw new IllegalArgumentException(`Group with uid '${groupUID}' not found`);
        }
        group.give(uid);
    }

    static resetAll() {
        for (let groupKey in this.groups) {
            const group = this.groups[groupKey];
            for (let key in group.children) {
                const child = group.getChild(key);
                child.reset();
            }
        }
    }

    static getGroup(uid: string): AchievementGroup | undefined {
        return this.groups[uid];
    }

    /*
        {                                 }
        {           DEPRECATED            }
        {                                 }
     */

    /**
     * @deprecated
     */
    static getAchievementY(achievement: IAchievement, size: number): number {
        return achievement.y || achievement.row * (size + 10);
    }

    /**
     * @deprecated
     */
    static getAchievementX(achievement: IAchievement, size: number): number {
        return achievement.x || achievement.column * (size + 10);
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * @deprecated
     */
    static getAchievementTexture(groupDesc: IAchievementGroup, achievement: IAchievement): string {
        const group = this.groups[groupDesc.unique];
        if (!group) {
            throw new IllegalArgumentException("Invalid group uid");
        }

        const child = group.getChild(achievement.unique);
        if (!child) {
            throw new IllegalArgumentException("Invalid achievement uid");
        }

        return child.texture;
    }

    /**
     * @deprecated
     */
    static getData(groupUID: string, uid: string): IAchievementData {
        const group = this.groups[groupUID];
        if (!group) {
            throw new IllegalArgumentException("Invalid group uid");
        }

        const child = group.getChild(uid);
        if (!child) {
            throw new IllegalArgumentException("Invalid achievement uid");
        }

        return child.fullData;
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * @deprecated
     */
    static showAchievementInfo(groupDescription: IAchievementGroup, achievement: IAchievement) {
        const group = this.groups[groupDescription.unique];
        if (!group) {
            return;
        }

        const child = group.getChild(achievement.unique);
        if (!child) {
            return;
        }

        child.showAlert();
    }

    /**
     * @deprecated
     */
    static giveAllForGroup(description: IAchievementGroup) {
        const group = this.groups[description.unique];
        if (!group) {
            return false;
        }

        group.giveAll();
        return true;
    }

    //noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    /**
     * @deprecated
     */
    static removeDataFor(groupUID: string, uid: string) {
    }

    /**
     * @deprecated
     */
    static getProgress(group: IAchievementGroup, achievement: IAchievement) {
        return this.groups[group.unique].getChild(achievement.unique).progress;
    }
}

AchievementAPI.init();

Callback.addCallback("PostLoaded", () =>
    AchievementAPI.groupNames = Object.keys(AchievementAPI.groups));
Callback.addCallback("NativeGuiChanged", (screenName: string) => {
    if (screenName === "hud_screen" || screenName === "in_game_play_screen") {
        AchievementAPI.containerOverlay.openAs(AchievementAPI.groupsShowUI);
    } else {
        AchievementAPI.containerOverlay.close();
    }
});
Callback.addCallback("LevelLeft", () => AchievementAPI.resetAll());

EXPORT("AchievementAPI", AchievementAPI);