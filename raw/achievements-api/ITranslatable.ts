/**
 * @deprecated
 */
interface ITranslatable {
    /**
     * Default text if string is not translated
     */
    text: string;

    /**
     * Translation key that passed into <i>Translation.translate</i>
     */
    translate: string;
}