module.exports = function (grunt) {
    const figlet = require("figlet");

    const mods = [
        {
            title: "BackpackAPI",
            id: "backpack-api",
        },
        {
            title: "BaublesAPI",
            id: "baubles-api",
        },
    ];

    for (const mod of mods) {
        if (mod.dir) {
            continue;
        }

        mod.dir = `raw/${mod.id}/`;
    }

    function generateBannerFor(mod) {
        return `/*
        
${figlet.textSync(mod.title).split("\n").filter(line => line.trim()).map(line => `  ${line}`).join("\n")}
    
    Terms of use:
     - Forbidden to distribute the library on third-party sources
       without links to the official group (https://vk.com/forestry_pe)
     - Forbidden to change the code of this library
     - Using the mod you automatically agree to the conditions described above
           
    ©DDCompany (https://vk.com/forestry_pe) 
*/

`;
    }

    grunt.initConfig({
        ts: (() => {
            const tasks = {
                examples: {
                    tsconfig: "dev/tsconfig.json",
                },
            };
            for (const {id, dir} of mods) {
                tasks[id] = {
                    tsconfig: `${dir}tsconfig.json`,
                };
            }
            return tasks;
        })(),

        move: {
            declarations: {
                src: "libs/*.d.ts",
                dest: "dev/declarations/",
            },
        },

        "file-creator": (() => {
            const tasks = {};
            for (const mod of mods) {
                tasks[`gen-banner-for-${mod.id}`] = {
                    [`${mod.dir}banner.ts`](fs, dist, done) {
                        fs.writeSync(dist, generateBannerFor(mod));
                        done();
                    },
                };
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

    grunt.registerTask("build-examples", [...mods.map(({id}) => `build-${id}`), "ts:examples"]);
};