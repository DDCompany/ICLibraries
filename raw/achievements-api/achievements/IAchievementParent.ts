/**
 * @deprecated
 */
interface IAchievementParent {
    /**
     * Group in which parent achievement contains. If not specified, the search will be within the current group
     */
    groupUnique?: string;

    /**
     * UID of parent achievement
     */
    unique: string;
}