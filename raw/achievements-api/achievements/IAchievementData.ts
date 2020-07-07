/**
 * Object representing data of achievement
 */
interface IAchievementData {
    /**
     * Achievement completion progress
     * @see <i>AchievementsAPI.getProgress</i>
     */
    progress: number;

    /**
     * Custom data
     * @see <i>AchievementsAPI.getData</i>
     */
    data: object;
}