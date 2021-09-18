module.exports = function (grunt) {
    const figlet = require("figlet");

    const mods = [
        {
            title: "BackpackAPI",
            id: "backpack-api"
        },
        {
            title: "BaublesAPI",
            id: "baubles-api"
        }
    ];

    for (const mod of mods) {
        if (mod.dir) {
            continue;
        }

        mod.dir = `raw/${mod.id}/`;
    }

    function generateBannerFor(mod) {
        return `/*
        
${figlet.textSync(mod.title).split("\n").map(line => `  ${line}`).join("\n")}
                                         
    ${mod.title} library
     
    Условия использования:
      - Запрещено распространение библиотеки на сторонних источниках
        без ссылки на официальное сообщество(https://vk.com/forestry_pe)
      - Запрещено изменение кода библиотеки
      - Запрещено явное копирование кода в другие библиотеки или моды
      - Используя библиотеку вы автоматически соглашаетесь с описанными
        выше условиями
           
    ©DDCompany (https://vk.com/forestry_pe) 
*/

`;
    }

    grunt.initConfig({
        ts: (() => {
            const tasks = {
                dev: {
                    tsconfig: "dev/tsconfig.json"
                },
            };
            for (const {id, dir} of mods) {
                tasks[id] = {
                    tsconfig: `${dir}tsconfig.json`
                }
            }
            return tasks;
        })(),

        move: {
            declarations: {
                src: "libs/*.d.ts",
                dest: "dev/declarations/"
            }
        },

        "file-creator": (() => {
            const tasks = {};
            for (const mod of mods) {
                tasks[`gen-banner-for-${mod.id}`] = {
                    [`${mod.dir}banner.ts`](fs, dist, done) {
                        fs.writeSync(dist, generateBannerFor(mod));
                        done();
                    }
                }
            }
            return tasks;
        })(),
    });

    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-move");
    grunt.loadNpmTasks("grunt-file-creator");

    for (const {id} of mods) {
        grunt.registerTask(`build-${id}`, [`file-creator:gen-banner-for-${id}`, `ts:${id}`, "move:declarations"]);
    }

    grunt.registerTask("build-dev", [...mods.map(({id}) => `build-${id}`), "ts:dev"]);
};