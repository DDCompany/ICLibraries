interface IAchievementGroup {
    /**
     * Unique string identifier of the group
     */
    unique: string;

    /**
     * Name of the group
     * @default empty string
     */
    name?: string;

    /**
     * Achievements area width
     * @default 600
     */
    width?: number;

    /**
     * Achievements area height
     * @default 250
     */
    height?: number;

    /**
     * Achievement icons size
     * @default 100
     */
    size?: number;

    /**
     * Path to the texture in resource directory, which is used as the background of the achievement area. This texture
     * is scaled to 50 pixels and duplicated in width nd height. Recommended size - 16x16
     * @default empty string
     */
    background?: string;

    /**
     * @deprecated
     */
    bgTexture?: string;

    /**
     * Group icon
     */
    icon?: number | IItemIcon
}