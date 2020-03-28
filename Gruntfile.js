module.exports = function (grunt) {
    const COPYRIGHT = "©DDCompany (https://vk.com/forestry_pe)";
    const TERMS_OF_USE = `Условия использования:
      - Заперещено распространие библиотеки на сторонних источниках
        без ссылки на официальное сообщество(https://vk.com/forestry_pe)
      - Запрещено измение кода библиотеки
      - Запрещено явное копирование кода в другие библиотеки или моды
      - Используя библиотеку вы автоматически соглашаетесь с описанными
        выше условиями`;

    function getGuideAPIBanner() {
        return `/*
     _____         _      _         ___  ______  _____
    |  __ \\       (_)    | |       / _ \\ | ___ \\|_   _|
    | |  \\/ _   _  _   __| |  ___ / /_\\ \\| |_/ /  | |
    | | __ | | | || | / _\` | / _ \\|  _  ||  __/   | |
    | |_\\ \\| |_| || || (_| ||  __/| | | || |     _| |_
    \\____/ \\__,_||_| \\__,_| \\___|\\_| |_/\\_|     \\___/
                
    GuideAPI library
     
    ${TERMS_OF_USE}
             
    ${COPYRIGHT}
*/

`;
    }

    grunt.initConfig({
        concat: {
            guideAPI: {
                options: {
                    banner: getGuideAPIBanner(),
                },
                src: [
                    'raw/guide-api/header.js',
                    'raw/guide-api/GuideAPI.js',
                    'raw/guide-api/GuideHelper.js',
                    'raw/guide-api/PageControllers.js',
                ],
                dest: 'libs/GuideAPI.js',
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.registerTask('guide-api', ['concat:guideAPI']);
};